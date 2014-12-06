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

	},

	'race_methods/get_cron_jobs': function() {

		return SyncedCron._entries;

	},

	'race_methods/get_next_cron_job': function(jobId) {

		return SyncedCron.nextScheduledAtDate(jobId);

	}

});

function addJobs() {

	var now = new Date(),
		races = Races.find({StartTime: {$gt: now}});

	races.forEach(function(race) {

		SyncedCron.add({
			name: race.RaceId,
			schedule: function(parser) {
				return parser.recur().every(15).minute().after(race.StartTime).fullDate();
			},
			job: function() {
				var result = 'Crawling at ' + new Date().toString() + '\n';
				Crawler.crawl({RaceId: race.RaceId}, {recursive: true, storeResults: true});
				var thisRace = Races.findOne(race._id);
				if (thisRace.HasAnalysis) {
					SyncedCron.remove(race.RaceId);
					result += 'Crawling Missing at ' + new Date().toString() + '\n';
					Crawler.crawlMissing();
					result += 'Crawling Missing Athletes at ' + new Date().toString() + '\n';
					Crawler.findMissingAthletes();
					result += 'Updating Points at ' + new Date().toString() + '\n';
					Crawler.updatePoints();
					result += 'Updating Seasons at ' + new Date().toString() + '\n';
					Crawler.updateSeasons([race.SeasonId]);
					result += 'Updating Current Points at ' + new Date().toString() + '\n';
					Crawler.updateCurrentPoints();
					Email.send({
						from: 'SyncedCron@fantasybiathlon.meteor.com',
						to: 'fantasybiathlon@gmail.com',
						subject: 'Race Cron Running - ' + race.RaceId,
						text: 'Race id ' + race.RaceId + ', the ' + race.ShortDescription + ' which started at ' + race.StartTime.toString() + '.\n' + result
					});
					return result;
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

			if (schedule > now) {
				SyncedCron.add({
					name: event.EventId + days.toString() + 'd',
					schedule: function(parser) {
						return parser.recur().on(schedule).fullDate();
					},
					job: function() {
						Email.send({
							from: 'SyncedCron@fantasybiathlon.meteor.com',
							to: 'fantasybiathlon@gmail.com',
							subject: 'Checking Schedule',
							text: 'Checking schedule for ' + event.EventId + ' (' + event.Organizer + ').'
						});
						Crawler.crawl({EventId: event.EventId}, {recursive: true, storeResults: true});
						SyncedCron.remove(event.EventId + days.toString() + 'd');
					}
				});
			}
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