define(
['jaws', '$', 'DATABASE', 'entities/npc'],
function (jaws, $, DATABASE, NPC) {

function Tellah(options) {
	
	this.options = $.extend( 
		{},
		DATABASE.characters["base"],
		DATABASE.characters['Tellah'],
		DATABASE.nonPlayerCharacters["base"],
		// Default options, until we come up with a better way to define these.
		{
			state:	"seek"
		},
		options
	);
	
	// Extend NPC class.
	NPC.call(this, this.options);
	
	this.race = "human";
	this.alignment = "evil";
}

Tellah.prototype = Object.create(NPC.prototype);

return Tellah;

});
