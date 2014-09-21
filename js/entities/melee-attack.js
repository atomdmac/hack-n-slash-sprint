define(
['jaws', 'DATABASE', 'entities/entity', 'lib/SAT'],
function (jaws, DATABASE, Entity, SAT) {

function MeleeAttack (options) {
	// Merge options
	options = $.extend({}, options);

	this.attacker = options.attacker;
	
	Entity.call(this, {
		x: this.attacker.x,
		y: this.attacker.y,
		scale: 1,
		anchor: [0, 0],
		radius: 1
	});
	
	this.targets    = options.targets;
	this.angle      = options.angle;
	this.attackData = options.attackData;
	this.onFinish   = options.onFinish;

	// Settings
	this.hitBox = new SAT.Polygon(new SAT.Vector(this.attacker.x, this.attacker.y),
		[
		new SAT.Vector(0, 0),
		new SAT.Vector(10, 0),
		new SAT.Vector(10, 50),
		new SAT.Vector(0, 50)
		]);
	this.angleRange   = 1.4;
	this.duration     = 10;

	// State
	this.angleCurrent = -this.angle - (this.angleRange / 2);
	this.angleStep    = (this.angleRange / this.duration);
	this.currentTime  = 0;
	
	// Apply initial position/angle to hitBox.
	this.hitBox.translate(-5, 0);
	this.hitBox.setAngle(this.angleCurrent);
}

MeleeAttack.prototype = Object.create(Entity.prototype);

MeleeAttack.prototype.update = function () {
	// Update hitbox angle and position.
	this.hitBox.pos.x = this.attacker.x;
	this.hitBox.pos.y = this.attacker.y;
	this.hitBox.setAngle(this.angleCurrent);

	// Check to see if the weapon hitBox collides with any potential targets.
	var i, ilen;
	for(i=0, ilen=this.targets.length; i<ilen; i++) {
		if(this.targets[i] !== this.attacker) {
			var col = this.getResponse(this.targets[i]);
			if(col) {
				this.targets[i].damage(this.attackData);
			}
		}
	}
	
	// Step forward in time.
	this.angleCurrent += this.angleStep;
	this.currentTime += 1;

	// Check to see if the attack has finished yet or not.
	if(this.currentTime >= this.duration) {
		this.onFinish();
	}
};

MeleeAttack.prototype.draw = function() {
	/* DEBUG
	var context = jaws.context,
		points  = this.hitBox.calcPoints,
		i, ilen;

	context.save();
	context.strokeStyle = "green";
	context.lineWidth = 3;

	context.beginPath();
	context.moveTo(
		this.hitBox.pos.x + points[0].x, 
		this.hitBox.pos.y + points[0].y
	);
	for(i=0, ilen=points.length; i<ilen; i++) {
		context.lineTo(
			this.hitBox.pos.x + points[i].x, 
			this.hitBox.pos.y + points[i].y
		);
	}
	context.lineTo(
		this.hitBox.pos.x + points[0].x,
		this.hitBox.pos.y + points[0].y
	);
	context.stroke();

	context.restore();
	*/
};

MeleeAttack.prototype.getResponse = function (target) {
	var c = new SAT.Circle(
		new SAT.Vector(target.x, target.y),
		target.radius
	);

	if(SAT.testCirclePolygon(c, this.hitBox)) {
		return true;
	} else {
		return false;
	}
};

return MeleeAttack;

});