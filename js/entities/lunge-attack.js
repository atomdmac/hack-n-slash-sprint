define(
['jaws', 'DATABASE', 'entities/entity', 'lib/SAT'],
function (jaws, DATABASE, Entity, SAT) {

function LungeAttack (options) {
	// Merge options
	this.options = $.extend({
						width: 80,
						height: 80,
						scale: 1,
						anchor: [0.5, 0.5],
						radius: 1,
						x: options.attacker.x,
						y: options.attacker.y },
					options);

	// Call super-class.
	Entity.call(this, this.options);
	
	this.hitBox = new SAT.Circle(new SAT.Vector(this.x, this.y), this.options.radius);
	/*this.hitBox = new SAT.Polygon(new SAT.Vector(this.x, this.y),
		[
			new SAT.Vector(-this.width / 2, -this.height / 2),
			new SAT.Vector(this.width / 2, -this.height / 2),
			new SAT.Vector(this.width / 2, this.height / 2),
			new SAT.Vector(-this.width / 2, this.height / 2)
		]);*/
	
	this.interests.push.apply(this.interests, [
		{name: 'touch', shape: this.hitBox}
	]);
	
	// Reference to game world data.
	this._gameData = this.options.gameData;
	
	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.attacker = this.options.attacker;
		this.attackData = this.options.attackData;
		this.angle = this.options.angle;
		this.onFinish = this.options.onFinish;
	}
}

LungeAttack.prototype = Object.create(Entity.prototype);

LungeAttack.prototype.onCollision = function (entity, interest) {
	if (interest.name === "touch" &&
		this.attacker.consider(entity) === "hostile") {
		entity.damage(this.options.attackData);
	}
};

LungeAttack.prototype.update = function () {
	this.attacker.move(this.angle, 2);
	this.x = this.attacker.x;
	this.y = this.attacker.y;
};

LungeAttack.prototype.draw = function () {
	/* DEBUG */
	var context = jaws.context;

	context.save();
	context.strokeStyle = "green";
	context.lineWidth = 3;

	context.beginPath();
	
	/* Rectangle Debug
	var points  = this.hitBox.calcPoints,
		i, ilen
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
	*/
	
	/* Circle Debug */
	context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);

	
	context.stroke();

	context.restore();
	
};

return LungeAttack;

});
