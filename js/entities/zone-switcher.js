define(
['jaws', '$', 'DATABASE', 'states/load-state'],
function (jaws, $, DATABASE, LoadState) {

function ZoneSwitcher(options) {
	// TODO: Character extension check is kinda hack-y...
	var isExtending = false;
	if(!Object.keys(options).length) {
		isExtending = true;
	}

	this.options = $.extend({}, options);

	// Call super-class.
	jaws.Sprite.call(this, this.options);

	if(isExtending) return;

	// Reference to game world data.
	this._gameData = this.options.gameData;

	// These options will not be able to be set if this constructor is being
	// called as a means to extend it.
	if(this.options){
		// Set up Sprite animations.
		this.animation = new jaws.Animation({
			sprite_sheet  : this.options.sprite_sheet,
			frame_size    : this.options.frame_size,
			frame_duration: this.options.frame_duration,
			subsets       : this.options.animationSubsets
		});
		
		this.radius = this.options.radius;
	}
}

ZoneSwitcher.prototype = new jaws.Sprite({});

ZoneSwitcher.prototype.update = function () {
	// Check for collision with the Player.
	if (jaws.collideCircles({
			radius: this.radius,
			x: this.x,
			y: this.y
		}, this._gameData.players[0])) {
		console.log("take me away!");
		this.loadZone();
	}
	
};

ZoneSwitcher.prototype.draw = function () {
	this.setImage(this.animation.subsets["loop"].next());
	// Call original jaws.Sprite.draw() function.
	jaws.Sprite.prototype.draw.call(this);
};

ZoneSwitcher.prototype.loadZone = function () {
	
	this._gameData.url = "assets/tmx/import-test.tmx";
	console.log(LoadState);
	// Populate 
	jaws.switchGameState(LoadState,
						// Start-up Options
						{
							fps: 60
						},
						this._gameData);
};

ZoneSwitcher.prototype.put = function () {
	// TODO: Add a way to put items places, like in a container or tilemap?
};

ZoneSwitcher.prototype.move = function (x, y) {
	this.x = x;
	this.y = y;
};

return ZoneSwitcher;

});
