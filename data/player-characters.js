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
					"move": "left", // Assumes joystick
					"primaryAttack": "right", // Assumes joystick
					"secondaryAttack": 0,
					"debug1": 1,
					"debug2": 2,
					"debug3": 3
				}
			}
		}
	};
});