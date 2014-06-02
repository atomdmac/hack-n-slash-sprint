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

	// The viewport for this player.  Responsible for displaying the tileMap.
	self.viewport = new jaws.Viewport({
		width : options.viewWidth,
		height: options.viewHeight,
		max_x : options.tileMap.width,
		max_y : options.tileMap.height,
		x_offset: options.viewOffsetX,
		y_offset: options.viewOffsetY
	});

	// Create the character that this player controls.
	self.character = CharacterFactory(options.character);
	
	// These are actions that the player can take.  Many of them will map to
	// functions on the underlying Character object.
	self.actions = {};
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
	self.actions.openInventory = function () {
		console.log("Implement inventory, please.");
	};
	self.actions.openMenu = function () {
		console.log("Implement menu, please.");
	};

	// Setup Gamepad
	self.gamepad = null;
	self.setGamepad = function(gamepad) {
		self.gamepad = gamepad;
		console.log ("player has set the gamepad!");
	};
	
	self.gamepadButtonPressed = function(b) {
		if (typeof(b) == "object") {
			return b.pressed;
		}
		return b == 1.0;
	};
	self.gamepadAxesPressed = function(b) {
		if (typeof(b) == "object") {
			return b.pressed;
		}
		return b == 1.0;
	};
	
	// Called from the parent Game State from it's update() method.  This is
	// where we listen for input and stuff.
	self.update = function () {
		self.character.update();
		for(var action in self.keyMap) {
			if (jaws.pressed(self.keyMap[action]) && self.actions[action]) {
				self.actions[action]();
			} 
		}
		if (self.gamepad != null) {
			var buttonPressed = self.gamepadButtonPressed;
			var axesPressed = self.gamepadAxesPressed;
			var gp = self.gamepad;
			
			for (var lcv = 0; lcv < gp.buttons.length; lcv++) {
				if (buttonPressed(gp.buttons[lcv])) {
					console.log("gamepade button pressed: " + lcv);
				}
			}
			for (var lcv = 0; lcv < gp.axes.length; lcv++) {
				if (axesPressed(gp.axes[lcv])) {
					console.log("gamepade axes pressed: " + lcv);
				}
			}
			
			if (gp.axes[1] < -0.25) {
				self.actions.moveUp();
			} else if (gp.axes[1] > 0.25) {
				self.actions.moveDown();
			}
			if(gp.axes[0] < -0.25) {
				self.actions.moveLeft();
			} else if(gp.axes[0] > 0.25) {
				self.actions.moveRight();
			}
		}
	};

	// Called from the parent Game State's draw() method.  Draw the character
	// and any applicable effects here.
	self.draw = function () {
		self.viewport.centerAround(self.character);

		self.viewport.drawTileMap(options.tileMap);

		for(var i=0, len=options.players.length; i<len; i++) {
			self.viewport.draw(options.players[i].character);
		}
		for(i=0, len=options.npcs.length; i<len; i++) {
			self.viewport.draw(options.npcs[i].character);
		}
	};

	return self;
}