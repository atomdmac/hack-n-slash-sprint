define(
['../data/equipment'],
function (equipment) {

return {
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
		resources: {
			health: 100,
			mana: 100,
			stamina: 100
		},
		// TODO: Implement max regen, damage reduction, and penetration rates.
		stats: {
			maxHealth: 100,
			maxMana: 100,
			maxStamina: 100,
			regenRateHealth: 1,
			regenRateMana: 1,
			regenRateStamina: 1,
			damage: 2,
			damageReductionPhysical: 0,
			damageReductionMagic: 0,
			penetrationPhysical: 0,
			penetrationMagic: 0
		},
		equipment: {
			primaryAttack: equipment["Sword"],
			secondaryAttack: null,
			offhand: null,
			tunic: equipment["Leather Tunic"],
			sleeves: null,
			gloves: null,
			leggings: null,
			footwear: null,
			gorget: null,
			head: null,
			ring: null,
			amulet: null
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

});