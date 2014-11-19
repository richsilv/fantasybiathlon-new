AdminController = RouteController.extend({
  waitOn: function () {
  	return [
  		Subs.subscribe('method_data'),
  		Subs.subscribe('core_data', '1314'),
  		Subs.subscribe('all_athletes')
  	];
  },

  data: function () {
  },

  action: function () {
    this.render();
  }
});