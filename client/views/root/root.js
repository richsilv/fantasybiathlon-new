/*****************************************************************************/
/* Root: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Root.events({
    'click .nav-panel': function(event, template) {
        Router.go(template.$(event.currentTarget).data('link'));
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
	}
});

/*****************************************************************************/
/* Root: Lifecycle Hooks */
/*****************************************************************************/
Template.Root.created = function() {};

Template.Root.rendered = function() {};

Template.Root.destroyed = function() {};