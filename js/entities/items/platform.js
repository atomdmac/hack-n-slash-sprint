define(
['jaws', '$', 'DATABASE', 'entities/entity', 'lib/SAT'],
function (jaws, $, DATABASE, Entity, SAT) {

function Platform(options) {
	
	this.options = $.extend({}, options);

	// Call super-class.
	Entity.call(this, this.options);
	
	// Constructor the platform's hitbox
	this.hitBox = new SAT.Box(new SAT.Vector(this.x, this.y), this.width, this.height);
	// The collider expects a Polygon instance, not a Box.
	this.hitBox = this.hitBox.toPolygon();

	this.presences.push.apply(this.presences, [
		{name: 'touch', shape: this.hitBox}
	]);

	this.interests.push.apply(this.interests, [
		{name: 'terrain', shape: this.hitBox},
		{name: 'touch', shape: this.hitBox}
	]);
	
	// Reference to game world data.
	this._gameData = this.options.gameData;

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		// Set up Entity animations.
		this.animation = new jaws.Animation({
			sprite_sheet  : this.options.sprite_sheet,
			frame_size    : this.options.frame_size,
			frame_duration: this.options.frame_duration,
			subsets       : this.options.animationSubsets
		});
		
		this.sprite_sheet = this.options.sprite_sheet;
		this.state = this.options.state ? this.options.state : "off";
		this.passable = this.options.passable;

		this.setImage(this.animation.subsets["unequipped"].next());
	}
}

Platform.prototype = Object.create(Entity.prototype);

Platform.prototype.onCollision = function (collision) {
	if(collision.target === this._gameData.player) {
		console.log('TODO: Don\'t let the player fall!');
	}
};

Platform.prototype.toggleState = function () {
	if (this.state === "off") {
		this.state = "on";
	}
	else {
		this.state = "off";
	}
};

return Platform;

});
