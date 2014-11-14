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
    return Athletes.find({}, {limit: 4, skip: Math.floor(Math.random() * 300)});
  },

  allAthletes: function() {
    return Athletes.find({});
  },

  changeAthlete: function() {
    return Router.current().state.get('changeAthlete');
  },

  athleteBlockDetails: function() {
    var changeAthlete = Router.current().state.get('changeAthlete');
    return {
      heightString: changeAthlete ? '1-4' : '2-3',
      rows: changeAthlete ? 1 : 2,
      cols: changeAthlete ? 4 : 2,
      marginPct: 1,
      color: 'light-1',
      extraClasses: changeAthlete ? 'small-text' : ''
    }
  },

  athleteTabsDetails: function() {
    var changeAthlete = Router.current().state.get('changeAthlete');
    return {
      height: '3-4',
      color: 'dark-1',
      extraClasses: changeAthlete ? '' : 'collapse'
    }
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