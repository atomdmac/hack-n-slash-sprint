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
			equipSlot: null,
			mass: 0,
			passable: true
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
			frame_size: [12, 16],
			hookable: true
		},
		"Cash Money": {
			type: "resource",
			label: "Cash Money",
			sprite_sheet: "assets/png/items/CashMoney.png",
			resources: {
				currency: 10
			},
			width: 16,
			height: 20,
			scale: 1,
			anchor: [0.5, 0.5],
			frame_size: [16, 20]
		},
		"Clay Pot": {
			interaction: "lift",
			label: "Clay Pot",
			sprite_sheet: "assets/png/items/ClayPot.png",
			width: 20,
			height: 20,
			scale: 1,
			anchor: [0.5, 0.5],
			frame_size: [20, 20]
		},
		"Target": {
			label: "Target",
			sprite_sheet: "assets/png/items/Target.png",
			width: 28,
			height: 28,
			scale: 1,
			radius: 14,
			anchor: [0.5, 0.5],
			frame_size: [28, 28],
			hookable: true,
			mass: 300
		},
		"Switch": {
			label: "Switch",
			sprite_sheet: "assets/png/items/Switch.png",
			width: 28,
			height: 28,
			scale: 1,
			radius: 14,
			anchor: [0.5, 0.5],
			frame_size: [28, 28],
			frame_duration: 100,
			animationSubsets: {
				off: [0,1],
				on: [1,2]
			},
			passable: false
		},
		"Platform": {
			label: "Platform",
			type: "platform",
			sprite_sheet: "assets/png/items/Platform.png",
			width: 32,
			height: 32,
			scale: 1,
			radius: 16,
			anchor: [0, 0],
			frame_size: [32, 32],
			passable: true
		},
		"Sword": {
			label: "Sword",
			sprite_sheet: "assets/png/items/Sword.png",
			equipSlot: "attack",
			attack: {
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