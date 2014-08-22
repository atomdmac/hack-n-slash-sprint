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
					"primaryAttack": "left_mouse_button",
					"secondaryAttack": "right_mouse_button",
					"equipInspected": "f",
					"debug1": "1",
					"debug2": "2",
					"debug3": "3"
				},
				gamepad: {
					"move": "left",				// Assumes joystick
					"primaryAttack": "right",	// Assumes joystick
					"secondaryAttack": 0,		// A
					"equipInspected": 2,		// X
					"debug1": 1,				// B
					"debug2": 4,				// Left Bumper
					"debug3": 3					// Y
				}
			}
		}
	};
});