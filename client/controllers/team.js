TeamController = RouteController.extend({

  waitOn: function() {
    return [
      Subs.core
    ];
  },

  onBeforeAction: function() {

    if (!this.currentTeam) this.currentTeam = new FantasyTeam();
    if (!this.newTeam) this.newTeam = new FantasyTeam();

    var user = Meteor.user();
    this.currentTeam.replace(user ? user.profile.team.members.memberIds() : []);
    this.newTeam.replace(this.currentTeam.memberIds());
    this.next();
  },

  data: function () {
    return {
      currentTeam: this.currentTeam,
      newTeam: this.newTeam
    }
  },

  action: function () {
    this.render();
  }
});