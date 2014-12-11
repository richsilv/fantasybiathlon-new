/*****************************************************************************/
/* Data Publish Functions
/*****************************************************************************/

Meteor.publish('all_data', function() {
	return [
		Results.find(),
		Analysis.find(),
		Races.find(),
		Events.find(),
		Athletes.find({}, {
			transform: function(ath) {
				ath.firstLetter = ath.FamilyName.slice(0, 1);
				return ath;
			}
		})
	];
});

Meteor.publish('core_data', function(SeasonId) {
	var athleteQuery = {
		active: true
	};
	return [
		Results.find({
			SeasonId: SeasonId
		}, {
			fields: {
				IBUId: 1,
				RaceId: 1,
				EventId: 1,
				Name: 1,
				Rank: 1,
				points: 1,
				RaceStartTime: 1
			}
		}),
		Races.find({
			SeasonId: SeasonId
		}, {
			fields: {
				RaceId: 1,
				catId: 1,
				DisciplineId: 1,
				StartTime: 1,
				ShortDescription: 1,
				EventId: 1,
				SeasonId: 1,
				disabled: 1
			}
		}),
		Events.find({
			SeasonId: SeasonId,
			EventId: {
				$regex: /^BT.+SWRL.+$/
			}
		}, {
			fields: {
				EventId: 1,
				SeasonId: 1,
				Organizer: 1,
				Nat: 1,
				Description: 1,
				StartDate: 1,
				EndDate: 1
			}
		}),
		Athletes.find(athleteQuery, {
			fields: {
				FamilyName: 1,
				GenderId: 1,
				GivenName: 1,
				IBUId: 1,
				NAT: 1,
				activeSeasons: 1,
				value: 1,
				points: 1
			}
		}),
		Nations.find({}),
		Messages.find({})
	];
});

Meteor.publish('athlete_history', function(id) {
	return Athletes.find({
		$or: [{
			_id: id
		}, {
			IBUId: id
		}]
	});
});

Meteor.publish('results', function(id, season) {
	return Results.find({
		$or: [{
			_id: id,
			SeasonId: season
		}, {
			IBUId: id,
			SeasonId: season
		}]
	});
});

Meteor.publish('all_athletes', function(SeasonId) {
	query = SeasonId ? {
		activeSeasons: SeasonId
	} : {};
	return Athletes.find(query);
});

var idDict = {};

Meteor.publish('team_ranking', function(query, skip, limit) {
	query = query || {};

	var _this = this,
		posId = Random.id(),
		user = Meteor.users.findOne(this.userId),
		position = 1 + skip,
		subHandle = limit && Meteor.users.find(query, {
			sort: {
				'profile.team.points': -1
			},
			skip: skip,
			limit: limit,
			fields: {
				'profile.team.name': 1,
				'profile.team.points': 1,
				'profile.country': 1
			}
		}).observeChanges({
			added: function(id, fields) {
				if (fields.profile && fields.profile.team) {
					var newId = idDict[id] ? idDict[id] : Random.id(),
						ranking = {
							name: fields.profile.team.name,
							country: fields.profile.country,
							points: fields.profile.team.points,
							position: position++,
							isUser: id === _this.userId
						};
					idDict[id] = newId;
					_this.added('team_ranking', newId, ranking);
				}
			},
			changed: function(id, fields) {
				var ranking = {
						name: fields.team.name,
						country: fields.country,
						points: fields.team.points
					};
				_this.changed('team_ranking', idDict[id], ranking);
				_this.added('counts', posId, {
					key: 'position',
					value: myPos()
				});					
			},
			removed: function(id) {
				_this.removed('team_ranking', idDict[id]);
			}
		});

	_this.added('counts', posId, {
		key: 'position',
		value: myPos()
	})

	_this.ready();

	_this.onStop(function() {
		subHandle && subHandle.stop();
	});

	function myPos() {
		return Meteor.users.find({
			'profile.team.points': {
				$gt: user.profile.team.points
			}
		}).count() + 1;
	}
});

Meteor.publish('counts', function() {

	var _this = this,
		ids = {
			teams: Random.id(),
			athletes: Random.id()
		};

	this.added('counts', ids['teams'], {
		key: 'teams',
		value: Meteor.users.find().count()
	});
	this.added('counts', ids['athletes'], {
		key: 'athletes',
		value: Athletes.find().count()
	});

	var interval = Meteor.setInterval(function() {
		_this.added('counts', ids['teams'], {
			key: 'teams',
			value: Meteor.users.find().count()
		});
		_this.added('counts', ids['athletes'], {
			key: 'athletes',
			value: Athletes.find().count()
		});		
	}, 5000);

	_this.ready();

	_this.onStop(function() {
		Meteor.clearInterval(interval);
	});

});