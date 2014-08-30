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
	var $el = $("<div class='stats-hud'></div>");
	
	var $ul = $("<ul></ul>");
	
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
