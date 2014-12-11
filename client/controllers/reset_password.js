ResetPasswordController = RouteController.extend({
  subscriptions: function () {
  },

  data: function () {
  	return {
  		token: this.params.token
  	};
  },

  action: function () {
    this.render();
  },

  onAfterAction: function() {
  }
});