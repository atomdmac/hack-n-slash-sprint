define([
'../data/settings', 
'../data/entities', 
'../data/equipment', 
'../data/spells',
'../data/characters', 
'../data/player-characters', 
'../data/non-player-characters',
'../data/loot-table'], 
function (settings, entities, equipment, spells, characters, playerCharacters, nonPlayerCharacters, lootTable) {
	var db = {
		settings           : settings,
		entities           : entities,
		equipment          : equipment,
		spells             : spells,
		characters         : characters,
		playerCharacters   : playerCharacters,
		nonPlayerCharacters: nonPlayerCharacters,
		lootTable          : lootTable
	};
	console.log('db = ', db);
	return db;
});