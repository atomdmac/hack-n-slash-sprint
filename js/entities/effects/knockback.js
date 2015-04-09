define(
['jaws', 'DATABASE', 'entities/entity', 'lib/SAT'],
function (jaws, DATABASE, Entity, SAT) {

function Knockback (options) {
	// Merge options
	this.options = $.extend({
						alpha: 0,
						width: 1,
						height: 1,
						scale: 1,
						anchor: [0.5, 0.5],
						radius: 1,
						x: options.target.x,
						y: options.target.y
					}, options);

	// Call super-class.
	Entity.call(this, this.options);
	
	this.onFinish   = this.options.onFinish;
	
	// State
	this.currentTime  = 0;
	
	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.target = this.options.target;
		this.angle = this.options.angle;
		this.force = this.options.force;
		this.duration = this.options.duration ? this.options.duration : 20;
	}
}

Knockback.prototype = Object.create(Entity.prototype);

Knockback.prototype.update = function () {
	var x = Math.sin(this.angle) * this.force;
	var y = Math.cos(this.angle) * this.force;
	
	if (x !== 0 || y !== 0) {
		this.target.x += x;
		this.target.y += y;
	}
	
	// Step forward in time.
	this.currentTime += 1;

	// Check to see if the attack has finished yet or not.
	if(this.currentTime >= this.duration) {
		this.onFinish();
	}
};

Knockback.prototype.applyFilter = function () {
	
};

return Knockback;

});
