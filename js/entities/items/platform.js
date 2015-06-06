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

		this.setImage(this.animation.subsets["unequipped"].next());
	}

	// Movement state machine.
	var host = this;
	host.movementFsm = new machina.Fsm({

		// Constants
		MAX_VEL: 0.5,	

		// Current velocity.
		vel: new SAT.Vector(0, 0),

		patrolPoints: [
			{x: 512, y: 384},
			{x: 576, y: 384},
			{x: 576, y: 448}, 
			{x: 512, y: 448}], 
		currentPatrolIndex: null,
		destination: null,

		initialState: 'on',

		hasArrived: function () {
			if(Math.abs(this.destination.x - host.x) < this.MAX_VEL) {
				host.x = this.destination.x;
			}
			if(Math.abs(this.destination.y - host.y) < this.MAX_VEL) {
				host.y = this.destination.y;
			}
			if(host.x === this.destination.x && host.y === this.destination.y) {
				return true;
			} else {
				return false;
			}
		},

		updateDestination: function () {
			// Initialize patrol index if it hasn't been already.
			if(this.currentPatrolIndex === null) {
				this.currentPatrolIndex = 0;
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

		// States
		states: {
			'on': {
				'_onEnter': function () {
					if(!this.destination) this.updateDestination();
				},
				'update': function () {
					// If we've reached our destination, let's reset our goal.
					if(this.hasArrived()) this.updateDestination();
					
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
	this.movementFsm.handle('update');
};

Platform.prototype.toggle = function () {
	this.movementFsm.handle('toggle');
};

return Platform;

});
