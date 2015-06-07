define(
['jaws', '$', 'lib/signals', 'DATABASE', 'lib/SAT', 'collider', 'entities/entity', 'entities/player', 'entities/npc', 'entities/characters/tellah', 'entities/characters/edge', 'entities/item', 'entities/zone-switcher', 'entities/patrol-point', 'entities/items/switch', 'entities/moon-console'],
function (jaws, $, signals, DATABASE, SAT, Collider, Entity, Player, NPC, Tellah, Edge, Item, ZoneSwitcher, PatrolPoint, Switch, MoonConsole) {


function GameWorld(gameData, readyCallback) {

	// Reference to game world data.
	this._gameData = gameData;
	this.readyCallback = readyCallback;
	this.collider = new Collider();
	
	// TODO: Find a better way to manage scope of the callback?
	new jaws.TMXMap(this._gameData.url, $.proxy(this.onMapParsed, this));
}

GameWorld.prototype = Object.create(Object);

GameWorld.prototype.update = function () {
	this.collider.update();
};

/*
 * Setup/Loading Stuffs
 */
GameWorld.prototype.onMapParsed = function (map) {
	console.log(map);
	this._gameData.map = map;
	this._gameData.layers = {
		collision : map.layerAsTileMap('collision', Entity),
		canopy    : map.layerAsTileMap('canopy'),
		terrain   : map.layerAsTileMap('terrain'),
		background: map.layerAsTileMap('background')
	};
	this._gameData.entities = [];
	this._gameData.patrols = {};
	
	// Create viewport.
	this._gameData.viewport = new jaws.Viewport({
		width : jaws.width,
		height: jaws.height,
		max_x: map.width  * this._gameData.map.tilewidth,
		max_y: map.height * this._gameData.map.tileheight
	});
	
	// Populate the map with Entities.
	this._gameData.entities.push.apply(this._gameData.entities, this.generateMapObjects());
	// Add the Player to the map here, rather than in this.generateMapObjects(),
	// because the Player always exists, even if not present in map data.
	this._gameData.entities.push.apply(this._gameData.entities, [this._gameData.player]);

	// Add entities to Collider
	this._gameData.entities.forEach(function (entity) {
		this.collider.addEntity(entity);
	}, this);
	
	this.collider.addTerrainLayer(this._gameData.layers.background);
	
	this.readyCallback();
};

GameWorld.prototype.generateMapObjects = function (map) {
	var mapObjects = [], currentObject, objectConfig;
	
	for (var lcv = 0; lcv < this._gameData.map.objects.length; lcv++) {
		currentObject = this._gameData.map.objects[lcv];
		switch (currentObject.type) {
			case "ZoneSwitcher":
				objectConfig = $.extend(true, 
					{},
					currentObject.properties,
					{
						x: currentObject.x,
						y: currentObject.y,
						width: currentObject.width,
						height: currentObject.height,
						color: null
					}
				);
				
				// Attach game data *after* cloning so it is passed by reference.
				objectConfig.gameData = this._gameData;
				
				mapObjects.push(new ZoneSwitcher(objectConfig));
				
				break;
			case "PatrolPoint":
				objectConfig = $.extend(true, 
					{},
					currentObject.properties,
					{
						x: currentObject.x,
						y: currentObject.y,
						width: currentObject.width || 1,
						height: currentObject.height || 1,
						color: null
					}
				);
				
				// Attach game data *after* cloning so it is passed by reference.
				objectConfig.gameData = this._gameData;
				
				mapObjects.push(new PatrolPoint(objectConfig));
				
				break;
			case "Player":
				if (!this._gameData.player) {
					objectConfig = $.extend(true, 
						{},
						DATABASE.characters["base"], 
						DATABASE.characters['Chuck'],
						DATABASE.playerCharacters['base'],
						currentObject.properties,
						{
							/*
							 * Funny math for pixel-perfect placement based
							 * on TMX data, because I haven't taken the time
							 * to figure out the root issue with placement.
							 */
							x       : currentObject.x + 13,
							y       : currentObject.y - 8,
							viewport: this._gameData.viewport
						}
					);
					
					// Attach game data *after* cloning so it is passed by reference.
					objectConfig.gameData = this._gameData;
					
					// Don't push the Player onto mapObjects here. We handle
					// the Player elsewhere.
					this._gameData.player = new Player(objectConfig);
				} 

				// Player already exists from previous map load.  Just reposition
				// it based on the map's spawn point.  If a spawn position is
				// defined in gameData, use it.
				else {
					this._gameData.player.spawn({
						x: this._gameData.spawnX || currentObject.x + 13,
						y: this._gameData.spawnY || currentObject.y - 8
					});
				}
				
				break;
			case "Tellah":
				objectConfig = $.extend(true, 
					{},
					currentObject.properties,
					{
						/*
						 * Funny math for pixel-perfect placement based
						 * on TMX data, because I haven't taken the time
						 * to figure out the root issue with placement.
						 */
						x: currentObject.x + 17,
						y: currentObject.y
					}
				);
	
				// Attach game data *after* cloning so it is passed by reference.
				objectConfig.gameData = this._gameData;
				
				// Instantiate new NPC.
				mapObjects.push(new Tellah(objectConfig));
				
				break;
			case "Edge":
				objectConfig = $.extend(true, 
					{},
					currentObject.properties,
					{
						/*
						 * Funny math for pixel-perfect placement based
						 * on TMX data, because I haven't taken the time
						 * to figure out the root issue with placement.
						 */
						x: currentObject.x + 17,
						y: currentObject.y
					}
				);
	
				// Attach game data *after* cloning so it is passed by reference.
				objectConfig.gameData = this._gameData;
				
				// Instantiate new NPC.
				mapObjects.push(new Edge(objectConfig));
				
				break;
			case "Switch":
				if (DATABASE.items[currentObject.name]) {
					objectConfig = $.extend(true, 
						{},
						DATABASE.items["base"],
						DATABASE.items[currentObject.name],
						currentObject.properties,
						{
							x: currentObject.x,
							y: currentObject.y
						}
					);
					
					// Attach game data *after* cloning so it is passed by reference.
					objectConfig.gameData = this._gameData;
					
					mapObjects.push(new Switch(objectConfig));
					
				}
				break;
			case "MoonConsole":
				if (DATABASE.items[currentObject.name]) {
					objectConfig = $.extend(true, 
						{},
						DATABASE.items["base"],
						DATABASE.items[currentObject.name],
						currentObject.properties,
						{
							x: currentObject.x,
							y: currentObject.y - currentObject.height
						}
					);
					
					// Attach game data *after* cloning so it is passed by reference.
					objectConfig.gameData = this._gameData;
					
					mapObjects.push(new MoonConsole(objectConfig));
					
				}
				break;
			case "Item":
				if (DATABASE.items[currentObject.name]) {
					objectConfig = $.extend(true, 
						{},
						DATABASE.items["base"],
						DATABASE.items[currentObject.name],
						currentObject.properties,
						{
							x: currentObject.x,
							y: currentObject.y
						}
					);
					
					// Attach game data *after* cloning so it is passed by reference.
					objectConfig.gameData = this._gameData;
					
					mapObjects.push(new Item(objectConfig));
					
				}
				break;
			default:
				break;
		}
	}
	
	return mapObjects;
};

return GameWorld;

});
