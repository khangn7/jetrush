import {
    Vector
} from "./math_functions.js"

// default: true
export const PERSPECTIVE = false;

// default: -450
// used to scale x and y during perspective by (PINHOLE_Z/z)
export const VIEWPORT_Z = -1;

// // default: -5
// // stop displaying objects when their most negative vertex in the z
// // direction is higher than HIGHEST_Z
// export const HIGHEST_Z = -5;

// size of viewport in world space
// default: 200
export const VIEWPORT_HEIGHT = 500;

export const LIGHT_V = new Vector(-1, -1, 0);
let mag = Math.sqrt(LIGHT_V.x**2 + LIGHT_V.y**2 + LIGHT_V.z**2);
LIGHT_V.x /= mag;
LIGHT_V.x /= mag;
LIGHT_V.x /= mag;

// should be roughly abs(start_z), start_z from script.js
export const FADE_MAX = 600;

export const INFLATE_SURFACES = true;

export const BUILDING_COLOR = [30,144,255];
export const SHIP_COLOR = [30,144,255];
