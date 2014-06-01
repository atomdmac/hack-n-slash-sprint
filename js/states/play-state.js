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
			height: jaws.height,
			max_x: map.width,
			max_y: map.height
		});

		console.log(map.height);

		player = HackNSlashCharacter({
			image: "assets/png/entities/player.png",
			x: 32,
			y: 32,
			scale: 2,
			tileMap: map
		});
		
		var playerAnim = new jaws.Animation({sprite_sheet: "assets/png/entities/player.png", frame_size: [16,16], frame_duration: 100});
        
        player.anim_down = playerAnim.slice(0,2);
        player.anim_up = playerAnim.slice(2,4);
        player.anim_left = playerAnim.slice(4,6);
        player.anim_right = playerAnim.slice(6,8);
		
        player.setImage( player.anim_down.next() );
		
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
	};

	this.update = function () {
		
		if(jaws.pressed("left"))  {
            player.move(-1,0);
            player.setImage(player.anim_left.next());
            //oink.play();
        }
        if(jaws.pressed("right")) {
            player.move(1,0);
            player.setImage(player.anim_right.next());
            //oink.play();
        }
        if(jaws.pressed("up"))    {
            player.move(0, -1);
            player.setImage(player.anim_up.next());
            //oink.play();
        }
        if(jaws.pressed("down"))  {
            player.move(0, 1);
            player.setImage(player.anim_down.next());
            //oink.play();
        }
        if(!jaws.pressed("left right up down"))  {
            //oink.stop();
        }
	};

	this.draw = function () {
		jaws.clear();
		
        viewport.centerAround(player);
		viewport.drawTileMap(map);
		viewport.draw(player);
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