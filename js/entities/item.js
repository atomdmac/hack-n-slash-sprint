define(
['jaws', '$', 'DATABASE', 'entities/entity'],
function (jaws, $, DATABASE, Entity) {

function Item(options) {
	
	this.options = $.extend({}, options);

	// Call super-class.
	Entity.call(this, this.options);

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
		this.sprite_sheet = this.options.sprite_sheet;
		this.equipSlot = this.options.equipSlot;
		this.primaryAttack = this.options.primaryAttack;
		this.bonuses = this.options.bonuses;
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

Item.prototype.damage = function (damageObj) {
	// TODO: Implement item damage?
};

Item.prototype.destroy = function () {
	// TODO: Implement item destruction.
};

return Item;

});
