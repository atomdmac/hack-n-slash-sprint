define(
[],
function () {

return {
    "base": {
		x: 0,
		y: 0,
		width: 32,
		height: 32,
		tileMap: null,
		sprite_sheet: null,
		scale: 1,
		anchor: [0.5, 0.5],
		frame_size: [32, 32],
		frame_duration: 100,
		animationSubsets: {
			loop:    [0,1]
		},
		radius: 12
	},
	"ZoneSwitcher": {
		sprite_sheet: "assets/png/entities/portal.png",
		animationSubsets: {
			loop:    [0,3]
		}
	}
};

});