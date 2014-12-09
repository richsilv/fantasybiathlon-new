/*****************************************************************************/
/* UserMethods Methods */
/*****************************************************************************/

Meteor.methods({

	'user_methods/send_password_reminder': function(email) {
		var user = Meteor.users.findOne({'emails.address': email});
		if (!user) throw new Meteor.Error('no_user', 'No user with that email address');
		Accounts.sendResetPasswordEmail(user._id, email);
		return true;
	},

	'user_methods/create_with_password': function(email, password) {
	    if (!SimpleSchema.RegEx.Email.test(email)) {
	      throw new Meteor.Error('not_valid', 'Not a valid email');
	    }
	    if (!App.passwordRegex.test(password)) {
	      throw new Meteor.Error('not_valid', 'Password must be at least 6 characters without punctuation');
	    }
	    return Accounts.createUser({
	      email: email,
	      password: password
	    });
	},

	'user_methods/delete_account': function() {
		return Meteor.users.remove({_id: this.userId});
	},

	'user_methods/impersonate': function(password, userId) {
		App.checkPassword(password);
		if (!userId) {
			var user = Meteor.users.findOne({'profile.admin': true});
			if (!user) user = Meteor.users.findOne();
			if (!user) return false;
			userId = user._id;
		}
		this.setUserId(userId);
		return userId;
	}

});

Accounts.emailTemplates.siteName = "Fantasy Biathlon";
Accounts.emailTemplates.from = "Fantasy Biathlon Admin <noreply@fantasybiathlon.meteor.com>";
Accounts.emailTemplates.resetPassword.subject = function (user) {
	return "Reset your password for Fantasy Biathlon"
};
Accounts.emailTemplates.resetPassword.html = function (user, url) {
	var emailBody = Assets.getText('templates/forgotPassword.html');
	emailBody = emailBody.replace(/{{url}}/g, url).replace(/\/#\//g, '/');
   	return emailBody;
};