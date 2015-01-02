define(['jaws', '$'], function (jaws, $) {
	
var Tab = function (config) {

	var _defaults = {
		id: new Date().getTime(),
		title: 'New Tab',
		selected: false,
		width: 500,
		height: 500
	};

	// Merge default config with provided config.
	$.extend(true, this, _defaults, config);

	
};

Tab.prototype.setup = function (setupConfig) {
	// TODO
};

Tab.prototype.update = function () {
	// TODO
};

Tab.prototype.draw = function () {
	var ctx = jaws.context,
		x   = 0,
		y   = 0;

	ctx.beginPath();
	ctx.rect(x, y, this.width, this.height);
	ctx.fillStyle = '#fff';
	ctx.fill();
	ctx.lineWidth = 1;
	ctx.strokeStyle = '#000';
	ctx.stroke();

	ctx.font = '25pt Calibri';
	ctx.textAlign = 'center';
	ctx.fillStyle = '#ccc';
	ctx.fillText(this.title, x + this.width / 2, this.height / 2);
};

return Tab;

});