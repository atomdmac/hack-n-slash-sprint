define(
['jaws', '$', 'ui/paperdoll', 'ui/resources-hud', 'ui/stats-hud', 'ui/debug-hud'],
function (jaws, $, Paperdoll, ResourcesHUD, StatsHUD, DebugHUD) {

function HUD(options) {
	
	this.options = $.extend({}, options);
	
	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.character = this.options.character;
	}
	
	this.updated = {"equipment"     : true,
					"resources"     : true,
					"stats"         : true};
					
	this.$hud = $("<div id='hud'></div>")
	.appendTo("body");
	this.$hudColumn1 = $("<div class='hud-column'></div>").appendTo(this.$hud);
	this.$hudColumn2 = $("<div class='hud-column'></div>").appendTo(this.$hud);
	
	this.paperdoll = new Paperdoll(this.options);
	this.$paperdoll = $("<div class='hud-tile paperdoll-tile'></div>")
	.appendTo(this.$hudColumn1);
	
	this.resources = new ResourcesHUD(this.options);
	this.$resources = $("<div class='hud-tile resources-tile'></div>")
	.appendTo(this.$hudColumn1);
	
	this.stats = new StatsHUD(this.options);
	this.$stats = $("<div class='hud-tile stats-tile'></div>")
	.appendTo(this.$hudColumn1);
	
	this.debug = new DebugHUD(this.options);
	this.$debug = $("<div class='hud-tile debug-tile'></div>")
	.appendTo(this.$hudColumn1);
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
					// Update Resources w/ Stats to update max Resource values.
					this.drawResources();
					break;
				
				case "debug":
					this.drawDebug();
					break;
				
				default:
					break;
			}
			
			
			this.updated[key] = false;
		}
	}
};

HUD.prototype.drawPaperdoll = function () {
	this.$paperdoll.html(this.paperdoll.getUI());
};

HUD.prototype.drawResources = function () {
	this.$resources.html(this.resources.getUI());
};

HUD.prototype.drawStats = function () {
	this.$stats.html(this.stats.getUI());
};

HUD.prototype.drawDebug = function () {
	this.$debug.html(this.debug.getUI());
};

return HUD;

});
