/*****************************************************************************/
/* Races Methods */
/*****************************************************************************/

Meteor.methods({

	'race_methods/add_crons': function() {

		addCrons();

	},

	'race_methods/check_events': function() {

		checkEvents();

	},

	'race_methods/start_cron': function() {

		startCron();

	}

});

function addCrons() {

	var now = new Date(),
		races = Races.find({RaceStart: {$gt: now}});

	races.forEach(function(race) {

		SyncedCron.add({
			name: race.RaceId,
			schedule: function(parser) {
				return parser.recur().every(15).minute().after(race.StartTime).fullDate();
			},
			job: function() {
				Crawler.crawl({RaceId: race.RaceId}, {recursive: true, storeResults: true});
				var thisRace = races.findOne(race._id);
				if (thisRace.HasAnalysis) SyncedCron.remove(race.RaceId);
			}
		});

	});

}

function checkEvents() {

	var now = new Date(),
		events = Events.find({StartDate: {$gt: now}});

	events.forEach(function(event) {

		_.each([1, 3, 7], function(days) {
			var schedule = new moment(event.StartDate).subtract(days, 'd').toString();

			SyncedCron.add({
				name: event.EventId + days.toString() + 'd',
				schedule: function(parser) {
					return parser.recur().on(schedule).fullDate();
				},
				job: function() {
					Crawler.crawl({EventId: event.EventId}, {recursive: true, storeResults: true});
					SyncedCron.remove(event.EventId + days.toString() + 'd');
				}
			});
		});

	});

}

function startCron() {

	SyncedCron.start();

}

// EXPOSE GLOBAL Methods

RaceMethods = {

	addCrons: addCrons,
	checkEvents: checkEvents,
	startCron: startCron

};