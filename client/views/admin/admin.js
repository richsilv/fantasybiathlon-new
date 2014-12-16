/*****************************************************************************/
/* Admin: Event Handlers and Helpersss .js*/
/*****************************************************************************/
var newField = function() {
    return {
      key: '',
      val: ''
    }
  },
  athleteQuery = new ReactiveVar({}),
  Fields = new Mongo.Collection(null);

Fields.insert(newField());

Template.Admin.helpers({
  /*
   * Example:
   *  items: function () {
   *    return Items.find();
   *  }
   */
   fields: Fields.find(),
   missingQueries: function() {
    var obj = MethodData.findOne({key: 'missingQueries'});
    return obj && obj.count;
   },
   missingPoints: function() {
    var obj = MethodData.findOne({key: 'missingPoints'});
    return obj && obj.count;
   }
});

Template.Admin.events({
  'click [data-action="add-field"]': function(event, template) {
    if (_.every(template.$('.uk-form-controls'), function(row) {
      return _.some($(row).find('[data-field]'), function(field) {
        return !!$(field).val();
      });
    })) Fields.insert(newField());
  },

  'click [data-action="submit"]': function(event, template) {
    var query = {},
        recursive = template.$('[data-field="recursive"]').prop('checked'),
        storeResults = template.$('[data-field="store-results"]').prop('checked');
    template.$('.uk-form-controls').each(function() {
      var key = $(this).find('[data-field="key"]').val(),
          val = $(this).find('[data-field="val"]').val();
      if (key) query[key] = val;
    });
    Meteor.call('crawler/crawl', query, {recursive: recursive, storeResults: storeResults}, function(err, res) {
      console.log(err, res);
    });
  },

  'click [data-action="crawl-missing"]': function(event, template) {
    Meteor.call('crawler/crawl_missing', function(err, res) {
      console.log(err, res);
    });
  },

  'click [data-action="update-points"]': function(event, template) {
    Meteor.call('crawler/update_points', function(err, res) {
      console.log(err, res);
    })
  },

  'click [data-action="clear-db"]': function(event, template) {
    App.confirmModal({
      header: 'Clear Database',
      content: '<p><strong>Are you sure???</strong></p>',
      callback: function() {
        $('.uk-modal').hide();
        $('.uk-modal').remove();
        $('html').removeClass('uk-modal-page');
        Meteor.call('crawler/clear_database', function(err, res) {
          Meteor.setTimeout(function() {
            App.confirmModal({
              header: 'COMPLETE',
              noButtons: true
            });
          }, 1000);
        });        
      }
    })
  },

  'click [data-action="update-seasons"]': function(event, template) {
    Meteor.call('crawler/update_seasons', function(err, res) {
      App.confirmModal({
        header: 'COMPLETE',
        noButtons: true
      });
    });
  },

  'click [data-action="calc-aggregates"]': function(event, template) {
    Meteor.call('crawler/calc_aggregates', ['1415'], function(err, res) {
      App.confirmModal({
        header: 'COMPLETE',
        noButtons: true
      });
    });
  },

  'click [data-action="update-current-points"]': function(event, template) {
    Meteor.call('crawler/update_current_points', function(err, res) {
      App.confirmModal({
        header: 'COMPLETE',
        noButtons: true
      });
    });
  }
})

Template.controls.events({
  'keyup [data-field]': function(event, template) {
    var $target = template.$(event.currentTarget),
      set = {};
    set [$target.data('field')] = $target.val();
    Fields.update({
      _id: this._id
    }, {
      $set: set
    });
    if (_.every(template.$('[data-field]'), function(field) {return !$(field).val();}) && Fields.find().count() > 1)
      Fields.remove({_id: this._id});
  }
});

Template.httpData.helpers({
  methodData: function (key) {
    return MethodData.findOne({key: key});
  }
});

Template.athleteSettings.helpers({
  athletes: function () {
    return Athletes.find(athleteQuery.get(), {sort: {value: -1}});
  }
});

Template.athleteSettings.events({
  'click [data-action="automatic-points"]': function (event, template) {
    var max = Athletes.findOne({}, {sort: {'aggregate.totalPoints': -1}}).aggregate.totalPoints,
        prop = parseFloat(template.$('[data-field="prop"]').val(), 10),
        buffer = parseFloat(template.$('[data-field="buffer"]').val(), 10),        
        maxPoints = 11,
        minPoints = 0;
    Athletes.find().forEach(function(athlete) {
      var s = sinusoid(athlete.aggregate ? athlete.aggregate.totalPoints : 0, max, prop, maxPoints, minPoints, buffer);
      Athletes.update({_id: athlete._id}, {$set: {value: App.dps(s, 1)}});
    });    
  },
  'click [data-action="activate-all"]': function () {
    Athletes.find().forEach(function(athlete) {
      Athletes.update({_id: athlete._id}, {$set: {active: true}});
    });
  },
  'click [data-action="deactivate-all"]': function () {
    Athletes.find().forEach(function(athlete) {
      Athletes.update({_id: athlete._id}, {$set: {active: false}});
    });
  },
  'change [data-field="active"]': function(event, template) {
    var checked = template.$(event.currentTarget).prop('checked');
    Athletes.update({_id: this._id}, {$set: {active: checked}});
  },
  'change [data-field="value"]': function(event, template) {
    var value = template.$(event.currentTarget).val();
    Athletes.update({_id: this._id}, {$set: {value: parseFloat(value, 10)}});
  },
  'submit .uk-form': function(event, template) {
    event.preventDefault();
    var string = template.$('[data-field="query"]').val();
    try {
      var query = JSON.parse(string);
    } catch(e) {
      console.log("Cannot parse " + string);
    }
    athleteQuery.set(query);
  }
});

/*****************************************************************************/
/* Admin: Lifecycle Hooks */
/*****************************************************************************/
Template.Admin.created = function() {};

Template.Admin.rendered = function() {};

Template.Admin.destroyed = function() {};

function sinusoid(points, max, prop, limit, auto, buffer) {
  var rem = 1 - (auto / limit),
      linear = rem * (1 - prop) * limit * points / max,
      val = buffer + ((points / max) * (1 - (2 * buffer))),
      sinusoid = rem * prop * Math.min(limit, Math.max(0, (limit / 2) - Math.log((1 / val) - 1)));
  return auto + linear + sinusoid;
}