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
    //  * @param {Function} _function a function that should expect [x, y] (reference) and return [new_x, new_y]
    //  *      _function([Number Number]) returns [Number, Number]
    //  */
    // change_all_points(_function) {
    //     const point_count = this.points.length;
    //     for (let i = 0; i < point_count; i++) {
    //         let new_points = _function(this.points[i]);
    //         // reassign this.points[i]
    //         this.points[i][0] = new_points[0];
    //         this.points[i][0] = new_points[1];
    //     }
    // }
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


    let template_points = [[0,0], [100, 0]];
    let s_points = [];
    const point_count = template_points.length;
    for (let i = 0; i < point_count; i++) {
        s_points.push(new Vector(template_points[i][0], template_points[i][1]));
    }
    let s_lines = [
        s_points[0], s_points[1]
    ];
    
    const arrow = new Shape(
        canvas_elem, 
        s_points,
        s_lines,
        true
    )
    
    let theta = 0;
    let i_hat;
    const interval = setInterval(
        () => {
            if (theta > 3) {
                clearInterval(interval);
            }

            i_hat = rotated_basis_vector(theta);

            for (let i = 0; i < point_count; i++) {
                let point = s_points[i]; // Vector(i-hat scalar, j-hat scalar)
                // linear combination
                let new_x = point.x * i_hat.x + point.y * j_hat.x;
                let new_y = point.x * i_hat.y + point.y * j_hat.y;
    
                point.x = new_x;
                point.y = new_y;
            }

            context.clearRect(0, 0, canvas.width, canvas.height);
            square.draw_lines();

            theta += 0.017;
        },
        100
    );

    // let template_points = [[-100, -100], [-100, 100], [100, 100], [100, -100]];
    // let s_points = [];
    // const point_count = template_points.length;
    // for (let i = 0; i < point_count; i++) {
    //     s_points.push(new Vector(template_points[i][0], template_points[i][1]));
    // }
    // let s_lines = [
    //     s_points[0], s_points[1],
    //     s_points[1], s_points[2],
    //     s_points[2], s_points[3],
    //     s_points[3], s_points[0]
    // ];

    // const square = new Shape(
    //     canvas_elem,
    //     s_points, 
    //     s_lines,
    //     true // dont_hardcopy. here this is used so references in s_lines can be used.
    //          // as in, so we only need to change values of s_points and s_lines values point to them
    // );
    // square.draw_lines();

    // let i_hat;
    // let j_hat;
    // const half_pi = 0.5 * Math.PI;
    // let theta = 0;
    // let context = canvas.getContext("2d");
    // const interval = setInterval(() => {
    //     if (theta > 6.3) {
    //         clearInterval(interval);
    //     }

    //     i_hat = rotated_basis_vector(theta);
    //     j_hat = rotated_basis_vector(theta + half_pi);
    //     console.log(theta);

    //     for (let i = 0; i < point_count; i++) {

    //         let point = s_points[i]; // Vector(i-hat scalar, j-hat scalar)
    //         // linear combination
    //         let new_x = point.x * i_hat.x + point.y * j_hat.x;
    //         let new_y = point.x * i_hat.y + point.y * j_hat.y;

    //         point.x = new_x;
    //         point.y = new_y;
    //     }
    //     context.clearRect(0, 0, canvas.width, canvas.height);

    //     square.draw_lines();

    //     theta += 0.017 // roughly 1 degrees in radians
    // }, 200);

}

main();


/**
 * rotates basis vector of [1, 0] by theta
 * @param {Number} theta // radians
 */
function rotated_basis_vector(theta) {
    return new Vector(Math.cos(theta), Math.sin(theta));
}
