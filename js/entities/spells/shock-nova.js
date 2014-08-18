define(
['jaws', 'DATABASE'],
function (jaws, DATABASE) {

function ShockNova (options) {
	// Merge options
	options = $.extend({}, DATABASE.spells["ShockNova"], options);

	var self = new jaws.Sprite({
		x: options.spawnX,
		y: options.spawnY,
		scale: options.scale,
		anchor: options.anchor,
		radius: options.radius
	});
	
	self.currentStep = -1;
	self.isLastFrame = false;
	
	var animation = new jaws.Animation({
		sprite_sheet: options.sprite_sheet,
		frame_size: options.frame_size,
		frame_duration: options.frame_duration,
		subsets: options.animationSubsets,
		loop: 0,
		on_end: function() { self.isLastFrame = true; }
	});
	
	self.update = function () {
		// Attempt to advance to the next frame.
		self.setImage(animation.subsets["cast"].next());
		
		// Only run if the frame advanced and we haven't reached the last step.
		if (self.currentStep < options.steps.length &&
			self.currentStep !== animation.subsets["cast"].index ) {
			// Update step counter.
			self.currentStep = animation.subsets["cast"].index;
			
			// Update hit radius.
			self.radius = options.steps[self.currentStep].radius;
			
			// Calculate targets and hit those muthahfuckahs.
			var targetsHits = jaws.collideOneWithMany(self, options.eligibleTargets);
			for (var lcv = 0; lcv < targetsHits.length; lcv++) {
				targetsHits[lcv].damage({
					value:			20,			// base damage value
					resource:		"health",	// resource being targeted for damage
					type:			"magic",	// type of damage being dealth
					penetration:	0.2			// percentage of armor/resist to ignore
				});
			}
			
			// If we're done, queue onFinish callback.
			if (self.currentStep === options.steps.length-1 && options.onFinish) {
				// Timeout allows final frame time to render before calling back.
				setTimeout(options.onFinish, options.frame_duration);
			}
		}
	};
	
	return self;
}

return ShockNova;

});