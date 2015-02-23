define(
['jaws', 'DATABASE', 'entities/entity', 'lib/SAT', 'entities/effects/knockback', 'entities/effects/invulnerability'],
function (jaws, DATABASE, Entity, SAT, Knockback, Invulnerability) {

function Hookshot (options) {
	// Merge options
	this.options = $.extend({
						width: 80,
						height: 80,
						scale: 1,
						anchor: [0.5, 0.5],
						radius: 10,
						x: options.attacker.x,
						y: options.attacker.y
					}, options);

	// Call super-class.
	Entity.call(this, this.options);
	
	this.onFinish   = this.options.onFinish;
	
	this.hitBox = new SAT.Circle(new SAT.Vector(this.x, this.y), this.options.radius);
	
	this.interests.push.apply(this.interests, [
		{name: 'touch', shape: this.hitBox}
	]);
	
	// State
	this.duration     = 30;
	this.speed        = 12;
	this.currentTime  = 0;
	this.hooked       = false;
	
	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.attacker = this.options.attacker;
		this.attackData = this.options.attackData;
		this.angle = this.options.angle;
		this.magnitude = this.options.magnitude;
	}
}

Hookshot.prototype = Object.create(Entity.prototype);

Hookshot.prototype.onCollision = function (entity, interest) {
	if (interest.name === "touch" &&
		this.attacker.consider(entity) === "hostile" &&
		!entity.invulnerable) {
		/*
		entity.addEffect(new Knockback({
			// Target
			target: entity,
			// Angle
			angle: this.angle,
			// Force
			force: this.magnitude * 1
		}));
		
		entity.addEffect(new Invulnerability({
			// Target
			target: entity
		}));
		*/
		
		if (!this.hooked) {
			this.hooked = true;
			this.duration = this.currentTime * 2;
		}
	}
};

Hookshot.prototype.update = function () {
	if (this.hooked) {
		
		var distancePoints = function ( xA, yA, xB, yB ){
			var xDistance = Math.abs( xA - xB );
			var yDistance = Math.abs( yA - yB );
		   
			return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
		};
		   
		var coordinatesMediumPoint = function( xA, yA, xB, yB, distanceAC ){
			//var distanceAB  = distancePoints( xA, yA, xB, yB );
			var angleAB     = Math.atan2( ( yB - yA ), ( xB - xA ) );
			var deltaXAC    = distanceAC * Math.cos( angleAB );
			var deltaYAC    = distanceAC * Math.sin( angleAB );
			
			var xC          = xA + deltaXAC;
			var yC          = yA + deltaYAC;
		   
			return { x: xC, y: yC };
		};
		
		var distanceBetween = distancePoints(
			this.attacker.x,
			this.attacker.y,
			this.x,
			this.y
		);
		var attackerDelta = distanceBetween / (this.duration - this.currentTime);
		
		var newAttackerCoords = coordinatesMediumPoint(
			this.attacker.x,
			this.attacker.y,
			this.x,
			this.y,
			attackerDelta
		);
		
		this.attacker.moveTo(newAttackerCoords.x, newAttackerCoords.y);
	}
	else {
		this.move(this.angle, this.magnitude);	
	}
	
	// Step forward in time.
	this.currentTime += 1;

	// Check to see if the attack has finished yet or not.
	if(this.currentTime >= this.duration) {
		this.onFinish();
	}
};

// TODO: Don't reinvent the wheel, dummy...
Hookshot.prototype.move = function (angle, magnitude) {
	var x = Math.sin(angle) * this.speed;
	var y = Math.cos(angle) * this.speed;
	
	if (x !== 0 || y !== 0) {
		this.x += x;
		this.y += y;
	}
};

Hookshot.prototype.draw = function () {
	/* DEBUG */
	var context = jaws.context;

	context.save();
	context.strokeStyle = "green";
	context.lineWidth = 3;

	context.beginPath();
	
	context.moveTo(this.attacker.x, this.attacker.y);
	context.lineTo(this.x, this.y);
	
	context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);

	context.stroke();

	context.restore();
	
};

return Hookshot;

});