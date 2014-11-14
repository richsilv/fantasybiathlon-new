/*****************************************************************************/
/* MasterLayout: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.MasterLayout.events({
    'swipeRight': function(e) {
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