define(
['jaws', 'DATABASE', 'entities/npc', 'entities/player', 'lib/SAT'],
function (jaws, DATABASE, NPC, Player, SAT) {

function PlayState () {
	// The current map.
	// TODO: Clean up PlayState internal variable assignments.
	var _gameData, map, players=[], npcs=[], characters=[], layers={}, viewport;

	this.setup = function (options) {
		if(!options.map) {
			throw new Error("PlayState needs a map.");
		}
		if(!options.players) {
			throw new Error("PlayState needs at least one player.");
		}

		_gameData = options;

		players    = _gameData.players;
		npcs       = _gameData.npcs;
		characters = _gameData.characters;
		items      = _gameData.items;

		map    = _gameData.map;
		layers = _gameData.layers;

		viewport = _gameData.viewport;
		
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
	};

	this.update = function () {
		// Set up loop variables.
		var i, ilen, j, jlen;

		// Update our players and NPCs.  This includes decision making and 
		// actions.
		for(i=0, ilen=players.length; i<ilen; i++) {
			players[i].update();
		}
		for(i=0, ilen=npcs.length; i<ilen; i++) {
			npcs[i].update();
		}

		// Sort the list of characters by Y coordinate so they'll be drawn with
		// the "closest" one in the foreground.
		characters.sort(function (a, b) {
			if(a.y > b.y) return  1;
			if(a.y < b.y) return -1;
			return 0; 
		});

		// Detect / respond to map collisions.
		for(i=0, ilen=characters.length; i<ilen; i++) {
			var mapObjs = _collide( characters[i] );
			for(j=0, jlen=mapObjs.length; j<jlen; j++) {
				characters[i].x -= mapObjs[j].overlapX;
				characters[i].y -= mapObjs[j].overlapY;
			}
		}
	};

	this.draw = function () {
		jaws.clear();

		viewport.centerAround(players[0]);
		viewport.drawTileMap(layers.terrain);

		// Set up loop variables.
		var i, ilen;
		
		// Draw items.
		for(var id in items) {
			viewport.draw(items[id]);
		}
		// Draw characters.
		for(i=0, ilen=characters.length; i<ilen; i++) {
			viewport.draw(characters[i]);
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