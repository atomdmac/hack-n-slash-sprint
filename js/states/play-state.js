function PlayState () {
	// The current map.
	var map, players=[], npcs=[], viewport;

	this.setup = function (options) {
		if(!options.map) {
			throw new Error("PlayState needs a map.");
		}
		if(!options.players) {
			throw new Error("PlayState needs at least one player.");
		}

		map = _parseMap(options.map);

		viewport = new jaws.Viewport({
			width: jaws.width,
			height: jaws.height,
			max_x: map.width,
			max_y: map.height
		});
		
		// Setup players.
		(function () {
			// Load Map assets.
			for(var lcv = 0; lcv < options.players.length; lcv++ ) {
				var player = PlayerFactory({
					character: $.extend({}, options.players[lcv].character, {
						spawnX: options.players[lcv].spawnX,
						spawnY: options.players[lcv].spawnY,
						tileMap: map
					}),
					tileMap  : map,
					players  : players,
					npcs     : npcs,
					keyMap   : options.players[lcv].keyMap

					// Experiments w/ multiple viewports.
					/*
					viewWidth: jaws.width / 2,
					viewHeight: jaws.height,
					viewOffsetX: lcv * (jaws.width / 2),
					viewOffsetY: 0
					*/
				});
				
				players.push(player);
				map.push(player.character);
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
				map.push(npc.character);
			}
		})();
		
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
	};

	this.update = function () {
		for(var i=0, len=players.length; i<len; i++) {
			players[i].update();
		}
		for(var j=0, len=npcs.length; j<len; j++) {
			npcs[j].update();
		}
	};

	this.draw = function () {
		jaws.clear();

		for(var lcv = 0; lcv < players.length; lcv++ ) {
			players[lcv].draw();
		}
	};

	/*
	 * Parse map data and output a TileMap.
	 */
	function _parseMap (data) {
		var tileMap, 
			xlen = data.tiles[0].length,
			ylen = data.tiles.length,
			x, y, tile, tileProps;

		tileMap = new jaws.TileMap({
			cell_size: data.properties.size,
			size     : [xlen, ylen],
			x: 0, y: 0
		});

		tileMap.width  = xlen * data.properties.size[0];
		tileMap.height = ylen * data.properties.size[1];

		for(x=0; x<xlen; x++) {
			for(y=0; y<ylen; y++) {
				tileProps = data.properties[data.tiles[y][x]];
				tile = new jaws.Sprite({
					image: tileProps.imageSrc,
					x    : x * data.properties.size[0],
					y    : y * data.properties.size[1]
				});

				tile = $.extend(tile, tileProps);
				tileMap.push(tile);
			}
		}

		return tileMap;
	}
}