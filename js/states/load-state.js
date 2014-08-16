/*
 * This state loads the map specified in the setup() config and provides the
 * user with an interface to display progress.  When the map has finished
 * loading, the game will switch back to the PlayState.  The Play State will be
 * passed a configuration object with an array containing jaws.TileMaps for each
 * layer found in the TMX map as well as a reference to the original map object
 * passed to jaws.TMXMap.
 */
function LoadState () {

	var _gameData, text;

	/*
	 * Callback to be invoked when map is loaded, parsed and ready for use.
	 */
	function _onMapParsed (map) {
		_gameData.map = map;
		_gameData.characters = [];
		
		// Create viewport.
		_gameData.viewport = new jaws.Viewport({
			width : jaws.width,
			height: jaws.height,
			max_x: map.width  * _gameData.map.tilewidth,
			max_y: map.height * _gameData.map.tileheight
		});

		// Populate the map with NPCs.
		_gameData.npcs = _generateNPCs(100);

		// Generate player.
		_gameData.players = [_generatePlayer()];

		// Create a list containing player as well as NPCs.
		_gameData.characters.push.apply(_gameData.characters, _gameData.npcs);
		_gameData.characters.push.apply(_gameData.characters, _gameData.players);

		// Populate 
		jaws.switchGameState(PlayState, {}, _gameData);
	}

	/*
	 * Generate a random point on the map that a character can be spawned on.
	 */
	function _getRandomSpawnPoint () {
		// TODO: Check for collisions when generating random spawn point.
		if(!_gameData.map.width) return;
		var mapWidth  = _gameData.map.width  * _gameData.map.tilewidth,
			mapHeight = _gameData.map.height * _gameData.map.tileheight;

		return {
			x: Math.floor(Math.random() * mapWidth  - 2) + 1,
			y: Math.floor(Math.random() * mapHeight - 2) + 1
		};
	}

	/*
	 * Create a list of randomly generated and placed NPCs.
	 */
	function _generateNPCs(npcCount) {
		var npcs = [], spawnPoint, character = DATABASE.characters['Tellah'];

		// Select Character properties.
		for(var lcv = 0; lcv < npcCount; lcv++) {

			// NPCs feel too fast right now, so let's slow them down.
			// TODO: Pull character baseSpeed from database.
			character = $.extend({}, character, {baseSpeed: 3});
			
			// Figure out where to drop the new NPC in the game world.
			spawnPoint = _getRandomSpawnPoint();
			
			// Instantiate new NPC.
			npcs.push(
				NPCFactory({
					character: $.extend({}, character, {
						spawnX: spawnPoint.x,
						spawnY: spawnPoint.y,
						
						// TODO: LoadState needs to give Player Character instance a reference to terrain data.  Hardcoded to TRUE to prevent errors for now.
						tileMap: true
					})
				})
			);
		}

		return npcs;
	}

	/*
	 * Generate a new Player instance and place it at a random position on the
	 * map.
	 */
	function _generatePlayer() {
		var player, spawnPoint;

		spawnPoint = _getRandomSpawnPoint();
		player = PlayerFactory({
			character: $.extend({}, DATABASE.characters['Edge'], {
				spawnX: spawnPoint.x,
				spawnY: spawnPoint.y,
				
				// TODO: LoadState needs to give Player Character instance a reference to terrain data.  Hardcoded to TRUE to prevent errors for now.
				tileMap: true,

				characters: _gameData.characters
			}),
			// TODO: LoadState needs to give Player instance a reference to terrain data.  Hardcoded to TRUE to prevent errors for now.
			tileMap   : true,

			players   : [],
			npcs      : _gameData.npcs,
			keyMap    : _gameData.keyMap,
			characters: _gameData.characters,
			viewport  : _gameData.viewport
		});

		return player;
	}

	/**
	 * Configure the game state.
	 * @param  {Object} config The configuration object.
	 * @param  {String} config.url A path to the TMX map to load.
	 * @return {Void} 
	 */
	this.setup = function (config) {
		if(!config || !config.url) throw "LoadState needs a map to load.";

		// Store reference to config in closure.
		_gameData = config;

		// Instantiate and TMX Map.  Callback will be notified when load and
		// parse are complete.
		new jaws.TMXMap(config.url, _onMapParsed);

		// Display initial feedback to user.
		text       = new jaws.Text({
			text: "Loading the map: " + config.url,
			x   : jaws.width / 2,
			y   : jaws.height / 2,
			textAlign: "center",
			fontSize: 24
		});

		jaws.clear();
		jaws.draw(text);
	};

	this.update = function () {
		// TODO
	};

	this.draw = function () {
		// TODO
	};
}