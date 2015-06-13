define(
['jaws', '$', 'DATABASE', 'entities/entity', 'lib/SAT', 'lib/machina'],
function (jaws, $, DATABASE, Entity, SAT, machina) {

function Platform(options) {
	
	this.options = $.extend({}, options);

	// Call super-class.
	Entity.call(this, this.options);

	// Constructor the platform's hitbox
	this.hitBox = new SAT.Box(new SAT.Vector(this.x, this.y), this.width, this.height);
	// The collider expects a Polygon instance, not a Box.
	this.hitBox = this.hitBox.toPolygon();

	this.presences.push.apply(this.presences, [
		{name: 'touch', shape: this.hitBox}
	]);

	this.interests.push.apply(this.interests, [
		{name: 'terrain', shape: this.hitBox},
		{name: 'touch', shape: this.hitBox}
	]);
	
	// Reference to game world data.
	this._gameData = this.options.gameData;

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		// Set up Entity animations.
		this.animation = new jaws.Animation({
			sprite_sheet  : this.options.sprite_sheet,
			frame_size    : this.options.frame_size,
			frame_duration: this.options.frame_duration,
			subsets       : this.options.animationSubsets
		});
		
		this.sprite_sheet = this.options.sprite_sheet;
		this.state = this.options.state ? this.options.state : "off";
		this.passable = this.options.passable;
		this.patrolName = this.options.patrolName;
		this.defaultPatrolIndex = this.options.defaultPatrolIndex;
		this.defaultState = this.options.defaultState ? this.options.defaultState : 'off';
		this.switchName = this.options.switchName;
		this.switchBoundTo = null;

		this.setImage(this.animation.subsets["unequipped"].next());
	}

	// Movement state machine.
	var host = this;
	host.movementFsm = new machina.Fsm({

		// Constants
		MAX_VEL: 1,	

		// Current velocity.
		vel: new SAT.Vector(0, 0),

		patrolPoints: null,
		/*[
			{x: 512, y: 384},
			{x: 576, y: 384},
			{x: 576, y: 448}, 
			{x: 512, y: 448}],*/ 
		currentPatrolIndex: null,
		destination: null,

		initialState: host.defaultState,

		hasArrived: function () {
			if (this.destination) {
				if(Math.abs(this.destination.x - host.x) < this.MAX_VEL) {
					host.x = this.destination.x;
				}
				if(Math.abs(this.destination.y - host.y) < this.MAX_VEL) {
					host.y = this.destination.y;
				}
				if(host.x === this.destination.x && host.y === this.destination.y) {
					return true;
				}
			}
			return false;
		},

		updateDestination: function () {
			// Initialize patrol index if it hasn't been already.
			if(this.currentPatrolIndex === null) {
				this.currentPatrolIndex = host.defaultPatrolIndex ? host.defaultPatrolIndex : 0;
			} 
			// ...else, increment patrol index.
			else {
				this.currentPatrolIndex++;
			}

			// Loop back to the first patrol index if we've gone thru them all
			// already.
			if(this.currentPatrolIndex > this.patrolPoints.length - 1) {
				this.currentPatrolIndex = 0;
			}

			// Update our reference to our current destination.
			this.destination =  this.patrolPoints[this.currentPatrolIndex];
		},

		updateHost: function () {
			host.x += this.vel.x;
			host.y += this.vel.y;
		},
		
		setPatrol: function (patrol, forceReset) {
			if(patrol.length) {
				if (this.patrolPoints === null || forceReset) {
					this.patrolPoints = patrol;
				}
			}
		},

		// States
		states: {
			'on': {
				'update': function () {

					// If we've reached our destination or if we don't have one yet, let's reset our goal.
					if(this.hasArrived() || !this.destination) this.updateDestination();
					
					// Determine the distance between us and our destination.
					this.vel.x = this.destination.x - host.x;
					this.vel.y = this.destination.y - host.y;

					// Noramlize vector length.
					this.vel.normalize();

					// Calculate our current velocity/
					this.vel.x = this.MAX_VEL * this.vel.x;
					this.vel.y = this.MAX_VEL * this.vel.y;

					// Update the host based on our calculations.
					this.updateHost();
				},
				'toggle': function () {
					this.transition('off');
				}
			},

			'off': {
				'toggle': function () {
					this.transition('on');
				}
			}
		}

	});
}

Platform.prototype = Object.create(Entity.prototype);

Platform.prototype.update = function() {
	// Make sure we set our patrol if we haven't already.
	if(this.patrolName && this._gameData.patrols[this.patrolName]) {
		this.movementFsm.setPatrol(this._gameData.patrols[this.patrolName]);
	}
	
	// Make sure we bind to a switch if we haven't already.
	if(this.switchName && this._gameData.switches[this.switchName] && this.switchBoundTo === null) {
		this.switchBoundTo = this._gameData.switches[this.switchName];
		
		var host = this;
		this.switchBoundTo.fsm.on('transition', function( data ) {
			switch(data.toState) {
				case 'on':
				case 'off':
					host.movementFsm.handle('toggle');
					break;
				default:
					// Do nothing.
			}
		});
	}

	// Update platform.
	this.movementFsm.handle('update');
};

Platform.prototype.toggle = function () {
	this.movementFsm.handle('toggle');
};

return Platform;

});
