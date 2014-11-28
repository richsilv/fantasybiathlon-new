/*****************************************************************************/
/* MasterLayout: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.MasterLayout.events({
    'swipeRight': function(e) {
    	if (!AppState.get('dragging'))
	        history.back();
    }
});

Template.MasterLayout.helpers({

    transition: function() {
        return function(from, to, element) {
            return to.template === "Root" ? 'left-to-right' : 'right-to-left';
        }
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

Template.MasterLayout.rendered = function() {};

Template.MasterLayout.destroyed = function() {};

Template.MasterLayout.events({
	'dragstart .ui-draggable-handle': function() {
		AppState.set('dragging', 1);
	},
	'dragstop .ui-draggable-handle': function() {
		AppState.set('dragging', 1);
	}
});
