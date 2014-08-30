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
	var $el = $("<div class='resources-hud'></div>");
	
	var $ul = $("<ul></ul>");
	
	for (var key in this.character.resources) {
		$ul.append($("<li>" + key + ": " + this.character.resources[key] + "</li>"));
	}
	
	$el.append($ul);
	
	return $el;
};

return ResourcesHUD;

});
