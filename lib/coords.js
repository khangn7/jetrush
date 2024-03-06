import {
    Vector
} from "./math_functions.js"

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
     * 
     * @param {Array[Vector]} _points 
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
        this.points = _points;
        // configuration of edges
        this.lines = [
            // back side 
            _points[0], _points[1],
            _points[1], _points[2],
            _points[2], _points[3],
            _points[3], _points[0],
            // front side
            _points[4], _points[5],
            _points[5], _points[6],
            _points[6], _points[7],
            _points[7], _points[4],
            // lines connecting them
            _points[0], _points[4],
            _points[1], _points[5],
            _points[2], _points[6],
            _points[3], _points[7]
        ];
    }
}

export class Grid_coords {
    /**
     * 
     * square grid
     * 
     * can generate points. if so pass false into points and give range, y, square_count
     * 
     * @param {Array[Vector]} _points 
     * // should have Vectors in this order:
     * // furthest (lowest z) left (lowest x) corner to closest (high z) rightmost (high x) corner
     * // rows one after another (not columns)
     * 
     * @param {Number} x_range half of length of the square in x dimension
     * @param {Number} z_range half of length of the square in z dimension
     * 
     * @param {Number} y y level of plane
     * 
     * @param {Number} x_square_count how many squares in x dimension
     * @param {Number} z_square_count how many squares in z dimension
     */
    constructor(_points=false, x_range, z_range, y, x_square_count, z_square_count) {
        
        let s_points;

        
        if (!_points) { // if autogenerate

            s_points = [];
            let square_width = Math.floor(x_range/x_square_count);
            let square_length = Math.floor(z_range/z_square_count);

            let x_half_range = Math.floor(x_range * 0.5);
            let z_half_range = Math.floor(z_range * 0.5);

            // z, start from most negative row
            for (let i = 0; i <= z_square_count; i++) {
                // x, start from most negative
                for (let q = 0; q <= x_square_count; q++) {
                    s_points.push(
                        new Vector(
                            -x_half_range + q * square_width, // x
                            y,                             // y
                            -z_half_range + i * square_length  // z
                        )
                    );
                }
            }

            this.points = s_points;

        } else { // else passed points

            this.points = _points;
            
            s_points = _points;

        }
        
        let x_n = x_square_count + 1;  // points per row
        let z_n = z_square_count + 1;  // points per z 'column'

        // console.log("points", s_points);

        let s_lines = [];
        for (let i = 0; i < x_n; i++) {
            for (let q = 1; q < z_n; q++) {
                // connect points along x dimension
                // console.log(i * n + q);
                s_lines.push(
                    s_points[i * x_n + q],
                    s_points[i * x_n + q - 1]
                );

                // connect points along z dimension
                s_lines.push(
                    s_points[(q - 1) * z_n + i],
                    s_points[q * z_n + i]
                );
            }
        }

        this.lines = s_lines;
        // console.log("lines", this.lines);
        
    }
}