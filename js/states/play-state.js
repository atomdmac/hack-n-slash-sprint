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
	};

	this.update = function () {
		// TODO
	};

	this.draw = function () {
		jaws.clear();
		viewport.drawTileMap(map);
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
			size     : [xlen, ylen]
		});

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