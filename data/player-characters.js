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
					"useActiveItem": ".",
					"equipInspected": "x",
					"debug1": "1",
					"debug2": "2",
					"debug3": "3"
				},
				gamepad: {
					"move": "left",			// Assumes joystick
					"attack": 0,			// A
					"useActiveItem": 1,		// B
					"equipInspected": 2,	// X
					"debug2": 4,			// Left Bumper
					"debug3": 3				// Y
				}
			}
		}
	};
});