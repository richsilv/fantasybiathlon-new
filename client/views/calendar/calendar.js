/*****************************************************************************/
/* Calendar: Event Handlers and Helpersss .js*/
/*****************************************************************************/
var open = new ReactiveVar();

Template.Calendar.events({
  /*
   * Example:
   *  'click .selector': function (e, tmpl) {
   *
   *  }
   */
});

Template.Calendar.helpers({
  eventList: function() {
    return Events.find({SeasonId: App.activeSeason}, {sort: {StartDate: 1}});
  },
  raceList: function() {
    return Races.find({EventId: this.EventId}, {sort: {StartTime: 1}})
  },
  open: function() {
    return this.EventId === open.get();
  }
});

Template.eventHeader.events({
  'click [data-action="change-event"]': function () {
    open.set(this.EventId);
  }
});

/*****************************************************************************/
/* Calendar: Lifecycle Hooks */
/*****************************************************************************/
Template.Calendar.created = function () {
};

Template.Calendar.rendered = function () {
  var nextEvent = Events.findOne({SeasonId: App.activeSeason, EndDate: {$gt: new Date()}}, {sort: {EndDate: 1}});
  open.set(nextEvent && nextEvent.EventId);
};

Template.Calendar.destroyed = function () {
};