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
			right: [6,8]
		}
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
			right: [6,8]
		}
	}
};

function HackNSlashSetup () {
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
		var npcCount = 20;
		var characterKeys = Object.keys(CHARACTER_MAP);
		// Select Character properties.
		for(var lcv = 0; lcv < npcCount; lcv++) {
			var randomCharacterIndex = Math.floor(Math.random() * characterKeys.length);
			var character = CHARACTER_MAP[characterKeys[randomCharacterIndex]];
			
			var spawnY = Math.floor(Math.random() * (DEBUG_MAP.tiles.length - 2)) + 1;
			var spawnX = Math.floor(Math.random() * (DEBUG_MAP.tiles[spawnY].length - 2)) + 1;
			
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
			fps: 30
		},
		// Game State options.
		{
			map: DEBUG_MAP,
			players: [
				{
					character: CHARACTER_MAP["Tellah"],
					spawnX: 32,
					spawnY: 32
				},
				{
					character: CHARACTER_MAP["Edge"],
					spawnX: 96,
					spawnY: 32,
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