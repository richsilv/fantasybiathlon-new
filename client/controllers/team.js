TeamController = RouteController.extend({
  waitOn: function () {
  	return [
  		Meteor.subscribe('core_data', '1314')
  	];
  },

  data: function () {
  	var user = Meteor.user(),
        current = user && user.profile.team.current;
    this.state.set('newTeam', current);
    return {
      current: current,
      newTeam: this.state.get('newTeam')
    }
  },

  action: function () {
    this.render();
  },

  onStop: function() {
  }
});