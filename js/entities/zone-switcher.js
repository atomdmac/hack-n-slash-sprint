define(
['jaws', '$', 'DATABASE', 'lib/SAT', 'entities/entity', 'states/load-state'],
function (jaws, $, DATABASE, SAT, Entity, LoadState) {

function ZoneSwitcher(options) {

	options = $.extend(
		{}, 
		DATABASE.entities["base"],
		DATABASE.entities['ZoneSwitcher'],
		options
	);
	
	// Call super-class.
	Entity.call(this, options);
	
	this.interests.push.apply(this.interests, [
		{name: 'touch', shape: new SAT.Polygon(new SAT.Vector(this.x, this.y),
											   [
											   new SAT.Vector(0, 0),
											   new SAT.Vector(this.width, 0),
											   new SAT.Vector(this.width, this.height),
											   new SAT.Vector(0, this.height)
											   ])
		}
	]);
	
	// Reference to game world data.
	this._gameData = options.gameData;

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(options){
		this.url     = options.url || "assets/tmx/import-test.tmx";
		this.targetX = Number(options.targetX);
		this.targetY = Number(options.targetY);
	}
}

ZoneSwitcher.prototype = Object.create(Entity.prototype);

ZoneSwitcher.prototype.onCollision = function (entity, interest) {
	// console.log(this.name, ' collides with ', entity.name, ' because of ', interest.name);
	if (entity === this._gameData.player) this.signals.activated.dispatch(this);
};

return ZoneSwitcher;

});
