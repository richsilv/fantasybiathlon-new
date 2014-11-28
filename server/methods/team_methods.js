/*****************************************************************************/
/* TeamMethods Methods */
/*****************************************************************************/

Meteor.methods({
	'team_methods/update_team': function(athletes) {
		var user = Meteor.users.findOne(this.userId),
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

		Meteor.users.update(this.userId, {
			$set: {
				'profile.team.current': athletes,
				'profile.team.history': history
			},
			$inc: {
				'profile.team.transfers': -transfers
			}
		});

		return true;

	},

	'team_methods/give_transfers': function(query, transfers) {

		CollectionFunctions.isAdmin(this.userId, true);

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
});