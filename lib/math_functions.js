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
