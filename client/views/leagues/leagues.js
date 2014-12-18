/*****************************************************************************/
/* Leagues: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Leagues.events({
  'uk.pagination.select': function(event, template, page) {
    var routerState = Router.current().state;
    routerState.set('skip', page * routerState.get('limit'));
  }
});

Template.Leagues.helpers({

});

/*****************************************************************************/
/* Leagues: Lifecycle Hooks */
/*****************************************************************************/
Template.Leagues.created = function() {};

Template.Leagues.rendered = function() {
  var _this = this,
      router = Router.current(),
      positionDoc = Counts.findOne({
        key: 'position'
      }),
      startPage = positionDoc ? (Math.floor((positionDoc.value - 1) / router.state.get('limit'))) + 1 : 1;
  Router.current().state.set('skip', Router.current().state.get('limit') * (startPage - 1));
  this.autorun(function(c) {
    _this.pagination = $.UIkit.pagination(_this.$('.uk-pagination'), {
      items: router.data().teamCount,
      itemsOnPage: router.state.get('limit'),
      edges: 2,
      currentPage: startPage
    });
  });
};

Template.Leagues.destroyed = function() {};