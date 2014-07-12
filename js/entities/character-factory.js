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
		frame_size: [16, 16],
		frame_duration: 100,
		animationSubset: {
			down:  null,
			up:    null,
			left:  null,
			right: null,
			damage: null,
			dead: null
		},
		anchor: [0.5, 0.75],
		radius: 8
	};
	
	// Merge options
	options = $.extend({}, defaultOptions, options);

	// Double-check required options.
	if (!options.tileMap) throw "Character needs a TileMap.";

	// Create Character object from jaws.Sprite.
	var self = new jaws.Sprite({
		x: options.spawnX,
		y: options.spawnY,
		scale: options.scale,
		anchor: options.anchor,
		radius: options.radius
	});

	// A hash of actions currently being performed by the character.
	self.actionsQueued = {};

	/**
	 * Draw the Character onto jaws.context.
	 * @return Void
	 */
	self.draw = function () {
		// Call original jaws.Sprite.draw() function.
		jaws.Sprite.prototype.draw.call(this);

		// Draw attack animation.
		if (self.actionsQueued["attack"] != null) {
			var context = jaws.context;
			(function ()
			{
				var attack = self.actionsQueued["attack"];
				
				context.beginPath();
				context.arc(attack.startX, attack.startY, attack.reach, 0, 2 * Math.PI, false);
				context.fillStyle = 'green';
				context.globalAlpha = 0.5;
				context.fill();
				context.lineWidth = 5;
				context.strokeStyle = '#003300';
				context.stroke();
				
				context.moveTo(attack.startX, attack.startY);
				context.lineTo(attack.endX, attack.endY);
				context.lineWidth = 5;
				context.globalAlpha = 1;
				context.strokeStyle = 'blue';
				context.stroke();
			})();
		}
	};

	var animation = new jaws.Animation({
		sprite_sheet: options.sprite_sheet,
		frame_size: options.frame_size,
		frame_duration: options.frame_duration,
		subsets: options.animationSubsets
	});
	
	self.setImage(animation.subsets["down"].next());
	
	/**
	 * Return the Character's base speed with any applicable buffs applied.
	 * @return {Void}
	 */
	self.getSpeed = function(){
		var speed = options.baseSpeed * options.speedMultiplier;
		return speed < options.maxSpeed ? speed : options.maxSpeed;
	};
	
	/**
	 * A radius to use for circle-based collisions.
	 * @type {Number}
	 */
	self.radius = options.radius;
	
	// TODO: CharacterFactory.prevPos is not currently used.  Can we remove it?
	self.prevPos = {
		x: self.x,
		y: self.y
	};

	self.update = function () {
		self.actionsQueued = {};
		self.prevPos = {
			x: self.x,
			y: self.y
		};
	};

	/**
	 * Move the Character in the given direction (angle) with the given
	 * magnitude.
	 * @param  {Number} angle     Given in degrees where 0 is up, 180 is down, etc.
	 * @param  {Number} magnitude A value between 0 and 1.  If 1, the character will be move at it's max speed.
	 * @return {Void}
	 */
	self.move = function (angle, magnitude) {
		var speed = self.getSpeed() * magnitude;
		speed = speed > options.maxSpeed ? options.maxSpeed : speed;
		var x = Math.sin(angle) * speed;
		var y = Math.cos(angle) * speed;
		
		self.x += x;
		self.y += y;
		
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
	
	/*
	 * Resourcing
	 */
	self.resources = {
		health: {
			min: 0,
			max: 100,
			points: 100,
			regen: 1
		},
		mana: {
			min: 0,
			max: 100,
			points: 100,
			regen: 1
		},
		stamina: {
			min: 0,
			max: 100,
			points: 100,
			regen: 1
		}
	};
	
	/* Sample damage object passed to self.damage().
	var damageObj = {
		value:			10,			// base damage value
		resource:		"health",	// resource being targeted for damage
		type:			"slashing",	// type fo damage being dealth
		penetration:	0.2			// percentage of armor/resist to ignore
	};
	*/
	
	/**
	 * Apply damage to this Character based on attack described by damageObj.
	 * @param  {Object} damageObj An Object describing the incoming attack.
	 * @return {Void}
	 */
	self.damage = function (damageObj) {
		self.resources[damageObj.resource].points -= damageObj.value;
		if (self.resources.health.points <= self.resources.health.min) {
			self.setImage(animation.subsets["dead"].next());
		}
		else {
			self.setImage(animation.subsets["damage"].next());
		}
	};

	/**
	 * Perform an attack with the given parameters.
	 * TODO: Add attack types that aren't AOEs.
	 * 
	 * @param  {Object} attackObj An object describing the attack.
	 * @return {Void}
	 */
	self.attack = function (attackObj) {
		self.actionsQueued["attack"] = attackObj;
		
		var attackEntity = {
			x: self.x,
			y: self.y,
			radius: attackObj.reach
		};
		
		var charactersHit = jaws.collideOneWithMany(attackEntity, options.characters);
		for (var lcv = 1; lcv < charactersHit.length; lcv++) {
			charactersHit[lcv].damage({
				value:			5,			// base damage value
				resource:		"health",	// resource being targeted for damage
				type:			"slashing",	// type of damage being dealth
				penetration:	0.2			// percentage of armor/resist to ignore
			});
		}
	};
	
	return self;
}