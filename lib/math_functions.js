export class Vector {
    /**
     * // don't preemptively translate to center of canvas. just act as if (0, 0) is center
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z
    }
}

// map angle to range of -pi to pi
export function map_angle_to_range(angle) {
    // if (angle < 0) {
    //     throw "this function only works for positive angles";
    // }
    let twopi = 2 * Math.PI
    let mod2pi = angle % twopi;
    if (mod2pi >= Math.PI) {
        // console.log(mod2pi - twopi)
        return mod2pi - twopi;
    } else {
        // console.log(mod2pi);
        return mod2pi;
    }
}

const two_pi = 2 * Math.PI;
/**
 * notation: [x, y, z], where z faces "out" of the screen towards the viewer
 * rotates basis vector of [0, 0, 1]. details in google doc
 * @param {Number} theta // radians, angle vector makes with [0, 1, 0]
 * @param {Number} phi  // radians, angle vector makes with [0, 0, 1]
 */
export function rotated_basis_vector(theta, phi) {

    let sin_theta = Math.abs(Math.sin(theta));
    return new Vector(
        sin_theta * Math.sin(phi),
        Math.cos(theta),
        sin_theta * Math.cos(phi)
    )
}

/**
 * returns angles for i-hat and j-hat given angle for k-hat as defined in google doc
 * @param {Number} k_theta 
 * @param {Number} k_phi 
 * @returns {} 
 */
export function translate_angles(k_theta, k_phi) {

    const half_pi = Math.PI * 0.5;
    const two_pi = Math.PI * 2;

    let j_theta = k_theta - half_pi;
    let j_phi;
    let j_test = Math.floor(j_theta / two_pi);
    if (j_test % 2 == Math.floor(k_phi / two_pi) % 2) {
        j_phi = k_phi;
    } else {
        j_phi = k_phi + Math.PI;
    }

    return [[half_pi, k_phi + half_pi], [j_theta, j_phi]];
    // return {
    //     "i": {
    //         theta: half_pi, 
    //         phi: k_phi + half_pi},
    //     "j": {
    //         theta: j_theta, 
    //         phi: j_phi
    //     }
    // };
}

/**
 * 
 * @param {Vector} vector [x, y, z]
 * @param {Vector} i_hat basis vector x scales
 * @param {Vector} j_hat basis vector y scales
 * @param {Vector} k_hat basis vector z scales
 * 
 * @returns {Vector} linear combination
 */
export function linear_combination3d(vector, i_hat, j_hat, k_hat) {
    return new Vector(
        vector.x * i_hat.x + vector.y * j_hat.x + vector.z * k_hat.x,
        vector.x * i_hat.y + vector.y * j_hat.y + vector.z * k_hat.y,
        vector.x * i_hat.z + vector.y * j_hat.z + vector.z * k_hat.z
    );
}