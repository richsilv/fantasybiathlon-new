ChangeAthleteController = RouteController.extend({
  waitOn: function () {
  },

  data: function () {
  },

  onBeforeAction: function() {

  	var user = Meteor.user();
  	if (!user || !user.profile.team[this.params.IBUId])
  		this.redirect('team');
  	else
  		this.next();
  }

  action: function () {
    this.render();
  }
});