define(
['jaws', 'DATABASE', 'entities/character', 'entities/item'],
function (jaws, DATABASE, Character, Item) {

function NPC (options) {

	Character.call(this, options);

	this.isDistracted = false;
	this.distractionRate = options.distractionRate;
	this.courseOfAction = {};
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
	// Hunt Player 0.
	if (this.resources.health > 0) {
		this.rollForDistraction();
		if (this.isDistracted) {
			// Find angle to player.
			var p1 = {
				x: this.x,
				y: this.y
			};
			var p2 = {
				x: this._gameData.players[0].x,
				y: this._gameData.players[0].y
			};
			var analogX = p2.x - p1.x;
			var analogY = p2.y - p1.y;
			
			var angleToPlayer = Math.atan2(analogX, analogY);
			
			this.courseOfAction.move = {
				angle: angleToPlayer,
				magnitude: 0.2
			};
			
			
			var reach = 50;
			var startX = this.x;
			var startY = this.y;
			var endX = startX + reach * Math.sin(angleToPlayer);
			var endY = startY + reach * Math.cos(angleToPlayer);
			
			
			this.courseOfAction.primaryAttack = {
				reach : reach,
				startX: startX,
				startY: startY,
				endX  : endX,
				endY  : endY,
				angle : angleToPlayer
			};
		}
		if (this.courseOfAction.move) {
			this.move(this.courseOfAction.move.angle,
					  this.courseOfAction.move.magnitude);
		}
		if (this.courseOfAction.primaryAttack) {
			this.primaryAttack(this.courseOfAction.primaryAttack);
		}
	}
	
};

NPC.prototype.kill = function() {
	Character.prototype.kill.call(this);
	
	// Make some loot.
	var lootKey = DATABASE.lootTable["Basic Creature"].getRandom();
	var loot = new Item($.extend(true, {},
							 DATABASE.equipment["base"],
							 DATABASE.equipment[lootKey]));
	loot._gameData = this._gameData;
	// Put the loot in the game world
	loot.drop(this.x, this.y+20);
};

return NPC;

});