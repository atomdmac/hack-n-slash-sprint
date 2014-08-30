define(
['jaws', '$'],
function (jaws, $) {

function ItemInspectorHUD(options) {
	
	this.options = $.extend({}, options);

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.character = this.options.character;
	}
}

ItemInspectorHUD.prototype = {};

ItemInspectorHUD.prototype.getUI = function () {
	var $el = $("<div class='item-inspector-hud'></div>");
	
	$el.append("Item Inspector FPO");
	
	return $el;
};

ItemInspectorHUD.prototype.draw = function () {
	
};

ItemInspectorHUD.prototype.set = function (data) {
	
};

ItemInspectorHUD.prototype.destroy = function () {
	// TODO: Implement ItemInspectorHUD destruction...maybe?
};

return ItemInspectorHUD;

});
