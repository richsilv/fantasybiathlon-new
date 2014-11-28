/*****************************************************************************/
/* Settings: Event Handlers and Helpersss .js*/
/*****************************************************************************/
var modals = {};

Template.Settings.events({
  'click [data-action="delete-account"]': function(event, template) {
    App.confirmModal({
      header: 'Really Delete Account?',
      content: '<p>Are you <strong>sure</strong> you want to delete your account?  This cannot be reversed.</p>',
      callback: function() {
        Meteor.call('user_methods/delete_account', function(err, res) {
          $('.uk-modal').hide()
          $('html').removeClass('uk-modal-page');
        });
      }
    });
  },
  'click [data-action="logout"]': function(event, template) {
    Meteor.logout();
  },
  'click [data-action="rules"]': function(event, template) {
    modals.rulesModal = App.generalModal('rulesModal');
  },
  'click [data-action="scoring"]': function(event, template) {
    modals.scoringModal = App.generalModal('scoringModal');
  }
});

Template.Settings.helpers({
  /*
   * Example:
   *  items: function () {
   *    return Items.find();
   *  }
   */
});

Template.rulesModal.events({
  'click': function () {
    modals.rulesModal && modals.rulesModal.hide();
    $('html').removeClass('uk-modal-page');
  }
});

Template.scoringModal.events({
  'click': function () {
    modals.scoringModal && modals.scoringModal.hide();
    $('html').removeClass('uk-modal-page');
  }
});

/*****************************************************************************/
/* Settings: Lifecycle Hooks */
/*****************************************************************************/
Template.Settings.created = function () {
};

Template.Settings.rendered = function () {
};

Template.Settings.destroyed = function () {
};