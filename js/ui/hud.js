define(
['jaws', '$', 'ui/paperdoll'],
function (jaws, $, Paperdoll) {

function HUD(options) {
	
	this.options = $.extend({}, options);
	
	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.character = this.options.character;
	}
	
	this.paperdoll = new Paperdoll(this.options);
	
	this.updated = true;
	this.$hud = this.getUI().appendTo("body");
	
}

HUD.prototype = {};

HUD.prototype.update = function () {
	this.updated = true;
};

HUD.prototype.draw = function () {
	if (this.updated) {
		this.$hud.remove();
		this.$hud = this.getUI().appendTo("body");
		
		this.updated = false;
	}
};

HUD.prototype.getUI = function () {
	var $el = $("<div id='hud'></div>")
		.css({
			"height": 600,
			"display": "inline-block",
			"position": "absolute",
			"background": "#cccccc"
		});
	
	$el.append(this.paperdoll.getUI());
	
	return $el;
};

HUD.prototype.set = function (data) {
	
};

HUD.prototype.destroy = function () {
	// TODO: Implement HUD destruction...maybe?
};

return HUD;

});
