define(
['jaws', 'DATABASE', 'lib/SAT', 'entities/character', 'ui/hud', 'entities/item'],
function (jaws, DATABASE, SAT, Character, HUD, Item) {

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
	this.mouse = {x: 0, y: 0};
	this.input = options.input;

	var jawswindow = jaws.canvas || jaws.dom;
	jawswindow.addEventListener("mousemove", _handleMouseMove, false);

	// TODO: Is there a way to move _handleMouseMove out of the Player constructor so it doesn't get duplicated in memory?
	function _handleMouseMove (event) {
		var x = 0;
		var y = 0;
		var canvas = jawswindow;

		if (event.x !== undefined && event.y !== undefined)
		{
			x = event.x;
			y = event.y;
		}
		else // Firefox method to get the position
		{
			x = event.clientX + document.body.scrollLeft +
				document.documentElement.scrollLeft;
			y = event.clientY + document.body.scrollTop +
				document.documentElement.scrollTop;
		}

		self.mouse.x = x -= canvas.offsetLeft;
		self.mouse.y = y -= canvas.offsetTop;
	}
	
	// Item inspection
	this.inspecting = null;
	this.inspectRadius = 30;
	this.inspectMessage = new jaws.Text({
		text: "nothing to see here",
		anchor: "bottom_left",
		width: 128,
		height: 32,
		textAlign: "center",
		//wordWrap: true, // Don't set to true - this is broken in JAWS!
		color: "white",
		style: "bold",
		fontFace: "Arial",
		shadowColor: "black",
		shadowBlur: 3
	});
	
	// HUD
	this.hud = new HUD({
		character: this
	});
}

Player.prototype = Object.create(Character.prototype);

Player.prototype.draw = function () {
	Character.prototype.draw.call(this);
	// Draw inspect message.
	this.inspectMessage.draw();
	// Draw HUD
	this.hud.draw();
};

Player.prototype.update = function () {

	Character.prototype.update.call(this);

	/*
	 * Handle movement input, considering multiple inputs first
	 */

	/***********************************************************************
	 * MOUSE & KEYBOARD INPUT
	 **********************************************************************/
	if (jaws.pressed(this.input.mouseAndKeyboard["equipInspected"])) {
		this.equipInspected();
	}
	
	// Placeholders for debugging/testing features
	if (jaws.pressed(this.input.mouseAndKeyboard["debug1"])) { this.debug1(); }
	if (jaws.pressed(this.input.mouseAndKeyboard["debug2"])) { this.debug2(); }
	if (jaws.pressed(this.input.mouseAndKeyboard["debug3"])) { this.debug3(); }

	/***********************************************************************
	 * GAMEPAD INPUT
	 **********************************************************************/ 
	if (!this.gamepad && jaws.gamepads[0]) {
		this.gamepad = jaws.gamepads[0]; // Only use first gamepad for now...
		
		this.gamepadButtons = {
			"attack": this.gamepad.buttons[this.input.gamepad["attack"]],
			"useActiveItem": this.gamepad.buttons[this.input.gamepad["useActiveItem"]],
			"equipInspected": this.gamepad.buttons[this.input.gamepad["equipInspected"]],
			"debug1": this.gamepad.buttons[this.input.gamepad["debug1"]],
			"debug2": this.gamepad.buttons[this.input.gamepad["debug2"]],
			"debug3": this.gamepad.buttons[this.input.gamepad["debug3"]]
		};
	}
	if (this.gamepad !== null) {
		// Equip inspected item.
		if (jaws.gamepadButtonPressed(this.gamepadButtons["equipInspected"])) {
			this.equipInspected();
		}
		
		// Placeholders for debugging/testing features
		if (jaws.gamepadButtonPressed(this.gamepadButtons["debug1"])) { this.debug1(); }
		if (jaws.gamepadButtonPressed(this.gamepadButtons["debug2"])) { this.debug2(); }
		if (jaws.gamepadButtonPressed(this.gamepadButtons["debug3"])) { this.debug3(); }
	}
	
	// Apply character actions.
	this.applyMovement();
	this.applyAction();
	
	// Update inspect message
	this.inspecting = null;
	for(var id in this._gameData.entities) {
		if (this._gameData.entities[id] instanceof Item && jaws.collideCircles({
									radius: this.inspectRadius,
									x: this.x,
									y: this.y
								}, this._gameData.entities[id])) {
			this.inspecting = this._gameData.entities[id];
			break;
		}
	}
	
	this.inspectMessage.text = this.inspecting
	                         ? this.inspecting.label
							 : "nothing to see here";
	
	// Move the inspect message with us.
	this.inspectMessage.moveTo(this.x, this.y);
	
	// Update inspecting in the HUD.
	this.hud.update("inspecting");
};

Player.prototype.applyMovement = function() {
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
		keys[this.input.mouseAndKeyboard["moveUp"]]		= {x: 0,	y: -1};
		keys[this.input.mouseAndKeyboard["moveDown"]]	= {x: 0,	y: 1};
		keys[this.input.mouseAndKeyboard["moveLeft"]]	= {x: -1,	y: 0};
		keys[this.input.mouseAndKeyboard["moveRight"]]	= {x: 1,	y: 0};
		
		// Calculate sum of emulated analog values for pressed keys.
		for (var key in keys) {
			if (jaws.pressed(key)) {
				analog.x += keys[key]["x"];
				analog.y += keys[key]["y"];
			}
		}
	}
	
	this.move(this.getAngleOfAnalogs(analog.x, analog.y),
			  this.getMagnitudeOfAnalogs(analog.x, analog.y));
};

Player.prototype.applyAction = function() {
	// TODO: Don't allow attacking and using items at the same time.
	
	// Check attack input
	if ((this.gamepad !== null &&
		jaws.gamepadButtonPressed(this.gamepadButtons["attack"])) ||
		jaws.pressed(this.input.mouseAndKeyboard["attack"])) {
		
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
	
	if ((this.gamepad !== null &&
		jaws.gamepadButtonPressed(this.gamepadButtons["useActiveItem"])) ||
		jaws.pressed(this.input.mouseAndKeyboard["useActiveItem"])) {
		
		// Use active item.
		this.useActiveItem();
	}
};

Player.prototype.getAngleOfAnalogs = function (analogX, analogY) {
	return Math.atan2(analogX, analogY);
};

Player.prototype.getMagnitudeOfAnalogs = function (analogX, analogY) {
	return Math.sqrt(analogX*analogX+analogY*analogY);
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

Player.prototype.equipInspected = function() {
	if (this.inspecting && this.inspecting.equipSlot) {
		Character.prototype.equip.call(this, this.inspecting.equipSlot, this.inspecting);
		this.hud.update("equipment");
		this.hud.update("stats");
	}
};

Player.prototype.damage = function(damageObj) {
	Character.prototype.damage.call(this, damageObj);
	this.hud.update("resources");
};

Player.prototype.debug1 = function() {
	// Get naked.
	for (var slot in this.equipment) {
		Character.prototype.unequip.call(this, slot);
	}
	this.hud.update("equipment");
	this.hud.update("stats");
};

Player.prototype.debug2 = function() {
	console.log("debug2");
};

Player.prototype.debug3 = function() {
	
};

return Player;

});