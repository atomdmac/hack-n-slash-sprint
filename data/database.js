define([
'../data/settings', 
'../data/equipment', 
'../data/spells',
'../data/characters', 
'../data/player-characters', 
'../data/non-player-characters'], 
function (settings, equipment, spells, characters, playerCharacters, nonPlayerCharacters) {
	var db = {
		settings           : settings,
		equipment          : equipment,
		spells             : spells,
		characters         : characters,
		playerCharacters   : playerCharacters,
		nonPlayerCharacters: nonPlayerCharacters
	};
	console.log('db = ', db);
	return db;
});