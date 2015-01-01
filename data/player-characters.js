define(
[],
function () {
	return {
		"base": {
			input: {
				mouseAndKeyboard: {
					"moveUp"   : "w",
					"moveDown" : "s",
					"moveLeft" : "a",
					"moveRight": "d",
					"attack": ",",
					"useActiveItem": "."
				},
				gamepad: {
					"move": "left",			// Assumes joystick
					"attack": 0,			// A
					"useActiveItem": 1		// B
				}
			}
		}
	};
});