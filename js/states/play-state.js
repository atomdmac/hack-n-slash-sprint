define(
['jaws', 'DATABASE', 'lib/tamepad', 'lib/SAT', 'entities/item', 'entities/zone-switcher',
 'entities/moon-console', 'states/play-menu-state'],
function (jaws, DATABASE, Tamepad, SAT, Item, ZoneSwitcher, MoonConsole, PlayMenuState) {

function PlayState () {
	// The current map.
	// TODO: Clean up PlayState internal variable assignments.
	var _gameData, map, player, viewport, input, tamepad, menu,
		entities=[], collidableEntities=[], layers={};

	function onPlayerFell(player) {
		jaws.switchGameState(_gameData.states.death, {}, _gameData);
	}

	function onEntityGave (entity) {
		entity.signals.gave.add(onEntityGave);
		entity.signals.took.add(onEntityTook);
		entity.signals.activated.add(onEntityActivated);
		entity.signals.destroyed.add(onEntityDestroyed);
		entities.push(entity);
	}

	function onEntityTook (entity) {
		entity.signals.gave.remove(onEntityGave);
		entity.signals.took.remove(onEntityTook);
		entity.signals.activated.remove(onEntityActivated);
		entity.signals.destroyed.remove(onEntityDestroyed);
		entities.splice(entities.indexOf(entity), 1);
	}

	function onEntityActivated (entity) {
		if(entity instanceof ZoneSwitcher) {
			_gameData.url = entity.url;
			
			// If a new spawn position is given by the ZoneSwitcher, move the
			// player to that position before changing maps.
			_gameData.spawnX = entity.targetX || _gameData.player.x;
			_gameData.spawnY = entity.targetY || _gameData.player.y;

			jaws.switchGameState(_gameData.states.load , {}, _gameData);
		}
		else if(entity instanceof MoonConsole) {
			jaws.switchGameState(_gameData.states.win, {}, _gameData);
		}
	}

	function onEntityDestroyed (entity) {
		entity.signals.gave.remove(onEntityGave);
		entity.signals.took.remove(onEntityTook);
		entity.signals.activated.remove(onEntityActivated);
		entity.signals.destroyed.remove(onEntityDestroyed);
		entities.splice(entities.indexOf(entity), 1);
	}

	this.setup = function (options) {
		if(!options.map) {
			throw new Error("PlayState needs a map.");
		}
		if(!options.player) {
			throw new Error("PlayState needs at least one player.");
		}

		_gameData = options;

		player     = _gameData.player;
		entities   = _gameData.entities;

		map    = _gameData.map;
		layers = _gameData.layers;

		viewport = _gameData.viewport;

		// Create menu.
		menu = new PlayMenuState({gameData:_gameData});

		// Listen for entity events.
		entities.forEach(function(entity) {
			entity.signals.gave.add(onEntityGave);
			entity.signals.took.add(onEntityTook);
			entity.signals.activated.add(onEntityActivated);
			entity.signals.destroyed.add(onEntityDestroyed);
		});

		// Listen for events from player.
		player.signals.fell.add(onPlayerFell);
		player.spawn({x:player.x,y:player.y});
		
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space", "esc"]);
		
		input = {
			keyboard: {
				"moveUp"   : "w",
				"moveDown" : "s",
				"moveLeft" : "a",
				"moveRight": "d",
				"attack": ",",
				"useActiveItem": ".",
				"interact": "e",
				"pause": "esc"
			},
			gamepad: {
				"move": "left",			// Assumes joystick
				"attack": 0,			// A
				"useActiveItem": 1,		// B
				"interact": 2,			// X
				"pause": 9				// Start
			}
		};
		tamepad = new Tamepad();
	};

	this.update = function () {

		this.checkUserInput();
		
		// Set up loop variables.
		var collidableEntities = entities.slice();

		// Update entities and detect / respond to collisions.
		while(collidableEntities.length) {
			collidableEntities[0].update();
			// Remove the entity just considered, so we don't consider collisions twice
			collidableEntities.shift();
		}
		
		_gameData.gameWorld.update();
		
		// Sort the list of entities by Y coordinate so they'll be drawn with
		// the "closest" one in the foreground.
		entities.sort(function (a, b) {
			if(b instanceof ZoneSwitcher) return  1;
			if(a instanceof ZoneSwitcher) return -1;
			if(a instanceof Item && b instanceof Item) return 0;
			if(b instanceof Item) return  1;
			if(a instanceof Item) return -1;
			if(a.y > b.y) return  1;
			if(a.y < b.y) return -1;
			return 0; 
		});
	};

	this.checkUserInput = function () {

		// Update tamepad.
		// TODO: Don't require manual update to facilitate tamepad.pressedWithoutRepeat().
		tamepad.update();
		
		if(tamepad.pressedWithoutRepeat(input.gamepad["pause"])) {
			jaws.switchGameState(menu, {}, _gameData);
		}
		else if(jaws.pressed(input.keyboard["pause"])) {
			jaws.switchGameState(menu, {}, _gameData);
			return true;
		}

		// Apply player movement input.
		var movementBearing = tamepad.readJoystickAngleMagnitude('left');
		if(movementBearing.x || movementBearing.y) {
			player.move(movementBearing);
		}

		else {
			movementBearing = {x: 0, y:0};
			if(jaws.pressed(input.keyboard['moveUp'])   ) {
				movementBearing.y -= 1;
			}
			if(jaws.pressed(input.keyboard['moveDown'])) {
				movementBearing.y += 1;
			}
			if(jaws.pressed(input.keyboard['moveLeft'])) {
				movementBearing.x -= 1;
			}
			if(jaws.pressed(input.keyboard['moveRight'])) {
				movementBearing.x += 1;
			}
			player.move(movementBearing);
		}
		
		// Apply attack input.
		if(tamepad.pressed(input.gamepad['attack'])) {
			player.applyAttackInput(true);
		} 
		else if(jaws.pressed(input.keyboard['attack'])) {
			player.applyAttackInput(true);
		}
		else {
			player.applyAttackInput(false);
		}

		// Apply item input.
		if(tamepad.pressed(input.gamepad['useActiveItem'])) {
			player.applyUseActiveItemInput(true);
		}
		else if(jaws.pressed(input.keyboard['useActiveItem'])) {
			player.applyUseActiveItemInput(true);
		} else {
			player.applyUseActiveItemInput(false);
		}

		// Apply interaction input.
		if(tamepad.pressedWithoutRepeat(input.gamepad['interact'])) {
			player.applyInteractInput(true);
		}
		else if(jaws.pressed(input.keyboard['interact'])) {
			player.applyInteractInput(true);
		} else {
			player.applyInteractInput(false);
		}

	};

	this.draw = function () {
		jaws.clear();

		viewport.centerAround(player);
		viewport.drawTileMap(layers.background);
		viewport.drawTileMap(layers.terrain);
		

		// Set up loop variables.
		var i, ilen;
		
		// Draw entities.
		for(i=0, ilen=entities.length; i<ilen; i++) {
			viewport.draw(entities[i]);
		}
		
		viewport.drawTileMap(layers.canopy);
		
	};
}

return PlayState;

});