/*
 * This state loads the map specified in the setup() config and provides the
 * user with an interface to display progress.  When the map has finished
 * loading, the game will switch back to the PlayState.  The Play State will be
 * passed a configuration object with an array containing jaws.TileMaps for each
 * layer found in the TMX map as well as a reference to the original map object
 * passed to jaws.TMXMap.
 */
define(
['jaws', 'DATABASE', 'states/play-state', 'game-world'],
function (jaws, DATABASE, PlayState, GameWorld) {

function LoadState () {

	var _gameData, text;

	/*
	 * Callback to be invoked when GameWorld is ready for use.
	 */
	function _onGameWorldReady (map) {
		// Switch to PlayState 
		jaws.switchGameState(PlayState, {}, _gameData);
	}

	/**
	 * Configure the game state.
	 * @param  {Object} config The configuration object.
	 * @param  {String} config.url A path to the TMX map to load.
	 * @return {Void} 
	 */
	this.setup = function (gameData) {
		if(!gameData || !gameData.url) throw "LoadState needs a map to load.";

		// Store reference to gameData in closure.
		_gameData = gameData;

		// Instantiate and TMX Map.  Callback will be notified when load and
		// parse are complete.
		_gameData.gameWorld = new GameWorld(_gameData, _onGameWorldReady);

		// Display initial feedback to user.
		text       = new jaws.Text({
			text: "Loading the map: " + _gameData.url,
			x   : jaws.width / 2,
			y   : jaws.height / 2,
			textAlign: "center",
			fontSize: 24
		});

	};

	this.update = function () {
		// TODO
	};

	this.draw = function () {
		console.log("drawing in load state");
		jaws.clear();
		jaws.draw(text);
	};
}

return LoadState;

});