define(
[],
function() {


var browserGamepads;
var gamepads = {};
var gamepadTypes = ["Xbox 360"];
var connectMethod;


var inputMap = {
	"default": {
		"joysticks": {
			"left" : { x: 0, y: 1 },
			"right": { x: 2, y: 3 }
		}
	},
	"Xbox 360": {
		"joysticks": {
			"left" : { x: 0, y: 1 },
			"right": { x: 2, y: 3 }
		}
	}
};

// Account for inputs that are mapped incorrectly by the browser.
if (navigator.userAgent.indexOf('Firefox') !== -1) {
	inputMap["Xbox 360"].joysticks = {
		"left" : { x: 1, y: 0 },
		"right": { x: 3, y: 2 }
	};
}

function addGamepad(gamepad) {
	for (var lcv = 0; lcv < gamepadTypes.length; lcv++) {
		if (gamepad.id.toLowerCase().indexOf(gamepadTypes[lcv].toLowerCase()) !== -1) {
			// Modify Gamepad object
			gamepad.type = gamepadTypes[lcv];
		}
	}
	if (!gamepad.type) { gamepad.type = "default"; }
	
	gamepads[gamepad.index] = gamepad;
	console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
	gamepad.index, gamepad.id,
	gamepad.buttons.length, gamepad.axes.length);
	
	console.log(gamepads);
}

function removeGamepad(gamepad) {
	delete gamepads[gamepad.index];
}

function connectHandler(e) {
	addGamepad(e.gamepad);
}

function disconnectHandler(e) {
	removeGamepad(e.gamepad);
}

function scanGamepads() {
	browserGamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
	for (var i = 0; i < browserGamepads.length; i++) {
		if (browserGamepads[i]) {
			if (!(browserGamepads[i].index in gamepads)) {
				addGamepad(browserGamepads[i]);
			} else {
				gamepads[browserGamepads[i].index] = browserGamepads[i];
			}
		}
	}
}

function setupGamepadSupport() {
	connectMethod = (navigator.webkitGetGamepads || navigator.getGamepads) ? "poll" : "event";
	
	if (connectMethod === "event") {
		window.addEventListener("gamepadconnected", connectHandler);
		window.addEventListener("gamepaddisconnected", disconnectHandler);
	}
}

function updateGamepads() {
	if (connectMethod === "poll") {
		scanGamepads();
	}
}

function applyDeadZones(gamepad, values) {
	if(values.x > -gamepad.deadZoneX && values.x < gamepad.deadZoneX) values.x = 0;
	if(values.y > -gamepad.deadZoneY && values.y < gamepad.deadZoneY) values.y = 0;
	return values;
}

	
/** @private
 * Start listening for gamepads.
 */


setupGamepadSupport();


var Tamepad = function () {
	scanGamepads();
	
	// TODO: Register gamepad index with this Tamepad instance.
	this.gamepad = gamepads[0]; // Debug: hardocded to first gamepad.
	this.buttonsPressedWithoutRepeat = {};

	this.deadZoneX = 0.2;
	this.deadZoneY = 0.2;

	if(!this.isConnected()) return;
	
	// select inputMap
	this.inputMap = inputMap[this.gamepad.type];
	
};

Tamepad.prototype.isConnected = function () {
	// Browser support for determinine if a gamepad is actually connected isn't
	// great currently so we'll just check to make sure we have a Gamepad 
	// object to work with.  
	// TODO: Add better support for checking gamepad connection.
	return typeof this.gamepad !== 'undefined';

};

Tamepad.prototype.update = function() {
	for (var btnKey in this.buttonsPressedWithoutRepeat) {
		if (!this.pressed(Number(btnKey))) {
			delete this.buttonsPressedWithoutRepeat[btnKey];
		}
	}
};

Tamepad.prototype.pressed = function(button) {
	updateGamepads();
	if(!this.gamepad) return false;
	if (typeof(this.gamepad.buttons[button]) == "object") {
		return this.gamepad.buttons[button].pressed;
	}
	return this.gamepad.buttons[button] == 1.0;
};

Tamepad.prototype.pressedWithoutRepeat = function(button) {
	// False if not pressed currently.
	if (!this.pressed(button)) {
		return false; 
	}
	// False if already in hash of pressed buttons.
	if (this.buttonsPressedWithoutRepeat[button]) {
		return false;
	}
	this.buttonsPressedWithoutRepeat[button] = true;
	return true;
};

Tamepad.prototype.readLeftJoystick = function () {
	return applyDeadZones(this, {
		x: this.gamepad.axes[0],
		y: this.gamepad.axes[1]
	});
};

Tamepad.prototype.readRightJoystick = function () {
	return applyDeadZones(this, {
		x: this.gamepad.axes[3],
		y: this.gamepad.axes[4]
	});
};

Tamepad.prototype.readJoystick = function(joystick) {
	updateGamepads();
	if(!this.isConnected()) return {x: 0, y: 0};
	
	var mappings = this.inputMap.joysticks[joystick];
	
	return applyDeadZones(this, {
		x: this.gamepad.axes[mappings.x],
		y: this.gamepad.axes[mappings.y]
	});
};

Tamepad.prototype.readJoystickAngleMagnitude = function(joystick) {
	var analog = this.readJoystick(joystick);
	var angle = Math.atan2(analog.x, analog.y);
	var magnitude = Math.sqrt(analog.x*analog.x+analog.y*analog.y);
	
	return {
		x: analog.x,
		y: analog.y,
		angle: angle,
		magnitude: magnitude
	};
};

Tamepad.prototype.gamepads = gamepads;

return Tamepad;
});
