define(
['jaws', 'lib/machina', 'TimelineLite', 'TweenLite'],
function (jaws, machina, Timeline, Tween) {

var PauseScreenState = machina.Fsm.extend({
	// Reference to the gameData object.
	gameData: null,

	// Gamepad instance.
	// TODO: Replace with Tamepad
	gamepad: null,

	// Tweens (Created in initialize()).
	tweens: {
		intro: null,
		outro: null,
	},

	// Tweenable properties
	alpha: 0,

	initialize: function () {
		this.tweens.intro = TweenLite.fromTo(this, 0.5, {alpha: 0}, {alpha: 1});
		this.tweens.intro.pause(0);
		this.tweens.outro = TweenLite.fromTo(this, 0.5, {alpha: 1}, {alpha: 0});
		this.tweens.outro.pause(0);
	},

	setup: function (gameData) {
		this.gameData = gameData;
		this.open();
	},
	update: function () {
		this.handle('update');
	},
	draw: function () {
		
		// Draw PlayState in the background.
		this.gameData.states.play.draw();

		var ctx = jaws.context;
		ctx.save();

		// Draw overlay.
		ctx.globalAlpha = this.alpha;
		ctx.fillStyle = '#000';
		ctx.beginPath();
		ctx.rect(0, 0, jaws.width, jaws.height);
		ctx.fill();

		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';

		ctx.fillStyle = 'rgba(255, 255, 255, 0.25';
		ctx.font = '86px Arial';
		ctx.fillText('PAUSED', jaws.width / 2, jaws.height / 2 - 86);
		
		ctx.fillStyle = '#FFF';
		ctx.font = '24px Arial';
		ctx.fillText('Press ' + (this.gamepad ? 'Start' : 'Space') + ' to Resume.', jaws.width / 2, jaws.height / 2);

		ctx.restore();
	},

	open: function () {
		if(this.state === 'closed') this.transition('opening');
	},
	close: function () {
		if(this.state === 'opened') this.transition('closing');
	},

	checkKeyboardInput: function () {
		if(jaws.pressed('esc')) {
			this.transition('closing');
			return true;
		}
	},
	checkGamepadInput: function () {
		var hasInput = false;

		// Setup gamepad if not already done.
		if (!this.gamepad && jaws.gamepads[0]) {
			this.gamepad = jaws.gamepads[0]; // Only use first gamepad for now...
		}
		if(!this.gamepad) return false;
		
		if(this.gamepad.buttons[9].pressed) {
			this.transition('closing');
			hasInput = true;
		}

		return hasInput;
	},

	initialState: 'closed',
	states: {
		'opening': {
			_onEnter: function () {
				this.tweens.intro.play(0);
			},
			'update': function () {
				if(this.tweens.intro.totalProgress() === 1) {
					this.transition('opened');
				}
			}
		},
		'opened': {
			'update': function () {
				if(!this.checkGamepadInput()) this.checkKeyboardInput();
			}
		},
		'closing': {
			_onEnter: function () {
				this.tweens.outro.play(0);
			},
			'update': function () {
				if(this.tweens.outro.totalProgress() === 1) {
					this.transition('closed');
				}
			}
		},
		'closed': {
			_onEnter: function () {
				if(this.gameData) jaws.switchGameState(this.gameData.states.play, {}, this.gameData);
			}
		}
	}
});

return PauseScreenState;

});