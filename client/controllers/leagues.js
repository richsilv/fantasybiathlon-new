LeaguesController = RouteController.extend({
  subscriptions: function () {
  	return Meteor.subscribe('team_ranking', this.state.get('query'), this.state.get('skip'), this.state.get('limit'));
  },

  data: function () {
  	var teamCount = Counts.findOne({key: 'teams'});
  	return {
  		teams: TeamRanking.find({}, {sort: {points: -1}}),
  		teamCount: teamCount ? teamCount.value : 0,
  		limit: this.state.get('limit')
  	}
  },

  onRun: function() {
    var rows = Math.floor((($(window).height() * 0.75)- (App.fontSize * 4.6) - 120) / (App.fontSize * 2.3));
  	this.state.set('query', {});
  	this.state.set('skip', 0);
  	this.state.set('limit', rows);
  	this.next();
  },

  action: function () {
    this.render();
  }
});