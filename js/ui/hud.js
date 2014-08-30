define(
['jaws', '$', 'ui/paperdoll', 'ui/resources-hud', 'ui/stats-hud', 'ui/item-inspector-hud'],
function (jaws, $, Paperdoll, ResourcesHUD, StatsHUD, ItemInspectorHUD) {

function HUD(options) {
	
	this.options = $.extend({}, options);
	
	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.character = this.options.character;
	}
	
	this.updated = {"equipment"     : true,
					"resources"     : true,
					"stats"         : true,
					"itemInspector" : true};
					
	this.$hud = $("<div id='hud'></div>").appendTo("body");
	
	this.paperdoll = new Paperdoll(this.options);
	this.$paperdoll = $("<div class='hud-tile paperdoll-tile'></div>")
	.appendTo(this.$hud);
	
	this.resources = new ResourcesHUD(this.options);
	this.$resources = $("<div class='hud-tile resources-tile'></div>")
	.appendTo(this.$hud);
	
	this.stats = new StatsHUD(this.options);
	this.$stats = $("<div class='hud-tile stats-tile'></div>")
	.appendTo(this.$hud);
	
	this.itemInspector = new ItemInspectorHUD(this.options);
	this.$itemInspector = $("<div class='hud-tile item-inspector-tile'></div>")
	.appendTo(this.$hud);
}

HUD.prototype = {};

HUD.prototype.update = function (propertyUpdated) {
	this.updated[propertyUpdated] = true;
};

HUD.prototype.draw = function () {
	for (var key in this.updated) {
		if (this.updated[key]) {
			
			switch (key) {
				case "equipment":
					this.drawPaperdoll();
					break;
				
				case "resources":
					this.drawResources();
					break;
				
				case "stats":
					this.drawStats();
					break;
				
				case "itemInspector":
					this.drawItemInspector();
					break;
				
				default:
					break;
			}
			
			
			this.updated[key] = false;
		}
	}
};

HUD.prototype.getUI = function () {
	var $el = $("<div id='hud'></div>");
	return $el;
};


// TODO: Make it so the order doesn't change when these update!
HUD.prototype.drawPaperdoll = function () {
	this.$paperdoll.html(this.paperdoll.getUI());
};

HUD.prototype.drawResources = function () {
	this.$resources.html(this.resources.getUI());
};

HUD.prototype.drawStats = function () {
	this.$stats.html(this.stats.getUI());
};

HUD.prototype.drawItemInspector = function () {
	this.$itemInspector.html(this.itemInspector.getUI());
};

HUD.prototype.set = function (data) {
	
};

HUD.prototype.destroy = function () {
	// TODO: Implement HUD destruction...maybe?
};

return HUD;

});
