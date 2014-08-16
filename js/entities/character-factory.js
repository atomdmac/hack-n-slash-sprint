function CharacterFactory (options) {
	// Merge options
	options = $.extend({}, DATABASE.characters["base"], options);

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
		// Draw Shock Nova animation.
		if (self.actionsQueued["castSpell"]) {
			self.actionsQueued["castSpell"].draw();
		}
		
		// Call original jaws.Sprite.draw() function.
		jaws.Sprite.prototype.draw.call(this);
		
		// Draw attack animation.
		if (self.actionsQueued.attack) {
			(function () {
				var context = jaws.context,
					hitBox  = self.actionsQueued.attack.hitBox,
					points  = hitBox.calcPoints,
					i, ilen;

				context.save();
				context.strokeStyle = "green";
				context.lineWidth = 3;

				context.beginPath();
				context.moveTo(
					hitBox.pos.x + points[0].x, 
					hitBox.pos.y + points[0].y
				);
				for(i=0, ilen=points.length; i<ilen; i++) {
					context.lineTo(
						hitBox.pos.x + points[i].x, 
						hitBox.pos.y + points[i].y
					);
				}
				context.lineTo(
					hitBox.pos.x + points[0].x,
					hitBox.pos.y + points[0].y
				);
				context.stroke();

				context.restore();

			})();
		}
	};

	var animation = new jaws.Animation({
		sprite_sheet: options.sprite_sheet,
		frame_size: options.frame_size,
		frame_duration: options.frame_duration,
		subsets: options.animationSubsets
	});
	
	//animation.setLayer("sword", DATABASE.equipment["Sword"].sprite_sheet, options.animationSubsets);
	
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
		if(self.actionsQueued.attack) {
			var isActive = self.actionsQueued.attack.step();
			if(!isActive) delete self.actionsQueued.attack;
		}

		if (self.actionsQueued["castSpell"]) {
			self.actionsQueued["castSpell"].update();
		}
		
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
		if (!self.actionsQueued["castSpell"]) {
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
		// If no attack is in progress, launch a new one.
		if(!self.actionsQueued.attack) {
			self.actionsQueued.attack = new _MeleeAttack(
				// Attacker
				self,
				// Potential targets.
				options.characters,
				// Attack angle
				attackObj.angle,
				// Attack Data
				{
					value: 5,
					resource: "health",
					type    : "slashing",
					penetration: 0.2
				}
			);
			self.actionsQueued.attack.step();
		}
	};

	// Represents the MeleeAttack Class.
	function _MeleeAttack (attacker, targets, angle, attackData) {
		var attack = this,

			// Settings
			hitBox = new SAT.Polygon(new SAT.Vector(attacker.x, attacker.y),
				[
				new SAT.Vector(0, 0),
				new SAT.Vector(10, 0),
				new SAT.Vector(10, 50),
				new SAT.Vector(0, 50)
				]),
			angleRange   = 1.4,
			duration     = 10,

			// State
			angleCurrent = -angle - (angleRange / 2),
			// TODO: Implement counter-clockwise attacks.
			// TODO: Implement thrust attacks.
			angleStep    = (angleRange / duration),
			currentTime  = 0;

		// Apply initial position/angle to hitBox.
		hitBox.translate(-5, 0);
		hitBox.setAngle(angleCurrent);

		// Expose the hitBox so we can draw it for debugging purposes.
		attack.hitBox = hitBox;

		function _getResponse (target) {
			var c = new SAT.Circle(
				new SAT.Vector(target.x, target.y),
				target.radius
			);

			if(SAT.testCirclePolygon(c, hitBox)) {
				return true;
			} else {
				return false;
			}
		}

		/**
		 * Perform the next iteration of the attack process.
		 * @return {Boolean} TRUE if the attack is still in progress, FALSE if it has finished.
		 */
		attack.step = function () {
			// Update hitbox angle and position.
			hitBox.pos.x = attacker.x;
			hitBox.pos.y = attacker.y;
			hitBox.setAngle(angleCurrent);

			// Check to see if the weapon hitBox collides with any potential targets.
			var i, ilen;
			for(i=0, ilen=targets.length; i<ilen; i++) {
				if(targets[i].character !== attacker) {
					var col = _getResponse(targets[i].character);
					if(col) {
						targets[i].character.damage(attackData);
					}
				}
			}
			
			// Step forward in time.
			angleCurrent += angleStep;
			currentTime += 1;

			// Check to see if the attack has finished yet or not.
			if(currentTime < duration) {
				return true;
			} else {
				return false;
			}
		};
	}

	/**
	 * Casts Shock Nova, the only spell currently available.
	 * TODO: Add more spells.
	 * 
	 * @return {Void}
	 */
	self.castSpell = function () {
		if (!self.actionsQueued["castSpell"]) {
			// Prepare eligible spell targets.
			var eligibleTargets = [];
			for (var lcv = 0; lcv < options.characters.length; lcv++) {
				// Include all Characters who are not the caster.
				if (self !== options.characters[lcv].character) {
					eligibleTargets.push(options.characters[lcv].character);
				}
			}
			self.actionsQueued["castSpell"] = ShockNova({
				spawnX: self.x,
				spawnY: self.y,
				eligibleTargets: eligibleTargets,
				onFinish: function() { delete self.actionsQueued["castSpell"]; }
			});
		}
	};
	
	return self;
}