define(
[],
function () {
	return {
		"Sword": {
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
			equipSlot: "tunic",
			bonuses: {
				damageReductionPhysical: 3
			}
		}
	};
});