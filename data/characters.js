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
		tileMap: null,
		sprite_sheet: null,
		anchor: [0.5, 0.5625],
		frame_size: [64, 64],
		frame_duration: 100,
		animationSubsets: {
			down:  null,
			up:    null,
			left:  null,
			right: null,
			damage: null,
			dead: null
		},
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
			penetrationMagic: 0,
			movementSpeed: 1,
			movementSpeedIncrease: 0,
			maxMovementSpeed: 5
		},
		equipment: {
			primaryAttack: null,
			secondaryAttack: null,
			offhand: null,
			tunic: null,
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
		anchor: [0.5, 0.5625],
		frame_size: [64, 64],
		frame_duration: 100,
		animationSubsets: {
			down:         [0,2],
			up:           [2,4],
			left:         [4,6],
			right:        [6,8],
			attack_down:  [8,10],
			attack_up:    [10,12],
			attack_left:  [12,14],
			attack_right: [14,16],
			damage:       [20,21],
			dead:         [21,22]
		}
	},
	"Tellah": {
		sprite_sheet: "assets/png/entities/FF4_TellahSheet.png",
		scale: 2,
		anchor: [0.5, 0.5625],
		frame_size: [64, 64],
		frame_duration: 100,
		animationSubsets: {
			down:         [0,2],
			up:           [2,4],
			left:         [4,6],
			right:        [6,8],
			attack_down:  [8,10],
			attack_up:    [10,12],
			attack_left:  [12,14],
			attack_right: [14,16],
			damage:       [20,21],
			dead:         [21,22]
		}
	}
};

});