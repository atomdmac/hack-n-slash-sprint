define(
['jaws', '$', 'lib/machina', 'DATABASE', 'entities/entity', 'lib/SAT', 'entities/spells/shock-nova', 'entities/melee-attack', 'entities/effects/knockback', 'fsm/movement'],
function (jaws, $, machina, DATABASE, Entity, SAT, ShockNova, MeleeAttack, Knockback, MovementFsm) {

function Character(options) {
	
	this.options = $.extend({}, options);
	
	// Call super-class.
	Entity.call(this, this.options);
	
	this.race = null;
	this.alignment = null;
	
	this.interests.push.apply(this.interests, [
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
		this.setImage(this.animation.subsets["idle_" + this.bearing].next());
	}
	
	// Actions queued for this game simulation iteration.
	this.actionsQueued = {};

	// Apply movement FSM module.
	MovementFsm(this);

	/*
	 * Equipment, Stats, and Resourcing
	 */
	this.equipment = $.extend(true, {}, this.options.equipment);
	this.stats = $.extend(true, {}, this.options.stats);
	this.resources = $.extend(true, {}, this.options.resources);
	
	this.interactTarget = null;
	this.carrying = null;
	
	
	// Flags
	this.bearingLocked = false;
	this.occupied = false;
	this.setMaxSpeed(this.stats.runSpeed);
	
}

Character.prototype = Object.create(Entity.prototype);

Character.prototype.update = function () {
	if (this.carrying) {
		this.carrying.x = this.x;
		this.carrying.y = this.y - 30;
	}
	this.movementFsm.handle('update');
};

Character.prototype.draw = function () {

	// If falling...
	// TODO: Movement FSM handles setImage in these cases.  Yes, it's gross.  Fix it, please.
	if(this.movementFsm.state === 'falling') {}

	// If moving...
	else if(this.movementFsm.vx !== 0 || this.movementFsm.vy !== 0) {
		this.setImage(this.animation.subsets["walk_" + this.bearing].next());
	} 

	// If idle...
	else {
		this.setImage(this.animation.subsets["idle_" + this.bearing].next());
	}
	
	// Call original Entity.draw() function.
	Entity.prototype.draw.call(this);
};

Character.prototype.spawn = function (options) {
	this.movementFsm.handle('spawn');
	Entity.prototype.spawn.call(this, options);
};

Character.prototype.handleCollisions = function (collisions) {
	this.movementFsm.handle('collide', collisions);
};

Character.prototype.onCollision = function (collision) {
	var entity = collision.target;

	Entity.prototype.onCollision.call(this, collision);

	// Follow platforms.
	if(entity.type === 'platform') {
		if(this.movementFsm.state !== 'floating' &&
		   entity.movementFsm.state !== 'off') {
			this.x += entity.movementFsm.vel.x;
			this.y += entity.movementFsm.vel.y;
		}
	}
};

Character.prototype.shouldFall = function (collisions) {
	var doFall = true;
	collisions.forEach(function (col) {
		if(col.interest.name === 'terrain' && col.target.type === 'floor' || col.target.type === 'platform') {
			doFall = false;
			return false;
		}
	});
	return doFall;
};

Character.prototype.radianMap8D = {
	"E":  90  * Math.PI / 180,
	"NE": 135 * Math.PI / 180,
	"N":  180 * Math.PI / 180,
	"NW": 225 * Math.PI / 180,
	"W":  270 * Math.PI / 180,
	"SW": 315 * Math.PI / 180,
	"S":  0   * Math.PI / 180,
	"SE": 45  * Math.PI / 180
};

// Extremely basic implementation. Assume Characters hate anything different.
Character.prototype.consider = function(targetEntity) {
	if (!targetEntity.race && !targetEntity.alignment) {
		return 'neutral';
	}
	else if (targetEntity.race === this.race && targetEntity.alignment === this.alignment) {
		return "friendly";
	}
	else {
		return "hostile";
	}
	return "neutral";
};

Character.prototype.applyStatChange = function (targetStat, modification) {
	this.stats[targetStat] += modification;
};

Character.prototype.applyResourceChange = function (targetResource, modification) {
	if (!this.resources[targetResource]) {
		this.resources[targetResource] = 0;
	}
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
	
	return speed < this.getMaxSpeed() ? speed : this.getMaxSpeed();
};

Character.prototype.getMaxSpeed = function () {
	return this.stats.maxMovementSpeed;
};

Character.prototype.setMaxSpeed = function (speed) {
	this.stats.maxMovementSpeed = speed;
};

// Sets the character's bearing.
// Direction can be a string ("E", "N", etc), or an angle in radians
// TODO: Implement directions "SE", "NE", "NW", and "SW"
Character.prototype.setBearing = function (direction) {
	if (!this.bearingLocked) {
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
	}
};

/*Character.prototype.move = function (angle, magnitude) {
	// var speed = this.getSpeed(magnitude);
	var x = Math.sin(angle) * magnitude; // * speed;
	var y = Math.cos(angle) * magnitude; // * speed;

	this.movementFsm.handle('move', {
		x: x,
		y: y
	});
};*/
Character.prototype.move = function (bearing) {
	this.movementFsm.handle('move', bearing);

	var x = bearing.x, y = bearing.y;
	if (x < 0 && Math.abs(x) > Math.abs(y)) {
		this.setBearing("W");
	}
	else if (x > 0 && Math.abs(x) > Math.abs(y)) {
		this.setBearing("E");
	}
	if (y < 0 && Math.abs(x) <= Math.abs(y)) {
		this.setBearing("N");
	}
	else if (y > 0 && Math.abs(x) <= Math.abs(y)) {
		this.setBearing("S");
	}
};

Character.prototype.steer = function (angle, magnitude) {
	var speed = this.getSpeed(magnitude);
	var x = Math.sin(angle) * speed;
	var y = Math.cos(angle) * speed;
	
	if (x !== 0 || y !== 0) {
		this.actionsQueued["move"] = true;
		
		this.x += x;
		this.y += y;
		
		// Keep Shock Nova locked to the character.
		if (this.actionsQueued["useActiveItem"]) {
			this.actionsQueued["useActiveItem"].moveTo(this.x, this.y);
		}
		
		// TODO: Implement gamepad "wedges" to better detect bearing
		if (x < 0 && Math.abs(x) > Math.abs(y)) {
			this.setBearing("W");
		}
		else if (x > 0 && Math.abs(x) > Math.abs(y)) {
			this.setBearing("E");
		}
		if (y < 0 && Math.abs(x) <= Math.abs(y)) {
			this.setBearing("N");
		}
		else if (y > 0 && Math.abs(x) <= Math.abs(y)) {
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

Character.prototype.attack = function (attackObj) {
	// If no attack is in progress, launch a new one.
	if(!this.actionsQueued.attack) {
		var equipmentData = this.equipment.attack
							? this.equipment.attack.attack
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
				this.actionsQueued.attack = new MeleeAttack({
					// Attacker
					attacker: this,
					// Attack angle
					angle: attackObj.angle,
					// Attack Data
					attackData: attackObj,
					// Callback
					onFinish: function() {
						// Destroy queued attack action and alert listeners.
						self.actionsQueued.attack.signals.destroyed.dispatch(self.actionsQueued.attack);
						delete self.actionsQueued.attack;
					}
				});
				
				// Reset animation manually so attack always starts at frame 0.
				this.animation.subsets["attack_S"].index = -1;
				this.animation.subsets["attack_S"].current_tick = (new Date()).getTime();
				this.animation.subsets["attack_S"].last_tick = (new Date()).getTime();
				this.animation.subsets["attack_S"].sum_tick = 0;
				
				this.animation.subsets["attack_N"].index = -1;
				this.animation.subsets["attack_N"].current_tick = (new Date()).getTime();
				this.animation.subsets["attack_N"].last_tick = (new Date()).getTime();
				this.animation.subsets["attack_N"].sum_tick = 0;
				
				this.animation.subsets["attack_W"].index = -1;
				this.animation.subsets["attack_W"].current_tick = (new Date()).getTime();
				this.animation.subsets["attack_W"].last_tick = (new Date()).getTime();
				this.animation.subsets["attack_W"].sum_tick = 0;
				
				this.animation.subsets["attack_E"].index = -1;
				this.animation.subsets["attack_E"].current_tick = (new Date()).getTime();
				this.animation.subsets["attack_E"].last_tick = (new Date()).getTime();
				this.animation.subsets["attack_E"].sum_tick = 0;
				
				// Update the attack right away, so it can start doing damage this turn.
				this.actionsQueued.attack.update();
				// Let listeners know that we're attacking.
				this.signals.gave.dispatch(this.actionsQueued.attack);
				break;
			
			default:
				break;
		}
	}
};

Character.prototype.holdAttack = function() {
	this.actionsQueued["holdAttack"] = true;
};

Character.prototype.releaseAttack = function() {
	this.actionsQueued["holdAttack"] = false;
};

Character.prototype.useActiveItem = function () {
	// Used to scope inner functions.
	var self = this;

	if (!this.actionsQueued["useActiveItem"]) {
		// Prepare eligible spell targets.
		var eligibleTargets = [];
		for (var lcv = 0; lcv < this._gameData.entities.length; lcv++) {
			// Include all Characters who are not the caster.
			if (this.consider(this._gameData.entities[lcv]) === "hostile") {
				eligibleTargets.push(this._gameData.entities[lcv]);
			}
		}
		this.actionsQueued["useActiveItem"] = new ShockNova({
			spawnX: this.x,
			spawnY: this.y,
			eligibleTargets: eligibleTargets,
			onFinish: function() { 
				self.signals.destroyed.dispatch(self.actionsQueued["useActiveItem"]);
				delete self.actionsQueued["useActiveItem"]; 
			}
		});

		// Let listeners know that we're attacking.
		this.signals.gave.dispatch(this.actionsQueued["useActiveItem"]);
	}
};

Character.prototype.liftEntity = function(entity) {
	this.carrying = entity;
};

Character.prototype.throwEntity = function(entity) {
	entity.addEffect(new Knockback({
		// Target
		target: entity,
		// Angle
		angle: this.radianMap8D[this.bearing],
		// Force
		force: 8,
		// Duration
		duration: 20
	}));
};

return Character;

});
