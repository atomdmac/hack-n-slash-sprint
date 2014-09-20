define(
['jaws', 'DATABASE', 'entities/entity'],
function (jaws, DATABASE, Entity) {

function ShockNova (options) {
	// Merge options
	options = $.extend({}, DATABASE.spells["ShockNova"], options);

	Entity.call(this, {
		x: options.spawnX,
		y: options.spawnY,
		scale: options.scale,
		anchor: options.anchor,
		radius: options.radius
	});
	
	this.currentStep     = -1;
	this.isLastFrame     = false;
	this.steps           = options.steps;
	this.eligibleTargets = options.eligibleTargets;
	this.onFinish        = options.onFinish;
	
	this.animation = new jaws.Animation({
		sprite_sheet: options.sprite_sheet,
		frame_size: options.frame_size,
		frame_duration: options.frame_duration,
		subsets: options.animationSubsets,
		loop: 0,
		on_end: function() { this.isLastFrame = true; }
	});
}

ShockNova.prototype = Object.create(Entity.prototype);

ShockNova.prototype.update = function () {
	// Attempt to advance to the next frame.
	this.setImage(this.animation.subsets["cast"].next());
	
	// Only run if the frame advanced and we haven't reached the last step.
	if (this.currentStep < this.steps.length &&
		this.currentStep !== this.animation.subsets["cast"].index ) {
		// Update step counter.
		this.currentStep = this.animation.subsets["cast"].index;
		
		// Update hit radius.
		this.radius = this.steps[this.currentStep].radius;
		
		// Calculate targets and hit those muthahfuckahs.
		var targetsHits = jaws.collideOneWithMany(this, this.eligibleTargets);
		for (var lcv = 0; lcv < targetsHits.length; lcv++) {
			targetsHits[lcv].damage({
				value:			20,			// base damage value
				resource:		"health",	// resource being targeted for damage
				type:			"magic",	// type of damage being dealth
				penetration:	0.2			// percentage of armor/resist to ignore
			});
		}
		
		// If we're done, queue onFinish callback.
		if (this.currentStep === this.steps.length-1 && this.onFinish) {
			// Timeout allows final frame time to render before calling back.
			setTimeout(this.onFinish, this.frame_duration);
		}
	}
};

return ShockNova;

});