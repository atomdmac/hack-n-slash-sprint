define(
['jaws', 'DATABASE', 'entities/character', 'entities/item', 'lib/SAT'],
function (jaws, DATABASE, Character, Item, SAT) {

function NPC (options) {

	Character.call(this, options);

	this.options = $.extend( 
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
	
	if (this.options.patrol ) {
		this.patrol(this.options.patrol);
	}
}

NPC.prototype = Object.create(Character.prototype);

NPC.prototype.update = function () {
	Character.prototype.update.call(this);
	this.decideNextAction();
};

NPC.prototype.onCollision = function (entity, interest) {
	//console.log(this.name, ' collides with ', entity.name, ' because of ', interest.name);
	if (interest.name === this.currentPatrol && entity.patrolIndex === this.currentPatrolPointIndex) {
		this.incrementPatrolPoint();
	}
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
	// Do nothing if dead.
	if (this.resources.health > 0 === false) return;
	
	// Do nothing.
	if (this.state === "idle") return;
	
	// Wander.
	if (this.state === "wander") {
		this.wander();
		return;
	}
	
	// Patrol.
	if (this.state === "patrol") {
		this.seek(this.getNextPatrolPoint());
		return;
	}
	
	// Seek.
	if (this.state === "seek") {
		var player   = this._gameData.player,
			// Round position values to prevent lineOfSight from breaking.
			startPos = [Math.round(this.x)  , Math.round(this.y)],
			endPos   = [Math.round(player.x), Math.round(player.y)],
			collisionLayer = this._gameData.layers.collision;
	
		if(collisionLayer.lineOfSight(startPos, endPos) &&
		   this.consider(player) === "hostile") {
			this.seek(player);
		}
		else {
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

NPC.prototype.seek = function (targetEntity) {
	// TODO: Allow NPCs to seek characters/locations besides the player.
	// Find angle to player.
	var p1 = {
		x: this.x,
		y: this.y
	};
	var p2 = {
		x: targetEntity.x,
		y: targetEntity.y
	};
	var analogX = p2.x - p1.x;
	var analogY = p2.y - p1.y;
	
	var angleToTarget = Math.atan2(analogX, analogY);
	
	this.courseOfAction.move = {
		angle: angleToTarget,
		magnitude: 0.8
	};
	
	
	var reach = 50;
	var startX = this.x;
	var startY = this.y;
	var endX = startX + reach * Math.sin(angleToTarget);
	var endY = startY + reach * Math.cos(angleToTarget);
	
	
	this.courseOfAction.primaryAttack = {
		reach : reach,
		startX: startX,
		startY: startY,
		endX  : endX,
		endY  : endY,
		angle : angleToTarget
	};

	this.move(this.courseOfAction.move.angle,
					  this.courseOfAction.move.magnitude);
};

NPC.prototype.wander = function () {
	this.rollForDistraction();
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

NPC.prototype.patrol = function (patrolName, patrolPointIndex) {
	if (this.currentPatrol) {
		var index = this.interests.indexOf(this.currentPatrol);
		if(index > -1) {
			this.signals.lostPresence.dispatch(this, this.interests[index]);
			this.interests.splice(index, 1);
		}
	}
	
	this.currentPatrol = patrolName;
	this.currentPatrolPointIndex = patrolPointIndex || 0;
	this.interests.push({name: this.currentPatrol, shape: new SAT.Circle(new SAT.Vector(this.x, this.y), this.radius)});
	this.signals.gainedPresence.dispatch(this, this.interests[this.interests.length-1]);
};

NPC.prototype.getNextPatrolPoint = function () {
	if (this.currentPatrol &&
		this._gameData.patrols[this.currentPatrol] &&
		this._gameData.patrols[this.currentPatrol][this.currentPatrolPointIndex]) {
		return this._gameData.patrols[this.currentPatrol][this.currentPatrolPointIndex];
	}
	// TODO: Fix this bullshit default!
	return {x: 100, y: 100};
};

NPC.prototype.incrementPatrolPoint = function () {
	if (this.currentPatrol &&
		this._gameData.patrols[this.currentPatrol]) {
		
		this.currentPatrolPointIndex = this.currentPatrolPointIndex < this._gameData.patrols[this.currentPatrol].length-1 ?
									   this.currentPatrolPointIndex+1 :
									   0;
		
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