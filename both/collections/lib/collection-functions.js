CollectionFunctions = {
	isAdmin: function(userId) {
		var user = Meteor.users.findOne(userId);
		return user && user.profile.admin;
	}
}