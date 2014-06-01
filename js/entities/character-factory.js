function CharacterFactory (options) {
	var defaultOptions = {
		spawnX: 0,
		spawnY: 0,
		scale: 1,
		width: 32,
		height: 32,
		baseSpeed: 5,
		speedMultiplier: 1,
		maxSpeed: 10,
		tileMap: null,
		sprite_sheet: null,
		frame_size: [32,32],
		frame_duration: 100,
		animationSubset: {
			down:  null,
			up:    null,
			left:  null,
			right: null
		}
	};
	
	// Merge options
	options = $.extend({}, defaultOptions, options);

	// Double-check required options.
	if (!options.tileMap) throw "Character needs a TileMap.";

	var self = new jaws.Sprite({
		x: options.spawnX,
		y: options.spawnY,
		scale: options.scale
	});
	
	var animation = new jaws.Animation({
		sprite_sheet: options.sprite_sheet,
		frame_size: [16,16],
		frame_duration: 100,
		subsets: options.animationSubsets
	});
	
	self.setImage(animation.subsets["down"].next());
	
	self.getSpeed = function(){
		var speed = options.baseSpeed * options.speedMultiplier;
		return speed < options.maxSpeed ? speed : options.maxSpeed;
	};

	self.move = function (x, y) {
		var speed = self.getSpeed();
		x = x * speed;
		y = y * speed;

		this.x += x;
		if (options.tileMap.collides(self)) this.x -= x;

		this.y += y;
		if (options.tileMap.collides(self)) this.y -= y;
	};
	
	self.moveDown = function() {
		self.move(0, 1);
		self.setImage(animation.subsets["down"].next());
	};
	
	self.moveUp = function() {
		self.move(0, -1);
		self.setImage(animation.subsets["up"].next());
	};
	
	self.moveLeft = function() {
		self.move(-1,0);
		self.setImage(animation.subsets["left"].next());
	};
	
	self.moveRight = function() {
		self.move(1,0);
		self.setImage(animation.subsets["right"].next());
	};

	return self;
}