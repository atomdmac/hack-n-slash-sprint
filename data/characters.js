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
			south:  null,
			north:    null,
			west:  null,
			east: null,
			damage: null,
			dead: null
		},
		radius: 8,
		bearing: "south",
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
		sprite_sheet: "assets/png/entities/FF4_Edge.png",
		scale: 2,
		anchor: [0.5, 0.5625],
		frame_size: [64, 64],
		frame_duration: 100,
		animationSubsets: {
			south:        [0,2],
			north:        [2,4],
			west:         [4,6],
			east :        [6,8],
			attack_south: [8,11],
			attack_north: [11,14],
			attack_west:  [14,17],
			attack_east:  [17,20],
			damage:       [22,23],
			dead:         [23,24]
		}
	},
	"Tellah": {
		sprite_sheet: "assets/png/entities/FF4_Tellah.png",
		scale: 2,
		anchor: [0.5, 0.5625],
		frame_size: [64, 64],
		frame_duration: 100,
		animationSubsets: {
			south:        [0,2],
			north:        [2,4],
			west:         [4,6],
			east :        [6,8],
			attack_south: [8,11],
			attack_north: [11,14],
			attack_west:  [14,17],
			attack_east:  [17,20],
			damage:       [22,23],
			dead:         [23,24]
		}
	}
};

});