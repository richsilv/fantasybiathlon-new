$.preloadImages = function(images) {
	var readyDep = new Tracker.Dependency(),
		imageObjs = {};
	for (var i = 0; i < images.length; i++) {
		Meteor.defer((function(image, index) {
			$("<img />").attr("src", image).load(function() {
				imageObjs[index] = true;
				readyDep.changed();
			}).on('error', function() {
				console.log('Cannot load ' + image);
				imageObjs[index] = true;
				readyDep.changed();
			});
			imageObjs[index] = false;
		}).bind(this, images[i], i));
	}
	return {
		ready: function() {
			readyDep.depend();
			return _.every(imageObjs, _.identity);
		}
	}
};

Meteor.startup(function() {
	Tracker.autorun(function(c) {
		if (Nations.find().count()) {
			nationFlags = [];
			Nations.find().forEach(function(nation) {
				nationFlags.push('images/' + nation.Nat + '.png');
				nationFlags.push('images/' + nation.Nat + 'small.png');
			});
			ImagePreloader = $.preloadImages(nationFlags);
			c.stop();
		}
	});

});