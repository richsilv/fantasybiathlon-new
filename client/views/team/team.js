/*****************************************************************************/
/* Team: Event Handlers and Helpersss .js*/
/*****************************************************************************/
var teamState = new ReactiveDict();

Template.Team.events({
  'navigate': function(event, template) {
    event.preventDefault();
    console.log(event);
  }
});

Template.Team.helpers({
  tempAthletes: function() {
    return Athletes.find({}, {
      limit: 4,
      skip: Math.floor(Math.random() * 300)
    });
  },

  allAthletes: function() {
    return Athletes.find({});
  },

  changeAthlete: function() {
    return teamState.get('changeAthlete');
  },

  athleteBlockDetails: function() {
    var changeAthlete = teamState.get('changeAthlete');
    return {
      heightString: changeAthlete ? '1-4' : '2-3',
      rows: changeAthlete ? 1 : 2,
      cols: changeAthlete ? 4 : 2,
      marginPct: 1,
      color: 'dark-2',
      extraClasses: changeAthlete ? 'small-text' : ''
    }
  },

  athleteTabsDetails: function() {
    var changeAthlete = teamState.get('changeAthlete');
    return {
      heightString: '1-2',
      color: 'dark-1',
      extraClasses: changeAthlete ? '' : 'collapse'
    }
  }
});

Template.athleteBlock.events({
  'click': function() {
    history.pushState({}, "Change Athlete", "/team");
    teamState.set('changeAthlete', 1);
  }
});

Template.athlete.helpers({
  athleteBackground: function(athlete) {
    var bString = 'url(images/' + athlete.GenderId.toLowerCase() + 'avatar.png), ' +
      'url(images/' + athlete.NAT + '.png)';
    return bString;
  }
});

Template.athlete.events({
  'dragstart .athlete': function(event, template) {
    if (teamState.get('changeAthlete')) {
      console.log(this, event);
      teamState.set('dragging', 1);
    }
  },
  'dragstop .athlete': function(event, template) {
    teamState.set('dragging', 0);
  }
});

Template.teamDetails.helpers({
  dragging: function () {
    return !!teamState.get('dragging');
  }
});

Template.athleteTab.events({
  'dragstop .athlete-tab': function(event) {
    console.log(this, event);
  }
});

/*****************************************************************************/
/* Team: Lifecycle Hooks */
/*****************************************************************************/
Template.Team.created = function() {
    teamState.set('changeAthlete', 0);
    $(window).on('popstate', function(event) {
      teamState.set('changeAthlete', 0);
    });
};

Template.Team.rendered = function() {};

Template.Team.destroyed = function() {
    $(window).off('popstate');  
};

Template.athlete.rendered = function() {
  var _this = this;
  this.$(".athlete").draggable({
    addClasses: false,
    containment: 'document',
    delay: 600,
    distance: 20,
    opacity: 0.75,
    revert: true,
    revertDuration: 250,
    zIndex: 100,
    scroll: false
  });  
}

Template.athleteTabs.rendered = function() {
  this.$(".athlete-tab").draggable({
    addClasses: false,
    appendTo: 'body',
    helper: 'clone',
    containment: 'document',
    delay: 300,
    distance: 20,
    opacity: 0.75,
    revert: true,
    revertDuration: 250,
    zIndex: 100,
    scroll: false
  });
}