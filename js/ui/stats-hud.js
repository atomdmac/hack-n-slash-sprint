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
			"width": 256,
			"margin": 5,
			"display": "block",
			"background": "#ffffff",
			"overflow": "hidden"
		});
	
	var $ul = $("<ul></ul>").css({
			"list-style": "none",
			"margin": "5px 0 0 0",
			"padding": 0
		});
	
	for (var key in this.character.stats) {
		$ul.append($("<li>" + key + ": " + this.character.stats[key] + "</li>"));
	}
	
	$el.append($ul);
	
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
