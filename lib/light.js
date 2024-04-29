import { dotProduct } from "./math_functions.js";
import { FADE_MAX, LIGHT_V } from "./settings.js";


/**
 * 
 * @param {Array[Number]} color [256, 256, 256]
 */
export function sunlight(color, normal) {
    // cross product of two vectors of magnitude 1 is <= 1
    let light_index = 0.5 + (-dotProduct(LIGHT_V, normal) + 1)/4;
    return color.map(x => x * light_index)
}

/**
 * 
 * @param {Array[Number]} color [256, 256, 256]
 * @param {Number} dist sqrt(dx**2 + dz**2) from 0,0,0
 */
export function fade(color, dist) {
    return color.map(x => x + (256 - x) * (dist / FADE_MAX))
}