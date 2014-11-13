/*****************************************************************************/
/* Team: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Team.events({
  /*
   * Example:
   *  'click .selector': function (e, tmpl) {
   *
   *  }
   */
});

Template.Team.helpers({
  tempAthletes: function() {
    return Athletes.find({}, {limit: 4, skip: Math.floor(Math.random() * 400)});
  },

  changeAthlete: function() {
    return Router.current().state.get('changeAthlete');
  },

  heightString: function() {
    var changeAthlete = Router.current().state.get('changeAthlete');
    return changeAthlete ? '1-3' : '2-3';
  },

  grid: function() {
    var changeAthlete = Router.current().state.get('changeAthlete');
    return changeAthlete ? {rows: 1, cols: 4} : {rows: 2, cols: 2};    
  }
});

Template.athlete.helpers({
  athleteBackground: function (athlete) {
    var bString = 'url(images/' + athlete.GenderId.toLowerCase() + 'avatar.png), ' + 
                  'url(images/' + athlete.NAT + '.png)';
    return bString;
  }
});

/*****************************************************************************/
/* Team: Lifecycle Hooks */
/*****************************************************************************/
Template.Team.created = function () {
};

Template.Team.rendered = function () {
};

Template.Team.destroyed = function () {
};