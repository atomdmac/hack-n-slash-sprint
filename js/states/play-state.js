define(
['jaws', 'DATABASE', 'lib/SAT', 'entities/item', 'entities/zone-switcher'],
function (jaws, DATABASE, SAT, Item, ZoneSwitcher) {

function PlayState () {
	// The current map.
	// TODO: Clean up PlayState internal variable assignments.
	var _gameData, map, player, entities=[], collidableEntities=[], layers={}, viewport;

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
			_gameData.player.x = entity.targetX || _gameData.player.x;
			_gameData.player.y = entity.targetY || _gameData.player.y;
			_gameData.url = entity.url;
			jaws.switchGameState(jaws.previous_game_state, {}, _gameData);
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

		entities.forEach(function(entity) {
			entity.signals.gave.add(onEntityGave);
			entity.signals.took.add(onEntityTook);
			entity.signals.activated.add(onEntityActivated);
			entity.signals.destroyed.add(onEntityDestroyed);
		});
		
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
	};

	this.update = function () {
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