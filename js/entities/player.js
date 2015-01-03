define(
['jaws', 'DATABASE', 'lib/SAT', 'entities/character', 'ui/hud', 'entities/item', 'entities/lunge-attack'],
function (jaws, DATABASE, SAT, Character, HUD, Item, LungeAttack) {

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
	
	// HUD
	this.hud = new HUD({
		character: this
	});
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
			"useActiveItem": this.gamepad.buttons[this.input.gamepad["useActiveItem"]]
		};
	}
	
	// Apply character actions.
	this.applyMovement();
	this.applyAction();
	
};

Player.prototype.applyMovement = function() {
	if (!this.actionsQueued["attack"]) {
		var analog = this.readMovementInput();
		
		this.move(this.getAngleOfAnalogs(analog),
				  this.getMagnitudeOfAnalogs(analog));
	}
};

Player.prototype.applyAction = function() {
	// TODO: Don't allow attacking and using items at the same time.
	
	// Check attack input
	if ((this.gamepad !== null &&
		jaws.gamepadButtonPressed(this.gamepadButtons["attack"])) ||
		jaws.pressed(this.input.keyboard["attack"])) {
		// Hold the current attack.
		if (this.actionsQueued["attack"] || this.actionsQueued["holdAttack"]) {
			this.holdAttack();
		}
		// Create a new attack if one isn't queued already.
		else {
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
		}
		
	}
	else if (this.actionsQueued["holdAttack"]) {
		this.actionsQueued["holdAttack"] = false;
		this.lungeAttack();
	}
	
	if ((this.gamepad !== null &&
		jaws.gamepadButtonPressed(this.gamepadButtons["useActiveItem"])) ||
		jaws.pressed(this.input.keyboard["useActiveItem"])) {
		
		// Use active item.
		this.useActiveItem();
	}
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
		
		this.actionsQueued.attack = new LungeAttack({
			// Attacker
			attacker: this,
			// Attack radius
			radius: 40,
			// Attack angle
			angle: angle,
			// Magnitude of lunge movement
			magnitude: 2,
			// Attack Data
			attackData: attackObj
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

Player.prototype.radianMap8D = {
	"E":  90  * Math.PI / 180,
	"NE": 135 * Math.PI / 180,
	"N":  180 * Math.PI / 180,
	"NW": 225 * Math.PI / 180,
	"W":  270 * Math.PI / 180,
	"SW": 315 * Math.PI / 180,
	"S":  0   * Math.PI / 180,
	"SE": 45  * Math.PI / 180
};

Player.prototype.onCollision = function (entity, interest) {
	// Consume resource items.
	if (interest.name === "touch" &&
		entity.type === "resource") {
		console.log("Consuming item " + entity.label + " (" + entity.id + ")");
		this.consumeResourceItem(entity);
		this.hud.update("resources");
	}
};

Player.prototype.damage = function(damageObj) {
	Character.prototype.damage.call(this, damageObj);
	this.hud.update("resources");
};

return Player;

});