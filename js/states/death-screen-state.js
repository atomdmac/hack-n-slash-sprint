define(
['jaws'],
function (jaws) {

var DeathScreenState = function () {

	var gameData, gamepad;

	this.alpha = 0;

	this.setup = function (_gameData) {
		this.alpha = 0;
		gameData = _gameData;
	};

	this.update = function () {
		if(!this.checkGamepadInput()) this.checkKeyboardInput();
	};

	this.checkKeyboardInput = function () {
		if(jaws.pressed('space')) {
			jaws.switchGameState(gameData.states.load, {}, gameData);
			return true;
		}
	};

	this.checkGamepadInput = function () {
		var hasInput = false;

		// Setup gamepad if not already done.
		if (!gamepad && jaws.gamepads[0]) {
			gamepad = jaws.gamepads[0]; // Only use first gamepad for now...
		}
		if(!gamepad) return false;
		
		if(gamepad.buttons[9].pressed) {
			jaws.switchGameState(gameData.states.load, {}, gameData);
			hasInput = true;
		}

		return hasInput;
	};

	this.draw = function () {

		if(this.alpha<1) {
			this.alpha += 0.01;
			jaws.previous_game_state.draw();
		}

		var ctx = jaws.context;
		ctx.save();

		ctx.globalAlpha = this.alpha;
		ctx.fillStyle = '#000';
		ctx.beginPath();
		ctx.rect(0, 0, jaws.width, jaws.height);
		ctx.fill();

		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';

		ctx.fillStyle = 'rgba(255, 255, 255, 0.25';
		ctx.font = '86px Arial';
		ctx.fillText('Death Finds You', jaws.width / 2, jaws.height / 2 - 86);
		
		ctx.fillStyle = '#FFF';
		ctx.font = '24px Arial';
		ctx.fillText('Press ' + (gamepad ? 'Start' : 'Space') + ' to Restart.', jaws.width / 2, jaws.height / 2);

		ctx.restore();
	};
};

return DeathScreenState;

});