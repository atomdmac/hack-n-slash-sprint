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
					"secondaryAttack": "right_mouse_button"
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