import {
    RandomPower,
    RedPotion, BluePotion, Hourglass, HealthLive, Coin, OxygenTank,
    BlackHole, Cauldron, IceDrink, IceCube, Confuse, DeadSkull, CarbonDioxideTank,
} from "../entities/powerUpAndDown.js";

export const POWER_UP_SPAWN_CONFIG = [
    { type: RandomPower, chance: 0.0025 },
    { type: RedPotion,   chance: 0.005 },
    { type: BluePotion,  chance: 0.005 },
    { type: Hourglass,   chance: 0.005 },
    { type: HealthLive,  chance: 0.005 },
    { type: Coin,        chance: 0.005 },
    { type: OxygenTank,  chance: 0.005, underwaterOnly: true },
];

export const POWER_DOWN_SPAWN_CONFIG = [
    { type: RandomPower,        chance: 0.0025 },
    { type: IceDrink,           chance: 0.005 },
    { type: IceCube,            chance: 0.005 },
    { type: Cauldron,           chance: 0.005 },
    { type: BlackHole,          chance: 0.005 },
    { type: Confuse,            chance: 0.005 },
    { type: DeadSkull,          chance: 0.005 },
    { type: CarbonDioxideTank,  chance: 0.005, underwaterOnly: true },
];
