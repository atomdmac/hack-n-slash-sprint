define(
['jaws', '$', '_', 'states/tab', 'states/menu/dial-ui', 'states/menu/grid-ui'], 
function (jaws, $, _, Tab, DialUI, GridUI) {

var EquipmentMenu = function (config) {
	var _defaults = {
		title   : 'Equipment',
		_gamepad: null,
		wedges  : null,
		angleOffset  : 0,
		numberOfItems: 0,
	};

	config = $.extend(true, config, _defaults);

	Tab.call(this, config);

	// Initialize DialUI.
	this._equipmentDialUi = new DialUI({
		ctx: jaws.context,
		cx: 250,
		cy: 250
	});

	this._equipmentGridUi = new GridUI({
		ctx: jaws.context,
		x: 250,
		y: 250
	});
};

EquipmentMenu.prototype = Object.create(Tab.prototype);

EquipmentMenu.prototype.draw = function () {
	this._equipmentGridUi.draw();
};

EquipmentMenu.prototype.update = function () {
	// Handle mouse/keyboard input.
	this._handleMouseKeyboardInput();

	// Handle gamepad input.
	this._handleGamepadInput();
};

EquipmentMenu.prototype._handleMouseKeyboardInput = function () {
	if(jaws.pressedWithoutRepeat('w')) {
		this._equipmentGridUi.moveUp();
	}

	if(jaws.pressedWithoutRepeat('s')) {
		this._equipmentGridUi.moveDown();
	}

	if(jaws.pressedWithoutRepeat('a')) {
		this._equipmentGridUi.moveLeft();
	}

	if(jaws.pressedWithoutRepeat('d')) {
		this._equipmentGridUi.moveRight();
	}
};

EquipmentMenu.prototype._handleGamepadInput = function () {
	// Setup gamepad if not already done.
	if (!this._gamepad && jaws.gamepads[0]) {
		this._gamepad = jaws.gamepads[0]; // Only use first gamepad for now...
	}
	if(!this._gamepad) return false;

	// Record move action
	var moveJoystickData = jaws.gamepadReadJoystick(this._gamepad, 'left');
	if(Math.abs(moveJoystickData.analogX) > 0.25 || Math.abs(moveJoystickData.analogY) > 0.25) {
		this._equipmentGridUi.move(moveJoystickData.analogX, moveJoystickData.analogY);
	}
};

return EquipmentMenu;

});