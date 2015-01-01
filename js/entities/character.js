define(
['jaws', '$', 'DATABASE', 'entities/entity', 'lib/SAT', 'entities/spells/shock-nova', 'entities/melee-attack'],
function (jaws, $, DATABASE, Entity, SAT, ShockNova, MeleeAttack) {

function Character(options) {
	
	this.options = $.extend({}, options);
	
	// Call super-class.
	Entity.call(this, this.options);
	
	this.race = null;
	this.alignment = null;
	
	this.interests.push.apply(this.interests, [
		{name: 'sight', shape: new SAT.Circle(new SAT.Vector(this.x, this.y), 500)},
		{name: 'terrain', shape: new SAT.Circle(new SAT.Vector(this.x, this.y), this.options.radius)},
		{name: 'touch', shape: new SAT.Circle(new SAT.Vector(this.x, this.y), this.options.radius)}
	]);
	
	this.presences.push.apply(this.presences, [
		{name: 'sight', shape: new SAT.Circle(new SAT.Vector(this.x, this.y), this.options.radius)},
		{name: 'touch', shape: new SAT.Circle(new SAT.Vector(this.x, this.y), this.options.radius)}
	]);
	
	// Reference to game world data.
	this._gameData = this.options.gameData;

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.bearing         = this.options.bearing;
		this.radius          = this.options.radius;

		// Set up Entity animations.
		this.animation = new jaws.Animation({
			sprite_sheet  : this.options.sprite_sheet,
			frame_size    : this.options.frame_size,
			frame_duration: this.options.frame_duration,
			subsets       : this.options.animationSubsets
		});
		this.setImage(this.animation.subsets[this.bearing].next());
	}
	
	// Actions queued for this game simulation iteration.
	this.actionsQueued = {};

	/*
	 * Equipment, Stats, and Resourcing
	 */
	this.equipment = $.extend(true, {}, this.options.equipment);
	this.stats = $.extend(true, {}, this.options.stats);
	this.resources = $.extend(true, {}, this.options.resources);
}

Character.prototype = Object.create(Entity.prototype);

Character.prototype.update = function () {
	if (this.actionsQueued["secondaryAttack"]) {
		// this.actionsQueued["secondaryAttack"].update();
	}
};

Character.prototype.draw = function () {
	// Used for scoping inner functions.
	var self = this;

	if (this.actionsQueued["move"]) {
		this.setImage(this.animation.subsets[this.bearing].next());
	}
	
	if (this.actionsQueued["damage"]) {
		this.setImage(this.animation.subsets["damage"].next());
	}
	
	
	// Draw Shock Nova animation.
	if (this.actionsQueued["secondaryAttack"]) {
		// this.actionsQueued["secondaryAttack"].draw();
	}
	
	// Draw attack animation.
	if (this.actionsQueued.attack) {
		this.setImage(this.animation.subsets["attack_" + this.bearing].next());
	}
	
	// Call original Entity.draw() function.
	Entity.prototype.draw.call(this);
	
	// Clear dumb flags after drawing.
	this.actionsQueued["move"] = false;
	this.actionsQueued["damage"] = false;
};

// Extremely basic implementation. Assume Characters hate anything different.
Character.prototype.consider = function(targetEntity) {
	if (targetEntity.race === this.race && targetEntity.alignment === this.alignment) {
		return "friendly";
	}
	return "hostile";
};

Character.prototype.applyStatChange = function (targetStat, modification) {
	this.stats[targetStat] += modification;
};

Character.prototype.applyResourceChange = function (targetResource, modification) {
	this.resources[targetResource] += modification;
};

Character.prototype.consumeResourceItem = function (item) {
	for (var resource in item.resources) {
		this.applyResourceChange(resource, item.resources[resource]);
	}
	
	// Destroy the item.
	item.destroy();
};

Character.prototype.equip = function (slot, item) {
	if (this.equipment[slot] !== item) {
		// Unequip item currently in slot.
		if (this.equipment[slot]) {
			this.unequip(slot);
		}
		
		// Tell the item you're taking it.
		item.take(this);

		// Tell the game you're taking the item.
		this.signals.took.dispatch(item);
		
		// Put item in equipment slot.
		this.equipment[slot] = item;
		
		// Draw item equipped.
		this.animation.setLayer(slot, item.sprite_sheet, this.options.animationSubsets);
		// TODO: Make the Entity visual update immediately.
		
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
		this.animation.setLayer(item.equipSlot, null, this.options.animationSubsets);
		// TODO: Make the Entity visual update immediately.
		
		// Negate item bonuses.
		for (var stat in item.bonuses) {
			bonusRemove = -1 * item.bonuses[stat];
			this.applyStatChange(stat, bonusRemove);
		}
		
		// Drop item on the ground.
		item.drop(this.x, this.y);

		// Tell the game that you dropped the item.
		this.signals.gave.dispatch(item);
		
		// Clear equipment slot.
		this.equipment[item.equipSlot] = null;
	}
};

Character.prototype.getSpeed = function (magnitude) {
	var speed = this.stats.movementSpeed * (1 + this.stats.movementSpeedIncrease);
	speed = magnitude ? speed * magnitude : 0;
	
	return speed < this.stats.maxMovementSpeed ? speed : this.stats.maxMovementSpeed;
};

Character.prototype.getMaxSpeed = function () {
	return this.stats.maxMovementSpeed;
};

// Sets the character's bearing.
// Direction can be a string ("E", "N", etc), or an angle in radians
// TODO: Implement directions "SE", "NE", "NW", and "SW"
Character.prototype.setBearing = function (direction) {
	// Apply direction as string.
	if (direction === "N" ||
		direction === "E" ||
		direction === "S" ||
		direction === "W") {
		this.bearing = direction;
	}
	// If direction isn't a string, just assume it's a radian.
	else {
		// TODO: Implement gamepad "wedges" to better detect bearing
		var x = Math.sin(direction);
		var y = Math.cos(direction);
		
		if (x < 0) {
			this.bearing = "W";
		}
		else if (x > 0) {
			this.bearing = "E";
		}
		if (y < 0 && y < x) {
			this.bearing = "N";
		}
		else if (y > 0 && y > x) {
			this.bearing = "S";
		}
	}
};

Character.prototype.move = function (angle, magnitude) {
	var speed = this.getSpeed(magnitude);
	var x = Math.sin(angle) * speed;
	var y = Math.cos(angle) * speed;
	
	if (x !== 0 || y !== 0) {
		this.actionsQueued["move"] = true;    
		
		this.x += x;
		this.y += y;
		
		// Keep Shock Nova locked to the character.
		if (this.actionsQueued["secondaryAttack"]) {
			this.actionsQueued["secondaryAttack"].moveTo(this.x, this.y);
		}
		
		// TODO: Implement gamepad "wedges" to better detect bearing
		if (x < 0) {
			this.setBearing("W");
		}
		else if (x > 0) {
			this.setBearing("E");
		}
		if (y < 0 && y < x) {
			this.setBearing("N");
		}
		else if (y > 0 && y > x) {
			this.setBearing("S");
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
			this.actionsQueued["damage"] = true;
		}
	}
};

Character.prototype.kill = function () {
	this.resources.health = 0;
	this.setImage(this.animation.subsets["dead"].next());
};

Character.prototype.primaryAttack = function (attackObj) {
	// If no attack is in progress, launch a new one.
	if(!this.actionsQueued.attack) {
		var equipmentData = this.equipment.primaryAttack
							? this.equipment.primaryAttack.primaryAttack
							: {	mode: "melee",
								resource: "health",
								type: "physical" };
		var statsData = {
			value: this.stats.damage
		};
		// Add appropriate penetration type to statsData.
		switch (equipmentData.type) {
			case "physical":
				statsData.penetration = this.stats.penetrationPhysical;
				break;
			
			case "magic":
				statsData.penetration = this.stats.penetrationMagic;
				break;
			
			default:
				break;
		}
		
		$.extend(attackObj, equipmentData, statsData);
		
		// Don't do more than 100% damage.
		attackObj.penetration = attackObj.penetration > 1 ? 1 : attackObj.penetration;
		
		switch (attackObj.mode) {
			case "melee":
				// Used to scope inner functions.
				var self = this;
				
				// Prepare eligible spell targets.
				var eligibleTargets = [];
				for (var lcv = 0; lcv < this._gameData.entities.length; lcv++) {
					// Include all Characters who are not the caster.
					if (this.consider(this._gameData.entities[lcv]) === "hostile") {
						eligibleTargets.push(this._gameData.entities[lcv]);
					}
				}
				
				this.actionsQueued.attack = new MeleeAttack({
					// Attacker
					attacker: this,
					// Potential targets.
					targets: eligibleTargets,
					// Attack angle
					angle: attackObj.angle,
					// Attack Data
					attackData: attackObj,
					// Callback
					onFinish: function() { 
						self.actionsQueued.attack.signals.destroyed.dispatch(self.actionsQueued.attack);
						delete self.actionsQueued.attack; 
					}
				});
				// Update the attack right away, so it can start doing damage this turn.
				this.actionsQueued.attack.update();
				// Let listeners know that we're attacking.
				this.signals.gave.dispatch(this.actionsQueued.attack);
				break;
			
			default:
				break;
		}
	}
	
	// Set bearing.
	this.setBearing(attackObj.angle);
};

Character.prototype.secondaryAttack = function () {
	// Used to scope inner functions.
	var self = this;

	if (!this.actionsQueued["secondaryAttack"]) {
		// Prepare eligible spell targets.
		var eligibleTargets = [];
		for (var lcv = 0; lcv < this._gameData.entities.length; lcv++) {
			// Include all Characters who are not the caster.
			if (this.consider(this._gameData.entities[lcv]) === "hostile") {
				eligibleTargets.push(this._gameData.entities[lcv]);
			}
		}
		this.actionsQueued["secondaryAttack"] = new ShockNova({
			spawnX: this.x,
			spawnY: this.y,
			eligibleTargets: eligibleTargets,
			onFinish: function() { 
				self.signals.destroyed.dispatch(self.actionsQueued["secondaryAttack"]);
				delete self.actionsQueued["secondaryAttack"]; 
			}
		});

		// Let listeners know that we're attacking.
		this.signals.gave.dispatch(this.actionsQueued["secondaryAttack"]);
	}
};

return Character;

});
