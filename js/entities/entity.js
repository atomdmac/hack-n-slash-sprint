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
		collided      : new signals.Signal(),
		gave          : new signals.Signal(),
		took          : new signals.Signal(),
		activated     : new signals.Signal(),
		destroyed     : new signals.Signal(),
		gainedInterest: new signals.Signal(),
		lostInterest  : new signals.Signal(),
		gainedPresence: new signals.Signal(),
		lostPresence  : new signals.Signal()
	};

	// Give this Entity a name.
	this.name = options.name || '';

	// Things this Entity is interested in knowing about.
	this.interests = options.interests || [];

	// Things other's might be interested in knowing about this Entity.
	this.presences = options.presences || [];

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.id = jaws.generateUUID();
		this.label = this.options.label || "no label";
		this.radius = this.options.radius;
	}
}

Entity.prototype = Object.create(jaws.Sprite.prototype);

Entity.prototype.onCollision = function (entity, interest) {
	console.log(this.name, ' collides with ', entity.name, ' because of ', interest.name);
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
