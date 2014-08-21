define(
['jaws', 'DATABASE', 'entities/character', 'entities/item'],
function (jaws, DATABASE, Character, Item) {

function NPC (options) {

	Character.call(this, options);

	this.isDistracted = false;
	this.distractionRate = options.distractionRate;
	this.courseOfAction = {
		move: {
			angle: 0,
			magnitude: 0
		}
	};
}

NPC.prototype = new Character({});

NPC.prototype.update = function () {
	Character.prototype.update.call(this);
	this.decideNextAction();
};

NPC.prototype.rollForDistraction = function(distractionRateMultiplier) {
	var calculatedDistractionRate = this.distractionRate;
	if (distractionRateMultiplier) { 
		calculatedDistractionRate = calculatedDistractionRate * distractionRateMultiplier;
	}
	if (Math.random() < calculatedDistractionRate) {
		this.isDistracted = true;
	}
	else {
		this.isDistracted = false;
	}
};

NPC.prototype.decideNextAction = function() {
	// TODO: Make decisions for actual reasons.
	if (this.resources.health > 0) {
		this.rollForDistraction();
		if (this.isDistracted) {
			// Decide how to move in the X-axis.
			var analogX = Math.round(Math.random()) ? Math.random() : Math.random() * -1;
			var analogY = Math.round(Math.random()) ? Math.random() : Math.random() * -1;
			
			this.courseOfAction.move.angle = Math.atan2(analogX, analogY);
			this.courseOfAction.move.magnitude = Math.sqrt(analogX*analogX+analogY*analogY);
		}
		this.move(this.courseOfAction.move.angle,
						  this.courseOfAction.move.magnitude);
	}
};

NPC.prototype.kill = function() {
	Character.prototype.kill.call(this);
	console.log("...and my name was Tellah.");
	
	// Make some loot.
	var loot = new Item($.extend(true, {},
							 DATABASE.equipment["base"],
							 DATABASE.equipment["Sword"]));
	loot._gameData = this._gameData;
	// Put the loot in the game world
	loot.drop(this.x, this.y+20);
};

return NPC;

});