define(
['jaws', 'DATABASE', 'entities/character', 'ui/hud', 'entities/item'],
function (jaws, DATABASE, Character, HUD, Item) {

function Player (options) {

	// Extend Character class.
	Character.call(this, options);

	// Controls
	this.gamepad = null;
	this.mouse = {x: 0, y: 0};
	this.input = options.input;

	var jawswindow = jaws.canvas || jaws.dom;
	jawswindow.addEventListener("mousemove", _handleMouseMove, false);

	// TODO: Is there a way to move _handleMouseMove out of the Player constructor so it doesn't get duplicated in memory?
	var self = this;
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
	var analogX, analogY, angle, magnitude, reach, startX, startY, endX, endY;

	Character.prototype.update.call(this);

	/*
	 * Handle movement input, considering multiple inputs first
	 */

	/***********************************************************************
	 * MOUSE & KEYBOARD INPUT
	 **********************************************************************/
	// North East
	if (jaws.pressed(this.input.mouseAndKeyboard["moveRight"]) &&
		jaws.pressed(this.input.mouseAndKeyboard["moveUp"])) {
		this.move(this.radianMap8D["NE"], 1);
	}
	else
	// North West
	if (jaws.pressed(this.input.mouseAndKeyboard["moveUp"]) &&
		jaws.pressed(this.input.mouseAndKeyboard["moveLeft"])) {
		this.move(this.radianMap8D["NW"], 1);
	}
	else
	// South West
	if (jaws.pressed(this.input.mouseAndKeyboard["moveLeft"]) &&
		jaws.pressed(this.input.mouseAndKeyboard["moveDown"])) {
		this.move(this.radianMap8D["SW"], 1);
	}
	else
	// South East
	if (jaws.pressed(this.input.mouseAndKeyboard["moveDown"]) &&
		jaws.pressed(this.input.mouseAndKeyboard["moveRight"])) {
		this.move(this.radianMap8D["SE"], 1);
	}
	else
	// East
	if (jaws.pressed(this.input.mouseAndKeyboard["moveRight"])) {
		this.move(this.radianMap8D["E"], 1);
	}
	else
	// North
	if (jaws.pressed(this.input.mouseAndKeyboard["moveUp"])) {
		this.move(this.radianMap8D["N"], 1);
	}
	else
	// West
	if (jaws.pressed(this.input.mouseAndKeyboard["moveLeft"])) {
		this.move(this.radianMap8D["W"], 1);
	}
	else
	// South
	if (jaws.pressed(this.input.mouseAndKeyboard["moveDown"])) {
		this.move(this.radianMap8D["S"], 1);
	}
	
	if (jaws.pressed(this.input.mouseAndKeyboard["equipInspected"])) {
		this.equipInspected();
	}
	
	// Primary Attack (must be a mouse button)
	if (jaws.pressed(this.input.mouseAndKeyboard["primaryAttack"])) {
		analogX   = this.mouse.x - (this.x - this._gameData.viewport.x);
		analogY   = this.mouse.y - (this.y - this._gameData.viewport.y);
		angle     = Math.atan2(analogX, analogY);
		magnitude = Math.sqrt(analogX*analogX+analogY*analogY);
		reach     = 100;

		magnitude = magnitude < reach ? magnitude / reach : 1;
		
		startX = this.x;
		startY = this.y;
		endX   = startX + reach * magnitude * Math.sin(angle);
		endY   = startY + reach * magnitude * Math.cos(angle);
		
		this.primaryAttack({
			reach : reach * magnitude,
			startX: startX,
			startY: startY,
			endX  : endX,
			endY  : endY,
			angle : angle
		});
	}
	// Secondary Attack
	if (jaws.pressed(this.input.mouseAndKeyboard["secondaryAttack"])) {
		this.secondaryAttack();
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
			"secondaryAttack": this.gamepad.buttons[this.input.gamepad["secondaryAttack"]],
			"equipInspected": this.gamepad.buttons[this.input.gamepad["equipInspected"]],
			"debug1": this.gamepad.buttons[this.input.gamepad["debug1"]],
			"debug2": this.gamepad.buttons[this.input.gamepad["debug2"]],
			"debug3": this.gamepad.buttons[this.input.gamepad["debug3"]]
		};
	}
	if (this.gamepad !== null) {
		// Record cast spell action.
		if (jaws.gamepadButtonPressed(this.gamepadButtons["secondaryAttack"])) {
			this.secondaryAttack();
		}
		
		// Equip inspected item.
		if (jaws.gamepadButtonPressed(this.gamepadButtons["equipInspected"])) {
			this.equipInspected();
		}
		
		// Placeholders for debugging/testing features
		if (jaws.gamepadButtonPressed(this.gamepadButtons["debug1"])) { this.debug1(); }
		if (jaws.gamepadButtonPressed(this.gamepadButtons["debug2"])) { this.debug2(); }
		if (jaws.gamepadButtonPressed(this.gamepadButtons["debug3"])) { this.debug3(); }
		
		// Record move action
		var moveJoystickData = jaws.gamepadReadJoystick(this.gamepad, this.input.gamepad["move"]);
		if(Math.abs(moveJoystickData.analogX) > 0.25 || Math.abs(moveJoystickData.analogY) > 0.25) {
			this.move(moveJoystickData.angle, moveJoystickData.magnitude);
		}
		
		// Record primaryAttack action
		var primaryAttackJoystickData = jaws.gamepadReadJoystick(this.gamepad, this.input.gamepad["primaryAttack"]);
		if(Math.abs(primaryAttackJoystickData.analogX) > 0.25 || Math.abs(primaryAttackJoystickData.analogY) > 0.25) {
			reach = 100;
			startX = this.x;
			startY = this.y;
			endX = startX + reach * primaryAttackJoystickData.magnitude * Math.sin(primaryAttackJoystickData.angle);
			endY = startY + reach * primaryAttackJoystickData.magnitude * Math.cos(primaryAttackJoystickData.angle);
			
			this.primaryAttack({
				reach : reach * primaryAttackJoystickData.magnitude,
				startX: startX,
				startY: startY,
				endX  : endX,
				endY  : endY,
				angle : primaryAttackJoystickData.angle
			});
		}
	}
	
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