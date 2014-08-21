requirejs.config({
	baseUrl: 'js',
	paths: {
		'$': 'lib/jquery',
		'jaws': 'lib/jawsjs/jaws',
		'DATABASE': '../data/database'
	},
	shim: {
		'jaws': {
			exports: 'jaws'
		},
		'$': {
			exports: 'jQuery'
		}
	}
});

require(
['jaws', '$', 'DATABASE', 'states/load-state'],
function (jaws, $, DATABASE, LoadState) {

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
		
	})();

	// Define game data structure.
	var gameData = {
		// Load the map from this path.
		url: 'assets/tmx/import-test.tmx',
		// Once loaded, a reference to the map will go here.
		map: null,
		// A jaws.Viewport instance for rendering the game world.
		viewport: null,

		// TODO: Change 'players' to 'player' in game state data.
		// Reference to the player's character instance.
		players: null,
		// Reference to array of NPCs in the current map.
		npcs: null,
		// Reference to all characters (player and NPC) in the current map.
		characters: null,
		// Reference to all items in the current map.
		items: null
	};
	
	// Start main Game Loop.
	jaws.start(
		new LoadState(),
		// Start-up Options
		{
			fps: 60
		},
		gameData
	);

	jaws.setDimensions = function (w, h) {
		jaws.width = w;
		jaws.height = h;
		var cvs = document.getElementsByTagName("canvas")[0];
		cvs.width = w;
		cvs.height = h;
	};
});