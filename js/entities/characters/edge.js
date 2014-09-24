define(
['jaws', '$', 'DATABASE', 'entities/npc'],
function (jaws, $, DATABASE, NPC) {

function Edge(options) {
	
	this.options = $.extend(true, 
		{},
		DATABASE.characters["base"],
		DATABASE.characters['Edge'],
		DATABASE.nonPlayerCharacters["base"],
		options
	);
	
	// Extend NPC class.
	NPC.call(this, this.options);
	
	this.race = "human";
	this.alignment = "good";
}

Edge.prototype = Object.create(NPC.prototype);

return Edge;

});
