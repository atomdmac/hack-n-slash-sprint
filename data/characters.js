define(
['../data/items'],
function (items) {

return {
    "base": {
		label: "no label",
		spawnX: 0,
		spawnY: 0,
		width: 32,
		height: 32,
		tileMap: null,
		sprite_sheet: null,
		scale: 1,
		anchor: [0.5, 0.5625],
		frame_size: [128, 128],
		frame_duration: 100,
		animationSubsets: {
			paperdoll:    [1,2],
			S:            [2,4],
			N:            [4,6],
			W:            [6,8],
			E:            [8,10],
			attack_S:     [10,13],
			attack_N:     [13,16],
			attack_W:     [16,19],
			attack_E:     [19,22],
			damage:       [24,25],
			dead:         [25,26]
		},
		radius: 8,
		bearing: "S",
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
			attack: null,
			useActiveItem: null,
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
	"Chuck": {
		label: "Chuck",
		sprite_sheet: "assets/png/entities/Chuck.png"
	},
	"Edge": {
		label: "Edge",
		sprite_sheet: "assets/png/entities/FF4_Edge.png"
	},
	"Tellah": {
		label: "Tellah",
		sprite_sheet: "assets/png/entities/FF4_Tellah.png"
	}
};

});