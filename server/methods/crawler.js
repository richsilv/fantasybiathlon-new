/*****************************************************************************/
/* Crawler Methods */
/*****************************************************************************/

var Future = Meteor.npmRequire('fibers/future'),
	bwRoot = CrawlerMatrix.findOne({
		key: 'bwRoot'
	}),
	analysisFields = [{
		field: 'STTM',
		stub: 'Shoot'
	}, {
		field: 'FINN',
		stub: 'Total'
	}, {
		field: 'A0TR',
		stub: 'Range'
	}, {
		field: 'A0TC',
		stub: 'Course'
	}],
	typeSortOrder = {
		Athlete: 0,
		Bio: 1,
		Analysis: 2,
		Race: 3,
		Event: 4,
		Season: 5
	},
	bioFields = [
		"Twitter",
		"Website",
		"Height",
		"Weight"
	],
	maxPoints = 15,
	finishpoints = [0, 30, 25, 22, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
	relaypoints = [0, 15, 10, 8, 6, 4, 3, 2, 1],
	smallpoints = [0, 10, 7, 5, 3, 1],
	nameRegex = /^([A-ZÄÖ][A-ZÄÖ\-' ]+) ([A-ZÄÖ][a-z][A-ZÄÖa-z\-' ]*)$/,
	relayRegex = /^BT[A-Z]{3}\d(\s{10})?$/,
	httpQueue = new LimitQueue(1000);

Meteor.methods({

	'crawler/crawl': function(details, options) {

		this.unblock();

		CollectionFunctions.isAdmin(this.userId, true);

		return crawl(details, options);

	},

	'crawler/crawl_missing': function() {

		this.unblock();

		CollectionFunctions.isAdmin(this.userId, true);

		return crawlMissing();

	},

	'crawler/update_points': function(results) {

		this.unblock();

		CollectionFunctions.isAdmin(this.userId, true);

		if (results && results.query) results = Results.find(query);

		return updatePoints(results);

	},

	'crawler/update_seasons': function(seasons) {

		this.unblock();

		CollectionFunctions.isAdmin(this.userId, true);

		return updateSeasons(seasons);

	},

	'crawler/calc_aggregates': function(seasons) {

		this.unblock();

		CollectionFunctions.isAdmin(this.userId, true);

		return calcAggregates(seasons);

	},

	'crawler/find_missing_athletes': function() {

		this.unblock();

		CollectionFunctions.isAdmin(this.userId, true);

		return findMissingAthletes();

	},

	'crawler/clear_future_results': function() {

		this.unblock();

		var futRaces = Races.find({StartTime: {$gt: new Date()}}).fetch(),
			raceIds = _.pluck(futRaces, 'RaceId');

		Results.remove({RaceId: {$in: raceIds}});

		return true;

	},

	'crawler/clear_database': function() {

		this.unblock();

		CollectionFunctions.isAdmin(this.userId, true);

		Events.remove({});
		Races.remove({});
		Results.remove({});
		Analysis.remove({});
		Athletes.remove({});
		MissingQueries.remove({});

		return true;

	}

});

function crawl(details, options) {

	options = options || {};

	var callQueue = [],
		futures = [],
		failures = 0,
		masterFuture = new Future(),
		masterResolver = masterFuture.resolver();

	var processQueueItem = function(theseDetails) {
		var thisCall = bwAPICall(theseDetails);
		futures.push(thisCall);
		return thisCall;
	}

	var processQueue = function() {
		var details = callQueue.pop(),
			queueThisTime = false,
			thisCall;

		if (details) {

			thisCall = processQueueItem(details);

			thisCall.resolve(function(err, res) {

				if (res.fail) failures++;

				if (options.recursive) {
					var recursion = res && res.recursion;
					if (recursion) callQueue = callQueue.concat(getRecursion(res));
					processQueueNext();
				}

				var resolved = allResolved(futures);

				if (!resolved || callQueue.length) {
					processQueueNext();
				} else {
					masterResolver();
				}

			});

			processQueueNext();

		}

	}

	var processQueueNext = function() {
		setImmediate(Meteor.bindEnvironment(processQueue), function(e) {
			console.log("BIND ERROR!", e);
		});
	}

	var updateStats = function() {
		var resolvedData = numResolved(futures);
		process.nextTick(Meteor.bindEnvironment(function() {
			MethodData.upsert({
				key: 'memStats'
			}, {
				$set: process.memoryUsage()
			});
			MethodData.upsert({
				key: 'queueStats'
			}, {
				$set: {
					httpHeapSize: httpQueue.count,
					httpQueueLength: httpQueue.queue.length
				}
			});
			MethodData.upsert({
				key: 'callResults'
			}, {
				$set: {
					failures: failures,
					resolved: resolvedData.resolved,
					unresolved: resolvedData.unresolved
				}
			});
		}));
	}

	// HERE IS THE ACTUAL INITIALISATION

	var monitor = Meteor.setInterval(updateStats, 500);

	try {
		// LOAD CALL QUEUE WITH DETAILS
		if (details instanceof Array)
			callQueue = callQueue.concat(details);
		else if (details instanceof Object)
			callQueue.push(details);
		else
			masterResolver();

		// PROCESS FIRST QUEUE ITEM, AND THEN WAIT FOR MASTER FUTURE TO RETURN
		processQueueNext();
		masterFuture.wait();
	} catch (e) {
		console.log("ERROR", e);
	} finally {
		updateStats();
		Meteor.clearInterval(monitor);
	}

	var results = _.sortBy(_.invoke(futures, 'get'), function(res) {
		return typeSortOrder[res.type];
	});

	if (options.storeResults) {
		storeRecords(results);
		MethodData.upsert({
			key: 'missingPoints'
		}, {
			$set: {
				count: Results.find({
					points: {
						$exists: false
					}
				}).count()
			}
		});
	}

	clearMethodData();

	return {
		results: results
	};

}

function crawlMissing() {

	var results = crawl(MissingQueries.find().fetch(), {
		storeResults: true,
		recursive: true
	});
	MissingQueries.remove({});

	return results;

}

function getRecursion(res) {
	var recursion = res.recursion,
		topField = recursion.topField ? getSubObject(res.content, recursion.topField) : null,
		topFieldObject = {},
		subArray = getSubObject(res.content, recursion.subObject);
	if (topField) topFieldObject[recursion.topField] = topField;
	if (!(subArray instanceof Array)) subArray = [subArray];
	if (recursion.exclude) {
		_.each(recursion.exclude, function(val, key) {
			if (false) null;
		});
	}
	return _.reduce(subArray, function(list, doc) {
		if (doc) {
			if (_.reduce(recursion.regex, function(bool, val, key) {
					return doc[key].match(val) ? bool : false;
				}, true)) list.push(_.extend(_.pick(doc, recursion.subFields), topFieldObject));
		}
		return list;
	}, []);
}

function bwAPICall(theseDetails) {

	theseDetails = _.omit(theseDetails, '_id');

	var crawlInstructions = CrawlerMatrix.findOne(trueify(theseDetails)),
		fut = new Future(),
		onComplete = fut.resolver();

	if (!crawlInstructions) console.log('Bad details', theseDetails);

	if (!crawlInstructions || !theseDetails) throw new Meteor.Error('cannot_crawl', 'Cannot crawl this set of details', theseDetails);

	theseDetails = _.extend({
		GivenName: ''
	}, theseDetails, {
		Level: 1,
		RT: '340203',
		RequestId: Math.floor(Math.random() * Math.pow(10, 4)),
		_: Math.floor(Math.random() * Math.pow(10, 13)),
		type: crawlInstructions.type,
	});

	httpQueue.add(function(cb) {
		HTTP.get(bwRoot.url + crawlInstructions.endpoint, {
			params: theseDetails,
			timeout: 60000
		}, function(err, res) {
			setImmediate(Meteor.bindEnvironment(cb), function(e) {
				console.log("BIND ERROR!", e)
			});
			onComplete(null, (res && res.statusCode === 200) ? _.extend(theseDetails, {
				// data: res.data,
				content: JSON.parse(res.content),
				recursion: crawlInstructions.recursion
			}) : _.extend(theseDetails, {
				data: res ? res : err,
				fail: true,
				recursion: crawlInstructions.recursion
			}));
		});
	})

	return fut;
}

function clearMethodData() {

	_.each(['memStats', 'queueStats', 'callResults', 'storeRecords'], function(thisKey) {
		var doc = MethodData.findOne({
			key: thisKey
		});
		_.each(doc, function(val, key) {
			if (key !== 'key') doc[key] = 0;
		});
		MethodData.update({
			key: thisKey
		}, {
			$set: _.omit(doc, '_id')
		});
	});

}

function trueify(object) {
	return _.reduce(object, function(memo, val, key) {
		memo[key] = !!val;
		return memo;
	}, {
		SeasonId: {
			$exists: false
		},
		EventId: {
			$exists: false
		},
		RaceId: {
			$exists: false
		},
		IBUId: {
			$exists: false
		},
		FamilyName: {
			$exists: false
		}
	});
}

function getSubObject(obj, key) {
	if (!key) return obj;
	else path = key.split('.');
	while (path.length) {
		obj = obj[path.shift()];
		if (!obj) return undefined;
	}
	return obj;
}

function allResolved(futures) {
	return _.every(futures, function(future) {
		return future.resolved;
	});
}

function numResolved(futures) {
	return _.countBy(futures, function(future) {
		return future.resolved ? 'resolved' : 'unresolved';
	});
}

function LimitQueue(limit) {

	_this = this;

	_this.count = 0;
	_this.queue = [];
	_this.limit = limit;

	_this.callback = function() {
		if (_this.queue.length) {
			_this.queue.shift().call({}, _this.callback);
		} else {
			_this.count--;
		}
	};

	_this.add = function(func) {
		if (_this.count < _this.limit) {
			_this.count++;
			func.call({}, _this.callback);
		} else {
			_this.queue.push(func);
		}
	};

	return _this;

}

function storeRecords(records) {
	var totalRecords = records.length;
	_.each(records, function(record, index) {
		MethodData.upsert({
			key: 'storeRecords'
		}, {
			$set: {
				total: totalRecords,
				storingNumber: index
			}
		});
		if (!record.fail) storeRecord(record);
	});
}

function storeRecord(record) {
	switch (record.type) {
		case 'Season':
			_.each(record.content, function(event) {
				Events.upsert({
					EventId: event.EventId
				}, {
					$set: _.extend(event, {
						StartDate: new moment(event.StartDate).toDate(),
						EndDate: new moment(event.EndDate).toDate()
					})
				});
			});
			break;
		case 'Event':
			_.each(record.content, function(race) {
				Races.upsert({
					RaceId: race.RaceId
				}, {
					$set: _.extend(race, {
						EventId: record.EventId,
						SeasonId: record.EventId.slice(2, 6),
						StartTime: new moment(race.StartTime).toDate()
					})
				});
			});
			break;
		case 'Race':
			_.each(record.content.Results, function(result) {
				Results.upsert({
					RaceId: record.content.RaceId,
					IBUId: result.IBUId
				}, {
					$set: cleanResult(_.extend(result, {
						RaceId: record.content.RaceId,
						EventId: record.content.RaceId.slice(0, 12),
						SeasonId: record.content.RaceId.slice(2, 6),
						DisciplineId: record.content.RaceId.slice(16)
					}))
				});
			});
			break;
		case 'Analysis':
			Analysis.upsert({
				RaceId: record.content.RaceId,
				IBUId: record.content.IBUId
			}, {
				$set: record.content
			});
			break;
		case 'Athlete':
			record.content.Athletes.length && Athletes.upsert({
				IBUId: record.content.Athletes[0].IBUId
			}, {
				$set: record.content.Athletes[0]
			});
			break;
		case 'Bio':
			var athlete = Athletes.findOne({
				IBUId: record.IBUId
			});
			if (athlete) {
				set = {};
				_.each(bioFields, function(field) {
					var val = _.find(record.content.Bios, function(bio) {
						return bio.Description === field;
					})
					if (val) set[field] = val.Value;
				})
				Athletes.update({
					IBUId: record.IBUId
				}, {
					$set: set
				});
			}
			break;
		default:
			break;
	}
}

function timeToSecs(string) {
	if (string === null) return 86399;
	var timeArray = string.replace('+', '').split(':'),
		time = 0;
	for (var i = 0; i < timeArray.length; i++) {
		time += parseFloat(timeArray[timeArray.length - i - 1]) * Math.pow(60, i);
	}
	return time;
}

function getNumbers(string) {
	var re = /[0-9]/g,
		matches = [],
		thisMatch;
	while (true) {
		thisMatch = re.exec(string);
		if (thisMatch !== null) matches.push(parseInt(thisMatch[0], 10));
		else break;
	}
	return matches;
}

function cleanResult(result) {
	result.ShootingTotal = parseInt(result.ShootingTotal, 10);
	result.Shootings = getNumbers(result.Shootings);
	result.TotalTime = timeToSecs(result.TotalTime);
	result.Behind = timeToSecs(result.Behind);
	result.Rank = parseInt(result.Rank, 10);
	result.StartTime = new moment(result.StartTime).toDate();
	if (isNaN(result.Rank)) {
		result.Rank = 999;
	}
	if (isNaN(result.TotalTime)) {
		result.TotalTime = 86399;
	}
	if (isNaN(result.ShootingTotal)) {
		result.ShootingTotal = -1;
	}
	var analysisQuery = {
			RaceId: result.RaceId,
			IBUId: result.IBUId
		},
		athleteQuery = {
			IBUId: result.IBUId
		},
		raceQuery = {
			RaceId: result.RaceId
		},
		analysis = Analysis.findOne(analysisQuery),
		athlete = Athletes.findOne(athleteQuery),
		race = Races.findOne(raceQuery);
	if (!athlete) {
		var names = nameRegex.exec(result.Name),
			athleteQueryLong;
		if (names) {
			athleteQueryLong = {
				FamilyName: names[1],
				GivenName: names[2]
			};
			if (!MissingQueries.findOne(athleteQueryLong)) {
				console.log("Adding " + JSON.stringify(athleteQueryLong) + " to Missing Queries queue");
				MissingQueries.insert(athleteQueryLong);
			}
		}
	}
	if (!analysis) {
		console.log("Adding " + JSON.stringify(analysisQuery) + " to Missing Queries queue");
		MissingQueries.insert(analysisQuery);
	} else if (!analysis.Values || !analysis.Values.length) {
		console.log("No values for " + JSON.stringify(analysisQuery));
	} else {
		var analysisData = {};
		_.each(analysisFields, function(analysisField) {
			analysisData[analysisField.stub] = _.find(analysis.Values, function(field) {
				return field.FieldId === analysisField.field;
			});
		});
		_.each(analysisData, function(val, key) {
			var time = val && timeToSecs(val.Value),
				rank = val && parseInt(val.Rank, 10);
			result[key + 'Time'] = time;
			result[key + 'Rank'] = rank;
			if (isNaN(rank)) result[key + 'Rank'] = 999;
		});
		if (result.RangeTime && result.ShootingTotal) result.ShootScore = result.RangeTime + (result.ShootingTotal * 1000);
	}
	return result;
}

function updateMissingCount() {
	MethodData.upsert({
		key: 'missingQueries'
	}, {
		$set: {
			count: MissingQueries.find().count()
		}
	});
}

function updatePointsOld(results) { // DEPRECATED!!!

	if (!results)
		Results.find({
			points: {
				$exists: false
			}
		}).forEach(function(res) {
			updatePointsIndividual(res);
		});
	else if (results._cursorDescription)
		results.forEach(function(res) {
			updatePointsIndividual(res);
		});
	else if (results instanceof Array) {
		_.each(resuts, function(res) {
			if (typeof res === 'string') res = Results.findOne(res);
			updatePointsIndividual(res);
		});
	} else if (results instanceof Object)
		updatePointsIndividual(results);
	else
		return false;

	updateActiveSeasons();
	updateSeasons();

	return missingPointsCount();

}

function updatePoints(results) {

	var cursor,
		allResults,
		races;

	if (!results)
		cursor = Results.find({
			points: {
				$exists: false
			}
		});
	else if (results._cursorDescription)
		cursor = results;
	else if (results instanceof Array) {
		if (results[0]._id) results = _.pluck(results, '_id');
		cursor = Results.find({
			_id: {
				$in: results
			}
		});
	} else if (results instanceof Object)
		cursor = Results.find(results._id);
	else
		return false;

	allResults = cursor.fetch();
	races = _.groupBy(allResults, 'RaceId');

	_.each(races, function(resultsList, raceId) {
		updateRacePoints(raceId, resultsList);
	});

	updateActiveSeasons();
	updateSeasons();

	return missingPointsCount();

}

function updateRacePoints(raceId, results) {

	var race = Races.findOne({
			RaceId: raceId
		}),
		ev = Events.findOne({
			EventId: race && race.EventId
		});

	if (!race || race.StartTime > new Date()) return missingPointsCount();

	var shootOrder = _.pluck(Results.find({
			RaceId: raceId,
			ResultOrder: {
				$lte: 998
			}
		}, {
			sort: {
				ShootingTotal: 1,
				RangeTime: 1
			},
			fields: {
				_id: 1
			}
		}).fetch(), '_id');

	results = _.map(results, function(r) {

		var points = 0;

		if (r.ResultOrder < 999) {

			if (r.RaceId.substr(r.RaceId.length - 2) === 'RL') {
				points += relaypoints[r.ResultOrder] ? relaypoints[r.ResultOrder] : 0;
				if (r.Shootings.reduce(function(tot, x) {
						return tot + x;
					}, 0) === 0) {
					points += 5;
				}
			} else {
				points += finishpoints[r.ResultOrder] ? finishpoints[r.ResultOrder] : 0;
				points += smallpoints[r.CourseRank] ? smallpoints[r.CourseRank] : 0;
				points += (r.ShootingTotal === 0 ? 5 : 0);
				points += (r.Shootings.reduce(function(total, x) {
					return x === 0 ? total + 1 : total;
				}, 0));
				points += smallpoints[_.indexOf(shootOrder, r._id)] || 0;
			}
			if (r.EventId.substr(r.RaceId.length - 2) === "__") points = points * 2;

		}

		r.points = points;

		return r;

	});

	_.each(results, function(r) {
		Results.update(r._id, {
			$set: {
				points: r.points,
				EventId: ev && ev.EventId,
				RaceStartTime: race.StartTime
			}
		});
	});

	return missingPointsCount();

}

function missingPointsCount() {
	var count = Results.find({
		points: {
			$exists: false
		}
	}).count();
	return MethodData.upsert({
		key: 'missingPoints'
	}, {
		$set: {
			count: count
		}
	});
}

function updatePointsIndividual(result) {
	var event = Event.findOne({
			EventId: result.EventId
		}),
		set = {};
	if (event && event.StartTime) set.RaceStartTime = event.StartTime;
	set.points = resultPoints(result);
	Results.update(result, {
		$set: set
	});
	missingPointsCount();
}

function resultPoints(r) {

	if (!r || r.ResultOrder > 998) return 0;

	var points = 0;

	if (r.RaceId.substr(r.RaceId.length - 2) === 'RL') {
		points += relaypoints[r.ResultOrder] ? relaypoints[r.ResultOrder] : 0;
		if (r.Shootings.reduce(function(tot, x) {
				return tot + x;
			}, 0) === 0) {
			points += 5;
		}
	} else {
		points += finishpoints[r.ResultOrder] ? finishpoints[r.ResultOrder] : 0;
		points += smallpoints[r.CourseRank] ? smallpoints[r.CourseRank] : 0;
		points += (r.ShootingTotal === 0 ? 5 : 0);
		points += (r.Shootings.reduce(function(total, x) {
			return x === 0 ? total + 1 : total;
		}, 0));
		if (r.RangeTime != 'undefined') {
			var minmisses = Results.findOne({
				RaceId: r.RaceId,
				ResultOrder: {
					$lte: 998
				}
			}, {
				fields: {
					ShootingTotal: 1
				},
				sort: {
					ShootingTotal: 1
				}
			}).ShootingTotal;
			var shootorder = Results.find({
				RaceId: r.RaceId,
				ShootingTotal: minmisses,
				ResultOrder: {
					$lte: 998
				}
			}, {
				sort: {
					RangeTime: 1
				}
			}).fetch();
			points += shootorder.reduce(function(t, e, i) {
				return (e.IBUId === r.IBUId) ? t + (smallpoints[i + 1] ? smallpoints[i + 1] : 0) : t;
			}, 0);
		}
	}
	if (r.EventId.substr(r.RaceId.length - 2) === "__") points = points * 2;
	return points;

}

function updateActiveSeasons(force) {

	var athletes = force ?
		Athletes.find() :
		Athletes.find({
			activeSeasons: {
				$exists: false
			}
		});

	athletes.forEach(function(athlete) {
		Athletes.update(athlete, {
			$set: {
				activeSeasons: _.keys(_.groupBy(Results.find({
					IBUId: athlete.IBUId
				}).fetch(), 'SeasonId'))
			}
		});
	});

}

function updateSeasons(seasons) {

	if (!seasons)
		seasons = _.keys(_.groupBy(Races.find().fetch(), 'SeasonId'));
	else if (typeof seasons === 'string')
		seasons = [seasons];
	else
		return false;

	updateActiveSeasons();

	_.each(seasons, function(season) {
		updateSeasonIndividual(season);
	});
}

function updateSeasonIndividual(season) {

	var athletes = Athletes.find({
		activeSeasons: season
	});
	athletes.forEach(function(athlete) {
		var results = Results.find({
				IBUId: athlete.IBUId,
				SeasonId: season,
				Rank: {
					$ne: 999
				},
				DisciplineId: {
					$ne: 'RL'
				}
			}).fetch(),
			data = {
				races: results.length,
				aveCourseRank: average(_.pluck(results, 'CourseRank'), 999),
				bestCourseRank: Math.min.apply(null, _.pluck(results, 'CourseRank')),
				worstCourseRank: Math.max.apply(null, _.pluck(results, 'CourseRank')),
				aveRangeRank: average(_.pluck(results, 'RangeRank'), 999),
				bestRangeRank: Math.min.apply(null, _.pluck(results, 'RangeRank')),
				worstRangeRank: Math.max.apply(null, _.pluck(results, 'RangeRank')),
				aveTotalRank: average(_.pluck(results, 'Rank'), 999),
				bestTotalRank: Math.min.apply(null, _.pluck(results, 'Rank')),
				worstTotalRank: Math.max.apply(null, _.pluck(results, 'Rank')),
				averageBehind: average(_.pluck(results, 'Behind'), 999),
				shootingPercentage: 1 - (sum(_.pluck(results, 'ShootingTotal')) / (sumArray(_.pluck(results, 'Shootings')) * 5)),
				averagePoints: average(_.pluck(results, 'points'), 999),
				bestPoints: Math.max.apply(null, _.pluck(results, 'points')),
				totalPoints: sum(_.pluck(results, 'points'))
			},
			set = {};
		set['seasons.' + season] = data;
		if (!athlete.seasons) Athletes.update(athlete, {
			$set: {
				seasons: {}
			}
		});
		Athletes.update(athlete, {
			$set: set
		});
	});

}

function calcAggregates(seasons) {

	var count = 0;
	if (!seasons) throw new Meteor.Error('missing_argument', 'Seasons array must be specified');
	else if (typeof seasons === 'string') seasons = [seasons];

	Athletes.find({
		activeSeasons: {
			$in: seasons
		}
	}).forEach(function(athlete) {
		calcAggregate(athlete, seasons);
		count++;
	});

	return count;

}

function calcAggregate(athlete, seasons) {

	var agg = {};
	_.each(athlete.seasons, function(seasonData, seasonId) {
		if (seasons.indexOf(seasonId) > -1) {
			_.each(seasonData, function(val, key) {
				agg[key] = agg[key] ? agg[key] + val : val;
			});
		}
	});
	agg.averagePoints = agg.totalPoints / (agg.races || 1);
	Athletes.update(athlete._id, {
		$set: {
			aggregate: agg
		}
	});
	return true;

}

function sumArray(array) {
	return _.reduce(array, function(total, subArray) {
		return (subArray instanceof Array) ? total + subArray.length : total;
	}, 0);
}

function sum(array, limit) {
	return _.reduce(array, function(total, item) {
		return (!limit || item < limit) ? total + item : total;
	}, 0);
}

function average(array, limit) {
	return sum(array, limit) / ((limit ? _.countBy(array, function(val) {
		return val < limit ? 'include' : 'exclude'
	}).include : array.length) || 1);
}

function findMissingAthletes() {
	var names = _.reduce(_.keys(_.groupBy(Results.find({
		RaceId: {
			$not: /^.*MXRL$/
		}
	}).fetch(), 'IBUId')), function(list, ibuId) {
		if (!relayRegex.exec(ibuId) && !Athletes.findOne({
				IBUId: ibuId
			})) {
			var result = Results.findOne({
				IBUId: ibuId,
				RaceId: {
					$not: /^.*MXRL$/
				}
			});
			if (result) {
				var nameSplit = nameRegex.exec(result.Name),
					newAthlete = {
						FamilyName: nameSplit && nameSplit[1],
						GivenName: nameSplit && nameSplit[2],
						GenderId: result.RaceId.slice(15, 16),
						NAT: result.Nat,
						IBUId: ibuId
					};
				Athletes.insert(newAthlete);
				MissingQueries.insert({
					IBUId: ibuId
				});
			}
			list.push({
				Name: result && result.Name,
				IBUId: ibuId
			});
		}
		return list;
	}, []);
	return names;
}

// OBSERVE MISSING QUERIES TO KEEP COLLECTION UPDATED

MissingQueries.find().observeChanges({
	added: updateMissingCount,
	removed: updateMissingCount
});

// EXPOSE PUBLIC Methods

Crawler = {
	crawl: crawl,
	crawlMissing: crawlMissing,
	updatePoints: updatePoints,
	updateSeasons: updateSeasons
}