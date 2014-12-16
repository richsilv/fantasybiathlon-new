/*****************************************************************************/
/* Login: Event Handlers and Helpersss .js*/
/*****************************************************************************/
var loginOptions = Meteor.isCordova ? { loginStyle: "redirect" } : {};

Template.Login.events({
  'click [data-action="login-with-email"]': function(event, template) {
    App.generalModal('loginWithEmail');
  },
  'click [data-vendor]': function(event, template) {
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

Template.loginWithEmail.helpers({
  error: function () {
    return Template.instance().error.get();
  }
});

Template.loginWithEmail.events({
  'submit, click [data-action="email-sign-in"]': function(event, template) {
    event.preventDefault();
    var email = template.$('[data-field="email"]').val(),
        password = template.$('[data-field="password"]').val(),
        instance = Template.instance();
    Meteor.loginWithPassword(email, password, function(err, res) {
      if (err) instance.error.set(err.reason);
      else {
        $('.uk-modal').hide();
        $('.uk-modal').remove();
      }
    });    
  },
  'click [data-action="email-sign-up"]': function(event, template) {
    event.preventDefault();
    var email = template.$('[data-field="email"]').val(),
        password = template.$('[data-field="password"]').val(),
        instance = Template.instance();
    if (!SimpleSchema.RegEx.Email.test(email)) {
      instance.error.set('Not a valid email');
      return false;
    }
    if (!App.passwordRegex.test(password)) {
      instance.error.set('Password must be at least 6 characters without punctuation');
      return false;
    }
    Accounts.createUser({email: email, password: password}, function(err, res) {
      if (err) instance.error.set(err.reason);
      else {
        $('.uk-modal').hide();
        $('.uk-modal').remove();
      }     
    });
  },
  'click [data-action="forgotten-password"]': function(event, template) {
    event.preventDefault();
    var email = template.$('[data-field="email"]').val(),
        password = template.$('[data-field="password"]').val(),
        instance = Template.instance();
    if (!SimpleSchema.RegEx.Email.test(email)) {
      instance.error.set('Please enter your email address so that we can send a reminder');
      return false;
    }
    Meteor.call('user_methods/send_password_reminder', email, function(err, res) {
      if (err) instance.error.set(err.reason);
      else instance.error.set('Password reminder has been sent to ' + email);
    });
  }
});

/*****************************************************************************/
/* Login: Lifecycle Hooks */
/*****************************************************************************/
Template.Login.created = function() {};

Template.Login.rendered = function() {};

Template.Login.destroyed = function() {};

Template.loginWithEmail.created = function () {
  this.error = new ReactiveVar();
};