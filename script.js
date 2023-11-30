/*
using the canvas as a cartesian plane:

width and height of the canvas element are odd numbers,
so it can be symmetrical, as in there are equal amount pixels to the right and left of
the centermost pixels of the element representing the axis x=0. and same for y=0

*/

class Shape {
    /**
     * @param {HTMLCanvasElement} canvas canvas element object returned by querySelector
     * @param {Number} canvasWidth pixel width of canvas element
     * @param {Number} canvasHeight pixel height of canvas element
     * 
     * arrays are hardcopied
     * @param {Array[Array[Number]]} points array of arrays [[x1, y1], [x2, y2], ...]
     *      coordinates are translated to center of canvas, so [0, 0] will be in the middle
     * @param {Array[Array[Number]]} lines [[x1, y1, x2, y2], [x1, y2, x2, y2], ...]
     */
    constructor (canvas, canvasWidth, canvasHeight, points, lines) {
        this.canvas = canvas;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.canvas_halfWidth = Math.floor(canvasWidth * 0.5);
        this.canvas_halfHeight = Math.floor(canvasHeight * 0.5);

        this.points = JSON.parse(JSON.stringify(points));
        this.lines = JSON.parse(JSON.stringify(lines));
    }

    draw_points() {
        const point_count = this.points.length;
        const ctx = this.canvas.getContext("2d");
        for (let i = 0; i < point_count; i++) {
            console.log(this.points)
            ctx.beginPath();
            ctx.moveTo(
                this.translate_coord(this.points[i][0]), 
                this.translate_coord(this.points[i][1])
            );
            ctx.lineTo(
                this.translate_coord(this.points[i][0]), 
                this.translate_coord(this.points[i][1])
            );
            ctx.stroke();
        }
    }

    draw_lines() {
        const line_count = this.lines.length;
        const ctx = this.canvas.getContext("2d");
        for (let i = 0; i < line_count; i++) {
            console.log(this.lines[i][0], this.translate_coord(this.lines[i][0], true));
            console.log(this.lines[i][1], this.translate_coord(this.lines[i][1], false));
            console.log(this.lines[i][2], this.translate_coord(this.lines[i][2], true));
            console.log(this.lines[i][3], this.translate_coord(this.lines[i][3], false));
            ctx.beginPath();
            ctx.moveTo(
                this.translate_coord(this.lines[i][0],true), 
                this.translate_coord(this.lines[i][1], false)

            );
            ctx.lineTo(
                this.translate_coord(this.lines[i][2], true), 
                this.translate_coord(this.lines[i][3], false)
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

    /**
     * reassigns all points with values from function passed as argument
     * @param {Function} _function a function that should expect [x, y] (reference) and return [new_x, new_y]
     *      _function([Number Number]) returns [Number, Number]
     */
    change_all_points(_function) {
        const point_count = this.points.length;
        for (let i = 0; i < point_count; i++) {
            let new_points = _function(this.points[i]);
            // reassign this.points[i]
            this.points[i][0] = new_points[0];
            this.points[i][0] = new_points[1];
        }
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

    const square = new Shape(
        canvas_elem,
        canvas_elem.clientWidth, 
        canvas_elem.clientHeight,
        [[-100, -100], [100,100]], 
        [[-100, -100, 100,100]]
    );
    square.draw_lines();

}

main();