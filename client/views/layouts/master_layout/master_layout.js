/*****************************************************************************/
/* MasterLayout: Event Handlers and Helpersss .js*/
/*****************************************************************************/
var excludeSwipeBack = [
  'root',
  'login',
  'reset.password'
]

Template.MasterLayout.events({
    'swipeRight': function(e) {
    	if (!AppState.get('dragging') && excludeSwipeBack.indexOf(Router.current().route.getName()) === -1)
	        history.back();
    },
    'click .hover-area-left': function(e) {
      Bender.go('root', {}, {animation: 'slideRight'});
    }
});

Template.MasterLayout.helpers({
  routeExcludeSwipeBack: function() {
    return excludeSwipeBack.indexOf(Router.current().route.getName()) > -1;
  }
});

Template.confirmModal.events({
  'click [data-action="confirm"]': function (event, template) {
    this.callback && this.callback.apply(this, $(event.currentTarget));
  },
  'click [data-action="cancel"]': function (event, template) {
    var modal = $.UIkit.modal(".uk-modal");
    modal && modal.hide();
    $('html').removeClass('uk-modal-page');
  }
});

/*****************************************************************************/
/* MasterLayout: Lifecycle Hooks */
/*****************************************************************************/
Template.MasterLayout.created = function() {};

Template.MasterLayout.rendered = function() {
  $('#main-container').css('font-size', App.fontSize + 'px');
  $('html').css('font-size', App.fontSize + 'px');
  $('#main-container').css('line-height', App.fontSize * 1.6 + 'px');
  $('html').css('line-height', App.fontSize * 1.6 + 'px');
  Bender.initialize(this.$('#main-container'));
};

Template.MasterLayout.destroyed = function() {};

Template.MasterLayout.events({
	'dragstart .ui-draggable-handle': function() {
		AppState.set('dragging', 1);
	},
	'dragstop .ui-draggable-handle': function() {
		AppState.set('dragging', 0);
	}
});
