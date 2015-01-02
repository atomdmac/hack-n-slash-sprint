define(['jaws', '$', '_', 'states/tab'], function (jaws, $, _, Tab) {

var TabCollection = function (config) {

	var _defaults = {
		width: 600,
		height: 400,
		tabWidth: 150,
		tabHeight: 25,
		_selectedTab: null,
		_tabs: null,
		_gamepad: null
	};

	// GROSS HACK CODE
	// Use this to limit how often joystick buttons are polled.
	this._handleGamepadInput = _.throttle(
		TabCollection.prototype._handleGamepadInput, 
		200
	);
	// END GROSS HACK CODE

	// Merge given config with standard config.
	$.extend(true, this, _defaults, config);

	if (!this._tabs) this._tabs = [];
};


TabCollection.prototype.setup = function (setupConfig) {};

TabCollection.prototype.update = function () {
	if(!this._selectedTab) return;

	// Handle mouse/keyboard input.
	this._handleMouseKeyboardInput();

	// Setup gamepad if not already done.
	if (!this._gamepad && jaws.gamepads[0]) {
		this._gamepad = jaws.gamepads[0]; // Only use first gamepad for now...
	}

	// Handle gamepad input.
	this._handleGamepadInput();

	this._selectedTab.update();
};

TabCollection.prototype._handleMouseKeyboardInput = function () {
	if(jaws.pressedWithoutRepeat('left')) {
		this.selectPrevious();
	}
	else if (jaws.pressedWithoutRepeat('right')) {
		this.selectNext();
	}
};

TabCollection.prototype._handleGamepadInput = function () {
	if(this._gamepad) {
		if(this._gamepad.buttons[4].pressed) {
			this.selectPrevious();
		}
		else if(this._gamepad.buttons[5].pressed) {
			this.selectNext();
		}
	}
};

TabCollection.prototype.draw = function () {
	jaws.clear();
	this.drawTabBar();

	if(this._selectedTab) {
		jaws.context.save();
		jaws.context.translate(0, this.tabHeight);
		this._selectedTab.draw();
		jaws.context.restore();
	}
};

TabCollection.prototype.drawTabBar = function () {
	var ctx = jaws.context,
		x, y, w = this.tabWidth, h = this.tabHeight;

	ctx.save();
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	// Loop through our tabs and draw a tab in the bar for each.
	_.forEach(this._tabs, function (tab, index) {

		x = this.tabWidth * index;
		y = 0;

		ctx.beginPath();
		ctx.rect(x, y, w, h);
		ctx.fillStyle = '#fff';
		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000';
		ctx.stroke();

		ctx.font = '14pt Calibri';
		ctx.textAlign = 'center';
		ctx.fillStyle = tab.selected ? '#ff0000' : '#000';
		ctx.fillText(tab.title, x + w / 2, y + h / 2);

	}, this);

	ctx.restore();
};

TabCollection.prototype.add = function (tab) {
	if(!Tab.prototype.isPrototypeOf(tab)) return false;

	tab.width = this.width;
	tab.height = this.height;

	this._tabs.push(tab);
	if(!this._selectedTab) {
		this.select(tab);
	}
};

TabCollection.prototype.selectNext = function () {
	if(!this._selectedTab) return false;

	var index = _.indexOf(this._tabs, this._selectedTab);

	if(index !== -1) {
		index++;
		if (index > this._tabs.length - 1) index = 0;
		this.select(this._tabs[index]);
	}
};

TabCollection.prototype.selectPrevious = function () {
	if(!this._selectedTab) return false;

	var index = _.indexOf(this._tabs, this._selectedTab);

	if(index !== -1) {
		index--;
		if (index < 0) index = this._tabs.length - 1;
		this.select(this._tabs[index]);
	}
};

TabCollection.prototype.select = function (tab) {
	// If given value of 'tab' is a string, search for the first tab that
	// has a 'title' or 'id' that matches.
	if(typeof tab === 'string') tab = _.find(function (item) {
		return item.name === tab || item.id === 'string';
	});

	// Select the new tab, deselect the old tab.
	if(tab) {
		tab.selected = true;
		if(this._selectedTab) this._selectedTab.selected = false;
		this._selectedTab = tab;
	}
};

return TabCollection;

});