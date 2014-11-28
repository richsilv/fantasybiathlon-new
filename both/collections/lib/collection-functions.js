CollectionFunctions = {
	isAdmin: function(userId, throwError) {
		var user = Meteor.users.findOne(userId);
		if (user && !user.profile.admin && throwError)
			throw new Meteor.Error('not_admin', 'User does not have admin privileges.');
		return !user || user.profile.admin;
	}
}

Schemas = {};