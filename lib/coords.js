import {
    Vector,
    // translate_angles,
    subtractVectors,
    crossProduct,
    addVectors,
    scaledVector
} from "./math_functions.js"
import { INFLATE_SURFACES } from "./settings.js";

const INFLATE_SCALE = 1.01

class Surface {
    /**
     * corner winding should be right handed (anti clockwise looking at front face)
     * as in, (corner 1 to 2) x (corner 1 to 3) will be normal vector
     * @param {Vector} corner1 
     * @param {Vector} corner2 
     * @param {Vector} corner3
     */
    constructor(corner1, corner2, corner3) {
        this.corner1 = corner1;
        this.corner2 = corner2;
        this.corner3 = corner3;
        let v1 = subtractVectors(corner1, corner2);
        let v2 = subtractVectors(corner1, corner3);
        this.normal = crossProduct(v1, v2);
        let mag = Math.sqrt(this.normal.x**2 + this.normal.y**2 + this.normal.z**2);
        this.normal = scaledVector(this.normal, 1/mag);

        // inflate vectors
        // https://stackoverflow.com/questions/43236289/javascript-gap-between-triangles-when-wire-frame-is-removed
        let center = addVectors(addVectors(corner1, corner2), corner3);
        center = scaledVector(center, 1/3);
        this.center = center;

        if (INFLATE_SURFACES) {
            let diff = subtractVectors(center, corner1);
            this.corner1 = addVectors(center, scaledVector(diff, INFLATE_SCALE));
            diff = subtractVectors(center, corner2);
            this.corner2 = addVectors(center, scaledVector(diff, INFLATE_SCALE));
            diff = subtractVectors(center, corner3);
            this.corner3 = addVectors(center, scaledVector(diff, INFLATE_SCALE));
        }
    }
}

// technically works for any hexahedron
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
     *          Vector(-100, -100, -100), // back bottom left
                Vector(100, -100, -100), // back bottom right
                Vector(100, 100, -100), // back top right
                Vector(-100, 100, -100), // back top left

                Vector(-100, -100, 100), // front bottom left
                Vector(100, -100, 100), // front bottom right
                Vector(100, 100, 100), // front top right
                Vector(-100, 100, 100) // front top left
            ]
     */
    constructor(_points) {
        if (_points.length != 8) {
            throw "wrong amount of vertices";
        }

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
        // console.log("theta", theta, "phi", phi);

        this.surfaces = [
            // important: put corners anti-clockwise looking at front face of triangle

            // back face
            new Surface( _points[1], _points[0], _points[3]),
            new Surface( _points[1], _points[3], _points[2]),

            // front face
            new Surface(_points[4], _points[6], _points[7]),
            new Surface(_points[4], _points[5], _points[6]),

            // right face
            new Surface(_points[5], _points[1], _points[2]),
            new Surface(_points[5], _points[2], _points[6]),

            // left face  
            new Surface(_points[0], _points[7], _points[3]),
            new Surface(_points[0], _points[4], _points[7]),

            // top face
            new Surface(_points[7], _points[2], _points[3]),
            new Surface(_points[7], _points[6], _points[2]),

            // bottom face
            new Surface(_points[5], _points[0], _points[1]),
            new Surface(_points[5], _points[4], _points[0])

        ]
    }
}

export class Ship_coords {
    /**
     * specifically for ship in this google doc:
     * https://docs.google.com/document/d/1Yp2yHPpARgLEpbdvNprUdbOWpWIGP3AA5BYyEIk0bqg/edit?usp=sharing
     * 
     * @param {Array[Vector]} _points corners A to Y in alphabetical order as done in google doc above
     */
    constructor (_points) {
        if (_points.length != 25) {
            throw "wrong amount of vertices"
        }

        this.points = _points;
        this.surfaces = [

            // HEAD
            new Surface(_points[0], _points[1], _points[2]),    // ABC (corners that make up surface)
            new Surface(_points[0], _points[2], _points[4]),    // ACE
            new Surface(_points[0], _points[4], _points[3]),    // AED
            new Surface(_points[0], _points[3], _points[1]),    // ADB

            // BODY
            // right side
            new Surface(_points[7], _points[4], _points[2]),    // HEC
            new Surface(_points[7], _points[6], _points[4]),    // HGE
            new Surface(_points[7], _points[2], _points[8]),    // HCI
            new Surface(_points[7], _points[8], _points[6]),    // HIG
            new Surface(_points[8], _points[2], _points[1]),    // ICB
            // left side
            new Surface(_points[5], _points[3], _points[4]),    // FDE
            new Surface(_points[5], _points[4], _points[6]),    // FEG
            new Surface(_points[5], _points[8], _points[3]),    // FID
            new Surface(_points[5], _points[6], _points[8]),    // FGI
            new Surface(_points[8], _points[1], _points[3]),    // IBD

            // WINGS
            // left wing (top)
            new Surface(_points[11], _points[12], _points[ 2]), // LMC
            new Surface(_points[10], _points[12], _points[ 9]), // KMJ
            new Surface(_points[10], _points[7],  _points[12]), // KHM
            // right wing (top)
            new Surface(_points[14], _points[3],  _points[13]), // ODN
            new Surface(_points[16], _points[15], _points[13]), // QPN
            new Surface(_points[16], _points[13], _points[ 5]), // QNF
            // left wing (bottom)
            new Surface(_points[2], _points[12], _points[11]),  // CML
            new Surface(_points[9], _points[12], _points[10]),  // JMK
            new Surface(_points[12], _points[7], _points[10]),  // MHK
            // right wing (bottom)
            new Surface(_points[13], _points[3], _points[14]),  // NDO
            new Surface(_points[13], _points[15], _points[16]), // NPQ
            new Surface(_points[5], _points[13], _points[16]),  // FNQ


            // TAIL
            // left top
            new Surface(_points[17], _points[18],_points[ 7]),  // RSH
            new Surface(_points[18], _points[19],_points[ 7]),  // STH
            new Surface(_points[19], _points[6], _points[ 7]),  // TGH
            new Surface(_points[19], _points[22],_points[ 6]),  // TWG
            new Surface(_points[19], _points[20],_points[22]),  // TUW
            // right top
            new Surface(_points[23], _points[24],_points[ 5]),  // XYF
            new Surface(_points[23], _points[5], _points[21]),  // XFV
            new Surface(_points[21], _points[5], _points[6]),   // VFG
            new Surface(_points[21], _points[6], _points[22]),  // VGW
            new Surface(_points[21], _points[22],_points[20]),  // VWU
            // left bottom
            new Surface(_points[7], _points[18], _points[17]),  // HSR
            new Surface(_points[7], _points[19], _points[18]),  // HTS
            new Surface(_points[7], _points[6], _points[19]),   // HGT
            new Surface(_points[19], _points[6], _points[20]),   // TGU
            // right bottom
            new Surface(_points[5], _points[24], _points[23]),  // FYX
            new Surface(_points[21], _points[5], _points[23]),  // VFX
            new Surface(_points[6], _points[5], _points[21]),   // GFV
            new Surface(_points[21], _points[20], _points[6]),   // VUG
            
        ]
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

export class Line_coords {
    constructor(points) {
        this.points = points;
        this.lines = [
            points[0], points[1]
        ];
    }
}