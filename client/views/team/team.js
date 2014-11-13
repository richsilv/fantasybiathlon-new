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