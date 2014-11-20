/*****************************************************************************/
/* Team: Event Handlers and Helpersss .js*/
/*****************************************************************************/
var teamState = new ReactiveDict(),
  MAX_VALUE = 15;

Template.Team.events({
  'navigate': function(event, template) {
    event.preventDefault();
  },
  'keyup [data-field="name"]': function(event, template) {
    var set = {
      'profile.team.name': $(event.currentTarget).val()
    };
    Meteor.users.update({_id: Meteor.userId()}, {
      $set: set
    });
  }
});

Template.Team.helpers({
  myAthletes: function() {
    var team = this.newTeam,
      athletes = Athletes.find({
        IBUId: {
          $in: team
        }
      }, {
        limit: 4
      }).fetch();
    while (athletes.length < 4) {
      athletes.push({});
    }
    return athletes;
  },

  allAthletes: function() {
    return Athletes.find({}, {
      sort: {
        value: -1
      }
    });
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
      extraClasses: 'overlay ' + (changeAthlete ? 'small-text' : ''),
      borders: !changeAthlete,
      extraStyles: 'z-index: 3;'
    }
  },

  athleteTabsDetails: function() {
    var changeAthlete = teamState.get('changeAthlete');
    return {
      heightString: '7-12',
      color: 'dark-1',
      extraClasses: changeAthlete ? '' : 'collapse',
      extraStyles: 'z-index: 5;'
    }
  },

  collapse: function() {
    return teamState.get('changeAthlete') ? '' : 'collapse';
  }
});

Template.athleteBlock.helpers({
  dragOverlay: function() {
    return AppState.get('dragOverlay');
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
      AppState.set('dragOverlay', 1);
    }
  },
  'dragstop .athlete': function(event, template) {
    AppState.set('dragOverlay', 0);
  }
});

Template.teamDetails.helpers({
  dragOverlay: function() {
    return !!AppState.get('dragOverlay')
  },
  value: function() {
    return teamState.get('teamValue');
  },
  transfers: function() {
    return AppState.get('transfers');
  },
  eligibility: function() {
    return teamState.get('eligibility');
  },
  MAX_VALUE: MAX_VALUE
});

Template.athleteTab.helpers({
  eligible: function() {
    var eligibility = teamState.get('eligibility');
    return eligibility && eligibility.eligible.indexOf(this.IBUId) > -1;
  },
  seasonsDep: function() {
    var dummy = this.seasonsSub.ready();
  }
});

Template.athleteTab.events({
  'click .athlete-tab': function(event, template) {
    var modal = {
      template: 'athleteInfo',
      data: {
        IBUId: this.IBUId
      }
    };
    Subs.subscribe('athlete_history', this.IBUId);
    teamState.set('modal', modal);
    $('.ui-draggable-dragging').remove();
    teamState.modal = App.generalModal('athleteModal');
  }
});

Template.athleteInfo.helpers({
  athlete: function() {
    return Athletes.findOne({
      IBUId: this.IBUId
    });
  }
});

Template.athleteModal.helpers({
  page: function() {
    return teamState.get('modal');
  }
});

Template.athleteInfo.events({
  'click [data-action="show-season"]': function(event, template) {
    var _this = this,
        parentData = Template.parentData(0);
    event.stopImmediatePropagation();
    var SeasonId = $(event.currentTarget).data(SeasonId);
    Subs.subscribe('results', this.IBUId, SeasonId);
    $('.athlete-modal').animate({
      opacity: 0
    }, 250, function() {
      teamState.set('modal', {
        template: 'athleteSeason',
        data: {
          IBUId: parentData.IBUId,
          SeasonData: _this
        }
      });
    }).animate({
      opacity: 1
    }, 250);
  },
  'click [data-action="show-results"]': function(event, template) {
    var _this = this;
    event.stopImmediatePropagation();
    var SeasonId = App.activeSeason;
    Subs.subscribe('results', this.IBUId, SeasonId);
    $('.athlete-modal').animate({
      opacity: 0
    }, 250, function() {
      teamState.set('modal', {
        template: 'athleteResults',
        data: {
          IBUId: _this.IBUId,
          SeasonId: SeasonId
        }
      });
    }).animate({
      opacity: 1
    }, 250);
  },
  'click': function() {
    teamState.modal.hide();
  }
});

Template.athleteResults.helpers({
  athlete: function() {
    return Athletes.findOne({
      IBUId: this.IBUId
    });
  },
  results: function() {
    return Results.find(this);
  },
  raceDeets: function(RaceId) {
    var race = Races.findOne({
      RaceId: RaceId
    }) || {};
    event = Events.findOne({
      EventId: race.EventId
    }) || {};
    return _.extend(event, race);
  }
});

Template.athleteResults.events({
  'click': function() {
    teamState.modal.hide();
  }
});

Template.athleteSeason.helpers({
  athlete: function() {
    return Athletes.findOne({
      IBUId: this.IBUId
    });
  },
  athleteSeason: function() {
    return this.SeasonData.val;
  },
  SeasonId: function() {
    return this.SeasonData.key;
  }
});

Template.athleteSeason.events({
  'click': function() {
    teamState.modal.hide();
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

Template.Team.rendered = function() {
  Router.current().state.set('newTeam', AppState.get('currentTeam'));

  this.autorun(function() {
    var team = Router.current().data().newTeam;
    teamState.set('eligibility', eligibleAthletes(team));
    teamState.set('teamValue', teamValue(team));
  });

};

Template.Team.destroyed = function() {
  $(window).off('popstate');
};

Template.athleteBlock.rendered = function() {
  var _this = this;

  this.$(".athlete-panel").droppable({
    drop: function(e, ui) {
      var stateObj = Router.current().state,
        athlete = Blaze.getData(ui.draggable[0]),
        newTeam = stateObj.get('newTeam');
      if (newTeam.length < 4) stateObj.set('newTeam', newTeam.concat([athlete.IBUId]));

      // JUMP BACK TO POSITION INSTANTLY, THEN REVERT FLOAT BACK
      $(ui.draggable).draggable("option", "revertDuration", 0);
      Meteor.defer(function() {
        $(ui.draggable).draggable("option", "revertDuration", 250)
      });

      AppState.set('dragOverlay', 0);
    },
    scope: 'athlete-tabs'
  });

  this.autorun(function() {
    if (teamState.get('changeAthlete')) {
      _this.$(".athlete:not(.dummy)").draggable('option', 'disabled', false);
      _this.$(".athlete.dummy").draggable('option', 'disabled', true);
    } else {
      _this.$(".athlete").draggable('option', 'disabled', true);
    }
  })
};

Template.teamDetails.rendered = function() {
  this.$('[data-action="remove-athlete"]').droppable({
    drop: function(e, ui) {
      var stateObj = Router.current().state,
        athlete = Blaze.getData(ui.draggable[0]),
        newTeam = _.without(stateObj.get('newTeam'), athlete.IBUId);
      stateObj.set('newTeam', newTeam);
      AppState.set('dragOverlay', 0);
    },
    scope: 'athletes'
  });
}

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
    scroll: false,
    scope: 'athletes'
  });
}

Template.athleteTab.rendered = function() {

  var _this = this;

  this.$(".athlete-tab").draggable({
    addClasses: false,
    appendTo: '[data-momentum]',
    helper: function() {
      return $('<div class="athlete-tab-dummy">' + $(this).children('.athlete-tab-contents')[0].outerHTML + '</div>');
    },
    containment: 'document',
    delay: 600,
    distance: 20,
    opacity: 0.75,
    revert: true,
    revertDuration: 250,
    zIndex: 100,
    scroll: false,
    scope: 'athlete-tabs'
  });

  _this.autorun(function() {
    teamState.get('eligibility');
    Meteor.defer(function() {
      _this.$('.athlete-tab:not(.disabled)').draggable("option", "disabled", false);
      _this.$('.athlete-tab.disabled').draggable("option", "disabled", true);
    });
  });

}

Template.athleteModal.created = function() {
}

// UTILITY FUNCTIONS

function teamValue(team) {

  var value = 0;
  if (!team) team = Router.current().data().newTeam;
  if (team.fetch) {
    team.forEach(function(athlete) {
      value += athlete.value;
    })
  } else if (team instanceof Array) {
    team.forEach(function(athlete) {
      if (athlete.value) {
        value += athlete.value;
      } else {
        var thisAthlete = Athletes.findOne({
          $or: [{
            _id: athlete
          }, {
            IBUId: athlete
          }]
        });
        if (thisAthlete) value += thisAthlete.value;
      }
    });
  }
  return Math.round(value * 10) / 10;

}

function transfers() {
  return Router.current().state.get('transfers');
}

function eligibleAthletes(team) {
  if (!team) team = Router.current().data().newTeam;
  var teamMembers = Athletes.find({
      IBUId: {
        $in: team
      }
    }).fetch(),
    remainder = MAX_VALUE - teamValue(teamMembers),
    genders = _.countBy(teamMembers, 'GenderId'),
    ineligibleNations = _.reduce(_.countBy(teamMembers, 'NAT'), function(arr, val, key) {
      if (val > 1) arr.push(key);
      return arr;
    }, []),
    eligible = Athletes.find({
      IBUId: {
        $nin: team
      },
      value: {
        $lte: remainder
      },
      NAT: {
        $nin: ineligibleNations
      },
      GenderId: {
        $nin: _.reduce(genders, function(arr, val, key) {
          if (val > 1) arr.push(key);
          return arr;
        }, [])
      }
    }, {
      fields: {
        IBUId: 1
      }
    }).fetch();
  return {
    eligible: _.pluck(eligible, 'IBUId') || [],
    genders: genders,
    NATs: ineligibleNations,
    remainder: remainder
  };
}

// DELETE ME

getTeamState = function() {
  return teamState;
};

getTeamValue = function(team) {
  return teamValue(team);
}