function HackNSlashPlayer (options) {
	var defaultOptions = {
		x: 0,
		y: 0,
		scale: 2,
		width: 16,
		height: 16,
		maxSpeed: 5,
		spriteSheet: null,
		tileMap: null
	};
	
	// Merge options
	options = $.extend({}, defaultOptions, options);

	// Double-check required options.
	if (!options.tileMap) throw "Player needs a TileMap.";

	var self = new jaws.Sprite({
		image: options.image,
		x: options.x,
		y: options.y,
		scale: options.scale
	});

	self.speed = {
		x: 5,
		y: 5
	};

	self.move = function (x, y) {
		x = x * self.speed.x;
		y = y * self.speed.y;

		this.x += x;
		if (options.tileMap.collides(self)) this.x -= x;

		this.y += y;
		if (options.tileMap.collides(self)) this.y -= y;
	};

	return self;
}