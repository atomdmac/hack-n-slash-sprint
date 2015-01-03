define(['jaws', '$', '_'], function (jaws, $, _) {

var DialUI = function (config) {
	var defaults = {
		radius     : 100,
		itemCount  : 10,
		itemRadius : 30,
		angleOffset: 0,
		cx         : 0,
		cy         : 0,
		ctx        : null,

		// Cache of items in the menu.
		items: []
	};

	// Merge given config with defaults.
	_.extend(this, defaults, config);

	if(!this.items.length) this.initItems();
};

DialUI.prototype.initItems = function () {
	var increment = 360  / this.itemCount,
		curAngle  = this.angleOffset,
		radians;

	for(; curAngle<360; curAngle+=increment) {
		radians = curAngle * (Math.PI / 180);
		this.items.push({
			cx: (this.radius * Math.cos(radians)) + this.cx,
			cy: (this.radius * Math.sin(radians)) + this.cy,
			radius: this.itemRadius,
			selected: false
		});
	}
};

DialUI.prototype.select = function (x, y) {
	var item = this.bearingToItem(x, y);

	for(var i=0; i<this.items.length; i++) {
		this.items[i].selected = false;
	}
	item.selected = true;
};

DialUI.prototype.radiansToItem = function (radians) {
	var increment = (Math.PI * 2) / this.itemCount,
		index     = Math.floor(radians / increment);

	if(index<0) index = this.itemCount + index;

	return this.items[index] || 0;
};

DialUI.prototype.bearingToItem = function (x, y) {
	var radians = Math.atan2(y, x);
	return this.radiansToItem(radians);
};

DialUI.prototype.draw = function () {
	this.ctx.save();
	for(var i=0; i<this.items.length; i++) {
		this.drawItem(this.items[i]);
	}
	this.ctx.restore();
};

DialUI.prototype.drawItem = function (item) {
	if(item.selected) {
		this.ctx.strokeStyle = "#ff0000";
		this.ctx.lineWidth = 5;
	} else {
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 1;
	}

    this.ctx.beginPath();
    this.ctx.arc(item.cx, item.cy, item.radius, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.stroke();
};

return DialUI;

});