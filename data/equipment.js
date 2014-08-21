define(
[],
function () {
	return {
		"base": {
			width: 32,
			height: 32,
			scale: 2,
			anchor: [0.5, 0.5625],
			frame_size: [64, 64],
			frame_duration: 100,
			animationSubsets: {
				unequipped: [0,1]
			},
			radius: 8
		},
		"Sword": {
			label: "Sword",
			sprite_sheet: "assets/png/equipment/FF4_Sword.png",
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
			sprite_sheet: "assets/png/equipment/FF4_LeatherTunicEdge.png",
			equipSlot: "tunic",
			bonuses: {
				damageReductionPhysical: 3
			}
		},
		"Hot Feet": {
			label: "Hot Feet",
			sprite_sheet: "assets/png/equipment/FF4_HotFeet.png",
			equipSlot: "footwear",
			bonuses: {
				movementSpeedIncrease: 1.5
			}
		}
	};
});