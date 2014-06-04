function NPCFactory (options) {
	var defaultOptions = {
		// Data that defines the character that this player controls.
		character: null,
		distractionRate: 0.05 // Chance NPC will do something different from its last action.
	};

	options = $.extend({}, defaultOptions, options);

	// Double-check required options.
	if (!options.character) throw "NPC needs a character.";

	var self = {};
	

	// Create the character that this player controls.
	self.character = CharacterFactory(options.character);

	// These are actions that the player can take.  Many of them will map to
	// functions on the underlying Character object.
	self.actions = {};
	self.actions.move = function (angle, forceX, forceY) {
		self.character.move(angle, forceX, forceY);
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
			forceX: 0,
			forceY: 0
		}
	};
	self.decideNextAction = function() {
		// TODO: Make decisions for actual reasons.
		
		self.rollForDistraction();
		if (self.isDistracted) {
			// Decide how to move in the X-axis.
			self.courseOfAction.move.forceX = Math.round(Math.random()) ? Math.random() : Math.random() * -1;
			// Decide how to move in the Y-axis.
			self.courseOfAction.move.forceY = Math.round(Math.random()) ? Math.random() : Math.random() * -1;
		}
		self.actions.move(self.courseOfAction.move.forceX,
						  self.courseOfAction.move.forceY);
	};
	
	// Called from the parent Game State from it's update() method.  This is
	// where we listen for input and stuff.
	self.update = function () {
		self.character.update();
		self.decideNextAction();
	};

	return self;
}