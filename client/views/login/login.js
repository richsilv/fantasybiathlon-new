/*****************************************************************************/
/* Login: Event Handlers and Helpersss .js*/
/*****************************************************************************/
var loginOptions = Meteor.isCordova ? { loginStyle: "redirect" } : {};

Template.Login.events({
  'click button': function(event, template) {
    var vendor = $(event.currentTarget).data('vendor');
    Meteor['loginWith' + vendor] && Meteor['loginWith' + vendor](loginOptions);
  }
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