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

// // map angle to range of -pi to pi
// export function map_angle_to_range(angle) {
//     let twopi = 2 * Math.PI
//     let mod2pi = angle % twopi;
//     mod2pi = (mod2pi + twopi) % twopi;
//     if (mod2pi >= Math.PI) {
//         return mod2pi - twopi;
//     } else {
//         return mod2pi;
//     }
// }

const two_pi = 2 * Math.PI;
// /**
//  * notation: [x, y, z], where z faces "out" of the screen towards the viewer
//  * rotates basis vector of [0, 0, 1]. details in google doc
//  * @param {Number} theta // radians, angle vector makes with [0, 1, 0]
//  * @param {Number} phi  // radians, angle vector makes with [0, 0, 1]
//  */
// export function rotated_basis_vector(theta, phi) {

//     let sin_theta = Math.abs(Math.sin(theta));
//     return new Vector(
//         sin_theta * Math.sin(phi),
//         Math.cos(theta),
//         sin_theta * Math.cos(phi)
//     )
// }

// /**
//  * returns angles for i-hat and j-hat given angle for k-hat as defined in google doc
//  * @param {Number} k_theta 
//  * @param {Number} k_phi 
//  * @returns {} 
//  */
// export function translate_angles(k_theta, k_phi) {

//     const half_pi = Math.PI * 0.5;
//     const two_pi = Math.PI * 2;

//     let j_theta = k_theta - half_pi;
//     let j_phi;
//     let j_test = Math.floor(j_theta / two_pi);
//     if (j_test % 2 == Math.floor(k_phi / two_pi) % 2) {
//         j_phi = k_phi;
//     } else {
//         j_phi = k_phi + Math.PI;
//     }

//     return [[half_pi, k_phi + half_pi], [j_theta, j_phi]];
// }

/**
 * 
 * @param {Vector} vector [x, y, z]
 * @param {Array} i_hat basis vector x scales
 * @param {Array} j_hat basis vector y scales
 * @param {Array} k_hat basis vector z scales
 * 
 * @returns {Vector} linear combination
 */
export function linear_combination3d(vector, i_hat, j_hat, k_hat) {
    // return new Vector(
    //     vector.x * i_hat.x + vector.y * j_hat.x + vector.z * k_hat.x,
    //     vector.x * i_hat.y + vector.y * j_hat.y + vector.z * k_hat.y,
    //     vector.x * i_hat.z + vector.y * j_hat.z + vector.z * k_hat.z
    // );
    return new Vector(
        vector.x * i_hat[0] + vector.y * j_hat[0] + vector.z * k_hat[0],
        vector.x * i_hat[1] + vector.y * j_hat[1] + vector.z * k_hat[1],
        vector.x * i_hat[2] + vector.y * j_hat[2] + vector.z * k_hat[2]
    );
}

/**
 * 
 * @param {*} rotate_angle 
 * @param {*} rotation_axis 0 for x, 1 for y, 2 for z
 * 
 * @returns {Array[Array]} matrix [column1, column2, column3]
 * from here https://en.wikipedia.org/wiki/Rotation_matrix
 */
export function rotation_matrix(rotate_angle, rotation_axis) {
    let cos = Math.cos(rotate_angle),
        sin = Math.sin(rotate_angle);
    let m = {
        0: [
            [1, 0, 0], // column for i hat
            [0, cos, sin], // j hat
            [0, -sin, cos]  // k hat
        ],
        1: [
            [cos, 0, -sin],
            [0, 1, 0],
            [sin, 0, cos]
        ],
        2: [
            [cos, sin, 0],
            [-sin, cos, 0],
            [0, 0, 1]
        ]
    };
    return m[String(rotation_axis)];
}

/**
 * 
 * @param {Vector} v1 
 * @param {Vector} v2 
 * @returns {Vector} v2 - v1
 */
export function subtractVectors(v1, v2) {
    return new Vector(
        v2.x - v1.x,
        v2.y - v1.y,
        v2.z - v1.z,
    )
}
/**
 * 
 * @param {Vector} v1 
 * @param {Vector} v2 
 * @returns {Vector} v1 + v2
 */
export function addVectors(v1, v2) {
    return new Vector(
        v2.x + v1.x,
        v2.y + v1.y,
        v2.z + v1.z,
    )
}

/**
 * 
 * @param {Vector} v 
 * @param {Number} s 
 * @returns {Vector}
 */
export function scaledVector(v, s) {
    return new Vector(v.x * s, v.y * s, v.z * s);
}


/**
 * 
 * @param {Vector} v1
 * @param {Vector} v2
 * @returns {Vector} v1 x v2
 */
export function crossProduct(v1, v2) {
    return new Vector(
        v1.y * v2.z - v1.z * v2.y,
        v1.z * v2.x - v1.x * v2.z,
        v1.x * v2.y - v1.y * v2.x
    )
}

/**
 * 
 * @param {Vector} v1 
 * @param {Vector} v2 
 * @returns {Number} v1 dot v2
 */
export function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

/**
     * rotates vector around axis described by theta and phi
     * @param {Vector} v
     * @param {Number} rotate_angle angle of rotation
     * @param {Number} theta angle that axis of rotation makes with positive y axis
     * @param {Number} phi angle that axis of rotation makes with positive z axis
     */
export function rotate_v_around_k(v, rotate_angle, theta, phi) {
    // note: do the math and compose these into one matrix
    // axis of rotation is k

    // step 1
    // transform v with R(v) such that R(k) lies on x=0 plane
    // aka rotate around y-axis by -phi
    let r_matrix = rotation_matrix(-phi, 1);
    v = linear_combination3d(v, r_matrix[0], r_matrix[1], r_matrix[2]);

    // step 2
    // transform v such that R(k) lies on positive y axis
    // aka rotate around x-axis by -theta
    r_matrix = rotation_matrix(-theta, 0);
    v = linear_combination3d(v, r_matrix[0], r_matrix[1], r_matrix[2]);
    
    // step 3
    // now that k lies on positive y axis, rotate v around y-axis
    r_matrix = rotation_matrix(rotate_angle, 1);
    v = linear_combination3d(v, r_matrix[0], r_matrix[1], r_matrix[2]);

    // step 4
    // rotate so that k would be back where it was in step 2
    // aka rotate around x-axis by theta
    r_matrix = rotation_matrix(theta, 0);
    v = linear_combination3d(v, r_matrix[0], r_matrix[1], r_matrix[2]);
    // note: matrix composition not commutative so doesn't cancel out step 2?

    // step 5
    // rotate so that k would be back where it was in step 1
    // aka rotate around y-axis by phi
    r_matrix = rotation_matrix(phi, 1);
    v = linear_combination3d(v, r_matrix[0], r_matrix[1], r_matrix[2]);

    return v;
}