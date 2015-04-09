define(
['jaws', 'lib/machina', 'DATABASE', 'entities/entity', 'lib/SAT'],
function (jaws, machina, DATABASE, Entity, SAT) {

function Hookshot (options) {
	// Merge options
	this.options = $.extend({
						width: 80,
						height: 80,
						scale: 1,
						anchor: [0.5, 0.5],
						radius: 10,
						x: options.attacker.x,
						y: options.attacker.y
					}, options);

	// Call super-class.
	Entity.call(this, this.options);
	
	this.hitBox = new SAT.Circle(new SAT.Vector(this.x, this.y), this.options.radius);
	
	this.presences.push.apply(this.presences, [
		{name: 'touch', shape: this.hitBox}
	]);
	
	this.interests.push.apply(this.interests, [
		{name: 'touch', shape: this.hitBox},
		{name: 'terrain', shape: this.hitBox}
	]);
	
	// State
	this.speed        = 12;
	this.anchorEntity = null;
	
	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		this.attacker = this.options.attacker;
	}
	
	
	// FSM
	var self = this;
	this.fsm = new machina.Fsm({
		initialState: 'idle',
		states: {
			'idle': {
				'wield': function (angle) {
					self.angle = angle;
					this.transition('aiming');
				}
			},
			'aiming': {
				'_onEnter': function() {
					self.moveTo(self.attacker.x, self.attacker.y);
				},
				'launch': function () {
					this.transition('extending');
				},
				'update': function() {
					self.moveTo(self.attacker.x, self.attacker.y);
				},
				'draw': function() {
					/* DEBUG */
					var context = jaws.context;
				
					context.save();
					context.strokeStyle = "green";
					context.lineWidth = 3;
				
					context.beginPath();
					context.moveTo(self.attacker.x, self.attacker.y);
					context.lineTo(self.x, self.y);
					context.stroke();
					context.closePath();
					
					context.beginPath();
					context.arc(self.x, self.y, self.radius, 0, 2 * Math.PI, false);
					context.stroke();
				
					context.restore();
				}
			},
			'extending': {
				'_onEnter': function() {
					self.duration     = 30;
					self.currentTime  = 0;
				},
				'update': function() {
					// Step forward in time.
					self.currentTime += 1;
					
					self.move(self.angle);
					
					// Check to see if the attack has finished yet or not.
					if (self.currentTime >= self.duration) {
						this.transition('retracting');
					}
				},
				'collide': function (collision) {
					// TODO: Clean-up these ad-hoc variables.
					var entity   = collision.target,
						interest = collision.interest;
					
					switch(interest.name) {
						case 'touch':
							// Anchor into entity and begin retracting.
							if (!self.anchorEntity) {
								if (entity.hookable) {
									self.anchorTo(entity);
									this.transition('retracting');
								}
								else if (!entity.passable &&
										 entity != self.attacker) {
									this.transition('retracting');
								}
							}
							break;
						case 'terrain':
							// TODO: Allow passage over other passable, non-chasm terrain types.
							if (collision.target.type === 'wall') {
								// Begin retracting.
								if (collision.overlapX >= self.radius/2 ||
									collision.overlapY >= self.radius/2) {
									
									this.transition('retracting');
									
								}
							}
							break;
						default:
							// Do nothing.
					}
				},
				'draw': function() {
					/* DEBUG */
					var context = jaws.context;
				
					context.save();
					context.strokeStyle = "green";
					context.lineWidth = 3;
				
					context.beginPath();
					context.moveTo(self.attacker.x, self.attacker.y);
					context.lineTo(self.x, self.y);
					context.stroke();
					context.closePath();
					
					context.beginPath();
					context.arc(self.x, self.y, self.radius, 0, 2 * Math.PI, false);
					context.stroke();
				
					context.restore();
				}
			},
			'retracting': {
				'_onEnter': function() {
					self.duration = self.currentTime * 2;
				},
				'finishRetracting': function () {
					// The hookshot has fully retracted, so finish.
					this.transition('idle');
				},
				'update': function() {
					if (self.anchorEntity &&
						self.anchorEntity.mass > self.attacker.mass) {
						
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
						
						self.x = self.anchorEntity.x;
						self.y = self.anchorEntity.y;
					
						var distanceBetween = distancePoints(
							self.attacker.x,
							self.attacker.y,
							self.x,
							self.y
						);
						var attackerDelta = distanceBetween / (self.duration - self.currentTime);
						var newAttackerCoords = coordinatesMediumPoint(
							self.attacker.x,
							self.attacker.y,
							self.x,
							self.y,
							attackerDelta
						);
						
						self.attacker.moveTo(newAttackerCoords.x, newAttackerCoords.y);
						
					}
					else {
						self.angle = Math.atan2(self.attacker.x - self.x, self.attacker.y - self.y);
						self.move(self.angle);
						
						// Pull lightweight anchor toward the attacker.
						if (self.anchorEntity &&
							self.anchorEntity.mass <= self.attacker.mass) {
							self.anchorEntity.x = self.x;
							self.anchorEntity.y = self.y;
						}
					}
					
					// Step forward in time.
					self.currentTime += 1;
					
					// Check to see if the attack has finished yet or not.
					if (self.currentTime >= self.duration) {
						self.anchorEntity = null;
						this.transition('idle');
					}
				},
				'draw': function() {
					/* DEBUG */
					var context = jaws.context;
				
					context.save();
					context.strokeStyle = "green";
					context.lineWidth = 3;
				
					context.beginPath();
					context.moveTo(self.attacker.x, self.attacker.y);
					context.lineTo(self.x, self.y);
					context.stroke();
					context.closePath();
					
					context.beginPath();
					context.arc(self.x, self.y, self.radius, 0, 2 * Math.PI, false);
					context.stroke();
				
					context.restore();
				}
			}
		}
	});
}

Hookshot.prototype = Object.create(Entity.prototype);

Hookshot.prototype.wield = function (angle) {
	this.fsm.handle('wield', angle);
};

Hookshot.prototype.launch = function (angle) {
	this.fsm.handle('launch', angle);
};

Hookshot.prototype.onCollision = function (collision) {
	this.fsm.handle('collide', collision);
};

Hookshot.prototype.update = function () {
	this.fsm.handle('update');
};

// TODO: Don't reinvent the wheel, dummy...
Hookshot.prototype.move = function (angle) {
	var x = Math.sin(angle) * this.speed;
	var y = Math.cos(angle) * this.speed;
	
	if (x !== 0 || y !== 0) {
		this.x += x;
		this.y += y;
	}
};

Hookshot.prototype.anchorTo = function (target) {
	this.anchorEntity = target;
};

Hookshot.prototype.draw = function () {
	this.fsm.handle('draw');
};

return Hookshot;

});
