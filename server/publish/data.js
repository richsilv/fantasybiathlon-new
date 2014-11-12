/*****************************************************************************/
/* Data Publish Functions
/*****************************************************************************/

Meteor.publish('all_data', function() {
	return [
		Results.find(),
		Analysis.find(),
		Races.find(),
		Events.find(),
		Athletes.find()
	];
});

Meteor.publish('core_data', function(SeasonId) {
	return [
		Results.find({SeasonId: SeasonId}, {fields: {IBUId: 1, RaceId: 1, EventId: 1, Name: 1, Rank: 1, points: 1, RaceStartTime: 1}}),
		Races.find({SeasonId: SeasonId}, {fields: {RaceId: 1, catId: 1, DisciplineId: 1, StartTime: 1, ShortDescription: 1, EventId: 1, SeasonId: 1}}),
		Events.find({SeasonId: SeasonId}, {fields: {EventId: 1, SeasonId: 1, Organizer: 1, Nat: 1, Description: 1}}),
		Athletes.find({activeSeasons: SeasonId}, {fields: {FamilyName: 1, GenderId: 1, GivenName: 1, IBUId: 1, Nat: 1, activeSeasons: 1}})
	];
});

Meteor.publish('athlete_history', function(id) {
	return Athletes.find({$or: [{_id: id}, {IBUId: id}]});
});

Meteor.publish('all_athletes', function(SeasonId) {
	query = SeasonId ? {activeSeasons: SeasonId} : {};
	return Athletes.find(query);
});