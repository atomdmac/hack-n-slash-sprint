define(
['jaws', '$', 'DATABASE', 'lib/SAT', 'entities/entity'],
function (jaws, $, DATABASE, SAT, Entity) {

function PatrolPoint(options) {

	options = $.extend(
		{
			x: 0,
			y: 0,
			width: 32,
			height: 32,
			radius: 8,
			patrolName: "general-patrol",
			patrolIndex: -1
		},
		options
	);
	
	// Call super-class.
	Entity.call(this, options);
	
	this.presences.push({name: options.patrolName,
						shape: new SAT.Circle(new SAT.Vector(this.x, this.y), this.options.radius)});

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(options){
		this.patrolName = options.patrolName;
		this.patrolIndex = Number(options.patrolIndex);
	}
	
	// Ensure this patrol exists in gameData, then add this patrol to it.
	if (!this._gameData.patrols[this.patrolName]) {
		this._gameData.patrols[this.patrolName] = [];
	}
	
	if (this.patrolIndex > -1) {
		this._gameData.patrols[this.patrolName][this.patrolIndex] = this;
	}
	else {
		this._gameData.patrols[this.patrolName].push(this);
	}
}

PatrolPoint.prototype = Object.create(Entity.prototype);

return PatrolPoint;

});
