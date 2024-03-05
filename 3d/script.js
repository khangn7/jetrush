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

import { 
    Vector, 
    // Cube_coords,
    Grid_coords
} from "./coords.js";

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
     * @param {Class} coord_class class used to make coords imported from coords.js
     * 
     * @param {Boolean} dont_hardcopy  won't hardcopy points and lines args
     */
    constructor (canvas, points, lines, coord_class, dont_hardcopy=true) {

        if (lines.length % 2 != 0) {
            throw "Shape 'lines' argument doesn't have even number of items";
        }

        this.canvas = canvas;
        this.canvasWidth = canvas.clientWidth;
        this.canvasHeight = canvas.clientHeight;
        this.canvas_halfWidth = Math.floor(canvas.clientWidth * 0.5);
        this.canvas_halfHeight = Math.floor(canvas.clientHeight * 0.5);

        this.coord_class = coord_class;

        if (dont_hardcopy) {
            this.points = points;
            this.lines = lines;
        } else {
            this.points = JSON.parse(JSON.stringify(points));
            this.lines = JSON.parse(JSON.stringify(lines));
        }

    }

    // draw_points() {
    //     const point_count = this.points.length;
    //     const ctx = this.canvas.getContext("2d");
    //     for (let i = 0; i < point_count; i++) {
    //         ctx.beginPath();
    //         ctx.moveTo(
    //             Math.round(this.translate_coord(this.points[i].x)), 
    //             Math.round(this.translate_coord(this.points[i].y))
    //         );
    //         ctx.lineTo( // don't move at all essentially
    //             Math.round(this.translate_coord(this.points[i].x)), 
    //             Math.round(this.translate_coord(this.points[i].y))
    //         );
    //         ctx.stroke();
    //     }
    // }

    draw_lines() {
        const line_count = this.lines.length;
        const ctx = this.canvas.getContext("2d");

        const pipeline = (/*Vector*/ coords) => {
            this.perspective(coords); // have to do persepective first
            // console.log(coords);
            this.translate_coords(coords);
        }

        for (let i = 0; i < line_count; i += 2) {
            
            ctx.beginPath();

            let display_coord = new Vector(this.lines[i].x, this.lines[i].y, this.lines[i].z);
            pipeline(display_coord);
            ctx.moveTo(
                display_coord.x, 
                display_coord.y
            );
            
            display_coord = new Vector(this.lines[i + 1].x, this.lines[i + 1].y, this.lines[i + 1].z);
            pipeline(display_coord);
            ctx.lineTo(
                display_coord.x,
                display_coord.y
            );

            ctx.stroke();
        }
    }

    /**
     * @param {String} dimension 'x', 'y' or 'z'
     * @param {Number} direction -1 or 1
     */
    user_translate(dimension, direction) {
        const speed = 5;
        for (let i in this.points) {
            this.points[i][dimension] += direction * speed;
        }
        const new_coords = new this.coord_class(this.points);
        this.lines = new_coords.lines;
    }

    /**
     * returns coordinate to use for canvas element's display methods
     * @param {Vector} coords coords passed by reference
     */
    translate_coords(coords) {
        coords.x = coords.x + this.canvas_halfWidth;
        coords.y = -coords.y + this.canvas_halfHeight;
    }

    /**
     * @param {Vector} coords passed by reference
     * scales x and y values based on z value
     * more negative z ("further" away from viewer) = smaller x and y
     * more positive z ("closer" to viewer) = bigger x and y
     */
    perspective(coords) {
        const z_max = 1000;
        let percent = (coords.z + z_max) / (z_max * 0.5);
        coords.x *= percent;
        coords.y *= percent ** 1.5; // exaggerate y scaling more
    }

    rotate_and_draw(theta, phi) {

        const half_pi = Math.PI * 0.5;
        
        // angle translation
        let translated_angles = translate_angles(theta, phi);
        let i_hat = rotated_basis_vector(translated_angles[0][0], translated_angles[0][1]);

        let j_hat = rotated_basis_vector(translated_angles[1][0], translated_angles[1][1]),
            k_hat = rotated_basis_vector(theta, phi);

        // console.log(i_hat, j_hat, k_hat);

        const new_points = []; // array of Vectors
        const point_count = this.points.length;
        for (let i = 0; i < point_count; i++) {
            let new_point = linear_combination3d(this.points[i], i_hat, j_hat, k_hat);
            new_points.push(new_point);
        }

        // console.log("np", new_points)

        const new_coords = new this.coord_class(new_points);

        let tmp_reference = this.lines; // store reference so it's not lost
        this.lines = new_coords.lines;

        // console.log("nl", this.lines);

        clearCanvas(this.canvas);
        this.draw_lines();

        this.lines = tmp_reference; // reassign
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

    display_grid(canvas_elem);
}

main();

function display_grid(canvas_elem) {
    const grid_coords = new Grid_coords(false, 300, -100, 10);

    const grid = new Shape(
        canvas_elem,
        grid_coords.points, 
        grid_coords.lines,
        Grid_coords,
        true // dont_hardcopy. here this is used so references in s_lines can be used.
             // as in, so we only need to change values of s_points and s_lines values point to them
    );

    // console.log(grid.lines);
    grid.draw_lines();

    let theta = Math.PI * 0.5;
    let phi = 0,
        phi_change = Math.PI * 0.005;

    const interval = setInterval(() => {
        phi += phi_change;
        grid.rotate_and_draw(theta, phi);
    }, 30);

    // document.addEventListener("keydown", (e) => {
    //     if (e.key === "ArrowUp") {
    //         grid.user_translate('z', 1);
    //         clearCanvas(grid.canvas);
    //         grid.draw_lines();
    //     } else if (e.key === "ArrowDown") {
    //         grid.user_translate('z', -1);
    //         clearCanvas(grid.canvas);
    //         grid.draw_lines();
    //     } else if (e.key === "ArrowRight") {
    //         phi -= phi_change;
    //         grid.rotate_and_draw(theta, phi)
    //     } else if (e.key === "ArrowLeft") {
    //         phi += phi_change;
    //         grid.rotate_and_draw(theta, phi);
    //     }
    // })

    document.addEventListener("click", ()=> {clearInterval(interval);});
}

const two_pi = 2 * Math.PI;
/**
 * notation: [x, y, z], where z faces "out" of the screen towards the viewer
 * rotates basis vector of [0, 0, 1]. details in google doc
 * @param {Number} theta // radians, angle vector makes with [0, 1, 0]
 * @param {Number} phi  // radians, angle vector makes with [0, 0, 1]
 */
function rotated_basis_vector(theta, phi) {
    // theta = theta % two_pi;
    // phi = phi % two_pi;

    let sin_theta = Math.sin(theta);
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
function translate_angles(k_theta, k_phi) {

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
function linear_combination3d(vector, i_hat, j_hat, k_hat) {
    return new Vector(
        vector.x * i_hat.x + vector.y * j_hat.x + vector.z * k_hat.x,
        vector.x * i_hat.y + vector.y * j_hat.y + vector.z * k_hat.y,
        vector.x * i_hat.z + vector.y * j_hat.z + vector.z * k_hat.z
    );
}

function close_equals(a, b) {
    return Math.abs(a - b) < 0.00001; // hardcoded tolerance error
}

function clearCanvas(canvas) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}