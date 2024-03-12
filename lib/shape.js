
import { Cube_coords } from "./coords.js";
import {
    Vector,
    rotated_basis_vector,
    translate_angles,
    linear_combination3d
} from "./math_functions.js"

export class Shape {
    /**
     * 
     * @param {Object} canvas canvas element object returned by querySelector
     * 
     * @param {Object} coord object created with new coord_class
     * 
     * @param {Class} coord_class class used to make coords imported from coords.js
     */
    constructor(canvas, coord_object, coord_class) {

        this.canvas = canvas;
        this.canvasWidth = canvas.clientWidth;
        this.canvasHeight = canvas.clientHeight;
        this.canvas_halfWidth = Math.floor(canvas.clientWidth * 0.5);
        this.canvas_halfHeight = Math.floor(canvas.clientHeight * 0.5);

        this.coord_class = coord_class;

        // this.model_coord_obj should never be tampered with
        // it's used for transformations
        this.model_coord_obj = coord_object; // reference

        // this.display_coord_obj is positional coords in virtual space to use to display (before pipeline)
        // this property can be reassigned
        this.display_coord_obj = JSON.parse(JSON.stringify(coord_object)); 
        

        // note: having two coord_obj like this makes things easier
        // then you could transform coords and display things independently

    }

    canvas_pipeline(/*Vector*/ coords) {
        // this.perspective(coords); // have to do persepective first
        // console.log(coords);
        this.translate_coords(coords);
        // rounding makes faster
        coords.x = Math.round(coords.x);
        coords.y = Math.round(coords.y);
        coords.z = Math.round(coords.z);
    }

    /**
     * translate coordinates so can be used on canvas element
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
        let percent = (coords.z + z_max) / (z_max * 0.5); // not meant for changing
        coords.x *= percent;

        const y_scale = 1; // adjust for each situtation - meant for changing

        coords.y *= percent ** y_scale; // exaggerate y scaling more
    }

    draw_lines() {
        const shape = this.display_coord_obj;
        const line_count = shape.lines.length;

        const ctx = this.canvas.getContext("2d");
        for (let i = 0; i < line_count; i += 2) {
            
            ctx.beginPath();

            let display_coord = new Vector(shape.lines[i].x, shape.lines[i].y, shape.lines[i].z);
            this.canvas_pipeline(display_coord);
            ctx.moveTo(display_coord.x, display_coord.y);
            
            display_coord = new Vector(shape.lines[i + 1].x, shape.lines[i + 1].y, shape.lines[i + 1].z);
            this.canvas_pipeline(display_coord);
            ctx.lineTo(display_coord.x, display_coord.y);

            ctx.stroke();
        }
    }

    // /**
    //  * @param {String} dimension 'x', 'y' or 'z'
    //  * @param {Number} direction -1 or 1
    //  */
    // user_translate(dimension, change) {
    //     for (let i in this.points) {
    //         this.points[i][dimension] += change;
    //     }
    //     const new_coords = new this.coord_class(this.points);
    //     this.lines = new_coords.lines;
    // }

    /**
     * NOTE: we can't just rewrite the existing this.display_coord_obj, 
     * as we need the lines created during constructor of coord_class.
     * If points in this.lines of coord_class can just be references to points in coord_class points, 
     * then this wouldn't be a problem, but...
     * 
     * tranforms this.model_coord_obj coords and reassigns this.display_coord_obj to new coord_bj
     * @param {Number} theta 
     * @param {Number} phi 
     */
    rotate(theta, phi) {
    
        let model = this.model_coord_obj;
        
        // angle translation
        let translated_angles = translate_angles(theta, phi);
        let i_hat = rotated_basis_vector(translated_angles[0][0], translated_angles[0][1]);

        let j_hat = rotated_basis_vector(translated_angles[1][0], translated_angles[1][1]),
            k_hat = rotated_basis_vector(theta, phi);

        // console.log(i_hat, j_hat, k_hat);

        const new_points = []; // array of Vectors
        const point_count = model.points.length;
        for (let i = 0; i < point_count; i++) {
            let new_point = linear_combination3d(model.points[i], i_hat, j_hat, k_hat);
            new_points.push(new_point);
        }


        this.display_coord_obj = new this.coord_class(new_points, theta, phi);
    }

    /**
     * @param {*} surface_index index in Array coord_object.surfaces
     */
     draw_surface(surface_index) {
        let surface_ref = this.display_coord_obj.surfaces[surface_index];

        let theta = surface_ref[3],
            phi = surface_ref[4];
        let half_pi = Math.PI * 0.5;
        if (phi < -half_pi || phi > half_pi || theta < -half_pi || theta > half_pi) {
            return;
        }
        console.log(theta/(half_pi), phi/(half_pi))

        const ctx = this.canvas.getContext("2d");

        ctx.beginPath();

        let point_ref = surface_ref[0];
        let display_coord = new Vector(point_ref.x, point_ref.y, point_ref.z);
        this.canvas_pipeline(display_coord);
        ctx.moveTo(display_coord.x, display_coord.y);

        for (let i = 1; i < 3; i++) {

            let point_ref = surface_ref[i];
            let display_coord = new Vector(point_ref.x, point_ref.y, point_ref.z);
            this.canvas_pipeline(display_coord);

            ctx.lineTo(display_coord.x, display_coord.y);

        }

        ctx.fill();
    }
}

export class CubeShape extends Shape {
    /**
     * 
     * @param {*} canvas 
     * @param {Cube_coords} coord_object 
     * @param {*} coord_class 
     */
    constructor(canvas, coord_object) {
        super(canvas, coord_object, Cube_coords);
    }

    draw_surfaces() {
        let colors = ["red", "blue", "yellow", "green", "orange", "purple"];
        const ctx = this.canvas.getContext("2d");
        for (let i = 0; i < 6; i++) {

            ctx.fillStyle = colors[i];
            this.draw_surface(i * 2);
            this.draw_surface(i * 2 + 1);
        }
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