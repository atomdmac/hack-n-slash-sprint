define(
['jaws', 'DATABASE', 'entities/entity', 'lib/SAT'],
function (jaws, DATABASE, Entity, SAT) {

function Knockback (options) {
	// Merge options
	this.options = $.extend({
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
	this.duration     = 20;
	this.currentTime  = 0;
	
	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.target = this.options.target;
		this.angle = this.options.angle;
		this.force = this.options.force;
	}
}

Knockback.prototype = Object.create(Entity.prototype);

Knockback.prototype.update = function () {
	this.target.move(this.angle, this.force);
	
	// Step forward in time.
	this.currentTime += 1;

	// Check to see if the attack has finished yet or not.
	if(this.currentTime >= this.duration) {
		this.onFinish();
	}
};

return Knockback;

});
