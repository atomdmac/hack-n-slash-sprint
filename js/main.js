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

function HackNSlashSetup () {

	// Configure JawsJS
	jaws.init({
		width: DATABASE.settings.graphics.resolution.selected.width,
		height: DATABASE.settings.graphics.resolution.selected.height
	});

	// Configure debug UI.
	$('#toggle-pause-btn').on('click', function (e) {
		var isPaused = $(this).data('isPaused') || false;
		if(isPaused) {
			jaws.game_loop.unpause();
			$(this).data('isPaused', false);
		} else {
			jaws.game_loop.pause();
			$(this).data('isPaused', true);
		}
	});

	// Load game assets.
	(function () {

		// Load Character assets.
		for(var character in DATABASE.characters) {
			character = DATABASE.characters[character];

			if(character.sprite_sheet) jaws.assets.add( character.sprite_sheet );
		}
		
		// Load Spell assets.
		for(var spell in DATABASE.spells) {
			spell = DATABASE.spells[spell];

			if(spell.sprite_sheet) jaws.assets.add( spell.sprite_sheet );
		}
		
		// Load Equipment assets.
		for(var equip in DATABASE.equipment) {
			equip = DATABASE.equipment[equip];

			if(equip.sprite_sheet) jaws.assets.add( equip.sprite_sheet );
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
		// Select Character properties.
		for(var lcv = 0; lcv < npcCount; lcv++) {
			var character = DATABASE.characters["Tellah"];
			
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
		new LoadState(),
		// Start-up Options
		{
			fps: 60
		},
		// Game State options.
		{
			url: "assets/tmx/import-test.tmx",
			players: [
				{
					character: DATABASE.characters["Edge"],
					spawnX: 96,
					spawnY: 96,
					keyMap: {
						"moveUp"   : "w",
						"moveDown" : "s",
						"moveLeft" : "a",
						"moveRight": "d",
						"castSpell": "space"
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