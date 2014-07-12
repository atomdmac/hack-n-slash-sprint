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
	
	// The viewport for this player.  Responsible for displaying the tileMap.
	self.viewport = new jaws.Viewport({
		width : options.viewWidth,
		height: options.viewHeight,
		max_x : options.tileMap.cell_size[0] * options.tileMap.size[0],
		max_y : options.tileMap.cell_size[1] * options.tileMap.size[1],
		x_offset: options.viewOffsetX,
		y_offset: options.viewOffsetY
	});

	// Create the character that this player controls.
	self.character = CharacterFactory(options.character);
	
	// These are actions that the player can take.  Many of them will map to
	// functions on the underlying Character object.
	self.actions = {};
	self.actionsQueued = {};
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
		self.actionsQueued = {}; // Clear queued actions.
		self.character.update();
		
		/*
		 * Handle movement input, considering multiple inputs first
		 */
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
		
		
		
		if (jaws.pressed("left_mouse_button")) {
			var	analogX = self.mouse.x - (self.character.x - self.viewport.x);
			var	analogY = self.mouse.y - (self.character.y - self.viewport.y);
			
			var angle = Math.atan2(analogX, analogY);
			var magnitude = Math.sqrt(analogX*analogX+analogY*analogY) / 100;
			
			self.actions.move(angle, magnitude);
		}
		
		if (jaws.pressed("right_mouse_button")) {
			var	analogX = self.mouse.x - (self.character.x - self.viewport.x);
			var	analogY = self.mouse.y - (self.character.y - self.viewport.y);
			
			var angle = Math.atan2(analogX, analogY);
			var magnitude = Math.sqrt(analogX*analogX+analogY*analogY);
			
			var reach = 100;
			magnitude = magnitude < reach ? magnitude / reach : 1;
			
			var startX = self.character.x - self.viewport.x;
			var startY = self.character.y - self.viewport.y;
			var endX = startX + reach * magnitude * Math.sin(angle);
			var endY = startY + reach * magnitude * Math.cos(angle);
			
			self.actionsQueued["attack"] = {
				startX: startX,
				startY: startY,
				angle: angle,
				reach: reach * magnitude,
				endX: endX,
				endY: endY
			};
				
			var attackEntity = {
				x: self.character.x,
				y: self.character.y,
				radius: reach * magnitude
			};
			
			var charactersHit = jaws.collideOneWithMany(attackEntity, options.characters);
			for (var lcv = 1; lcv < charactersHit.length; lcv++) {
				charactersHit[lcv].damage({
					value:			5,			// base damage value
					resource:		"health",	// resource being targeted for damage
					type:			"slashing",	// type fo damage being dealth
					penetration:	0.2			// percentage of armor/resist to ignore
				});
			}
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
		
		if (!self.gamepad && jaws.gamepads[0]) {
			self.gamepad = jaws.gamepads[0]; // Only use first gamepad for now...
		}
		if (self.gamepad != null) {
			// Record move action
			var leftJoystickData = jaws.gamepadReadJoystick(self.gamepad, "left");
			if(Math.abs(leftJoystickData.analogX) > 0.25 || Math.abs(leftJoystickData.analogY) > 0.25) {
				self.actions.move(leftJoystickData.angle, leftJoystickData.magnitude);
			}
			
			// Record attack action
			var rightJoystickData = jaws.gamepadReadJoystick(self.gamepad, "right");
			if(Math.abs(rightJoystickData.analogX) > 0.25 || Math.abs(rightJoystickData.analogY) > 0.25) {
				// TODO: Handle more of this in CharacterFactory.
				var reach = 100;
				var startX = self.character.x - self.viewport.x;
				var startY = self.character.y - self.viewport.y;
				var endX = startX + reach * rightJoystickData.magnitude * Math.sin(rightJoystickData.angle);
				var endY = startY + reach * rightJoystickData.magnitude * Math.cos(rightJoystickData.angle);
				
				self.actionsQueued["attack"] = {
					startX: startX,
					startY: startY,
					angle: rightJoystickData.angle,
					reach: reach * rightJoystickData.magnitude,
					endX: endX,
					endY: endY
				};
				
				var attackEntity = {
					x: self.character.x,
					y: self.character.y,
					radius: reach * rightJoystickData.magnitude
				};
				
				var charactersHit = jaws.collideOneWithMany(attackEntity, options.characters);
				for (var lcv = 1; lcv < charactersHit.length; lcv++) {
					charactersHit[lcv].damage({
						value:			5,			// base damage value
						resource:		"health",	// resource being targeted for damage
						type:			"slashing",	// type fo damage being dealth
						penetration:	0.2			// percentage of armor/resist to ignore
					});
				}
			}
		}
	};

	// Called from the parent Game State's draw() method.  Draw the character
	// and any applicable effects here.
	self.draw = function () {
		self.viewport.centerAround(self.character);
		self.viewport.drawTileMap(options.tileMap);
		var i, ilen;
		for(i=0, ilen=options.characters.length; i<ilen; i++) {
			self.viewport.draw(options.characters[i]);
		}
		
		if (self.actionsQueued["attack"] != null) {
			var context = jaws.context;
			(function ()
			{
				var attack = self.actionsQueued["attack"];
				
				context.beginPath();
				context.arc(attack.startX, attack.startY, attack.reach, 0, 2 * Math.PI, false);
				context.fillStyle = 'green';
				context.globalAlpha = 0.5;
				context.fill();
				context.lineWidth = 5;
				context.strokeStyle = '#003300';
				context.stroke();
				
				context.moveTo(attack.startX, attack.startY);
				context.lineTo(attack.endX, attack.endY);
				context.lineWidth = 5;
				context.globalAlpha = 1;
				context.strokeStyle = 'blue';
				context.stroke();
				
			})();
		}
	};

	return self;
}