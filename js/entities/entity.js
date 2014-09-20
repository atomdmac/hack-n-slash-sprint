define(
['jaws', 'lib/signals'],
function (jaws, signals) {

function Entity(options) {
	this.options = $.extend({}, options);

	// Call super-class.
	jaws.Sprite.call(this, this.options);

	// Reference to game world data.
	this._gameData = this.options.gameData;

	// Create Signals.
	this.signals = {
		collided : new signals.Signal(),
		gave     : new signals.Signal(),
		took     : new signals.Signal(),
		activated: new signals.Signal(),
		destroyed: new signals.Signal()
	};

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.id = jaws.generateUUID();
		this.label = this.options.label || "no label";
		this.radius = this.options.radius;
	}
}

Entity.prototype = new jaws.Sprite({});

Entity.prototype.handleCollideWithEntity = function () {
	
};

Entity.prototype.destroy = function () {
	// TODO: Do any clean-up necessary when an entity needs to be completely removed from the game.
	this.destroyed.dispatch(this);
};

Entity.prototype.damage = function (damageObj) {
	// TODO: Implement entity damage?
};

return Entity;

});
