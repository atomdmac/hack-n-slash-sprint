define([
'../data/settings', 
'../data/entities', 
'../data/items', 
'../data/spells',
'../data/characters', 
'../data/player-characters', 
'../data/non-player-characters',
'../data/loot-table'], 
function (settings, entities, items, spells, characters, playerCharacters, nonPlayerCharacters, lootTable) {
	var db = {
		settings           : settings,
		entities           : entities,
		items              : items,
		spells             : spells,
		characters         : characters,
		playerCharacters   : playerCharacters,
		nonPlayerCharacters: nonPlayerCharacters,
		lootTable          : lootTable
	};
	console.log('db = ', db);
	return db;
});