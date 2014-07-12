function PlayerFactory (options) {
	var defaultOptions = {
		// Data that defines the character that this player controls.
		character: null,

		// The dimensions of the player's viewport.
		viewWidth : jaws.width,
		viewHeight: jaws.height,

		// Where on the main game display the draw the player's viewport.
		viewOffsetX: 0,
		viewOffsetY: 0,

		// Reference to the map that the character is in.
		tileMap: null,

		// tileMaps keyboard/controller input to actions.
		keyMap: {
			"moveUp"       : "up",
			"moveDown"     : "down",
			"moveLeft"     : "left",
			"moveRight"    : "right",
			"openInventory": "i",
			"openMenu"     : "escape"
		}
	};
	
	options = $.extend({}, defaultOptions, options);
	
	
	// Double-check required options.
	if (!options.tileMap) throw "Player needs a tileMap.";
	if (!options.character) throw "Player needs a character.";

	var self = {};
	
	// Set our keymap.
	self.keyMap = options.keyMap;
	
	self.radianMap8D = {
		"E":  90  * Math.PI / 180,
		"NE": 135 * Math.PI / 180,
		"N":  180 * Math.PI / 180,
		"NW": 225 * Math.PI / 180,
		"W":  270 * Math.PI / 180,
		"SW": 315 * Math.PI / 180,
		"S":  0   * Math.PI / 180,
		"SE": 45  * Math.PI / 180
	};
	
	self.mouse = {x: 0, y: 0};
	var jawswindow = jaws.canvas || jaws.dom;
	self.handleMouseMove = function(event) {
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
	};
	jawswindow.addEventListener("mousemove", self.handleMouseMove, false);

	// Create the character that this player controls.
	self.character = CharacterFactory(options.character);
	
	// These are actions that the player can take.  Many of them will map to
	// functions on the underlying Character object.
	self.actions = {};
	self.actions.move = function (angle, magnitude) {
		self.character.move(angle, magnitude);
	};
	self.actions.moveUp = function () {
		self.character.moveUp();
	};
	self.actions.moveDown = function () {
		self.character.moveDown();
	};
	self.actions.moveLeft = function () {
		self.character.moveLeft();
	};
	self.actions.moveRight = function () {
		self.character.moveRight();
	};
	self.actions.attack = function (props) {
		
	};
	self.actions.openInventory = function () {
		console.log("Implement inventory, please.");
	};
	self.actions.openMenu = function () {
		console.log("Implement menu, please.");
	};

	// Setup Gamepad
	self.gamepad = null;
	
	// Called from the parent Game State from it's update() method.  This is
	// where we listen for input and stuff.
	self.update = function () {
		var analogX, analogY, angle, magnitude, reach, startX, startY, endX, endY;

		self.character.update();
		
		/*
		 * Handle movement input, considering multiple inputs first
		 */
		
		/***********************************************************************
		 * KEYBOARD INPUT
		 **********************************************************************/
		// North East
		if (jaws.pressed(self.keyMap["moveRight"]) &&
			jaws.pressed(self.keyMap["moveUp"])) {
			self.actions.move(self.radianMap8D["NE"], 1);
		}
		else
		// North West
		if (jaws.pressed(self.keyMap["moveUp"]) &&
			jaws.pressed(self.keyMap["moveLeft"])) {
			self.actions.move(self.radianMap8D["NW"], 1);
		}
		else
		// South West
		if (jaws.pressed(self.keyMap["moveLeft"]) &&
			jaws.pressed(self.keyMap["moveDown"])) {
			self.actions.move(self.radianMap8D["SW"], 1);
		}
		else
		// South East
		if (jaws.pressed(self.keyMap["moveDown"]) &&
			jaws.pressed(self.keyMap["moveRight"])) {
			self.actions.move(self.radianMap8D["SE"], 1);
		}
		else
		// East
		if (jaws.pressed(self.keyMap["moveRight"])) {
			self.actions.move(self.radianMap8D["E"], 1);
		}
		else
		// North
		if (jaws.pressed(self.keyMap["moveUp"])) {
			self.actions.move(self.radianMap8D["N"], 1);
		}
		else
		// West
		if (jaws.pressed(self.keyMap["moveLeft"])) {
			self.actions.move(self.radianMap8D["W"], 1);
		}
		else
		// South
		if (jaws.pressed(self.keyMap["moveDown"])) {
			self.actions.move(self.radianMap8D["S"], 1);
		}
		
		
		/***********************************************************************
		 * MOUSE INPUT
		 **********************************************************************/
		if (jaws.pressed("left_mouse_button")) {
			analogX   = self.mouse.x - (self.character.x - options.viewport.x);
			analogY   = self.mouse.y - (self.character.y - options.viewport.y);
			angle     = Math.atan2(analogX, analogY);
			magnitude = Math.sqrt(analogX*analogX+analogY*analogY) / 100;
			
			self.actions.move(angle, magnitude);
		}
		
		if (jaws.pressed("right_mouse_button")) {
			analogX   = self.mouse.x - (self.character.x - options.viewport.x);
			analogY   = self.mouse.y - (self.character.y - options.viewport.y);
			angle     = Math.atan2(analogX, analogY);
			magnitude = Math.sqrt(analogX*analogX+analogY*analogY);
			reach     = 100;

			magnitude = magnitude < reach ? magnitude / reach : 1;
			
			startX = self.character.x;
			startY = self.character.y;
			endX   = startX + reach * magnitude * Math.sin(angle);
			endY   = startY + reach * magnitude * Math.cos(angle);
			
			self.character.attack({
				reach : reach * magnitude,
				startX: startX,
				startY: startY,
				endX  : endX,
				endY  : endY
			});
		}
		
		/*
		 * Handle UI requests
		 */
		/*
		// Open inventory
		if (jaws.pressed(self.keyMap["openInventory"]) &&
			self.actions["openInventory"]) {
			// TODO
		}	
		// Open menu
		if (jaws.pressed(self.keyMap["openMenu"]) &&
			self.actions["openMenu"]) {
			// TODO
		}
		*/
		
		/***********************************************************************
		 * GAMEPAD INPUT
		 **********************************************************************/ 
		if (!self.gamepad && jaws.gamepads[0]) {
			self.gamepad = jaws.gamepads[0]; // Only use first gamepad for now...
		}
		if (self.gamepad !== null) {
			// Record move action
			var leftJoystickData = jaws.gamepadReadJoystick(self.gamepad, "left");
			if(Math.abs(leftJoystickData.analogX) > 0.25 || Math.abs(leftJoystickData.analogY) > 0.25) {
				self.actions.move(leftJoystickData.angle, leftJoystickData.magnitude);
			}
			
			// Record attack action
			var rightJoystickData = jaws.gamepadReadJoystick(self.gamepad, "right");
			if(Math.abs(rightJoystickData.analogX) > 0.25 || Math.abs(rightJoystickData.analogY) > 0.25) {
				// TODO: Handle more of this in CharacterFactory.
				reach = 100;
				startX = self.character.x;
				startY = self.character.y;
				endX = startX + reach * rightJoystickData.magnitude * Math.sin(rightJoystickData.angle);
				endY = startY + reach * rightJoystickData.magnitude * Math.cos(rightJoystickData.angle);
				
				self.character.attack({
					reach : reach * rightJoystickData.magnitude,
					startX: startX,
					startY: startY,
					endX  : endX,
					endY  : endY
				});
			}
		}
	};

	return self;
}