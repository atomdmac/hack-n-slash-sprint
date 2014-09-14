define(
['jaws', '$', 'DATABASE', 'lib/SAT', 'entities/entity', 'states/load-state'],
function (jaws, $, DATABASE, SAT, Entity, LoadState) {

function ZoneSwitcher(options) {
	// TODO: Character extension check is kinda hack-y...
	var isExtending = false;
	if(!Object.keys(options).length) {
		isExtending = true;
	}

	this.options = $.extend({}, options);

	// Call super-class.
	Entity.call(this, this.options);

	if(isExtending) return;

	// Reference to game world data.
	this._gameData = this.options.gameData;

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.url     = this.options.url || "assets/tmx/import-test.tmx";
		this.targetX = Number(this.options.targetX);
		this.targetY = Number(this.options.targetY);
	}
}

ZoneSwitcher.prototype = new Entity({});

ZoneSwitcher.prototype.update = function () {
	// NOTE: Requires SAT.js.
	var polygon = new SAT.Polygon(
		new SAT.Vector(this.x, this.y),
		[
			new SAT.Vector(0, 0),
			new SAT.Vector(this.width, 0),
			new SAT.Vector(this.width, this.height),
			new SAT.Vector(0, this.height)
		]
	);

	var circle = new SAT.Circle(
		new SAT.Vector(
			this._gameData.player.x, 
			this._gameData.player.y
		), 
		this._gameData.player.radius
	);

	var response = new SAT.Response();

	var collision = SAT.testCirclePolygon(circle, polygon, response);

	if (collision) {
		this.signals.activated.dispatch(this);
		return response;
	} else {
		return false;
	}
	
};
/*
ZoneSwitcher.prototype.draw = function () {
	this.setImage(this.animation.subsets["loop"].next());
	// Call original Entity.draw() function.
	Entity.prototype.draw.call(this);
};
*/
ZoneSwitcher.prototype.put = function () {
	// TODO: Add a way to put items places, like in a container or tilemap?
};

ZoneSwitcher.prototype.move = function (x, y) {
	this.x = x;
	this.y = y;
};

return ZoneSwitcher;

});
