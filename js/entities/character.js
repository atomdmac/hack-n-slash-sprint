function Character(options) {
	// TODO: Character extension check is kinda hack-y...
	var isExtending = false;
	if(!Object.keys(options).length) {
		isExtending = true;
	}

	options = $.extend({}, options);

	// Call super-class.
	jaws.Sprite.call(this, options);

	if(isExtending) return;

	// Reference to game world data.
	this._gameData = options.gameData;

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(options){
		// Speed properties.
		// TODO: Rename Character speed properties to be 'private'.
		this.baseSpeed       = options.baseSpeed;
		this.speedMultiplier = options.speedMultiplier;
		this.maxSpeed        = options.maxSpeed;
		this.radius          = options.radius;

		// Set up Sprite animations.
		this.characterAnimation = new jaws.Animation({
			sprite_sheet  : options.sprite_sheet,
			frame_size    : options.frame_size,
			frame_duration: options.frame_duration,
			subsets       : options.animationSubsets
		});
		this.characterAnimation.setLayer("sword", DATABASE.equipment["Sword"].sprite_sheet, options.animationSubsets);
		this.setImage(this.characterAnimation.subsets["down"].next());
	}
	
	// Actions queued for this game simulation iteration.
	this.actionsQueued = {};

	// TODO: Can prevPos be removed from characters?
	this.prevPos = {
		x: this.x,
		y: this.y
	};

	// Resources (Hit points, mana points, stamina, etc.)
	this.resources = {
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
}

Character.prototype = new jaws.Sprite({});

Character.prototype.update = function () {
	if(this.actionsQueued.attack) {
		var isActive = this.actionsQueued.attack.step();
		if(!isActive) delete this.actionsQueued.attack;
	}

	if (this.actionsQueued["castSpell"]) {
		this.actionsQueued["castSpell"].update();
	}
	
	this.prevPos = {
		x: this.x,
		y: this.y
	};
};

Character.prototype.draw = function () {
	// Used for scoping inner functions.
	var self = this;

	// Draw Shock Nova animation.
	if (this.actionsQueued["castSpell"]) {
		this.actionsQueued["castSpell"].draw();
	}
	
	// Call original jaws.Sprite.draw() function.
	jaws.Sprite.prototype.draw.call(this);
	
	// Draw attack animation.
	if (this.actionsQueued.attack) {
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

Character.prototype.getSpeed = function () {
	var speed = this.baseSpeed * this.speedMultiplier;
	return speed < this.maxSpeed ? speed : this.maxSpeed;
};

Character.prototype.move = function (angle, magnitude) {
	if (!this.actionsQueued["castSpell"]) {
		var speed = this.getSpeed() * magnitude;
		speed = speed > this.maxSpeed ? this.maxSpeed : speed;
		var x = Math.sin(angle) * speed;
		var y = Math.cos(angle) * speed;
		
		this.x += x;
		this.y += y;
		
		if (x < 0) {
			this.setImage(this.characterAnimation.subsets["left"].next());
		}
		else if (x > 0) {
			this.setImage(this.characterAnimation.subsets["right"].next());
		}
		if (y < 0 && y < x) {
			this.setImage(this.characterAnimation.subsets["up"].next());
		}
		else if (y > 0 && y > x) {
			this.setImage(this.characterAnimation.subsets["down"].next());
		}
	}
};

Character.prototype.damage = function (damageObj) {
	this.resources[damageObj.resource].points -= damageObj.value;
	if (this.resources.health.points <= this.resources.health.min) {
		this.setImage(this.characterAnimation.subsets["dead"].next());
	}
	else {
		this.setImage(this.characterAnimation.subsets["damage"].next());
	}
};

Character.prototype.attack = function (attackObj) {
	// If no attack is in progress, launch a new one.
	if(!this.actionsQueued.attack) {
		this.actionsQueued.attack = new _MeleeAttack(
			// Attacker
			this,
			// Potential targets.
			this._gameData.characters,
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
		this.actionsQueued.attack.step();
	}
};

Character.prototype.castSpell = function () {
	// Used to scope inner functions.
	var self = this;

	if (!this.actionsQueued["castSpell"]) {
		// Prepare eligible spell targets.
		var eligibleTargets = [];
		for (var lcv = 0; lcv < this._gameData.characters.length; lcv++) {
			// Include all Characters who are not the caster.
			if (this !== this._gameData.characters[lcv]) {
				eligibleTargets.push(this._gameData.characters[lcv]);
			}
		}
		this.actionsQueued["castSpell"] = ShockNova({
			spawnX: this.x,
			spawnY: this.y,
			eligibleTargets: eligibleTargets,
			onFinish: function() { delete self.actionsQueued["castSpell"]; }
		});
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
			if(targets[i] !== attacker) {
				var col = _getResponse(targets[i]);
				if(col) {
					targets[i].damage(attackData);
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
