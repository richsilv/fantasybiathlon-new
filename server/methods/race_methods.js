/*****************************************************************************/
/* Races Methods */
/*****************************************************************************/

Meteor.methods({

	'race_methods/add_jobs': function() {

		CollectionFunctions.isAdmin(this.userId, true);

		addJobs();

	},

	'race_methods/check_events': function() {

		CollectionFunctions.isAdmin(this.userId, true);

		checkEvents();

	},

	'race_methods/start_cron': function() {

		CollectionFunctions.isAdmin(this.userId, true);

		startCron();

	},

	'race_methods/reset_cron': function() {

		resetCron();

	}

});

function addJobs() {

	var now = new Date(),
		races = Races.find({StartTime: {$gt: now}});

	races.forEach(function(race) {

		console.log(race);

		SyncedCron.add({
			name: race.RaceId,
			schedule: function(parser) {
				return parser.recur().every(15).minute().after(race.StartTime).fullDate();
			},
			job: function() {
				Crawler.crawl({RaceId: race.RaceId}, {recursive: true, storeResults: true});
				var thisRace = races.findOne(race._id);
				if (thisRace.HasAnalysis) {
					SyncedCron.remove(race.RaceId);
					Crawler.crawlMissing();
					Crawler.findMissingAthletes();
					Crawler.updatePoints();
					Crawler.updateSeasons([race.SeasonId]);
					Crawler.updateCurrentPoints();
				}
			}
		});

	});

}

function checkEvents() {

	var now = new Date(),
		events = Events.find({StartDate: {$gt: now}});

	events.forEach(function(event) {

		_.each([1, 3, 7], function(days) {
			var schedule = new moment(event.StartDate).subtract(days, 'd').toDate();

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

function resetCron() {

	SyncedCron._reset();

}

// EXPOSE GLOBAL Methods

RaceMethods = {

	addJobs: addJobs,
	checkEvents: checkEvents,
	startCron: startCron,
	resetCron: resetCron

};