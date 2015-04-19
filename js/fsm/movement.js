define(
['jaws', '$', 'lib/machina'],
function (jaws, $, machina) {

var Movement = function (host) {

host.movementFsm = new machina.Fsm({

	// "Constants"
	MAX_ACCEL: 2,
	MAX_VEL: 2.5,
	FRICTION: 0.8,

	// Velocity
	vx: 0,
	vy: 0,

	// Acceleration
	ax: 0,
	ay: 0,

	initialState: 'grounded',

	// States
	states: {
		'floating': {
			'spawn': function () {
				this.transition(this.initialState);
			},
			'fall': function () {
				this.transition('falling');
			},
			'move': function (bearing) {
				this.accelerate(bearing);
			}
		},
		'falling': {
			'spawn': function () {
				this.transition(this.initialState);
			},
			'float': function () {
				this.transition('floating');
			},
			'collide': function (collisions) {
				collisions.forEach(host.onCollision, host);

				if(host.animation.subsets['fall'].atLastFrame()) {

					// Continue setting the image so we can display the last
					// frame for it's full duration.  When we loop, we'll
					// know that the animation has played all the way thru.
					host.setImage(
						host.animation.subsets['fall'].next()
					);

					// We've looped.  Time to die!
					if(host.animation.subsets['fall'].atFirstFrame()) {
						host.destroy();

						// Wait a second before telling listeners that we've
						// died.  They're going to be really sad... break it
						// to them gently.
						setTimeout(function() {
							host.signals.fell.dispatch(host);
						}, 1000);
					}

				}

				else {
					host.setImage(
						host.animation.subsets['fall'].next()
					);
				}
				
				if(!host.shouldFall(collisions)) this.transition('grounded');
			},
			'update': function () {
				this.applyFrictionX();
				this.applyFrictionY();
				this.update();
			}
		},
		'grounded': {
			'collide': function (collisions) {
				collisions.forEach(host.onCollision, host);
				if(host.shouldFall(collisions)) {
					this.transition('falling');
				}
			},
			'move': function (bearing) {
				this.accelerate(bearing);
			},
			'update': function () {
				// TODO: Should we *always* apply friction? or just when there's no movement input?
				this.applyFrictionX();
				this.applyFrictionY();
				this.update();
			}
		}
	},

	applyFrictionX: function () {
		// X axis friction.
		if (this.vx > 0) {
			this.vx -= this.FRICTION;
		} 

		else if (this.vx < 0) {
			this.vx += this.FRICTION;
		}

		if(Math.abs(this.vx) < this.FRICTION) {
			this.vx = 0;
		}
	},

	applyFrictionY: function () {
		// Y axis this.friction.
		if (this.vy > 0) {
			this.vy -= this.FRICTION;
		} 

		else if (this.vy < 0) {
			this.vy += this.FRICTION;
		}

		if(Math.abs(this.vy) < this.FRICTION) {
			this.vy = 0;
		}
	},

	accelerate: function (bearing) {
		this.ax += typeof bearing.x === 'number' ? bearing.x * this.MAX_ACCEL : 0;
		this.ay += typeof bearing.y === 'number' ? bearing.y * this.MAX_ACCEL : 0;
	},

	update: function () {
		this.ax = this.ax.clamp(-this.MAX_ACCEL, this.MAX_ACCEL);
		this.ay = this.ay.clamp(-this.MAX_ACCEL, this.MAX_ACCEL);

		this.vx += this.ax;
		this.vy += this.ay;

		this.vx = this.vx.clamp(-this.MAX_VEL, this.MAX_VEL);
		this.vy = this.vy.clamp(-this.MAX_VEL, this.MAX_VEL);

		host.x += this.vx;
		host.y += this.vy;

		this.ax = 0;
		this.ay = 0;
	}
});
};

return Movement;

});

// TODO: Move Number.clamp convenience method to someplace where it makes sense.
// Thanks, numerous posts on the Internet!
Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};