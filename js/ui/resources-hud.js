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
	
	var moonPendantKeys = ["moonPendantGreen", "moonPendantOrange", "moonPendantRed", "moonPendantBlue"];
	var $moonPendantHUD = $("<div class='moon-pendant-hud'></div>");
	var $moonPendantItem;
	for (var lcv = 0; lcv < moonPendantKeys.length; lcv++) {
		$moonPendantItem = $("<div class='moon-pendant-hud-item'></div>")
			.addClass(moonPendantKeys[lcv]);
		if (this.character.resources[moonPendantKeys[lcv]]) {
			$moonPendantItem.addClass("resource-acquired");
		}
		$moonPendantHUD.append($moonPendantItem);
	}
	$el.append($moonPendantHUD);
	
	var $ul = $("<ul></ul>");
	for (var key in this.character.resources) {
		$ul.append($("<li>" + key + ": " + this.character.resources[key] + "</li>"));
	}
	$el.append($ul);
	
	return $el;
};

return ResourcesHUD;

});
