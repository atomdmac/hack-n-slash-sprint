function PlayState () {
	// The current map.
	var map, player, viewport;

	this.setup = function (options) {
		if(!options.map) {
			throw new Error("PlayState needs a map.");
		}

		map = _parseMap(options.map);

		viewport = new jaws.Viewport({
			width: jaws.width,
			height: jaws.height
		});

		player = HackNSlashPlayer({
			image: "assets/png/entities/player.png",
			x: 32,
			y: 32,
			tileMap: map
		});
	};

	this.update = function () {
		if (jaws.pressed("up"))    player.walk( 0, -1);
		if (jaws.pressed("down"))  player.walk( 0,  1);
		if (jaws.pressed("left"))  player.walk(-1,  0);
		if (jaws.pressed("right")) player.walk( 1,  0);
	};

	this.draw = function () {
		jaws.clear();
		viewport.drawTileMap(map);
		player.draw();
	};

	/*
	 * Parse map data and output a TileMap.
	 */
	function _parseMap (data) {
		var map, 
			xlen = data.tiles[0].length,
			ylen = data.tiles.length,
			x, y, tile, tileProps;

		map = new jaws.TileMap({
			cell_size: data.properties.size,
			size     : [xlen, ylen],
			x: 0, y: 0
		});

		// Convenience method for checking for collisions.
		map.collides = function (obj) {
			var tiles = this.atRect(obj);
			
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
				map.push(tile);
			}
		}

		return map;
	}
}