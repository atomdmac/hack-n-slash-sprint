define(
['jaws', '$', 'DATABASE'],
function (jaws, $, DATABASE) {

function Item(options) {
	// TODO: Character extension check is kinda hack-y...
	var isExtending = false;
	if(!Object.keys(options).length) {
		isExtending = true;
	}

	this.options = $.extend({}, options);

	// Call super-class.
	jaws.Sprite.call(this, this.options);

	if(isExtending) return;

	// Reference to game world data.
	this._gameData = this.options.gameData;

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		// Set up Sprite animations.
		this.animation = new jaws.Animation({
			sprite_sheet  : this.options.sprite_sheet,
			frame_size    : this.options.frame_size,
			frame_duration: this.options.frame_duration,
			subsets       : this.options.animationSubsets
		});
		
		this.owner = null;
		this.drawable = false;
	}
}

Item.prototype = new jaws.Sprite({});

Item.prototype.update = function () {
	
};

Item.prototype.draw = function () {
	if (this.drawable && this.state) {
		this.setImage(this.animation.subsets[this.state].next());
		// Call original jaws.Sprite.draw() function.
		jaws.Sprite.prototype.draw.call(this);
	}
};

Item.prototype.state = function (state) {
	// Handle state switching logic here.
	if (state) {
		this.state = state;
	}
	return this.state;
};

Item.prototype.put = function () {
	// TODO: Add a way to put items places, like in a container or tilemap?
};

Item.prototype.drop = function (x, y) {
	this.move(x, y);
	this.drawable = true;
	this.state("unequipped");
	this._gameData.items.push(this);
};
Item.prototype.take = function () {
	this.drawable = false;
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
