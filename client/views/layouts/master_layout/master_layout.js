/*****************************************************************************/
/* MasterLayout: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.MasterLayout.events({
    'swipeRight': function(e) {
    	if (!App.state.get('dragging'))
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

/*****************************************************************************/
/* MasterLayout: Lifecycle Hooks */
/*****************************************************************************/
Template.MasterLayout.created = function() {};

Template.MasterLayout.rendered = function() {};

Template.MasterLayout.destroyed = function() {};

Template.MasterLayout.events({
	'dragstart .ui-draggable-handle': function() {
		App.state.set('dragging', 1);
	},
	'dragstop .ui-draggable-handle': function() {
		App.state.set('dragging', 1);
	}
});
