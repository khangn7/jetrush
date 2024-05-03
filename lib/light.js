import { dotProduct } from "./math_functions.js";
import { FADE_MAX, LIGHT_V } from "./settings.js";


/**
 * 
 * @param {Array[Number]} color [256, 256, 256]
 */
export function sunlight(color, normal, min_scale=0) {
    // cross product of two vectors of magnitude 1 is <= 1
    let light_index = min_scale + (1 - min_scale) * (-dotProduct(LIGHT_V, normal) + 1)/2;
    // let light_index = (-dotProduct(LIGHT_V, normal) + 1)/2;
    return color.map(x => x * light_index)
}

/**
 * 
 * @param {Array[Number]} color [256, 256, 256]
 * @param {Number} dist sqrt(dx**2 + dz**2) from 0,0,0
 * 
 * #6CB4EE
 */
// const FADE_TO = [0,10,10]
const FADE_TO = [256, 256, 256]
export function fade(color, dist) {
    return color.map((x,i) => x + (FADE_TO[i] - x) * (dist / FADE_MAX))
}