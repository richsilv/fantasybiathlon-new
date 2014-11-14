/*****************************************************************************/
/* Client App Namespace  */
/*****************************************************************************/
_.extend(App, {
	dps: function(num, dp) {
		return ~~(num * Math.pow(10, dp))/Math.pow(10, dp);		
	},
	thisPage: new ReactiveVar('root'),
	previousPage: new ReactiveVar(null)
});

App.helpers = {
	keyVal: function(object, ignoreList) {
		ignoreList = ignoreList instanceof Array ? ignoreList : ['_id'];
		return _.reduce(object, function(list, val, key) {
			if (ignoreList.indexOf(key) === -1) {
				list.push({
					key: key,
					val: val
				});
			}
			return list;
		}, []);
	},
	numberWithCommas: function(x) {
    	return x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
	},
	equals: function(x, y) {
		return x === y;
	},
	dps: function(num, dp) {
		return App.dps(num, dp);
	},
	toPercent: function(num, marginPct) {
		return (100 - (2 * marginPct * (num + 1))) / num;
	},
	abbreviate: function(name) {
		return name.match(/[A-Z]/g).join(' ');
	}
};

_.each(App.helpers, function (helper, key) {
  Handlebars.registerHelper(key, helper);
});

$(document).on("keydown", function (e) {
    if (e.which === 8 && !$(e.target).is("input, textarea")) {
        e.preventDefault();
    }
});

UI.body.rendered = function() {
	// $('body').hammer();
};