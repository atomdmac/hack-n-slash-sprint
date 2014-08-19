define(
[],
function () {
	return {
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
		}
	};
});