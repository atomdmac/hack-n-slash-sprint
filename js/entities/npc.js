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
		attack: {}
	};
	
	if (this.options.patrol ) {
		this.patrol(this.options.patrol);
	}
	
	this.seekTarget = null;
}

NPC.prototype = Object.create(Character.prototype);

NPC.prototype.update = function () {
	Character.prototype.update.call(this);
	this.decideNextAction();
};

NPC.prototype.onCollision = function (collision) {

	// Call super.
	Character.prototype.onCollision.call(this, collision);

	// Temp variables while we transition to single 'collision' input object.
	var entity   = collision.target,
		interest = collision.interest;

	//console.log(this.name, ' collides with ', entity.name, ' because of ', interest.name);
	if (interest.name === this.currentPatrol && entity.patrolIndex === this.currentPatrolPointIndex) {
		this.incrementPatrolPoint();
	}
	
	if (interest.name === "sight" &&
		this.state === "patrol" &&
		this.consider(entity) === "hostile" &&
		!this.seekTarget) {
		
		if (entity.resources && entity.resources.health === 0) {
			this.seekTarget = null;
			this.state = "patrol";
		}
		else {
			// Round position values to prevent lineOfSight from breaking.
			var startPos = [Math.round(this.x)  , Math.round(this.y)],
				endPos   = [Math.round(entity.x), Math.round(entity.y)],
				collisionLayer = this._gameData.layers.collision;
	
			// If we can see the entity, update our seek target.
			if(collisionLayer.lineOfSight(startPos, endPos)) {
				this.state = "seek";
				this.seekTarget = entity;
			}
		}
	}
	
	if (interest.name === "touch" &&
		entity === this.seekTarget &&
		this.resources.health > 0) {
		
		// Debug: damage on contact.
		entity.damage({
			resource: "health",
			type: "physical",
			value: 1,
			penetration: 1
		});
		
		if (entity.resources.health <= 0) {
			this.seekTarget = null;
			this.state = "patrol";
		}
		
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
	
	// Patrol.
	if (this.state === "patrol") {
		var targetPatrolPoint = this.getNextPatrolPoint();
		if (targetPatrolPoint) {
			this.seek(targetPatrolPoint);
		}
		else {
			this.wander();
		}
		return;
	}
	// Seek.
	if (this.state === "seek") {
		if(this.seekTarget !== null) {
			this.seek(this.seekTarget/*{x: this.seekTarget.x, y: this.seekTarget.y}*/);
		} else {
			this.wander();
		}
		return;
	}

	// This currently causes all character health to drop to 0 as soon as the
	// game starts.
	/*
	if (this.courseOfAction.attack) {
		this.attack(this.courseOfAction.attack);
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
	
	
	this.courseOfAction.attack = {
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
	
	return undefined;
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
							 DATABASE.items["base"],
							 DATABASE.items[lootKey]));
	loot._gameData = this._gameData;
	// Put the loot in the game world
	this.signals.gave.dispatch(loot);
	loot.drop(this.x, this.y+20);
};

return NPC;

});