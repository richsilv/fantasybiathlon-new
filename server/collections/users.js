Accounts.validateNewUser(function(user) {
    if (user.emails && user.emails.length && !SimpleSchema.RegEx.Email.test(user.emails[0].address)) {
      throw new Meteor.Error('not_valid', 'Not a valid email');
    }
    return true;
})