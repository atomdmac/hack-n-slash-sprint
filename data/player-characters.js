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
					"debug1": "1",
					"debug2": "2",
					"debug3": "3"
				},
				gamepad: {
					"move": "left",				// Assumes joystick
					"primaryAttack": "right",	// Assumes joystick
					"secondaryAttack": 0,		// A
					"debug1": 1,				// B
					"debug2": 2,				// X
					"debug3": 3					// Y
				}
			}
		}
	};
});