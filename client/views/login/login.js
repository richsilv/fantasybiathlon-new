/*****************************************************************************/
/* Login: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Login.events({
  /*
   * Example:
   *  'click .selector': function (e, tmpl) {
   *
   *  }
   */
});

Template.Login.helpers({
  /*
   * Example:
   *  items: function () {
   *    return Items.find();
   *  }
   */
});

/*****************************************************************************/
/* Login: Lifecycle Hooks */
/*****************************************************************************/
Template.Login.created = function() {};

Template.Login.rendered = function() {};

Template.Login.destroyed = function() {};

Tracker.autorun(function(c) {

  var user = Meteor.user(),
    currentTeam = user && user.profile.team.current;

  AppState.set('currentTeam', currentTeam);

});