Meteor.startup(function() {

	RaceMethods.addJobs();
	RaceMethods.checkEvents();
	RaceMethods.startCron();

});