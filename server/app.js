_.extend(App, {
	checkPassword: function(password) {
		var passwordObj = SecureData.findOne({key: 'password'});

		if (!password) throw new Meteor.Error('no_password', 'No password was supplied.');

		if (!passwordObj) throw new Meteor.Error('password_unset', 'No impersonate password has been set.');

		if (passwordObj.value !== password) throw new Meteor.Error('incorrect_password', 'Password does not match.', password);

		return true;
	}
});