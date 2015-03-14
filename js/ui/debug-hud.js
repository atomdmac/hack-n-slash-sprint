define(
['jaws', '$'],
function (jaws, $) {

function DebugHUD(options) {
	
	this.options = $.extend({}, options);

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.character = this.options.character;
	}
}

DebugHUD.prototype = {};

DebugHUD.prototype.getUI = function () {
	var $el = $("<div class='debug-hud'></div>");
	
	var $ul = $("<ul></ul>");
	
	this.info = {
		x:		Math.round(this.character.x),
		y:		Math.round(this.character.y),
		map:    this._gameData.url
	};
	
	for (var key in this.info) {
		$ul.append($("<li>" + key + ": " + this.info[key] + "</li>"));
	}
	
	$el.append($ul);
	
	return $el;
};

return DebugHUD;

});
