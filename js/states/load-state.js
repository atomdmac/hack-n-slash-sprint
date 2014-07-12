/*
 * This state loads the map specified in the setup() config and provides the
 * user with an interface to display progress.  When the map has finished
 * loading, the game will switch back to the PlayState.  The Play State will be
 * passed a configuration object with an array containing jaws.TileMaps for each
 * layer found in the TMX map as well as a reference to the original map object
 * passed to jaws.TMXMap.
 */
function LoadState () {

	var playConfig, text;

	/*
	 * Callback to be invoked when map is loaded, parsed and ready for use.
	 */
	function _onMapParsed (map) {
		playConfig.map = map;
		jaws.switchGameState(PlayState, {}, playConfig);
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
		playConfig = config;

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