/*****************************************************************************/
/* Client and Server Routes */
/*****************************************************************************/
Router.configure({
  layoutTemplate: 'MasterLayout',
  loadingTemplate: 'Loading',
  notFoundTemplate: 'NotFound'
});

Router.onBeforeAction(function() {

	if (!Meteor.user()) this.redirect('login');
	else this.next();

}, {except: ['login']});

Router.onBeforeAction(function() {

	if (Meteor.user()) this.redirect('root');
	else this.next();

}, {only: ['login']});

Router.onBeforeAction(function() {

	if (!Meteor.user() || !Meteor.user().profile.admin) this.redirect('root');
	else this.next();

}, {only: ['admin']});

Router.onAfterAction(function() {
	if (App && App.thisPage.get() !== this.route.getName()) {
		App.previousPage.set(App.thisPage.get());
		App.thisPage.set(this.route.getName());
	}
})

/*
 *  Example:
 *  Router.route('/', {name: 'home'});
*/
Router.route('/login', {name: 'login'});
Router.route('/admin', {name: 'admin'});
Router.route('/', {name: 'root'});
Router.route('/team', {name: 'team'});
Router.route('/leagues', {name: 'leagues'});
Router.route('/calendar', {name: 'calendar'});
Router.route('/settings', {name: 'settings'});
