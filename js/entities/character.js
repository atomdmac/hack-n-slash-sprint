define(
['jaws', '$', 'DATABASE', 'lib/SAT', 'entities/spells/shock-nova'],
function (jaws, $, DATABASE, SAT, ShockNova) {

function Character(options) {
	// TODO: Character extension check is kinda hack-y...
	var isExtending = false;
	if(!Object.keys(options).length) {
		isExtending = true;
	}

	this.options = $.extend({}, options);

	// Call super-class.
	jaws.Sprite.call(this, this.options);

	if(isExtending) return;

	// Reference to game world data.
	this._gameData = this.options.gameData;

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		// Speed properties.
		// TODO: Rename Character speed properties to be 'private'.
		this.baseSpeed       = this.options.baseSpeed;
		this.speedMultiplier = this.options.speedMultiplier;
		this.maxSpeed        = this.options.maxSpeed;
		this.radius          = this.options.radius;

		// Set up Sprite animations.
		this.characterAnimation = new jaws.Animation({
			sprite_sheet  : this.options.sprite_sheet,
			frame_size    : this.options.frame_size,
			frame_duration: this.options.frame_duration,
			subsets       : this.options.animationSubsets
		});
		this.setImage(this.characterAnimation.subsets["down"].next());
	}
	
	// Actions queued for this game simulation iteration.
	this.actionsQueued = {};

	// TODO: Can prevPos be removed from characters?
	this.prevPos = {
		x: this.x,
		y: this.y
	};

	/*
	 * Equipment, Stats, and Resourcing
	 */
	this.equipment = $.extend(true, {}, this.options.equipment);
	this.stats = $.extend(true, {}, this.options.stats);
	this.resources = $.extend(true, {}, this.options.resources);
	
	for (var equippedItem in this.equipment) {
		var item = this.equipment[equippedItem];
		if (item) {
			for (var stat in item.bonuses) {
				var statBonus = item.bonuses[stat];
				this.stats[stat] += statBonus;
			}
		}
	}
}

Character.prototype = new jaws.Sprite({});

Character.prototype.update = function () {
	if(this.actionsQueued.attack) {
		var isActive = this.actionsQueued.attack.step();
		if(!isActive) delete this.actionsQueued.attack;
	}

	if (this.actionsQueued["secondaryAttack"]) {
		this.actionsQueued["secondaryAttack"].update();
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
	if (this.actionsQueued["secondaryAttack"]) {
		this.actionsQueued["secondaryAttack"].draw();
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

Character.prototype.applyStatChange = function (targetStat, modification) {
	this.stats[targetStat] += modification;
};

Character.prototype.equip = function (slot, item) {
	if (this.equipment[slot] !== item) {
		// Unequip item currently in slot.
		if (this.equipment[slot]) {
			this.unequip(slot);
		}
		
		// Put item in equipment slot.
		this.equipment[slot] = item;
		
		// Draw item equipped.
		this.characterAnimation.setLayer(slot, item.sprite_sheet, this.options.animationSubsets);
		// TODO: Make the Sprite visual update immediately.
		
		// Apply item bonuses.
		for (var stat in item.bonuses) {
			this.applyStatChange(stat, item.bonuses[stat]);
		}
	}
};

Character.prototype.unequip = function (slot) {
	var item = this.equipment[slot];
	if (item) {
		// Remove item from drawn layers.
		this.characterAnimation.setLayer(item.equipSlot, null, this.options.animationSubsets);
		// TODO: Make the Sprite visual update immediately.
		
		// Negate item bonuses.
		for (var stat in item.bonuses) {
			bonusRemove = -1 * item.bonuses[stat];
			this.applyStatChange(stat, bonusRemove);
		}
		
		// Clear equipment slot.
		this.equipment[item.equipSlot] = null;
	}
};

Character.prototype.getSpeed = function () {
	var speed = this.baseSpeed * this.speedMultiplier;
	return speed < this.maxSpeed ? speed : this.maxSpeed;
};

Character.prototype.move = function (angle, magnitude) {
	if (!this.actionsQueued["secondaryAttack"]) {
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
	if (this.resources[damageObj.resource] > 0) {
		// Use appropriate damageReduction type.
		var damageReduction = 0;
		switch (damageObj.type) {
			case "physical":
				damageReduction = this.stats.damageReductionPhysical;
				break;
			
			case "magic":
				damageReduction = this.stats.damageReductionMagic;
				break;
			
			default:
				break;
		}
		var calculatedDamage = damageObj.value - (damageReduction * (1 - damageObj.penetration));
		
		// Don't let damageReduction turn into a healing effect.
		if (calculatedDamage > 0){
			this.resources[damageObj.resource] -= calculatedDamage;
		}
		
		// Update sprite's appearance to reflect damage.
		// TODO: Probably move this to update or draw.
		// TODO: Make damage appearance overide movement appearance.
		if (this.resources.health <= 0) {
			this.kill();
		}
		else {
			this.setImage(this.characterAnimation.subsets["damage"].next());
		}
	}
};

Character.prototype.kill = function () {
	this.resources.health = 0;
	this.setImage(this.characterAnimation.subsets["dead"].next());
	// Debug B-)
	console.log("Ahh, you got me!");
	// TODO: Generate loot!
};

Character.prototype.primaryAttack = function (attackObj) {
	// If no attack is in progress, launch a new one.
	if(!this.actionsQueued.attack) {
		var equipmentData = this.equipment.primaryAttack
							? this.equipment.primaryAttack.primaryAttack
							: {	mode: "melee",
								resource: "health",
								type: "physical" };
		var attackData = {
			value: this.stats.damage,
			resource: equipmentData.resource,
			type    : equipmentData.type
		};
		// Add appropriate penetration type to attackData.
		switch (equipmentData.type) {
			case "physical":
				attackData.penetration = this.stats.penetrationPhysical;
				break;
			
			case "magic":
				attackData.penetration = this.stats.penetrationMagic;
				break;
			
			default:
				break;
		}
		// Don't do more than 100% damage.
		attackData.penetration = attackData.penetration > 1 ? 1 : attackData.penetration;
		
		switch (equipmentData.mode) {
			case "melee":
				this.actionsQueued.attack = new _MeleeAttack(
					// Attacker
					this,
					// Potential targets.
					this._gameData.characters,
					// Attack angle
					attackObj.angle,
					// Attack Data
					attackData
				);
				this.actionsQueued.attack.step();
				break;
			
			default:
				break;
		}
		
	}
};

Character.prototype.secondaryAttack = function () {
	// Used to scope inner functions.
	var self = this;

	if (!this.actionsQueued["secondaryAttack"]) {
		// Prepare eligible spell targets.
		var eligibleTargets = [];
		for (var lcv = 0; lcv < this._gameData.characters.length; lcv++) {
			// Include all Characters who are not the caster.
			if (this !== this._gameData.characters[lcv]) {
				eligibleTargets.push(this._gameData.characters[lcv]);
			}
		}
		this.actionsQueued["secondaryAttack"] = ShockNova({
			spawnX: this.x,
			spawnY: this.y,
			eligibleTargets: eligibleTargets,
			onFinish: function() { delete self.actionsQueued["secondaryAttack"]; }
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

return Character;

});
