TeamController = RouteController.extend({
  waitOn: function () {
  	return [
  		Subs.subscribe('core_data', '1314')
  	];
  },

  data: function () {
    currentTeam = AppState.get('currentTeam');
    return {
      currentTeam: currentTeam,
      newTeam: this.state.get('newTeam') || []
    }
  },

  action: function () {
    this.render();
  }
});