define(
['jaws', '$', 'DATABASE', 'lib/SAT', 'entities/entity'],
function (jaws, $, DATABASE, SAT, Entity) {

function MoonConsole(options) {

	options = $.extend(
		{}, 
		DATABASE.entities["base"],
		DATABASE.entities['MoonConsole'],
		options
	);
	
	// Call super-class.
	Entity.call(this, options);
	
	// Settings
	this.hitBox = new SAT.Box(new SAT.Vector(this.x, this.y), this.width, this.height);
	this.hitBox = this.hitBox.toPolygon();
	
	this.interests.push.apply(this.interests, [
		{name: 'touch', shape: this.hitBox}
	]);
	
	// Reference to game world data.
	this._gameData = options.gameData;

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(options){
		// Set up Entity animations.
		this.animation = new jaws.Animation({
			sprite_sheet  : this.options.sprite_sheet,
			frame_size    : this.options.frame_size,
			frame_duration: this.options.frame_duration,
			subsets       : this.options.animationSubsets
		});
		
		this.sprite_sheet = this.options.sprite_sheet;
		this.state = this.options.state ? this.options.state : "off";
	}
}

MoonConsole.prototype = Object.create(Entity.prototype);

MoonConsole.prototype.onCollision = function (collision) {
	// console.log(this.name, ' collides with ', collision.target.name, ' because of ', collision.interest.name);
	var player = this._gameData.player;
	if (collision.target === player) {
		if (player.resources["moonPendantGreen"] &&
			player.resources["moonPendantOrange"] &&
			player.resources["moonPendantRed"] &&
			player.resources["moonPendantBlue"]) {
			
			this.activate();
		}
	}
};

MoonConsole.prototype.update = function () {
	// Move to the next frame.
	// Yeah, this is done in update()...
	// Yeah, I tied functionality to the animation. Whatcha gonna do about it??
	this.setImage(this.animation.subsets[this.state].next());
	
	if (this.state === "activating") {
		// We've looped.  Time to advance to the next state!
		if(this.animation.subsets['activating'].atFirstFrame()) {
			this.state = "activated";
			// Wait a second before telling listeners that the game has been won!
			var self = this;
			setTimeout(function() {
				self.signals.activated.dispatch(self);
			}, 1000);
		}
	}
};

MoonConsole.prototype.draw = function () {
	// Call original Entity.draw() function.
	Entity.prototype.draw.call(this);
	
	/* DEBUG */
	/*var context = jaws.context,
		points  = this.hitBox.calcPoints,
		i, ilen;

	context.save();
	context.strokeStyle = this.debugColor;
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

	context.restore();*/
};

MoonConsole.prototype.activate = function () {
	if (this.state === "off") {
		this.state = "activating";
	}
};

return MoonConsole;

});
