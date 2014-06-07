function CharacterFactory (options) {
	var defaultOptions = {
		spawnX: 0,
		spawnY: 0,
		scale: 1,
		width: 32,
		height: 32,
		baseSpeed: 5,
		speedMultiplier: 1,
		maxSpeed: 5,
		tileMap: null,
		sprite_sheet: null,
		frame_size: [32,32],
		frame_duration: 100,
		animationSubset: {
			down:  null,
			up:    null,
			left:  null,
			right: null
		},
		anchor: [0.5, 0.75],
		radius: 8
	};
	
	// Merge options
	options = $.extend({}, defaultOptions, options);

	// Double-check required options.
	if (!options.tileMap) throw "Character needs a TileMap.";

	var self = new jaws.Sprite({
		x: options.spawnX,
		y: options.spawnY,
		scale: options.scale,
		anchor: options.anchor,
		radius: options.radius
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
	
	self.radius = options.radius;
	
	self.prevPos = {
		x: self.x,
		y: self.y
	};

	self.update = function () {
		self.prevPos = {
			x: self.x,
			y: self.y
		};
	};

	self.move = function (angle, magnitude) {
		var speed = self.getSpeed() * magnitude;
		speed = speed > options.maxSpeed ? options.maxSpeed : speed;
		var x = Math.sin(angle) * speed;
		var y = Math.cos(angle) * speed;
		
		self.x += x;
		if (options.tileMap.collides(self)) self.x -= x;

		self.y += y;
		if (options.tileMap.collides(self)) self.y -= y;
		
		if (x < 0) {
			self.setImage(animation.subsets["left"].next());
		}
		else if (x > 0) {
			self.setImage(animation.subsets["right"].next());
		}
		if (y < 0 && y < x) {
			self.setImage(animation.subsets["up"].next());
		}
		else if (y > 0 && y > x) {
			self.setImage(animation.subsets["down"].next());
		}
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
		self.move(1.57079633, -1);
		self.setImage(animation.subsets["left"].next());
	};
	
	self.moveRight = function() {
		self.move(1.57079633, 1);
		self.setImage(animation.subsets["right"].next());
	};

	return self;
}