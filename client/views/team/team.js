/*****************************************************************************/
/* Team: Event Handlers and Helpersss .js*/
/*****************************************************************************/
var teamState = new ReactiveDict(),
    MAX_PRICE = 15;

Template.Team.events({
  'navigate': function(event, template) {
    event.preventDefault();
    console.log(event);
  }
});

Template.Team.helpers({
  myAthletes: function() {
    var team = this.newTeam,
        athletes = Athletes.find({
          IBUId: {
            $in: team
          }
        }, {limit: 4}).fetch();
    while (athletes.length < 4) {
      athletes.push({});
    }
    return athletes;
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
      extraClasses: 'overlay ' + (changeAthlete ? 'small-text' : '')
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

Template.athleteBlock.helpers({
  dragOverlay: function() {
    return App.state.get('dragOverlay');
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
    var bString;
    if (athlete && athlete.IBUId)
      bString = 'url(images/' + athlete.GenderId.toLowerCase() + 'avatar.png), ' +
      'url(images/' + athlete.NAT + '.png)';
    else
      bString = 'url(images/mavatar.png)'
    return bString;
  }
});

Template.athlete.events({
  'dragstart .athlete': function(event, template) {
    if (teamState.get('changeAthlete')) {
      console.log(this, event);
      App.state.set('dragOverlay', 1);
    }
  },
  'dragstop .athlete': function(event, template) {
    App.state.set('dragOverlay', 0);
  }
});

Template.teamDetails.helpers({
  dragOverlay: function() {
    return !!App.state.get('dragOverlay');
  }
});

Template.athleteTab.helpers({
  eligible: function() {
    return eligible(this);
  }
});

Template.athleteTab.events({
  'dragstart .athlete-tab': function(event) {
    $('.athlete-tab-panel').css('overflow-y', 'visible');
  },
  'dragstop .athlete-tab': function(event) {
    var stateObj = Router.current().state,
        athlete = Blaze.getData(event.currentTarget);
    console.log(this, event);
    $('.athlete-tab-panel').css('overflow-y', '');
    stateObj.set('newTeam', stateObj.get('newTeam').push(athlete._id));
  },
  'click .athlete-tab': function(event, template) {
    App.confirmModal({
      header: this.FamilyName + ', ' + this.GivenName,
      content: 'This is a description of the athlete',
      noButtons: true,
    });
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
    /*    appendTo: 'body',
        helper: 'clone',*/
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

function teamPrice(team) {

  var price = 0;

  if (team.fetch) {
    team.forEach(function(athlete) {
      price += athlete.price;
    })
  } else {
    team.forEach(function(athlete) {
      if (athlete.price) {
        price += athlete.price;
      } else {
        var thisAthlete = Athletes.findOne({$or: [{_id: athlete}, {IBUId: athlete}]});
        if (thisAthlete) price += thisAthlete.price;
      }
    });
  }
  return price;

}

function eligible(athlete, team) {
  if (!team) team = Router.current().data().newTeam;
  var price = teamPrice(team),
      athlete = athlete.price ? athlete : Athletes.findOne({$or: [{_id: athlete}, {IBUId: athlete}]});
  if (!athlete) return false;
  else if (price + athlete.price > MAX_PRICE) return false;
}