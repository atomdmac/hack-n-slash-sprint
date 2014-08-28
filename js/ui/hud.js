define(
['jaws', '$', 'ui/paperdoll', 'ui/stats-hud', 'ui/resources-hud'],
function (jaws, $, Paperdoll, StatsHUD, ResourcesHUD) {

function HUD(options) {
	
	this.options = $.extend({}, options);
	
	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.character = this.options.character;
	}
	
	this.paperdoll = new Paperdoll(this.options);
	this.$paperdoll = this.paperdoll.getUI();
	
	this.stats = new StatsHUD(this.options);
	this.$stats = this.stats.getUI();
	
	this.resources = new ResourcesHUD(this.options);
	this.$resources = this.resources.getUI();
	
	this.updated = {"equipment":  true,
					"stats":      true,
					"resources":  true};
	this.$hud = this.getUI().appendTo("body");
	this.$hud.append(this.$paperdoll);
	this.drawPaperdoll();
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
					console.log("redrawing equipment");
					this.drawPaperdoll();
					break;
				
				case "stats":
					console.log("redrawing stats");
					this.drawStats();
					break;
				
				case "resources":
					console.log("redrawing resources");
					this.drawResources();
					break;
				
				default:
					break;
			}
			
			
			this.updated[key] = false;
		}
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
	return $el;
};


// TODO: Make it so the order doesn't change when these update!
HUD.prototype.drawPaperdoll = function () {
	this.$paperdoll.remove();
	this.$paperdoll = this.paperdoll.getUI();
	this.$hud.append(this.$paperdoll);
};

HUD.prototype.drawStats = function () {
	this.$stats.remove();
	this.$stats = this.stats.getUI();
	this.$hud.append(this.$stats);
};

HUD.prototype.drawResources = function () {
	this.$resources.remove();
	this.$resources = this.resources.getUI();
	this.$hud.append(this.$resources);
};


HUD.prototype.set = function (data) {
	
};

HUD.prototype.destroy = function () {
	// TODO: Implement HUD destruction...maybe?
};

return HUD;

});
