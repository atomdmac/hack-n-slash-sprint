var DATABASE = DATABASE ? DATABASE : {};
DATABASE.spells = {
    "ShockNova": {
		label: "Shock Nova",
        description: "A ring of electricity blasts out from the caster, damaging all enemies within its radius.",
        spawnX: 0,
		spawnY: 0,
		scale: 1,
		sprite_sheet: "assets/png/entities/spells/shockNova.png",
		frame_size: [128, 128],
		frame_duration: 100,
		animationSubsets: {
			cast:  [0,3]
		},
		anchor: [0.5, 0.5],
		radius: 0,
		steps: [
			{
				radius: 16
			},
			{
				radius: 40
			},
			{
				radius: 64
			}
		],
		eligibleTargets: [],
		onFinish: null
	}
};