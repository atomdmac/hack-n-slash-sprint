define(
[],
function () {
	return {
		"base": {
			input: {
				keyboard: {
					"moveUp"   : "w",
					"moveDown" : "s",
					"moveLeft" : "a",
					"moveRight": "d",
					"attack": ",",
					"useActiveItem": ".",
					"interact": "e"
				},
				gamepad: {
					"move": "left",			// Assumes joystick
					"attack": 0,			// A
					"useActiveItem": 1,		// B
					"interact": 2			// X
				}
			}
		}
	};
});