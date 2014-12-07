define(
[],
function () {
	return {
		"base": {
			type: null,
			width: 32,
			height: 32,
			scale: 1,
			anchor: [0.5, 0.5625],
			frame_size: [128, 128],
			frame_duration: 100,
			animationSubsets: {
				unequipped: [0,1]
			},
			radius: 8,
			equipSlot: null
		},
		"Health Potion": {
			type: "resource",
			label: "Health Potion",
			sprite_sheet: "assets/png/items/HealthPotion.png",
			resources: {
				health: 20
			},
			width: 12,
			height: 16,
			scale: 1,
			anchor: [0.5, 0.5],
			frame_size: [12, 16]
		},
		"Sword": {
			label: "Sword",
			sprite_sheet: "assets/png/items/Sword.png",
			equipSlot: "primaryAttack",
			primaryAttack: {
				mode: "melee",
				resource: "health",
				type: "physical"
			},
			bonuses: {
				damage: 3,
				penetrationPhysical: 0.2
			}
		},
		"Leather Tunic": {
			label: "Leather Tunic",
			sprite_sheet: "assets/png/items/LeatherTunic.png",
			equipSlot: "tunic",
			bonuses: {
				damageReductionPhysical: 3
			}
		},
		"Hot Feet": {
			label: "Hot Feet",
			sprite_sheet: "assets/png/items/HotFeet.png",
			equipSlot: "footwear",
			bonuses: {
				movementSpeedIncrease: 1.5
			}
		},
		"Gohan's Boots": {
			label: "Gohan's Boots",
			sprite_sheet: "assets/png/items/GohansBoots.png",
			equipSlot: "footwear",
			bonuses: {
				movementSpeedIncrease: 1
			}
		},
		"Gohan's Hat": {
			label: "Gohan's Hat",
			sprite_sheet: "assets/png/items/GohansHat.png",
			equipSlot: "head",
			bonuses: {
			}
		}
	};
});