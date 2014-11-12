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

/*
 *  Example:
 *  Router.route('/', {name: 'home'});
*/
Router.route('/login', {name: 'login'});
Router.route('/admin', {name: 'admin'});
Router.route('/', {name: 'root'});
