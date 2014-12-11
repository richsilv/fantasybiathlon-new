/*****************************************************************************/
/* TeamMethods Methods */
/*****************************************************************************/

Meteor.methods({
	'team_methods/update_team': function(athletes) {

		this.unblock();

		return updateTeam(this.userId, athletes);

	},

	'team_methods/give_transfers': function(query, transfers) {

		this.unblock();

		CollectionFunctions.isAdmin(this.userId, true);

		return giveTransfers(query, transfers);

	},

	'team_methods/update_points': function(query) {

		this.unblock();

		CollectionFunctions.isAdmin(this.userId, true);

		return updatePoints(query);

	},

	'team_methods/team_start': function(startDate, query) {

		this.unblock();

		CollectionFunctions.isAdmin(this.userId, true);

		return teamStart(startDate, query);

	}
});

function updateTeam(userId, athletes) {

	var user = Meteor.users.findOne(userId),
		team = user.profile.team.members,
		history = user.profile.team.teamHistory,
		newTeam = new FantasyTeam(athletes),
		transfers = newTeam.transfers(team.memberIds()),
		date = new Date();

	newTeam.check(true);

	if (transfers > user.profile.team.transfers) throw new Meteor.Error('insufficient_transfers', 'New team would require too many transfers', transfers);

	history = _.map(history, function(value, key, list) {
		if (!value.endDate) value.endDate = date;
		return value;
	});
	history.push({
		team: athletes,
		startDate: date
	});

	Meteor.users.update(userId, {
		$set: {
			'profile.team.current': athletes,
			'profile.team.teamHistory': history
		},
		$inc: {
			'profile.team.transfers': -transfers
		}
	}, function(err, num) {
		if (err) throw new Meteor.Error(err.reason);
	});

	return true;

}

function giveTransfers(query, transfers) {

	var total = Meteor.users.update(query, {
		$inc: {
			'profile.team.transfers': transfers
		}
	});
	Meteor.users.update({
		'profile.team.transfers': {
			$gt: 4
		}
	}, {
		$set: {
			'profile.team.transfers': 4
		}
	});

	return total;

}

function updatePoints(query) {

	var disabledRaces = Races.find({
		disabled: true
	}, {
		fields: {
			RaceId: 1
		}
	}).map(function(race) {
		return race.RaceId;
	});

	return Meteor.users.find(query || {}).forEach(function(user) {

		var points = 0;

		if (!user || !user.profile || !user.profile.team) return null;
		_.each(user.profile.team.teamHistory, function(history) {
			var timeFilter = {
				$gte: history.startDate
			};
			if (history.endDate) timeFilter['$lte'] = history.endDate;
			Results.find({
				IBUId: {
					$in: history.team
				},
				RaceStartTime: timeFilter
			}).forEach(function(result) {
				if (disabledRaces.indexOf(result.RaceId) === -1) points += result.points;
			});
		});
		console.log("updating points to " + points + " for " + user._id);
		Meteor.users.update(user._id, {
			$set: {
				'profile.team.points': points
			}
		});

	})

}

function teamStart(startDate, query) {

	query = query || {};
	query['profile.team.current'] = {
		$size: 4
	};

	return Meteor.users.find(query).forEach(function(user) {
		Meteor.users.update(user._id, {
			$set: {
				'profile.team.teamHistory': [{
					team: user.profile.team.current,
					startDate: startDate
				}]
			}
		});
	});

}

TeamMethods = {
	updatePoints: updatePoints,
	giveTransfers: giveTransfers,
	updateTeam: updateTeam
};