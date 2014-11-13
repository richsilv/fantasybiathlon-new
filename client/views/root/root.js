/*****************************************************************************/
/* Root: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Root.events({
    'click .nav-panel': function(event, template) {
        Router.go(template.$(event.currentTarget).data('link'));
    }
});

Template.Root.helpers({

});

/*****************************************************************************/
/* Root: Lifecycle Hooks */
/*****************************************************************************/
Template.Root.created = function() {};

Template.Root.rendered = function() {};

Template.Root.destroyed = function() {};