/*****************************************************************************/
/* ResetPassword: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.ResetPassword.events({
  'submit, click [data-action="save-new-password"]': function(event, template) {
    event.preventDefault();
    var newPassword = template.$('[data-field="new-password"]').val();
        token = Router.current().data().token;
    if (!App.passwordRegex.test(newPassword)) {
      template.error.set('Password must be at least 6 characters without punctuation');
      return false;
    }
    Accounts.resetPassword(token, newPassword, function(err, res) {
      if (err) template.error.set(err.reason); 
    });
  }
});

Template.ResetPassword.helpers({
  error: function() {
    return Template.instance().error.get();
  }
});

/*****************************************************************************/
/* ResetPassword: Lifecycle Hooks */
/*****************************************************************************/
Template.ResetPassword.created = function () {
  this.error = new ReactiveVar();
};

Template.ResetPassword.rendered = function () {
};

Template.ResetPassword.destroyed = function () {
};