var DEBUG_MAP = {
	tiles: [
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	],
	properties: {
		size: [32, 32],
		"0": {
			name: "wall",
			destructable: false,
			imageSrc: "assets/png/terrain/wall.png",
			passable: false
		},
		"1": {
			name: "floor",
			imageSrc: "assets/png/terrain/floor.png",
			destructable: false,
			passable: true
		}
	}
};

var CHARACTER_MAP = {
	"Edge": {
		sprite_sheet: "assets/png/entities/FF4_EdgeSheet.png",
		scale: 2,
		frame_size: [16,16],
		frame_duration: 100,
		animationSubsets: {
			down:  [0,2],
			up:    [2,4],
			left:  [4,6],
			right: [6,8],
			damage:[10,11],
			dead:  [11,12]
		},
		baseSpeed: 1,
		maxSpeed: 1.5
	},
	"Tellah": {
		sprite_sheet: "assets/png/entities/FF4_TellahSheet.png",
		scale: 2,
		frame_size: [16,16],
		frame_duration: 100,
		animationSubsets: {
			down:  [0,2],
			up:    [2,4],
			left:  [4,6],
			right: [6,8],
			damage:[10,11],
			dead:  [11,12]
		},
		baseSpeed: 0.5,
		maxSpeed: 0.5
	}
};

function HackNSlashSetup () {
	/*
	 * A convenience method for checking to see if the given object collides with
	 * anything.  Collisions are detected based on each overlapping object's
	 * "passable" property.
	 */
	jaws.TileMap.prototype.collides = function (obj) {
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

		var tiles = this.atRect(obj.rect()),
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
	};

	// Configure JawsJS
	jaws.init({
		width: 500,
		height: 600
	});

	// Load game assets.
	(function () {

		// Load Character assets.
		for(var character in CHARACTER_MAP) {
			character = CHARACTER_MAP[character];

			if(character.sprite_sheet) jaws.assets.add( character.sprite_sheet );
		}
		
		// Load Map assets.
		for(var tile in DEBUG_MAP.properties) {
			tile = DEBUG_MAP.properties[tile];

			if(tile.imageSrc) jaws.assets.add( tile.imageSrc );
		}
	})();
	
	// Randomly generate some NPC data.
	var npcs = [];
	(function () {
		var npcCount = 100;
		var characterKeys = Object.keys(CHARACTER_MAP);
		// Select Character properties.
		for(var lcv = 0; lcv < npcCount; lcv++) {
			var randomCharacterIndex = Math.floor(Math.random() * characterKeys.length);
			var character = CHARACTER_MAP[characterKeys[randomCharacterIndex]];
			
			// NPCs feel too fast right now, so let's slow them down.
			character = $.extend({}, character, {baseSpeed: 3});
			
			var spawnY = Math.floor(Math.random() * (DEBUG_MAP.tiles.length - 2) + 1);
			var spawnX = Math.floor(Math.random() * (DEBUG_MAP.tiles[spawnY].length - 2) + 1);
			
			spawnY = spawnY * DEBUG_MAP.properties.size[1];
			spawnX = spawnX * DEBUG_MAP.properties.size[0];
			
			npcs.push({
				character: character,
				spawnX: spawnX,
				spawnY: spawnY
			});
		}
	})();
	
	// Start main Game Loop.
	jaws.start(
		// Start with this Game State
		new PlayState(),
		// Start-up options.
		{
			fps: 60
		},
		// Game State options.
		{
			map: DEBUG_MAP,
			players: [
				/*{
					character: CHARACTER_MAP["Tellah"],
					spawnX: 32,
					spawnY: 32
				},*/
				{
					character: CHARACTER_MAP["Edge"],
					spawnX: 96,
					spawnY: 96,
					keyMap: {
						"moveUp"   : "w",
						"moveDown" : "s",
						"moveLeft" : "a",
						"moveRight": "d"
					}
				}
			],
			npcs: npcs
		}
	);

	jaws.setDimensions = function (w, h) {
		jaws.width = w;
		jaws.height = h;
		var cvs = document.getElementsByTagName("canvas")[0];
		cvs.width = w;
		cvs.height = h;
	};
}