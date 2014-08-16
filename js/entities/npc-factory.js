function NPCFactory (options) {
	options = $.extend({}, DATABASE.nonPlayerCharacters["base"], options);

	// Double-check required options.
	if (!options.character) throw "NPC needs a character.";

	var self = {};
	

	// Create the character that this player controls.
	self.character = CharacterFactory(options.character);

	// These are actions that the player can take.  Many of them will map to
	// functions on the underlying Character object.
	self.actions = {};
	self.actions.move = function (angle, magnitude) {
		self.character.move(angle, magnitude);
	};
	self.actions.moveUp = function () {
		self.character.moveUp();
	};
	self.actions.moveDown = function () {
		self.character.moveDown();
	};
	self.actions.moveLeft = function () {
		self.character.moveLeft();
	};
	self.actions.moveRight = function () {
		self.character.moveRight();
	};
	
	// This distractionRate idea probably shouldn't be permanant, but here it is!
	self.isDistracted = false;
	self.rollForDistraction = function(distractionRateMultiplier) {
		var calculatedDistractionRate = options.distractionRate;
		if (distractionRateMultiplier) { 
			calculatedDistractionRate = calculatedDistractionRate * distractionRateMultiplier;
		}
		if (Math.random() < calculatedDistractionRate) {
			self.isDistracted = true;
		}
		else {
			self.isDistracted = false;
		}
	};
	
	self.courseOfAction = {
		move: {
			angle: 0,
			magnitude: 0
		}
	};
	self.decideNextAction = function() {
		// TODO: Make decisions for actual reasons.
		if (self.character.resources.health.points > 0) {
			self.rollForDistraction();
			if (self.isDistracted) {
				// Decide how to move in the X-axis.
				var analogX = Math.round(Math.random()) ? Math.random() : Math.random() * -1;
				var analogY = Math.round(Math.random()) ? Math.random() : Math.random() * -1;
				
				self.courseOfAction.move.angle = Math.atan2(analogX, analogY);
				self.courseOfAction.move.magnitude = Math.sqrt(analogX*analogX+analogY*analogY);
			}
			self.actions.move(self.courseOfAction.move.angle,
							  self.courseOfAction.move.magnitude);
		}
	};
	
	// Called from the parent Game State from it's update() method.  This is
	// where we listen for input and stuff.
	self.update = function () {
		self.character.update();
		self.decideNextAction();
	};

	return self;
}