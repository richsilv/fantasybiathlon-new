/*****************************************************************************/
/* Team: Event Handlers and Helpersss .js*/
/*****************************************************************************/
var teamState = new ReactiveDict(),
  userUpdateDebounce = _.debounceWithArgs(function(set) {
    Meteor.users.update({
      _id: Meteor.userId()
    }, {
      $set: set
    });
  }, 500);

Template.Team.events({
  'keyup [data-field="name"]': function(event, template) {
    newName = template.$(event.currentTarget).val();
    if (newName !== Meteor.user().profile.team.name) {
      var set = {
        'profile.team.name': template.$(event.currentTarget).val()
      };
      userUpdateDebounce(set);
    }
  },
  'change [data-field="NAT"]': function(event, template) {
    var set = {
      'profile.team.country': event.added.id
    };
    Meteor.users.update({
      _id: Meteor.userId()
    }, {
      $set: set
    });
  }
});

Template.Team.helpers({
  myAthletes: function() {
    var team = Router.current().newTeam;
    return team && team.get().members;
  },

  name: function() {
    user = Meteor.users.findOne(Meteor.connection._userId, {reactive: false});
    return user.profile.team.name;
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
      color: (changeAthlete ? 'dark-1' : 'light-1'),
      extraClasses: 'overlay ' + (changeAthlete ? 'small-text' : ''),
      borders: !changeAthlete,
      extraStyles: 'z-index: 3;'
    }
  },

  athleteTabsDetails: function() {
    var changeAthlete = teamState.get('changeAthlete');
    return {
      heightString: '7-12',
      color: 'light-1',
      extraClasses: changeAthlete ? '' : 'collapse',
      extraStyles: 'z-index: 5;'
    }
  },

  collapse: function() {
    return teamState.get('changeAthlete') ? '' : 'collapse';
  },

  nations: function() {
    return Nations.find();
  },

  eligibility: function() {
    var team = Router.current().newTeam;
    return team && team.eligibleAthletes();
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
      bString = 'url(images/' + athlete.GenderId.toLowerCase() + 'avatar2.png), ' +
      'url(images/' + athlete.NAT + '.png)';
    else
      bString = 'url(images/mavatar2.png)'
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
    var team = Router.current().newTeam;
    return team && team.value();
  },
  transfers: function() {
    var team = Router.current().newTeam;
    return Meteor.user() && Meteor.user().profile.team.transfers - (team ? team.transfers(Router.current().currentTeam, true) : 0);
  },
  eligibility: function() {
    var team = Router.current().newTeam;
    return team && team.eligibleAthletes();
  },
  invalid: function() {
    var team = Router.current().newTeam;
    return !team || !Router.current().newTeam.check() || !Meteor.user() ||
            Meteor.user().profile.team.transfers < Router.current().newTeam.transfers(Router.current().currentTeam, true);
  },
  MAX_VALUE: function() {
    return window.App && App.MAX_VALUE;
  }
});

Template.teamDetails.events({
  'click [data-action="save-team"]:not("disabled")': function() {
    var newTeam = Router.current().newTeam,
      transfers = newTeam.transfers(Router.current().currentTeam);
    App.confirmModal({
      header: "Save Team?",
      content: "<p>Are you sure you want to save this team?" + 
                (transfers ? (" This will use up " + transfers + " transfer" + (transfers > 1 ? "s" : "") + ".</p>") : "</p>"),
      callback: function() {
        Meteor.call('team_methods/update_team', newTeam.memberIds(), function(err, res) {
          if (res) {
            modal = $.UIkit.modal(".uk-modal");
            modal && modal.hide();
            $('html').removeClass('uk-modal-page');
            history.go(-2);
          }
        });
      }
    });
  }
});

Template.athleteTab.helpers({
  eligible: function() {
    var eligibility = Template.parentData(1).eligibility;
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
    Meteor.subscribe('athlete_history', this.IBUId);
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
    Meteor.subscribe('results', this.IBUId, SeasonId);
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
    Meteor.subscribe('results', this.IBUId, SeasonId);
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
    $('html').removeClass('uk-modal-page');
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
    $('html').removeClass('uk-modal-page');
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
    $('html').removeClass('uk-modal-page');
  }
});


/*****************************************************************************/
/* Team: Lifecycle Hooks */
/*****************************************************************************/
Template.Team.created = function() {

  teamState.set('changeAthlete', 0);
  $(window).on('popstate', function(event) {
    var user = Meteor.user();
    Router.current().currentTeam.replace(user ? user.profile.team.members.memberIds() : []);
    Router.current().newTeam.replace(Router.current().currentTeam.memberIds());
    teamState.set('changeAthlete', 0);
  });

};

Template.Team.rendered = function() {

  $('select[data-field="NAT"]').select2({
    minimumResultsForSearch: -1
  });

  this.autorun(function() {
    var user = Meteor.user();
    $('select[data-field="NAT"]').select2('val', Meteor.user().profile.country);
  });

};

Template.Team.destroyed = function() {
  $(window).off('popstate');
};

Template.athleteBlock.rendered = function() {
  var _this = this;

  this.$(".athlete-panel").droppable({
    drop: function(e, ui) {
      var athlete = Blaze.getData(ui.draggable[0]);
      Router.current().newTeam.add(athlete.IBUId);

      // JUMP BACK TO POSITION INSTANTLY, THEN REVERT FLOAT BACK
      $(ui.draggable).draggable("option", "revertDuration", 0);
      Meteor.defer(function() {
        $(ui.draggable).draggable("option", "revertDuration", 250)
      });

      AppState.set('dragOverlay', 0);
    },
    scope: 'athlete-tabs',
    tolerance: 'pointer'
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
      var athlete = Blaze.getData(ui.draggable[0]);
      Router.current().newTeam.remove(athlete.IBUId);
      AppState.set('dragOverlay', 0);
    },
    scope: 'athletes',
    tolerance: 'pointer'
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

    var team = Router.current().newTeam;

    team && team.depend();

    Meteor.defer(function() {
      _this.$('.athlete-tab:not(.disabled)').draggable("option", "disabled", false);
      _this.$('.athlete-tab.disabled').draggable("option", "disabled", true);
    });
  });

}

Template.athleteModal.created = function() {}

function transfers() {
  return Router.current().state.get('transfers');
}

// DELETE ME

getTeamState = function() {
  return teamState;
};

getTeamValue = function(team) {
  return teamValue(team);
}