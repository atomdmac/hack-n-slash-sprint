define(['jaws', '$', '_'], function (jaws, $, _) {

var GridUI = function (config) {
	var defaults = {
		x         : 0,
		y         : 0,
		ctx       : jaws.context,
		width     : 4,

		vSpacing  : 10,
		hSpacing  : 10,
		itemWidth : 50,
		itemHeight: 50,

		itemCount : 10,

		// Cache of items in the menu.
		items: [],
		selected: null
	};

	// Merge given config with defaults.
	_.extend(this, defaults, config);

	if(!this.items.length) this.initItems();

	this.move = _.throttle(this.move, 200, {trailing: false});
};

GridUI.prototype.initItems = function () {
	for(var i=0; i<this.itemCount; i++) {
		this.items.push({
			index: i,
			selected: !i ? true : false, // Select first item by default.
			image: null,
			color: '#000'
		});
	}
	this.selected = this.items[0];
};

GridUI.prototype.select = function (index) {
	if(index < 0) return;
	if(index > this.items.length - 1) return;

	this.selected.selected = false;
	this.selected = this.items[index];
	this.selected.selected = true;
};

GridUI.prototype.move = function (x, y) {
	var threshold = 0.25;
	if(x >  threshold) this.moveRight();
	if(x < -threshold) this.moveLeft();
	if(y >  threshold) this.moveDown();
	if(y < -threshold) this.moveUp();
};

GridUI.prototype.moveUp = function () {
	this.select(this.selected.index - this.width);
};

GridUI.prototype.moveDown = function () {
	this.select(this.selected.index + this.width);
};

GridUI.prototype.moveRight = function () {
	this.select(this.selected.index + 1);
};

GridUI.prototype.moveLeft = function () {
	this.select(this.selected.index - 1);
};

GridUI.prototype.draw = function () {
	this.ctx.save();
	this.ctx.translate(this.x, this.y);
	for(var i=0; i<this.items.length; i++) {
		this.drawItem(this.items[i]);
	}
	this.ctx.restore();
};

GridUI.prototype.drawItem = function (item) {
	if(item.selected) {
		this.ctx.strokeStyle = "#ff0000";
		this.ctx.lineWidth = 5;
	} else {
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 1;
	}

	var x = (item.index % this.width) * (this.itemWidth + this.hSpacing),
		y = Math.floor(item.index / this.width) * (this.itemHeight + this.vSpacing); 

    this.ctx.beginPath();
    this.ctx.rect(x, y, this.itemWidth, this.itemHeight);
    this.ctx.closePath();
    this.ctx.stroke();
};

return GridUI;

});