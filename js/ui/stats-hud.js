define(
['jaws', '$'],
function (jaws, $) {

function StatsHUD(options) {
	
	this.options = $.extend({}, options);

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.character = this.options.character;
	}
}

StatsHUD.prototype = {};

StatsHUD.prototype.getUI = function () {
	var $el = $("<div id='stats-hud'></div>")
		.css({
			"width": 128,
			"margin": 5,
			"display": "block",
			"background": "#ffffff",
			"overflow": "hidden"
		});
	$el.html("stats-hud");
	
	return $el;
};

StatsHUD.prototype.draw = function () {
	
};

StatsHUD.prototype.set = function (data) {
	
};

StatsHUD.prototype.destroy = function () {
	// TODO: Implement StatsHUD destruction...maybe?
};

return StatsHUD;

});
