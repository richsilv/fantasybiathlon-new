/*
 * Add query methods like this:
 *  Athletes.findPublic = function () {
 *    return Athletes.find({is_public: true});
 *  }
 */

Meteor.startup(function() {

	var debouncedUpdateTeamPoints = _.debounce(Meteor.bindEnvironment(TeamMethods.updatePoints), 10000);

	Athletes.after.update(function(userId, doc, fieldNames) {
		if (fieldNames.indexOf('points') > -1) debouncedUpdateTeamPoints();
	});

});