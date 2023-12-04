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

export class TriPyramid_coords {
    /**
     * 
     * @param {Array[Array[Number]]} points 
     *      given array of [x,y] called a, b, c and d
     *      in this order points = [a, b, c, d]
     *      points a and b are connected with a line
     *      b and c are connected,
     *      a & c , a & d , b & d , c & d
     */
    constructor(points) {
        const points_count = points.length;
        if (points_count != 4) {
            throw "Triangle_coords constructor arg points.length != 4"
        }
        this.points_count = points_count;
        const s_points = [];
        for (let i = 0; i < points_count; i++) {
            s_points.push(
                new Vector(
                    points[i][0], // x
                    points[i][1], // y
                    points[i][2]  // z
                )
            );
        }
        this.points = s_points;
        this.lines = [
            s_points[0], s_points[1], // a & b
            s_points[1], s_points[2], // b & c
            s_points[2], s_points[0], // c & a
            s_points[0], s_points[3], // a & d
            s_points[1], s_points[3], // b & d
            s_points[2], s_points[3], // c & d
        ];
    }
}

export class Cube_coords { // could be used for other things than cubes
    /**
     * @param {Array[Array[Number]]} _points 
     *      should be 8 points total
     *      they have to be be in this EXACT order of corners
     *      given corners [a, b, c, d, e, f, g, h] 
     *      where each of them are [Number, Number]
     *      
     *      a & b will be connected with a line
     *      b & c will be connected
     *      c & d , d & a , 
     *      e & f , f & g , g & h , h & e 
     *      a & e , b & f , c & g , d & h
     * 
     *      example for cube of side lengths 200
     *      points = [
     *          [-100, -100, -100], // back bottom left
                [100, -100, -100], // back bottom right
                [100, 100, -100], // back top right
                [-100, 100, -100], // back top left

                [-100, -100, 100], // front bottom left
                [100, -100, 100], // front bottom right
                [100, 100, 100], // front top right
                [-100, 100, 100] // front top left
            ]
     */
    constructor(_points) {
        let s_points = [];
        const point_count = _points.length;
        if (point_count != 8) {
            throw "Cube_coords constructor arg _points.length should be 8";
        }
        for (let i = 0; i < point_count; i++) {
            s_points.push(
                new Vector(
                    _points[i][0], // x
                    _points[i][1], // y
                    _points[i][2]  // z
                )
            );
        }
        this.points = s_points;
        // configuration of edges
        this.lines = [
            // back side 
            s_points[0], s_points[1],
            s_points[1], s_points[2],
            s_points[2], s_points[3],
            s_points[3], s_points[0],
            // front side
            s_points[4], s_points[5],
            s_points[5], s_points[6],
            s_points[6], s_points[7],
            s_points[7], s_points[4],
            // lines connecting them
            s_points[0], s_points[4],
            s_points[1], s_points[5],
            s_points[2], s_points[6],
            s_points[3], s_points[7]
        ];
    }
}