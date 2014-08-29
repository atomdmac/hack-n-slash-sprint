define(
['jaws', '$'],
function (jaws, $) {

function ResourcesHUD(options) {
	
	this.options = $.extend({}, options);

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.character = this.options.character;
	}
}

ResourcesHUD.prototype = {};

ResourcesHUD.prototype.getUI = function () {
	var $el = $("<div id='resources-hud'></div>")
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
	
	for (var key in this.character.resources) {
		$ul.append($("<li>" + key + ": " + this.character.resources[key] + "</li>"));
	}
	
	$el.append($ul);
	
	return $el;
};

ResourcesHUD.prototype.draw = function () {
	
};

ResourcesHUD.prototype.set = function (data) {
	
};

ResourcesHUD.prototype.destroy = function () {
	// TODO: Implement ResourcesHUD destruction...maybe?
};

return ResourcesHUD;

});
