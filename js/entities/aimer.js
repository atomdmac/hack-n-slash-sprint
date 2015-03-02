define(
['jaws', 'DATABASE', 'entities/entity', 'lib/SAT', 'entities/effects/knockback', 'entities/effects/invulnerability'],
function (jaws, DATABASE, Entity, SAT, Knockback, Invulnerability) {

function Aimer (options) {
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
	this.speed        = 5;
	
	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.attacker = this.options.attacker;
	}
}

Aimer.prototype = Object.create(Entity.prototype);

Aimer.prototype.onCollision = function (entity, interest) {
	/*if (interest.name === "touch") {
		
	}*/
};

Aimer.prototype.update = function () {
	this.angle = Math.atan2(this.attacker.x - this.x, this.attacker.y - this.y)+Math.PI;
};

Aimer.prototype.angleTo = function () {
	return this.angle;
};

// TODO: Don't reinvent the wheel, dummy...
Aimer.prototype.move = function (angle, magnitude) {
	var x = Math.sin(angle) * this.speed * magnitude;
	var y = Math.cos(angle) * this.speed * magnitude;
	
	if (x !== 0 || y !== 0) {
		this.x += x;
		this.y += y;
	}
};

Aimer.prototype.draw = function () {
	/* DEBUG */
	var context = jaws.context;

	context.save();
	context.strokeStyle = "gray";
	context.lineWidth = 3;

	context.beginPath();
	
	context.moveTo(this.attacker.x, this.attacker.y);
	context.lineTo(this.x, this.y);
	
	context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);

	context.stroke();

	context.restore();
	
};

return Aimer;

});
