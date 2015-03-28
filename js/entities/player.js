define(
['jaws', 'DATABASE', 'lib/SAT', 'lib/machina', 'entities/character', 'ui/hud', 'entities/item', 'entities/lunge-attack', 'entities/hookshot', 'entities/aimer'],
function (jaws, DATABASE, SAT, machina, Character, HUD, Item, LungeAttack, Hookshot, Aimer) {

function Player (options) {           
	var self = this;
	
	// Extend Character class.
	Character.call(this, options);
	
	this.race = "human";
	this.alignment = "good";
	
	// Equipment
	// TODO: Don't hardcode this here...seriously.
	var equipmentKeys = ["Sword", "Leather Tunic", "Hot Feet", "Gohan's Hat"];
	equipmentKeys.forEach(function(equipmentKey) {
		// Create item to be equipped.
		var item = new Item($.extend(true, {},
								 DATABASE.items["base"],
								 DATABASE.items[equipmentKey]));
		item._gameData = this._gameData;
		
		// Put the loot in the game world
		self.signals.gave.dispatch(item);
		
		// Equip item.
		Character.prototype.equip.call(self, item.equipSlot, item);
	});
	
	// Controls
	this.gamepad = null;
	this.input = options.input;
	
	// Charge attack counter/limiter.
	this.chargeAttackCounter = 0;
	this.chargeAttackLimit = 30;
	
	// HUD
	this.hud = new HUD({
		character: this
	});
	this.hud.debug._gameData = this._gameData;
}

Player.prototype = Object.create(Character.prototype);

Player.prototype.draw = function () {
	Character.prototype.draw.call(this);
	// Draw HUD
	this.hud.draw();
};

Player.prototype.update = function () {

	Character.prototype.update.call(this);

	/***********************************************************************
	 * GAMEPAD INPUT
	 **********************************************************************/ 
	if (!this.gamepad && jaws.gamepads[0]) {
		this.gamepad = jaws.gamepads[0]; // Only use first gamepad for now...
		
		this.gamepadButtons = {
			"attack": this.gamepad.buttons[this.input.gamepad["attack"]],
			"useActiveItem": this.gamepad.buttons[this.input.gamepad["useActiveItem"]],
			"interact": this.gamepad.buttons[this.input.gamepad["interact"]]
		};
	}
	
	// Apply character actions.
	this.applyMovementInput();
	this.applyAttackInput();
	this.applyUseActiveItemInput();
	this.applyInteractInput();
	
	
	// Debug
	this.hud.update("debug");
};

Player.prototype.applyMovementInput = function() {
	if (!this.actionsQueued["attack"]) {
		var analog = this.readMovementInput();
		
		if (this.actionsQueued["aim"]) {
			this.actionsQueued["aim"].move(this.getAngleOfAnalogs(analog),
										   this.getMagnitudeOfAnalogs(analog));
		}
		else {
			this.move(this.getAngleOfAnalogs(analog),
					  this.getMagnitudeOfAnalogs(analog));
		}
	}
};

Player.prototype.applyAttackInput = function() {
	// Attack input is pressed
	if ((this.gamepad !== null &&
		jaws.gamepadButtonPressed(this.gamepadButtons["attack"])) ||
		jaws.pressed(this.input.keyboard["attack"])) {
		
		// Charge count is 0.
		if (this.chargeAttackCounter === 0) {
			// Prepare attack data.
			reach = 100;
			startX = this.x;
			startY = this.y;
			endX = startX + reach * Math.sin(this.radianMap8D[this.bearing]);
			endY = startY + reach * Math.cos(this.radianMap8D[this.bearing]);
			
			// Apply attack.
			this.attack({
				reach : reach,
				startX: startX,
				startY: startY,
				endX  : endX,
				endY  : endY,
				angle : this.radianMap8D[this.bearing]
			});
			
			// Increment charge counter.
			this.chargeAttackCounter++;
		}
		else {
			// Increment charge counter.
			this.chargeAttackCounter++;
			
			// Show visual for holding the attack.
			this.holdAttack();
			
			// Attack is finished charging and ready to release on next update.
			if (this.chargeAttackCounter >= this.chargeAttackLimit) {
				// TODO: Implement visual effect to show the attack is charged.
			}
		}
	}
	else {
		// We aren't holding the attack anymore.
		this.releaseAttack();
		
		// Execute attack if charged.
		if (this.chargeAttackCounter >= this.chargeAttackLimit) {
			this.lungeAttack();
		}
		
		// Reset charge count.
		this.chargeAttackCounter = 0;
	}
};

Player.prototype.applyUseActiveItemInput = function() {
	// Use Active Item input is pressed.
	if ((this.gamepad !== null &&
		jaws.gamepadButtonPressed(this.gamepadButtons["useActiveItem"])) ||
		jaws.pressed(this.input.keyboard["useActiveItem"])) {
		
		// Only use item if we're not attacking nor holding an attack.
		if (!this.actionsQueued["holdAttack"] && !this.actionsQueued["attack"]) {
			// Use active item.
			//this.useActiveItem();
			
			if (!this.actionsQueued["aim"]) {
				// Create Aimer object, since we aren't already aiming.
				this.actionsQueued["aim"] = new Aimer({
					// Attacker
					attacker: this,
					// Bearing
					angle: this.radianMap8D[this.bearing]
				});
				
				// Update the aim right away.
				this.actionsQueued["aim"].update();
				// Let listeners know that we're aiming.
				this.signals.gave.dispatch(this.actionsQueued["aim"]);
			}
		}
	}
	// Input is released
	else {
		// Trigger aimed items.
		if (this.actionsQueued["aim"]) {
			// Debug: Use Hookshot from here, at least until we have a better place to queue the Hookshot from...
			this.useHookshot();
			
			// Destroy queued aim action and alert listeners.
			this.actionsQueued["aim"].signals.destroyed.dispatch(this.actionsQueued["aim"]);
			// Destroy aim object
			delete this.actionsQueued["aim"];
		}
	}
};

Player.prototype.applyInteractInput = function() {
	// Interact input is pressed.
	if ((this.gamepad !== null &&
		jaws.gamepadButtonPressed(this.gamepadButtons["interact"])) ||
		jaws.pressed(this.input.keyboard["interact"])) {
		
		// Only interact if we're not attacking nor holding an attack.
		if (!this.actionsQueued["holdAttack"] && !this.actionsQueued["attack"]) {
			// If we have a target that we can interact with, interact!
			if (this.interactTarget && this.interactTarget.interaction && !this.carrying) {
				if (this.interactTarget.interaction === "lift") {
					this.liftEntity(this.interactTarget);
				}
			}
		}
	}
	// TODO: Throw carried item only after interaction input is released and resent.
	// Throw entity if hands are full on release!
	else if (this.carrying) {
		this.throwEntity(this.carrying);
		this.carrying = null;
	}
	
	// TODO: This is probably better handled at the Character or Entity level?
	// Clear interactTarget, wait for collision handling to reset it next tick.
	this.interactTarget = null;
};

Player.prototype.readMovementInput = function() {
	var analog = {x: 0, y: 0},
		joystickThreshold = 0.25;
	
	var useGamepadInput = false; // TODO: Remove need for gamepad flag.
	
	// Prefer gamepad right joystick input if threshhold is met.
	if (this.gamepad !== null) {
		// Get joystick data.
		var joystick = jaws.gamepadReadJoystick(this.gamepad, this.input.gamepad["move"]);
		// Use joystick input if either analog exceeds threshold.
		if(Math.abs(joystick.analogX) > joystickThreshold ||
		   Math.abs(joystick.analogY) > joystickThreshold) {
			// Use gamepad as input source.
			analog.x = joystick.analogX;
			analog.y = joystick.analogY;
			
			useGamepadInput = true; // TODO: Remove need for gamepad flag.
		}
	}
	
	// Aggregate any keyboard input if gamepad input not used.
	if (!useGamepadInput) {
		// Emulate analog values for movement keys.
		var keys = {};
		keys[this.input.keyboard["moveUp"]]		= {x: 0,	y: -1};
		keys[this.input.keyboard["moveDown"]]	= {x: 0,	y: 1};
		keys[this.input.keyboard["moveLeft"]]	= {x: -1,	y: 0};
		keys[this.input.keyboard["moveRight"]]	= {x: 1,	y: 0};
		
		// Calculate sum of emulated analog values for pressed keys.
		for (var key in keys) {
			if (jaws.pressed(key)) {
				analog.x += keys[key]["x"];
				analog.y += keys[key]["y"];
			}
		}
	}
	
	return analog;
};

Player.prototype.getAngleOfAnalogs = function (analog) {
	return Math.atan2(analog.x, analog.y);
};

Player.prototype.getMagnitudeOfAnalogs = function (analog) {
	return Math.sqrt(analog.x*analog.x+analog.y*analog.y);
};

Player.prototype.lungeAttack = function () {
	if(!this.actionsQueued.attack) {
		var attackObj = {
			mode: "melee",
			resource: "health",
			type: "physical",
			value: 500,
			penetration: this.stats.penetrationPhysical
		};
		
		// Don't do more than 100% damage.
		attackObj.penetration = attackObj.penetration > 1 ? 1 : attackObj.penetration;
		
		var analog = this.readMovementInput();
		var angle = (analog.x === 0 && analog.y === 0)
					? this.radianMap8D[this.bearing]
					: this.getAngleOfAnalogs(analog);
		
		var self = this;
		this.actionsQueued.attack = new LungeAttack({
			// Attacker
			attacker: this,
			// Attack radius
			radius: 40,
			// Attack angle
			angle: angle,
			// Magnitude of lunge movement
			magnitude: this.getMaxSpeed(),
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
		
	}
};

Player.prototype.useHookshot = function () {
	if(this.actionsQueued["aim"] &&
	   !this.actionsQueued["hooking"]) {
		var angle = this.actionsQueued["aim"].angleTo();
		
		var self = this;
		this.actionsQueued["hooking"] = new Hookshot({
			// Attacker
			attacker: this,
			// Attack angle
			angle: angle,
			// Callback
			onFinish: function() {
				// Destroy queued attack action and alert listeners.
				self.actionsQueued["hooking"].signals.destroyed.dispatch(self.actionsQueued["hooking"]);
				delete self.actionsQueued["hooking"];
			}
		});
		
		// Update the attack right away, so it can start doing damage this turn.
		this.actionsQueued["hooking"].update();
		// Let listeners know that we're attacking.
		this.signals.gave.dispatch(this.actionsQueued["hooking"]);
		
	}
};

Player.prototype.onCollision = function (collision) {
	// TODO: Clean up these ad-hoc variables.
	var entity = collision.target,
		interest = collision.interest;

		Character.prototype.onCollision.call(this, collision);

	// On touch:
	if (interest.name === "touch") {
		// Consume resource items.
		if (entity.type === "resource") {
			console.log("Consuming item " + entity.label + " (" + entity.id + ")");
			this.consumeResourceItem(entity);
			this.hud.update("resources");
		}
		// Allow interaction with liftable items.
		if (entity.interaction) {
			this.interactTarget = entity;
		}
	}
};

Player.prototype.damage = function(damageObj) {
	Character.prototype.damage.call(this, damageObj);
	this.hud.update("resources");
};

return Player;

});