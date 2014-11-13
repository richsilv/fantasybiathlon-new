TeamController = RouteController.extend({
  waitOn: function () {
  	return [
  		Meteor.subscribe('core_data', '1314')
  	];
  },

  data: function () {
  	var user = Meteor.user();
  	return user && user.profile.team;
  },

  action: function () {
    this.state.set('changeAthlete'. false);
    this.render();
  }
});