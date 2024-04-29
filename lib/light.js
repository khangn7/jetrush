import { dotProduct } from "./math_functions.js";
import { LIGHT_V } from "./settings.js";


/**
 * 
 * @param {Array[Number]} color [256, 256, 256]
 */
export function sunlight(color, normal) {
    // cross product of two vectors of magnitude 1 is <= 1
    let light_index = (-dotProduct(LIGHT_V, normal) + 1)/2;
    for (let i = 0; i < 3; i++) {
        color[i] *= light_index
    }
}