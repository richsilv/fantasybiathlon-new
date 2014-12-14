_.mixin({
	debounceWithArgs: function(func, timeOutDuration) {
		var timeOut,
			_this = this,
			newFunc = function() {
				var args = Array.prototype.slice.call(arguments);
				if (timeOut) {
					Meteor.clearTimeout(timeOut);
				}
				timeOut = Meteor.setTimeout(function() {
					func.apply(_this, args);
					Meteor.clearTimeout(timeOut);
					timeOut = null;
				}, timeOutDuration);
			}
		return newFunc;
	}
});

FantasyTeam = function(memberIds) {

	memberIds = (memberIds && memberIds.length) ? memberIds : [];

	var _this = this,
		eligibilityMemo = {};

	if (Meteor.isClient) _this.dep = new Tracker.Dependency();

	this.members = [];
		maxValue = App.MAX_VALUE,

	this._id = Random.id();

	_.each(memberIds, function(id) {
		if (_this.members.length < 4) {
			if (id._id) {
				var athlete = Athletes.findOne(id._id, {reactive: false});
				if (athlete) _this.members.push(athlete);
			} else if (id.IBUId) {
				var athlete = Athletes.findOne({
					IBUId: IBUId
				}, {reactive: false});
				if (athlete) _this.members.push(athlete);
			} else {
				var athlete = Athletes.findOne({
					$or: [{
						IBUId: id
					}, {
						_id: id
					}]
				}, {reactive: false});
				if (athlete) _this.members.push(athlete);
			}
		}
	});

	while (_this.members.length < 4) {
		_this.members.push({});
	}

	this.maxValue = function() {
		return maxValue;
	}

	this.eligibleAthletes = function() {
		_this.dep && _this.dep.depend();
		var result,
			memoKey = _this.memberIds().join('');
		if (eligibilityMemo[memoKey]) return eligibilityMemo[memoKey];
		var remainder = maxValue - _this.value() + 0.01,
			genders = _.countBy(_this.members, 'GenderId'),
			ineligibleNations = _.reduce(_.countBy(_this.members, 'NAT'), function(arr, val, key) {
				if (val > 1) arr.push(key);
				return arr;
			}, []),
			eligible = Athletes.find({
				IBUId: {
					$nin: _this.memberIds()
				},
				value: {
					$lte: remainder
				},
				NAT: {
					$nin: ineligibleNations
				},
				GenderId: {
					$nin: _.reduce(genders, function(arr, val, key) {
						if (val > 1) arr.push(key);
						return arr;
					}, [])
				}
			}, {
				fields: {
					IBUId: 1
				}
			}).fetch();
		result =  {
			eligible: _.pluck(eligible, 'IBUId') || [],
			genders: genders,
			NATs: ineligibleNations,
			remainder: remainder
		};
		eligibilityMemo[memoKey] = result;
		return result;
	}

};

FantasyTeam.prototype.replace = function(memberIds) {

	memberIds = (memberIds && memberIds.length) ? memberIds : [];

	var _this = this;

	_this.members = [];

	_.each(memberIds, function(id) {
		if (_this.members.length < 4) {
			if (id._id) {
				var athlete = Athletes.findOne(id._id, {reactive: false});
				if (athlete) _this.members.push(athlete);
			} else if (id.IBUId) {
				var athlete = Athletes.findOne({
					IBUId: IBUId
				}, {reactive: false});
				if (athlete) _this.members.push(athlete);
			} else {
				var athlete = Athletes.findOne({
					$or: [{
						IBUId: id
					}, {
						_id: id
					}]
				}, {reactive: false});
				if (athlete) _this.members.push(athlete);
			}
		}
	});

	while (_this.members.length < 4) {
		_this.members.push({});
	}

	_this.dep && _this.dep.changed();

}

FantasyTeam.prototype.remove = function(id) {
	var _this = this;
	if (_.isNumber(id)) {
		_this.members = _this.members.splice(id, 1);
		_this.dep && _this.dep.changed();
	} else {
		_this.members = _.filter(_this.members, function(athlete) {
			return (athlete.IBUId !== id && athlete._id !== id);
		})
		_this.dep && _this.dep.changed();
	}
	if (_this.members.length < 4) {
		_this.members.push({});
		return true;
	}
	return false;
}

FantasyTeam.prototype.add = function(id) {
	var _this = this;
	var athlete;
	if (id._id) {
		athlete = Athletes.findOne(id._id);
	} else if (id.IBUId) {
		athlete = Athletes.findOne({
			IBUId: IBUId
		});
	} else {
		athlete = Athletes.findOne({
			$or: [{
				IBUId: id
			}, {
				_id: id
			}]
		});
	}
	if (athlete) {
		var removeFlag = false,
			newMembers = _.filter(_this.members, function(ath) {
				if (_.isEmpty(ath) && !removeFlag) {
					removeFlag = true;
					return false
				} else return true;
			});
		if (newMembers.length < 4) {
			_this.dep && _this.dep.changed();
			newMembers.push(athlete);
			_this.members = newMembers;
			return true;				
		}
	}

	return false;
}

FantasyTeam.prototype.value = function() {
	var _this = this;
	_this.dep && _this.dep.depend();
	return _.reduce(_this.members, function(total, athlete) {
		return total + (athlete.value || 0);
	}, 0);
}

FantasyTeam.prototype.get = function() {
	var _this = this;
	_this.dep && _this.dep.depend();
	return _this;
}

FantasyTeam.prototype.memberIds = function() {
	var _this = this;
	return _.compact(_.pluck(_this.members, 'IBUId')).sort();
}

FantasyTeam.prototype.depend = function() {
	var _this = this;
	return _this.dep && _this.dep.depend();
}

FantasyTeam.prototype.check = function(throwErrors) {
	var _this = this;

	if (!throwErrors && Meteor.isClient) {
		_this.dep.depend();
	}

	var IBUIds = _this.memberIds();
	if (_.uniq(IBUIds).length < IBUIds.length) {
		if (throwErrors) throw new Meteor.Error('ineligible_team', 'Duplicate IBUId', IBUIds);
		return false;
	}

	if (this.value() > this.maxValue() + 0.01) {
		if (throwErrors) throw new Meteor.Error('ineligible_team', 'Team is too expensive', this.value());
		return false;
	}

	var genders = _.countBy(_this.members, 'GenderId');

	if (genders.undefined) {
		if (throwErrors) throw new Meteor.Error('ineligible_team', 'Team does not have four members', _this.members);
		return false;
	}

	if (Math.max.apply(null, _.values(genders)) > 2) {
		if (throwErrors) throw new Meteor.Error('ineligible_team', 'Team has more than two of one gender', genders);
		return false;			
	}

	var nations = _.countBy(_this.members, 'NAT');		

	if (Math.max.apply(null, _.values(nations)) > 2) {
		if (throwErrors) throw new Meteor.Error('ineligible_team', 'Team has more than two from one nation', nations);
		return false;						
	}

	return true
}

FantasyTeam.prototype.transfers = function(team, reactive) {
	var _this = this;
	if (reactive && Meteor.isClient)
		_this.dep.depend();
	if (team.memberIds) team = team.memberIds();
	if (team[0] && team[0].IBUId)
		team = _.pluck(team, 'IBUId');

	return _.difference(team, _this.memberIds()).length;
}

FantasyTeam.prototype.randomize = function() {

}