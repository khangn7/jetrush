/*
https://docs.google.com/document/d/1O4p7wp5PDOXYR603c-Hvf3A5mCqCEAJT4kB97HY5n2I/edit?usp=sharing

using the canvas as a cartesian plane:

width and height of the canvas element are odd numbers,
so it can be symmetrical, as in there are equal amount pixels to the right and left of
the centermost pixels of the element representing the axis x=0. and same for y=0

when displaying a 3d vector, we'll only use it's x and y values.
note that this doesn't take perspective into account
(as in, the effect that things further away look smaller)

*/

class Vector {
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

class Shape {
    /**
     * @param {Object} canvas canvas element object returned by querySelector
     * 
     * arrays are hardcopied unless param below
     * @param {Array[Vector]} points array of Vectors [[x1, y1, z1], [x2, y2, z1], ...]
     *      coordinates are translated to center of canvas, so [0, 0, any] will be in the middle
     * @param {Array[Vector]} lines [vector0,  vector1, vector2, vector3, ...]
     *      // a line will be drawn between vector0 and vector1 using its x and y values.
     *      // another lines be drawn between vector2 and vector3, and so on.
     * 
     * @param {Boolean} dont_hardcopy  won't hardcopy points and lines args
     */
    constructor (canvas, points, lines, dont_hardcopy=false) {

        if (lines.length % 2 != 0) {
            throw "Shape 'lines' argument doesn't have even number of items";
        }

        this.canvas = canvas;
        this.canvasWidth = canvas.clientWidth;
        this.canvasHeight = canvas.clientHeight;
        this.canvas_halfWidth = Math.floor(canvas.clientWidth * 0.5);
        this.canvas_halfHeight = Math.floor(canvas.clientHeight * 0.5);

        if (dont_hardcopy) {
            this.points = points;
            this.lines = lines;
        } else {
            this.points = JSON.parse(JSON.stringify(points));
            this.lines = JSON.parse(JSON.stringify(lines));
        }

    }

    draw_points() {
        const point_count = this.points.length;
        const ctx = this.canvas.getContext("2d");
        for (let i = 0; i < point_count; i++) {
            ctx.beginPath();
            ctx.moveTo(
                Math.round(this.translate_coord(this.points[i].x)), 
                Math.round(this.translate_coord(this.points[i].y))
            );
            ctx.lineTo( // don't move at all essentially
                Math.round(this.translate_coord(this.points[i].x)), 
                Math.round(this.translate_coord(this.points[i].y))
            );
            ctx.stroke();
        }
    }

    draw_lines() {
        const line_count = this.lines.length;
        const ctx = this.canvas.getContext("2d");
        for (let i = 0; i < line_count; i += 2) {
            ctx.beginPath();
            ctx.moveTo(
                Math.round(this.translate_coord(this.lines[i].x,true)), 
                Math.round(this.translate_coord(this.lines[i].y, false))

            );
            ctx.lineTo(
                Math.round(this.translate_coord(this.lines[i + 1].x, true)), 
                Math.round(this.translate_coord(this.lines[i + 1].y, false))
            );
            ctx.stroke();
        }
    }

    /**
     * returns coordinate to use for canvas element's display methods
     * @param {Number} value coord
     * @param {Boolean} is_x if it's for an x value then True, if y then False
     */
    translate_coord(value, is_x) {
        if (is_x) {
            return value + this.canvas_halfWidth;
        } else {
            return -value + this.canvas_halfHeight;
        }
    }

    rotate_and_draw(theta, phi) {

        let half_pi = Math.PI * 0.5;
        // angle translation details in google docs
        let i_hat = rotated_basis_vector(half_pi, phi + half_pi),
            j_hat = rotated_basis_vector(theta - half_pi, phi + Math.PI),
            k_hat = rotated_basis_vector(theta, phi);

        const new_points = [];
        const point_count = this.points.length;
        for (let i = 0; i < point_count; i++) {
            let new_point = linear_combination3d(this.points[i], i_hat, j_hat, k_hat);
            new_points.push([new_point.x, new_point.y, new_point.z]);
        }

        const new_coords = new Cube_coords(new_points);

        let tmp_reference = this.lines; // store reference so it's not lost
        this.lines = new_coords.lines;

        clearCanvas(this.canvas);
        this.draw_lines();

        this.liens = tmp_reference; // reassign
    }
}

class Cube_coords {
    /**
     * @param {Array[Array[Number]]} _points 
     *      they have to be be in this EXACT order of corners given
     *      (not necessarily 100 or -100 tho)
     * 
     *      [-100, -100, -100], // back bottom left
            [100, -100, -100], // back bottom right
            [100, 100, -100], // back top right
            [-100, 100, -100], // back top left

            [-100, -100, 100], // front bottom left
            [100, -100, 100], // front bottom right
            [100, 100, 100], // front top right
            [-100, 100, 100] // front top left
     */
    constructor(_points) {
        let s_points = [];
        const point_count = _points.length;
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

function main() {

    // set up canvas
    const canvas_elem = document.querySelector("#canvas");
    canvas_elem.width = window.innerWidth * 0.99; // 0.99 is to fit screen
    canvas_elem.height = window.innerHeight * 0.99;
    // have to be odd numbers, explained above
    if (canvas_elem.width % 2 == 0) {
        canvas_elem.width--;
    }
    if (canvas_elem.height % 2 == 0) {
        canvas_elem.height--;
    }

    const context = canvas.getContext("2d");

    let template_points = [
        // [x, y, z]
        [-100, -100, -100], // back bottom left
        [100, -100, -100], // back bottom right
        [100, 100, -100], // back top right
        [-100, 100, -100], // back top left

        [-100, -100, 100], // front bottom left
        [100, -100, 100], // front bottom right
        [100, 100, 100], // front top right
        [-100, 100, 100] // front top left
    ];
    const cube_coords = new Cube_coords(template_points);

    const cube = new Shape(
        canvas_elem,
        cube_coords.points, 
        cube_coords.lines,
        true // dont_hardcopy. here this is used so references in s_lines can be used.
             // as in, so we only need to change values of s_points and s_lines values point to them
    );
    cube.draw_lines();
    
    let half_pi = Math.PI * 0.3;
    let phi = 0;
    const interval = setInterval(() => {
        if (phi > 10) {
            clearInterval(interval);
        }

        //          theta, phi
        cube.rotate_and_draw(half_pi, phi);

        // console.log(theta / 3.14 * 180, theta);
        phi += 0.017;
    }, 50);

}

main();


/**
 * notation: [x, y, z], where z faces "out" of the screen towards the viewer
 * rotates basis vector of [0, 0, 1]. details in google docs
 * @param {Number} theta // radians, angle vector makes with [0, 1, 0]
 * @param {Number} phi  // radians, angle vector makes with [0, 0, 1]
 */
function rotated_basis_vector(theta, phi) {
    // let sin_theta = Math.sin(theta),
    //     cos_phi = Math.cos(phi);
    // return new Vector(
    //     sin_theta * Math.sin(phi),
    //     cos_phi,
    //     sin_theta * cos_phi
    // )
    if (close_equals(theta, 0)) {
        return new Vector(0, 1, 0);
    } 
    else if (close_equals(theta, Math.PI)) {
        return new Vector(0, -1, 0);
    }
    else {
        let sin_theta = Math.sin(theta),
            cos_phi = Math.cos(phi);
        return new Vector(
            sin_theta * Math.sin(phi),
            cos_phi,
            sin_theta * cos_phi
        )
    }
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
function linear_combination3d(vector, i_hat, j_hat, k_hat) {
    return new Vector(
        vector.x * i_hat.x + vector.y * j_hat.x + vector.z * k_hat.x,
        vector.x * i_hat.y + vector.y * j_hat.y + vector.z * k_hat.y,
        vector.x * i_hat.z + vector.y * j_hat.z + vector.z * k_hat.z
    );
}

function close_equals(a, b) {
    return Math.abs(a - b) < 0.0001; // 1 is hardcoded tolerance error
}

function clearCanvas(canvas) {
    canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
}