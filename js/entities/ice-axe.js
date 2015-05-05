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
	
	
	this.jumpTarget = new SAT.Circle(new SAT.Vector(this.attacker.x, this.attacker.y), this.attacker.radius);
	
	
	// State
	this.duration      = 15;
	this.angleRange    = 5;
	this.angleStep     = (this.angleRange / this.duration);
	this.isCharging    = false;
	this.timeToCharged = 30;
	this.debugColor    = "green";
	this.jumpDistance  = {x: 0, y: 0};
	this.jumpCoords    = {x: this.x, y: this.y};
	this.jumpPreviousMediumCoords = {x: -100, y: -100};
	this.jumpDistancePerTick = 3;
	this.maxJumpDistance = 150;
	
	// FSM
	var self = this;

	this.fsm = new machina.Fsm({
		initialState: 'idle',
		states: {
			'idle': {
				'swing': function (angle) {
					self.angle = angle;
					this.transition('swinging');
				}
			},
			'swinging-again': {
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
				'swing': function (angle) {
					if (self.isCharging === false) {
						this.transition('swinging-again');
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
					self.jumpDistance = {x: 0, y: 0};
					self.jumpCoords = {x: self.attacker.x, y: self.attacker.y};
				},
				'update': function() {
					self.x = self.hitBox.pos.x = self.attacker.x;
					self.y = self.hitBox.pos.y = self.attacker.y;
					
					if (self.jumpDistance.x*self.jumpDistance.x + self.jumpDistance.y*self.jumpDistance.y < self.maxJumpDistance*self.maxJumpDistance) {
						self.jumpDistance.x += self.jumpDistancePerTick * Math.sin(self.angle);
						self.jumpDistance.y += self.jumpDistancePerTick * Math.cos(self.angle);
					}
					
				},
				'release': function () {
					self.isCharging = false;
					this.transition('lunging');
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
					context.closePath();
					
					context.beginPath();
					context.strokeStyle = "gray";
					context.fillStyle = "gray";
					context.arc(self.attacker.x+self.jumpDistance.x, self.attacker.y+self.jumpDistance.y, self.attacker.radius, 0, 2 * Math.PI, false);
					context.stroke();
					context.fill();
					
					context.restore();
				}
			},
			'lunging': {
				'_onEnter': function() {
					self.hitBox.setAngle(-self.angle);
					self.jumpCoords = {x: self.attacker.x + self.jumpDistance.x, y: self.attacker.y + self.jumpDistance.y};
					self.jumpPreviousMediumCoords = {x: -100, y: -100};
				},
				'update': function() {
					self.x = self.hitBox.pos.x = self.attacker.x;
					self.y = self.hitBox.pos.y = self.attacker.y;
					
					var coordinatesMediumPoint = function( xA, yA, xB, yB, distanceAC ){
						var angleAB     = Math.atan2( ( yB - yA ), ( xB - xA ) );
						var deltaXAC    = distanceAC * Math.cos( angleAB );
						var deltaYAC    = distanceAC * Math.sin( angleAB );
						
						var xC          = xA + deltaXAC;
						var yC          = yA + deltaYAC;
					   
						return { x: xC, y: yC };
					};
					
					var newAttackerCoords = coordinatesMediumPoint(
						self.attacker.x,
						self.attacker.y,
						self.jumpCoords.x,
						self.jumpCoords.y,
						self.jumpDistancePerTick*2
					);
					if (// We aren't so close that moving again would move us beyond the jumpCoords.
						(Math.abs(self.attacker.x - self.jumpCoords.x) >= self.jumpDistancePerTick*2 ||
						Math.abs(self.attacker.y - self.jumpCoords.y) >= self.jumpDistancePerTick*2)
						// And we were able to execute the previous attempt to move without getting stuck on a wall or something.
						// TODO: Find a cleaner way to make this check? Maybe the jump target should be an entity, so you can't even try jumping through walls?
						&&
						!(Math.abs(self.jumpPreviousMediumCoords.x - newAttackerCoords.x) < self.jumpDistancePerTick*2 &&
						Math.abs(self.jumpPreviousMediumCoords.y - newAttackerCoords.y) < self.jumpDistancePerTick*2)
						) {
						
						self.jumpPreviousMediumCoords = newAttackerCoords;
						self.attacker.moveTo(newAttackerCoords.x, newAttackerCoords.y);
					}
					else {
						this.transition('idle');
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

IceAxe.prototype.swing = function (angle) {
	this.fsm.handle('swing', angle);
};

return IceAxe;

});