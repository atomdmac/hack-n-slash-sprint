define(
['jaws', 'DATABASE', 'entities/entity', 'lib/SAT', 'entities/effects/knockback'],
function (jaws, DATABASE, Entity, SAT, Knockback) {

function MeleeAttack (options) {
	// Merge options
	this.options = $.extend({
					x: options.attacker.x,
					y: options.attacker.y,
					scale: 1,
					anchor: [0, 0],
					radius: 1
				}, options);

	this.attacker = this.options.attacker;
	
	Entity.call(this, this.options);
	
	this.angle      = this.options.angle;
	this.attackData = this.options.attackData;
	this.onFinish   = this.options.onFinish;

	// Settings
	this.hitBox = new SAT.Polygon(new SAT.Vector(this.attacker.x, this.attacker.y),
		[
		new SAT.Vector(0, 0),
		new SAT.Vector(10, 0),
		new SAT.Vector(10, 50),
		new SAT.Vector(0, 50)
		]);
	
	this.interests.push.apply(this.interests, [
		{name: 'touch', shape: this.hitBox}
	]);

	// State
	this.duration     = 15;
	this.currentTime  = 0;
	this.angleRange   = 3.5;
	this.angleCurrent = -this.angle - (this.angleRange / 2);
	this.angleStep    = (this.angleRange / this.duration);
	
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
	
	// Step forward in time.
	this.angleCurrent += this.angleStep;
	this.currentTime += 1;

	// Check to see if the attack has finished yet or not.
	if(this.currentTime >= this.duration) {
		this.onFinish();
	}
};

MeleeAttack.prototype.draw = function() {
	/* DEBUG */
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
	
};

MeleeAttack.prototype.onCollision = function (entity, interest) {
	if (interest.name === "touch" &&
		this.attacker.consider(entity) === "hostile") {
		entity.damage(this.options.attackData);
		
		var xDiff = this.x - entity.x;
        var yDiff = this.y - entity.y;
		/*var xDiff = entity.x - this.x;
        var yDiff = entity.y - this.y;*/
        var angleBetween = Math.atan2(yDiff, xDiff) * (180 / Math.PI);
		
		entity.addEffect(new Knockback({
			// Target
			target: entity,
			// Target
			angle: angleBetween,
			// Target
			force: 3
		}));
	}
};

return MeleeAttack;

});