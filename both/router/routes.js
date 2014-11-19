/*****************************************************************************/
/* Client and Server Routes */
/*****************************************************************************/
Subs = new SubsManager();

Router.configure({
  layoutTemplate: 'MasterLayout',
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
Router.route('/change_athlete/:IBUId', {name: 'change.athlete'});
