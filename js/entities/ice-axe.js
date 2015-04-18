define(
['jaws', 'lib/machina', 'DATABASE', 'entities/entity', 'lib/SAT', 'entities/effects/knockback', 'entities/effects/invulnerability'],
function (jaws, machina, DATABASE, Entity, SAT, Knockback, Invulnerability) {

function IceAxe (options) {
	// Merge options
	this.options = $.extend({
					x: options.attacker.x,
					y: options.attacker.y,
					scale: 1,
					anchor: [0, 0],
					radius: 1
				}, options);

	this.attacker = this.options.attacker;
	
	Entity.call(this, this.options);
	
	this.attackData = this.options.attackData || {
		mode: "melee",
		resource: "health",
		type: "physical",
		value: 20,
		penetration: 1
	};
	this.onFinish   = this.options.onFinish;

	// Settings
	this.hitBox = new SAT.Polygon(new SAT.Vector(this.attacker.x, this.attacker.y),
		[
		new SAT.Vector(0, 0),
		new SAT.Vector(10, 0),
		new SAT.Vector(10, 50),
		new SAT.Vector(0, 50)
		]);
	this.hitBox.translate(-5, 0);
	
	this.presences.push.apply(this.presences, [
		{name: 'touch', shape: this.hitBox}
	]);
	
	this.interests.push.apply(this.interests, [
		{name: 'touch', shape: this.hitBox}
	]);

	// State
	this.duration      = 15;
	this.angleRange    = 3.5;
	this.angleStep     = (this.angleRange / this.duration);
	this.isCharging    = false;
	this.timeToCharged = 45;
	this.debugColor    = "green";
	
	// FSM
	var self = this;
	this.fsm = new machina.Fsm({
		initialState: 'idle',
		states: {
			'idle': {
				'initialize': function (angle) {
					self.angle = angle;
					this.transition('initializing');
				}
			},
			'initializing': {
				'_onEnter': function () {
					self.debugColor = "green";
					this.transition('swinging');
				}
			},
			'swinging': {
				'_onEnter': function() {
					self.isCharging = true;
					self.currentTime = 0;
					self.angleCurrent = -self.angle - (self.angleRange / 2);
					self.hitBox.setAngle(self.angleCurrent);
					self.x = self.hitBox.pos.x = self.attacker.x;
					self.y = self.hitBox.pos.y = self.attacker.y;
				},
				'initialize': function (angle) {
					if (self.isCharging === false) {
						this.transition('initializing');
					}
				},
				'release': function () {
					self.isCharging = false;
				},
				'collide': function (collision) {
					self._handleCollision(collision);
				},
				'update': function() {
					// Update hitbox angle and position.
					self.hitBox.setAngle(self.angleCurrent);
					self.x = self.hitBox.pos.x = self.attacker.x;
					self.y = self.hitBox.pos.y = self.attacker.y;
					
					// Step forward in time.
					self.angleCurrent += self.angleStep;
					self.currentTime += 1;
				
					// Check to see if the attack has finished yet or not.
					if(self.currentTime >= self.duration) {
						if (self.isCharging) {
							this.transition('charging');
						}
						else {
							this.transition('idle');
						}
					}
				},
				'draw': function() {
					/* DEBUG */
					var context = jaws.context,
						points  = self.hitBox.calcPoints,
						i, ilen;
				
					context.save();
					context.strokeStyle = self.debugColor;
					context.lineWidth = 3;
				
					context.beginPath();
					context.moveTo(
						self.hitBox.pos.x + points[0].x, 
						self.hitBox.pos.y + points[0].y
					);
					for(i=0, ilen=points.length; i<ilen; i++) {
						context.lineTo(
							self.hitBox.pos.x + points[i].x, 
							self.hitBox.pos.y + points[i].y
						);
					}
					context.lineTo(
						self.hitBox.pos.x + points[0].x,
						self.hitBox.pos.y + points[0].y
					);
					context.stroke();
				
					context.restore();
				}
			},
			'charging': {
				'_onEnter': function() {
					self.hitBox.setAngle(-self.angle);
				},
				'update': function() {
					self.x = self.hitBox.pos.x = self.attacker.x;
					self.y = self.hitBox.pos.y = self.attacker.y;
					
					// Step forward in time.
					self.currentTime += 1;
					
					// Check to see if the attack has finished yet or not.
					if(self.currentTime >= self.timeToCharged) {
						this.transition('charged');
						
					}
				},
				'release': function () {
					self.isCharging = false;
					this.transition('idle');
				},
				'collide': function (collision) {
					self._handleCollision(collision);
				},
				'draw': function() {
					/* DEBUG */
					var context = jaws.context,
						points  = self.hitBox.calcPoints,
						i, ilen;
					
					context.save();
					context.strokeStyle = self.debugColor;
					context.lineWidth = 3;
					
					// Draw hitbox
					context.beginPath();
					context.moveTo(
						self.hitBox.pos.x + points[0].x, 
						self.hitBox.pos.y + points[0].y
					);
					for(i=0, ilen=points.length; i<ilen; i++) {
						context.lineTo(
							self.hitBox.pos.x + points[i].x, 
							self.hitBox.pos.y + points[i].y
						);
					}
					context.lineTo(
						self.hitBox.pos.x + points[0].x,
						self.hitBox.pos.y + points[0].y
					);
					context.stroke();
					context.closePath();
					
					
					// Helper functions for drawing charging progress
					var distancePoints = function ( xA, yA, xB, yB ){
						var xDistance = Math.abs( xA - xB );
						var yDistance = Math.abs( yA - yB );
					   
						return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
					};
					var coordinatesMediumPoint = function( xA, yA, xB, yB, distanceAC ){
						//var distanceAB  = distancePoints( xA, yA, xB, yB );
						var angleAB     = Math.atan2( ( yB - yA ), ( xB - xA ) );
						var deltaXAC    = distanceAC * Math.cos( angleAB );
						var deltaYAC    = distanceAC * Math.sin( angleAB );
						
						var xC          = xA + deltaXAC;
						var yC          = yA + deltaYAC;
					   
						return { x: xC, y: yC };
					};
					var distanceBetween = distancePoints(
						points[1].x,
						points[1].y,
						points[2].x,
						points[2].y
					);
					var percentCharged = (self.currentTime - self.duration) / (self.timeToCharged - self.duration);
					var chargingDelta = distanceBetween * percentCharged;
					var chargingProgressCoords = coordinatesMediumPoint(
						points[1].x,
						points[1].y,
						points[2].x,
						points[2].y,
						chargingDelta
					);
					
					// Draw charging progress in hitbox
					context.beginPath();
					context.lineWidth = 10;
					context.moveTo(
						self.hitBox.pos.x,
						self.hitBox.pos.y
					);
					context.lineTo(
						self.hitBox.pos.x + chargingProgressCoords.x - points[1].x,
						self.hitBox.pos.y + chargingProgressCoords.y - points[1].y
					);
					context.stroke();
					
					context.restore();
				}
			},
			'charged': {
				'_onEnter': function() {
					self.debugColor = "red";
				},
				'update': function() {
					self.x = self.hitBox.pos.x = self.attacker.x;
					self.y = self.hitBox.pos.y = self.attacker.y;
				},
				'release': function () {
					self.isCharging = false;
					this.transition('idle');
				},
				'collide': function (collision) {
					self._handleCollision(collision);
				},
				'draw': function() {
					/* DEBUG */
					var context = jaws.context,
						points  = self.hitBox.calcPoints,
						i, ilen;
					
					context.save();
					context.strokeStyle = self.debugColor;
					context.lineWidth = 3;
				
					context.beginPath();
					context.moveTo(
						self.hitBox.pos.x + points[0].x, 
						self.hitBox.pos.y + points[0].y
					);
					for(i=0, ilen=points.length; i<ilen; i++) {
						context.lineTo(
							self.hitBox.pos.x + points[i].x, 
							self.hitBox.pos.y + points[i].y
						);
					}
					context.lineTo(
						self.hitBox.pos.x + points[0].x,
						self.hitBox.pos.y + points[0].y
					);
					context.stroke();
					context.fillStyle = self.debugColor;
					context.fill();
					
					context.restore();
				}
			},
			'lunging': {
				'_onEnter': function() {
					
				},
				'finishRetracting': function () {
					
				},
				'update': function() {
					
				},
				'draw': function() {
					
				}
			}
		}
	});
}

IceAxe.prototype = Object.create(Entity.prototype);

IceAxe.prototype.update = function () {
	this.fsm.handle('update');
};

IceAxe.prototype.draw = function() {
	this.fsm.handle('draw');
};

IceAxe.prototype.onCollision = function (collision) {
	this.fsm.handle('collide', collision);
};

IceAxe.prototype._handleCollision = function (collision) {
	var entity = collision.target,
		interest = collision.interest;
		
	if (interest.name === "touch" &&
		this.attacker.consider(entity) === "hostile" &&
		!entity.invulnerable) {
		entity.damage(this.attackData);
		
		var analog = this.attacker.readMovementInput();
		var angle = (analog.x === 0 && analog.y === 0)
					? this.attacker.radianMap8D[this.attacker.bearing]
					: this.attacker.getAngleOfAnalogs(analog);
		
		entity.addEffect(new Knockback({
			// Target
			target: entity,
			// Angle
			angle: angle,
			// Force
			force: 3,
			// Duration
			duration: 20
		}));
		
		entity.addEffect(new Invulnerability({
			// Target
			target: entity
		}));
		
		this.fsm.transition('idle');
	}
};

IceAxe.prototype.release = function (collision) {
	this.fsm.handle('release');
};

IceAxe.prototype.initialize = function (angle) {
	this.fsm.handle('initialize', angle);
};

return IceAxe;

});