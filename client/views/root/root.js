/*****************************************************************************/
/* Root: Event Handlers and Helpersss .js*/
/*****************************************************************************/
var welcomeShown = false;

Template.Root.events({
    'click .nav-panel': function(event, template) {
        Bender.go(template.$(event.currentTarget).data('link'), {}, {animation: 'slideLeft'});
    }
});

Template.Root.helpers({
	teamName: function() {
		return Meteor.user().profile.team.name;
	},
	nextRace: function() {
		var race = Races.findOne({StartTime: {$gt: new Date()}}, {sort: {StartTime: 1}}),
			ev = Events.findOne({EventId: race && race.EventId});
		return race && _.extend(race, ev);
	},
	position: function() {
		var posObj = Counts.findOne({key: 'position'});
		return posObj ? posObj.value + App.getOrdinal(posObj.value) : '---';
	},
	points: function() {
		return Meteor.user().profile.team.points;
	}
});

/*****************************************************************************/
/* Root: Lifecycle Hooks */
/*****************************************************************************/
Template.Root.created = function() {};

Template.Root.rendered = function() {

	Tracker.autorun(function(c) {
		var welcome = Messages.findOne({key: 'welcome'});
		if (welcomeShown) {
			c.stop();
		} else if (welcome) {
			App.confirmModal({
				content: welcome.message,
				noButtons: true
			});
			c.stop();
			welcomeShown = true;
		}
	});


};

Template.Root.destroyed = function() {};