function HackNSlashPlayer (options) {
	var defaultOptions = {
		x: 0,
		y: 0,
		width: 16,
		height: 16,
		maxSpeed: 5,
		spriteSheet: null
	};

	var state = {
		health   : 100,
		maxHealth: 100,

		speed    : {x: 0, y: 0},
		velocity : {x: 0, y: 0}
	};

	// Merge options
	$.extend({}, options, defaultOptions);

	this.run = function (x, y) {
		// TODO
	};

	this.walk = function (x, y) {
		// TODO
	};
}