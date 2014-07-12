function PlayState () {
	// The current map.
	var map, players=[], npcs=[], characters=[], layers={}, viewport;

	this.setup = function (options) {
		if(!options.map) {
			throw new Error("PlayState needs a map.");
		}
		if(!options.players) {
			throw new Error("PlayState needs at least one player.");
		}

		options.players = options.players || [];
		options.npcs    = options.npcs    || [];

		map              = options.map;
		layers.collision = options.map.layerAsTileMap("collision");
		layers.terrain   = options.map.layerAsTileMap("terrain");

		viewport = new jaws.Viewport({
			width: jaws.width,
			height: jaws.height,
			max_x: map.width  * map.tilewidth,
			max_y: map.height * map.tileheight
		});
		
		// Setup players.
		(function () {
			// Load Map assets.
			for(var lcv = 0; lcv < options.players.length; lcv++ ) {
				var player = PlayerFactory({
					character: $.extend({}, options.players[lcv].character, {
						spawnX: options.players[lcv].spawnX,
						spawnY: options.players[lcv].spawnY,
						tileMap: layers.terrain,
						characters: characters
					}),
					tileMap   : layers.terrain,
					players   : players,
					npcs      : npcs,
					keyMap    : options.players[lcv].keyMap,
					characters: characters
				});
				
				players.push(player);
				characters.push(player.character);
			}
		})();
		
		// Setup NPCs.
		(function () {
			// Load Map assets.
			for(var lcv = 0; lcv < options.npcs.length; lcv++ ) {
				var npc = NPCFactory({
					character: $.extend({}, options.npcs[lcv].character, {
						spawnX: options.npcs[lcv].spawnX,
						spawnY: options.npcs[lcv].spawnY,
						tileMap: map
					})
				});
				
				npcs.push(npc);
				characters.push(npc.character);
			}
		})();
		
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
	};

	this.update = function () {
		// Set up loop variables.
		var i, ilen, j, jlen, response = new SAT.Response();

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

		viewport.centerAround(players[0].character);
		viewport.drawTileMap(layers.terrain);

		// Draw characters.
		var i, ilen;
		for(i=0, ilen=players.length; i<ilen; i++) {
			viewport.draw(players[i].character);
		}
		for(i=0, ilen=npcs.length; i<ilen; i++) {
			viewport.draw(npcs[i].character);
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