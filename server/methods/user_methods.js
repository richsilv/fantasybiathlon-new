/*****************************************************************************/
/* UserMethods Methods */
/*****************************************************************************/

Meteor.methods({

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