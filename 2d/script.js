/*
using the canvas as a cartesian plane:

width and height of the canvas element are odd numbers,
so it can be symmetrical, as in there are equal amount pixels to the right and left of
the centermost pixels of the element representing the axis x=0. and same for y=0

*/

class Vector {
    /**
     * // don't preemptively translate to center of canvas. just act as if (0, 0) is center
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Shape {
    /**
     * @param {HTMLCanvasElement} canvas canvas element object returned by querySelector
     * 
     * arrays are hardcopied unless param below
     * @param {Array[Vector]} points array of Vectors [[x1, y1], [x2, y2], ...]
     *      coordinates are translated to center of canvas, so [0, 0] will be in the middle
     * @param {Array[Vector]} lines [vector0,  vector1, vector2, vector3, ...]
     *      // a line will be drawn between vector0 and vector1.
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

    // /**
    //  * reassigns all points with values from function passed as argument
    //  * @param {Function(Vector) -> Vector} _function
    //  */
    // change_all_points(_function) {
    //     const point_count = this.points.length;
    //     for (let i = 0; i < point_count; i++) {
    //         let new_point = _function(this.points[i]);
    //         this.points[i].x = new_point.x;
    //         this.points[i].y = new_point.y;
    //     }
    // }

    rotate_and_draw(theta) {
        // we need to somehow preserve original graph and line connections

        const new_points = [];
        let i_hat = rotated_basis_vector(theta),
            j_hat = rotated_basis_vector(theta + Math.PI * 0.5);
        // console.log(i_hat, j_hat);
        const point_count = this.points.length;
        for (let i = 0; i < point_count; i++) {
            new_points.push(linear_combination2d(this.points[i], i_hat, j_hat));
        }
        const new_coords = new Square_coords(new_points);

        let tmp_reference = this.lines; // remember ptr to original lines
        this.lines = new_points; // this.lines will point to transformed lines here.

        this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw_lines();

        this.lines = tmp_reference; // reassign after drawing done
    }
}

class Square_coords {
    constructor(_points) {
        this.points = [];
        const point_count = _points.length;
        for (let i = 0; i < point_count; i++) {
            this.points.push(new Vector(_points[i][0], _points[i][1]));
        }
        this.lines = [
            this.points[0], this.points[1],
            this.points[1], this.points[2],
            this.points[2], this.points[3],
            this.points[3], this.points[0]
        ];
    }
}

function main() {
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

    let template_points = [[-100, -100], [-100, 100], [100, 100], [100, -100]];
    const square_coords = new Square_coords(template_points);

    const square = new Shape(
        canvas_elem,
        square_coords.points, 
        square_coords.lines,
        true // dont_hardcopy. here this is used so references in square_coords.lines can be used.
             // as in, so we only need to change values of .points and .lines values point to them
    );
    square.draw_lines();

    // square.rotate(Math.PI);
    // // context.clearRect(0, 0, canvas_elem.width, canvas_elem.height);
    // square.draw_lines();

    let theta = 0;
    const interval = setInterval(() => {
        if (theta > 3) {
            clearInterval(interval);
        }

        square.rotate_and_draw(theta);

        console.log(theta / 3.14 * 180, theta);
        theta += 0.017;
    }, 100);

}

main();


/**
 * rotates basis vector of [1, 0] by theta
 * @param {Number} theta // radians
 */
function rotated_basis_vector(theta) {
    return new Vector(Math.cos(theta), Math.sin(theta));
}

/**
 * 
 * @param {Vector} vector [x, y]
 * @param {Vector} i_hat basis vector x scales
 * @param {Vector} j_hat basis vector y scales
 * @returns 
 */
function linear_combination2d(vector, i_hat, j_hat) {
    return new Vector(
        vector.x * i_hat.x + vector.y * j_hat.x,
        vector.x * i_hat.y + vector.y * j_hat.y
    );
}
