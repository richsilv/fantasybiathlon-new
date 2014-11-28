RootController = RouteController.extend({
  waitOn: function () {
   	return [
  		Subs.core
  	];
  },

  data: function () {
  },

  action: function () {
    this.render();
  }
});