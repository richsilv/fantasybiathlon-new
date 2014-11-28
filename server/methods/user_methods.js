/*****************************************************************************/
/* UserMethods Methods */
/*****************************************************************************/

Meteor.methods({

	'user_methods/delete_account': function() {
		return Meteor.users.remove({_id: this.userId});
	}

});