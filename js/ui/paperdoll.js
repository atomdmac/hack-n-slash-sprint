define(
['jaws', '$'],
function (jaws, $) {

function Paperdoll(options) {
	
	this.options = $.extend({}, options);

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.character = this.options.character;
		console.log(this.character);
	}
}

Paperdoll.prototype = {};

Paperdoll.prototype.getUI = function () {
	var $el = $("<div id='paperdoll'></div>")
		.css({
			"width": 256,
			"height": 256,
			"margin": 5,
			"display": "block",
			"background": "#ffffff"
		});
	var canvas = jaws.retroScaleImage(this.character.animation.frames[1], 2);
	
	var $canvas = $(canvas)
		.css({
			"position": "absolute"
		});
	$el.append($canvas);
	
	return $el;
};

Paperdoll.prototype.draw = function () {
	
};

Paperdoll.prototype.set = function (data) {
	
};

Paperdoll.prototype.destroy = function () {
	// TODO: Implement Paperdoll destruction...maybe?
};

return Paperdoll;

});
