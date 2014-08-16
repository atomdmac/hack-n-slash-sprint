var DATABASE = DATABASE ? DATABASE : {};
DATABASE.characters = {
    "base": {
		spawnX: 0,
		spawnY: 0,
		scale: 1,
		width: 32,
		height: 32,
		baseSpeed: 5,
		speedMultiplier: 1,
		maxSpeed: 5,
		tileMap: null,
		sprite_sheet: null,
		frame_size: [16, 16],
		frame_duration: 100,
		animationSubsets: {
			down:  null,
			up:    null,
			left:  null,
			right: null,
			damage: null,
			dead: null
		},
		anchor: [0.5, 0.75],
		radius: 8,
		stats: {
			resources: {
				health: {
					max: 100,
					points: 100,
					regen: 1
				},
				mana: {
					max: 100,
					points: 100,
					regen: 1
				},
				stamina: {
					max: 100,
					points: 100,
					regen: 1
				}
			},
			damageReduction: {
				physical: 0,
				magic: 0
			},
			penetration: {
				physical: 0,
				magic: 0
			}
		}
	},
	"Edge": {
		sprite_sheet: "assets/png/entities/FF4_EdgeSheet.png",
		scale: 2,
		frame_size: [16,16],
		frame_duration: 100,
		animationSubsets: {
			down:  [0,2],
			up:    [2,4],
			left:  [4,6],
			right: [6,8],
			damage:[10,11],
			dead:  [11,12]
		},
		baseSpeed: 2,
		maxSpeed: 2
	},
	"Tellah": {
		sprite_sheet: "assets/png/entities/FF4_TellahSheet.png",
		scale: 2,
		frame_size: [16,16],
		frame_duration: 100,
		animationSubsets: {
			down:  [0,2],
			up:    [2,4],
			left:  [4,6],
			right: [6,8],
			damage:[10,11],
			dead:  [11,12]
		},
		baseSpeed: 0.5,
		maxSpeed: 0.5
	}
};