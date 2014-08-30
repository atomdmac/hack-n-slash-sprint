define(
['jaws', '$'],
function (jaws, $) {

function Paperdoll(options) {
	
	this.options = $.extend({}, options);

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.character = this.options.character;
	}
}

Paperdoll.prototype = {};

Paperdoll.prototype.getUI = function () {
	var $el = $("<div class='paperdoll'></div>");
	var canvas = jaws.retroScaleImage(this.character.animation.frames[1], 2);
	
	var $canvas = $(canvas);
	$el.append($canvas);
	
	return $el;
};

return Paperdoll;

});
