define(
['jaws', 'DATABASE', 'lib/SAT', 'entities/item', 'entities/zone-switcher'],
function (jaws, DATABASE, SAT, Item, ZoneSwitcher) {

function PlayState () {
	// The current map.
	// TODO: Clean up PlayState internal variable assignments.
	var _gameData, map, player, entities=[], collidableEntities=[], layers={}, viewport;

	function onEntityGave (entity) {
		entities.push(entity);
	}

	function onEntityTook (entity) {
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
		});
		
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
	};

	this.update = function () {
		// Set up loop variables.
		var i, ilen;
		collidableEntities = entities.slice();

		// Update entities and detect / respond to collisions.
		while(collidableEntities.length) {
			collidableEntities[0].update();
			var mapObjs = _collide( layers.collision, collidableEntities[0] );
			for(i=0, ilen=mapObjs.length; i<ilen; i++) {
				collidableEntities[0].x -= mapObjs[i].overlapX;
				collidableEntities[0].y -= mapObjs[i].overlapY;
			}
			// Remove the entity just considered, so we don't consider collisions twice
			collidableEntities.shift();
		}
		
		// See if the Player is under canopy
		if (_collide( layers.canopy, player ).length) {
			player.underCanopy = true;
		}
		else {
			player.underCanopy = false;
		}

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
		viewport.drawTileMap(layers.terrain);
		

		// Set up loop variables.
		var i, ilen;
		
		// Draw entities.
		for(i=0, ilen=entities.length; i<ilen; i++) {
			viewport.draw(entities[i]);
		}
		
		viewport.drawTileMap(layers.structures);
		
		// Only draw canopy if the player isn't under it.
		if (!player.underCanopy) {
			viewport.drawTileMap(layers.canopy);
		}
	};

	/*
	 * Check for collisions between the given Object and any objects in the
	 * given TileMap.
	 */
	function _collide(layer, obj) {
		function __getResponse (tile, obj) {
			// NOTE: Requires SAT.js.
			var polygon = new SAT.Polygon(
				new SAT.Vector(tile.x, tile.y),
				[
					new SAT.Vector(0, 0),
					new SAT.Vector(tile.width, 0),
					new SAT.Vector(tile.width, tile.height),
					new SAT.Vector(0, tile.height)
				]
			);

			var circle = new SAT.Circle(
				new SAT.Vector(
					obj.x, 
					obj.y
				), 
				obj.radius
			);

			var response = new SAT.Response();

			var collision = SAT.testCirclePolygon(circle, polygon, response);

			if (collision) {
				return response;
			} else {
				return false;
			}
		}

		var tiles = layer.atRect(obj.rect()),
			cols  = [];

		for(var i=0, len=tiles.length; i<len; i++) {
			if (!tiles[i].passable && tiles[i] !== obj) {
				var col = __getResponse( tiles[i], obj );
				if (col) {
					cols.push({
						tile: tiles[i],
						overlapX: col.overlapV.x,
						overlapY: col.overlapV.y
					});
				}
			}
		}
		return cols;
	}
}

return PlayState;

});