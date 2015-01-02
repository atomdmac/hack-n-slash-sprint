define(
['jaws', '$', 'DATABASE', 'entities/entity', 'lib/SAT'],
function (jaws, $, DATABASE, Entity, SAT) {

function Item(options) {
	
	this.options = $.extend({}, options);

	// Call super-class.
	Entity.call(this, this.options);
	
	this.presences.push.apply(this.presences, [
		{name: 'touch', shape: new SAT.Circle(new SAT.Vector(this.x, this.y), this.options.radius)}
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
		
		this.owner = null;
		this.type = this.options.type;
		this.sprite_sheet = this.options.sprite_sheet;
		this.equipSlot = this.options.equipSlot;
		this.attack = this.options.attack;
		this.bonuses = this.options.bonuses;
		this.resources = this.options.resources;
		this.state = "unequipped";
	}
}

Item.prototype = Object.create(Entity.prototype);

Item.prototype.update = function () {
	
};

Item.prototype.draw = function () {
	this.setImage(this.animation.subsets[this.state].next());
	// Call original Entity.draw() function.
	Entity.prototype.draw.call(this);
};

Item.prototype.put = function () {
	// TODO: Add a way to put items places, like in a container or tilemap?
};

Item.prototype.drop = function (x, y) {
	this.move(x, y);
};

Item.prototype.take = function (newOwner) {
	if (newOwner) {
		this.owner = newOwner;
	}
};

Item.prototype.move = function (x, y) {
	this.x = x;
	this.y = y;
};

return Item;

});
