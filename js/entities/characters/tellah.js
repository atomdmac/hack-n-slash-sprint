define(
['jaws', '$', 'DATABASE', 'entities/npc'],
function (jaws, $, DATABASE, NPC) {

function Tellah(options) {
	
	this.options = $.extend(true, 
		{},
		DATABASE.characters["base"],
		DATABASE.characters['Tellah'],
		DATABASE.nonPlayerCharacters["base"],
		options
	);
	
	// Extend NPC class.
	NPC.call(this, this.options);
}

Tellah.prototype = Object.create(NPC.prototype);

return Tellah;

});
