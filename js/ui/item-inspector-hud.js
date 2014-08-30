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
	
	// Draw inspected item.
	var inspectedItem = this.character.inspecting;
	var inspectedBonuses = $.extend(true, {}, inspectedItem.bonuses);
	var $inspected = $("<div class='inspected'></div>")
		.append("<p>Inspecting:</p>")
		.append("<p>" + inspectedItem.label + "</p>");
		
	var $inspectedBonuses = $("<ul></ul>");
	
	for (var key in inspectedBonuses) {
		$inspectedBonuses.append($("<li>" + key + ": " + inspectedBonuses[key] + "</li>"));
	}
	$inspected.append($inspectedBonuses);
	
	// Draw currently equipped item.
	var equipSlot = this.character.inspecting.equipSlot;
	var equippedItem = this.character.equipment[equipSlot];
	var equippedBonuses = {};
	var $equipped = $("<div class='equipped'></div>")
		.append("<p>Currently Equipped:</p>");
	if (equippedItem !== null) {
		$equipped.append("<p>" + equippedItem.label + "</p>");
		
		var $equippedBonuses = $("<ul></ul>");
		equippedBonuses = $.extend(true, {}, equippedItem.bonuses);
		
		for (var key in equippedBonuses) {
			$equippedBonuses.append($("<li>" + key + ": " + equippedBonuses[key] + "</li>"));
		}
		$equipped.append($equippedBonuses);
	}
	else {
		$equipped.append("<p>---</p>");
	}
	
	// Draw stat bonus deltas.
	var $statsDelta = $("<div class='stats-delta'></div>")
		.append("<p>Press X to swap</p>");
	var $deltaBonuses = $("<ul></ul>");
	var deltaBonuses = {};//$.extend(true, {}, inspectedBonuses);
	
	// Negate current equipment bonuses
	for (var key in equippedBonuses) {
		deltaBonuses[key] = equippedBonuses[key] * -1;
	}
	
	// Add inspected bonuses
	for (var key in inspectedBonuses) {
		if (deltaBonuses[key]) {
			deltaBonuses[key] += inspectedBonuses[key];
		}
		else {
			deltaBonuses[key] = inspectedBonuses[key];
		}
	}
	
	// Draw deltas
	for (var key in deltaBonuses) {
		$deltaBonuses.append($("<li>" + key + ": " + deltaBonuses[key] + "</li>"));
	}
		
	$statsDelta.append($deltaBonuses);
	
	$el.append($equipped)
	   .append($statsDelta)
	   .append($inspected);
	
	return $el;
};

return ItemInspectorHUD;

});
