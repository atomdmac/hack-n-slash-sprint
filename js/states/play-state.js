define(
['jaws', 'DATABASE', 'lib/SAT', 'entities/item', 'entities/zone-switcher'],
function (jaws, DATABASE, SAT, Item, ZoneSwitcher) {

function PlayState () {
	// The current map.
	// TODO: Clean up PlayState internal variable assignments.
	var _gameData, map, player, entities=[], collidableEntities=[], layers={}, viewport;

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

		map              = _gameData.map;
		layers.collision = _gameData.map.layerAsTileMap("collision");
		layers.terrain   = _gameData.map.layerAsTileMap("terrain");

		viewport = _gameData.viewport;
		
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
	};

	this.update = function () {
		// Set up loop variables.
		var i, ilen;
		collidableEntities = entities.slice();

		// Update entities and detect / respond to collisions.
		while(collidableEntities.length) {
			collidableEntities[0].update();
			var mapObjs = _collide( collidableEntities[0] );
			for(i=0, ilen=mapObjs.length; i<ilen; i++) {
				collidableEntities[0].x -= mapObjs[i].overlapX;
				collidableEntities[0].y -= mapObjs[i].overlapY;
			}
			// Remove the entity just considered, so we don't consider collisions twice
			collidableEntities.shift();
		}

		// Sort the list of entities by Y coordinate so they'll be drawn with
		// the "closest" one in the foreground.
		entities.sort(function (a, b) {
			if(b instanceof ZoneSwitcher) return  1;
			if(a instanceof ZoneSwitcher) return -1;
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
	};

	/*
	 * Check for collisions between the given Object and any objects in the
	 * given TileMap.
	 */
	function _collide(obj) {
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

		var tiles = layers.collision.atRect(obj.rect()),
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