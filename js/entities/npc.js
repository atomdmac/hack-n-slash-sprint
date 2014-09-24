define(
['jaws', 'DATABASE', 'entities/character', 'entities/item'],
function (jaws, DATABASE, Character, Item) {

function NPC (options) {

	Character.call(this, options);

	this.options = $.extend(true, 
		{},
		// Default options, until we come up with a better way to define these.
		{
			state:	"idle"
		},
		options
	);
	this.state = this.options.state;
	this.isDistracted = false;
	this.distractionRate = options.distractionRate;
	this.courseOfAction = {
		move: {angle: 0, magnitude: 0},
		primaryAttack: {}
	};
	this.seekTarget = null;
}

NPC.prototype = Object.create(Character.prototype);

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

// TODO: Move getDistance to someplace that makes sense.
function getDistance (pt1, pt2) {
	var dx = pt1[0] - pt2[0],
		dy = pt1[1] - pt2[1];
	return Math.sqrt((dx * dx) + (dy * dy));
}

NPC.prototype.decideNextAction = function() {
	// Do nothing if dead.
	if (this.resources.health > 0 === false) return;
	
	// Do nothing.
	if (this.state === "idle") return;
	
	// Wander.
	if (this.state === "wander") {
		this.wander();
		return;
	}
	
	// Seek.
	if (this.state === "seek") {
		var player   = this._gameData.player,
			// Round position values to prevent lineOfSight from breaking.
			startPos = [Math.round(this.x)  , Math.round(this.y)],
			endPos   = [Math.round(player.x), Math.round(player.y)],
			collisionLayer = this._gameData.layers.collision;

		// If we can see player, update our seek target.
		if(collisionLayer.lineOfSight(startPos, endPos)) {
			this.seekTarget = endPos;
		}

		if(
			this.seekTarget !== null &&
			getDistance(startPos, this.seekTarget) > this.getMaxSpeed() * 2 &&
			this.consider(player) === 'hostile'
		) {
			this.seek({x: this.seekTarget[0], y: this.seekTarget[1]});
		} else {
			this.seekTarget = null;
			this.wander();
		}
	}

	// This currently causes all character health to drop to 0 as soon as the
	// game starts.
	/*
	if (this.courseOfAction.primaryAttack) {
		this.primaryAttack(this.courseOfAction.primaryAttack);
	}
	*/
	
};

NPC.prototype.seek = function (destination) {
	// TODO: Allow NPCs to seek characters/locations besides the player.
	// Find angle to player.
	var p1 = {
		x: this.x,
		y: this.y
	};
	var p2 = destination;

	var analogX = p2.x - p1.x;
	var analogY = p2.y - p1.y;
	
	var angleToPlayer = Math.atan2(analogX, analogY);
	
	this.courseOfAction.move = {
		angle: angleToPlayer,
		magnitude: 0.8
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

	this.move(this.courseOfAction.move.angle,
					  this.courseOfAction.move.magnitude);
};

NPC.prototype.wander = function () {
	this.rollForDistraction(0.4);
	if (this.isDistracted) {
		// Decide how to move in the X-axis.
		var analogX = Math.round(Math.random()) ? Math.random() : Math.random() * -1;
		var analogY = Math.round(Math.random()) ? Math.random() : Math.random() * -1;
		
		this.courseOfAction.move.angle = Math.atan2(analogX, analogY);
		this.courseOfAction.move.magnitude = Math.sqrt(analogX*analogX+analogY*analogY);
	}
	if(this.courseOfAction.move) {
		this.move(this.courseOfAction.move.angle,
						  this.courseOfAction.move.magnitude);
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
	this.signals.gave.dispatch(loot);
	loot.drop(this.x, this.y+20);
};

return NPC;

});