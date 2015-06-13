define(
['jaws', 'lib/machina', '$', 'DATABASE', 'entities/entity', 'lib/SAT'],
function (jaws, machina, $, DATABASE, Entity, SAT) {

function Switch(options) {
	
	this.options = $.extend({}, options);

	// Call super-class.
	Entity.call(this, this.options);
	
	this.hitBox = new SAT.Circle(new SAT.Vector(this.x, this.y), this.options.radius);
	
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
		this.switchName = this.options.switchName;
	}

	// Make myself available for things to react to my state.
	this._gameData.switches[this.switchName] = this;
	
	// FSM
	var self = this;
	this.fsm = new machina.Fsm({
		initialState: self.state,
		states: {
			'on': {
				'toggleState': function () {
					this.transition('off');
				},
				draw: function () {
					self.setImage(self.animation.subsets['on'].next());
					// Call original Entity.draw() function.
					Entity.prototype.draw.call(self);
				}
			},
			'off': {
				'toggleState': function () {
					this.transition('on');
				},
				draw: function () {
					self.setImage(self.animation.subsets['off'].next());
					// Call original Entity.draw() function.
					Entity.prototype.draw.call(self);
				}
			}
		}
	});
}

Switch.prototype = Object.create(Entity.prototype);

Switch.prototype.onCollision = function (collision) {
	switch(collision.interest.name) {
		case 'terrain':
			if(collision.target.type === 'wall') {
				this.x -= collision.overlapX;
				this.y -= collision.overlapY;
			}
			break;
		case 'touch':
			if (collision.target.attacker &&
				collision.target.attacker == this._gameData.player) {
				this.fsm.handle('toggleState');
			}
			break;
		default:
			// console.log('I am ' + this + ' and I seem to have run into a ', collision.interest);
	}
};

Switch.prototype.update = function () {
	
};

Switch.prototype.draw = function () {
	this.fsm.handle('draw');
};

return Switch;

});
