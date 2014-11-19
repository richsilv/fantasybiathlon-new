RootController = RouteController.extend({
  waitOn: function () {
   	return [
  		Subs.subscribe('core_data', '1314')
  	];
  },

  data: function () {
  },

  action: function () {
    this.render();
  }
});