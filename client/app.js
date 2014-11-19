/*****************************************************************************/
/* Client App Namespace  */
/*****************************************************************************/
_.extend(App, {
	dps: function(num, dp) {
		return ~~(num * Math.pow(10, dp)) / Math.pow(10, dp);
	}
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
		return (100 - (2 * marginPct * (num))) / num;
	},
  toNum: function(num) {
    return parseInt(num, 10) || 0;
  },
	abbreviate: function(name) {
		return name.match(/[A-Z]/g).join(' ');
	},
  arrayify: function(object) {
    return _.reduce(object, function(list, val, key) {
      if (typeof value === 'object') {
        list.push(_.extend(value, {key: key}));
      } else {
        list.push({key: key, val: val});
      }
      return list;
    }, []);
  },
  fullNation: function(code) {
    var nat = Nations.findOne({Nat: code});
    return nat ? nat.LongName : 'Unknown Nation';
  },
  briefTime: function(dateTime) {
    return moment(dateTime).format("ddd, DD MMM YY");
  }
};

_.each(App.helpers, function(helper, key) {
	Handlebars.registerHelper(key, helper);
});

$(document).on("keydown", function(e) {
	if (e.which === 8 && !$(e.target).is("input, textarea")) {
		e.preventDefault();
	}
});

Template.body.rendered = function() {
	$('body').hammer();
};

App.templateAttach = function(template, callback, data) {
  var instance;
  if (typeof template === "string") template = Template[template];
  if (!template) return false;
  if (data)
    instance = Blaze.renderWithData(template, data, document.body);
  else
    instance = Blaze.render(template, document.body);
  return callback && callback.call(this, instance);
};

App.confirmModal = function(options, postRender) {
  return App.templateAttach(
    Template.confirmModalWrapper, 
    function(instance) {
      var modal = $.UIkit.modal(".uk-modal");
      modal.on({
        'uk.modal.hide': function() {
          $('.uk-modal').remove();
        }
      });
      modal.show();
      postRender && postRender.call(instance, options);
      return modal;
    },
    _.extend({
      content: '',
      header: '',
      callback: null,
      noButtons: false
    }, options)
  );
};

App.generalModal = function(template, data, postRender) {
  return App.templateAttach(
    Template.generalModalWrapper, 
    function(instance) {
      var modal = $.UIkit.modal(".uk-modal");
      modal.on({
        'uk.modal.hide': function() {
          $('.uk-modal').remove();
        }
      });
      modal.show();
      postRender && postRender.call(instance, options);
      return modal;
    },
    {
      template: template,
      data: data
    }
  );
};