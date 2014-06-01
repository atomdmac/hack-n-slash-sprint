function PlayState () {
	// The current map.
	var map, players=[], viewport;

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
				var player = options.players[lcv];
				var character = CharacterFactory(
					$.extend({}, player.character, {
						spawnX: player.spawnX,
						spawnY: player.spawnY,
						tileMap: map
					})
				);
				
				players.push(character);
				//map.push(character);
			}
		})();
		
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
	};

	this.update = function () {
		
		if(jaws.pressed("left"))  {
			players[0].moveLeft();
        }
        if(jaws.pressed("right")) {
			players[0].moveRight();
        }
        if(jaws.pressed("up"))    {
			players[0].moveUp();
        }
        if(jaws.pressed("down"))  {
			players[0].moveDown();
        }
	};

	this.draw = function () {
		jaws.clear();
		
		viewport.drawTileMap(map);
		for(var lcv = 0; lcv < players.length; lcv++ ) {
			viewport.centerAround(players[lcv]);
			viewport.draw(players[lcv]);
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

		// Convenience method for checking for collisions.
		tileMap.collides = function (obj) {
			var tiles = this.atRect(obj.rect());

			for(var i=0, len=tiles.length; i<len; i++) {
				if (!tiles[i].passable) {
					return true;
				}
			}
			return false;
		};

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