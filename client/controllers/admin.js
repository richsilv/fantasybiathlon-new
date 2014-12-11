AdminController = RouteController.extend({
  subscriptions: function () {
  	return [
  		Meteor.subscribe('method_data'),
  		Meteor.subscribe('core_data', '1314'),
  		Meteor.subscribe('all_athletes')
  	];
  },

  data: function () {
  },

  action: function () {
    this.render();
  }
});