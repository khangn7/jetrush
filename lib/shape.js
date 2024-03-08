
import { Cube_coords } from "./coords.js";
import {
    Vector,
    rotated_basis_vector,
    translate_angles,
    linear_combination3d
} from "./math_functions.js"

export class Shape {
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

    pipeline(/*Vector*/ coords) {
        this.perspective(coords); // have to do persepective first
        // console.log(coords);
        this.translate_coords(coords);
    }

    draw_lines() {
        const line_count = this.lines.length;
        const ctx = this.canvas.getContext("2d");

        for (let i = 0; i < line_count; i += 2) {
            
            ctx.beginPath();

            let display_coord = new Vector(this.lines[i].x, this.lines[i].y, this.lines[i].z);
            this.pipeline(display_coord);
            ctx.moveTo(
                display_coord.x, 
                display_coord.y
            );
            
            display_coord = new Vector(this.lines[i + 1].x, this.lines[i + 1].y, this.lines[i + 1].z);
            this.pipeline(display_coord);
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
    user_translate(dimension, change) {
        for (let i in this.points) {
            this.points[i][dimension] += change;
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

        const y_scale = 1; // adjust for each situtation

        coords.y *= percent ** y_scale; // exaggerate y scaling more
    }

    rotate_and_draw(theta, phi) {
        
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

        // console.log("np", new_points);

        const new_coords = new this.coord_class(new_points);

        let tmp_reference = this.lines; // store reference so it's not lost
        this.lines = new_coords.lines;

        // console.log("nl", new_coords);

        clearCanvas(this.canvas);
        this.draw_lines();

        this.lines = tmp_reference; // reassign
    }
}

export class CubeShape extends Shape {
    /**
     * 
     * @param {*} canvas 
     * @param {Cube_coords} coord_object 
     * @param {*} coord_class 
     */
    constructor (canvas, coord_object) {
        super(canvas, coord_object.points, coord_object.lines, Cube_coords, true);
        this.surfaces = coord_object.surfaces;
    }
    /**
     * @param {*} surface_index index in Array coord_object.surfaces
     */
    draw_surface(surface_index) {
        // let colors = ["red", "blue", "green", "yellow", "orange", "pink"]
        let surface_ref = this.surfaces[surface_index]; // ref to array of 4 corners

        const ctx = this.canvas.getContext("2d");
        ctx.fillStyle = "red";

        // draw two triangles
        let indexes = [0, 1, 3,   1, 2, 3];

        for (let i = 0; i < 2; i++) {
            ctx.beginPath();

            for (let j = 0; j < 3; j++) {

                let point_ref = surface_ref[indexes[i*3 + j]];
                let display_coord = new Vector(point_ref.x, point_ref.y, point_ref.z);
                this.pipeline(display_coord);
                console.log(display_coord);

                if (j == 0) {
                    ctx.moveTo(display_coord.x, display_coord.y)
                } else {
                    ctx.lineTo(display_coord.x, display_coord.y)
                }

            }

            ctx.fill();
        }

        // ctx.beginPath();
        // let point_ref = surface_ref[0];
        // let display_coord = new Vector(point_ref.x, point_ref.y, point_ref.z);
        // this.pipeline(display_coord);
        // ctx.moveTo(display_coord.x, display_coord.y);

        // point_ref = surface_ref[1];
        // display_coord = new Vector(point_ref.x, point_ref.y, point_ref.z);
        // this.pipeline(display_coord);
        // ctx.lineTo(display_coord.x, display_coord.y);

        // point_ref = surface_ref[2];
        // display_coord = new Vector(point_ref.x, point_ref.y, point_ref.z);
        // this.pipeline(display_coord);
        // ctx.lineTo(display_coord.x, display_coord.y);
        // ctx.fill();

        // ctx.beginPath();
        // ctx.moveTo(surface_ref[1].x, surface_ref[1].y);
        // ctx.lineTo(surface_ref[2].x, surface_ref[2].y);
        // ctx.lineTo(surface_ref[3].x, surface_ref[3].y);
        // ctx.fill();

        ctx.fillStyle = "black";
        }
}

// Grid_coords() 's constructor requires more arguments than passed in Shape
export class GridShape extends Shape {
    /**
     * @param {Object} properties object containing:
     * {
     *      // these properties explained in the Grid_coords class
     *      x_square_count: Number, 
     *      z_square_count: Number
     * }
     */
    constructor (canvas, points, lines, coord_class, dont_hardcopy=true, properties) {
        super(canvas, points, lines, coord_class, dont_hardcopy=true);
        this.x_square_count = properties.x_square_count;
        this.z_square_count = properties.z_square_count;
    }

    // this overides user_translate() method from Shape class
    /**
     * @param {String} dimension 'x', 'y' or 'z'
     * @param {Number} direction -1 or 1
     */
     user_translate(dimension, change) {
        for (let i in this.points) {
            this.points[i][dimension] += change;
        }
                                        // these zeroes are filler doesn't matter what when first argument != false
        const new_coords = new this.coord_class(this.points, 0, 0, 0, this.x_square_count, this.z_square_count);
        this.lines = new_coords.lines;
    }

}

function clearCanvas(canvas) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}