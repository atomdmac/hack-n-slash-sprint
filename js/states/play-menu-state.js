define(['jaws', '_', 'states/tab-collection', 'states/menu/equipment-menu', 'states/tab'], 
function (jaws, _, TabCollection, EquipmentMenu, Tab) {

var PlayMenuState = function (options) {
    var defaults = {
        gameData: null,
        gamepad: null
    };
    _.extend(this, defaults, options);
 
    // Create menu.
    this.tabCollection = new TabCollection();
    this.tabCollection.add(new EquipmentMenu());
    for(var i=0; i<3; i++) {
        this.tabCollection.add(new Tab({
            title: 'Tab ' + i
        }));
    }
};

PlayMenuState.prototype.update = function () {
    this.checkKeyboardInput();
    this.checkGamepadInput();
    this.tabCollection.update();
};

PlayMenuState.prototype.draw = function () {
    this.tabCollection.draw();
};

PlayMenuState.prototype.checkKeyboardInput = function () {
    if(jaws.pressed('esc') ){
        jaws.switchGameState(jaws.previous_game_state, {}, this.gameData);
    }
};

PlayMenuState.prototype.checkGamepadInput = function () {
    // Setup gamepad if not already done.
    if (!this.gamepad && jaws.gamepads[0]) {
        this.gamepad = jaws.gamepads[0]; // Only use first gamepad for now...
    }
    if(!this.gamepad) return false;
    
    if(this.gamepad.buttons[1].pressed) {
        jaws.switchGameState(jaws.previous_game_state, {}, this.gameData);
    }
};

return PlayMenuState;

});