
import { Cube_coords } from "./coords.js";
import {
    Vector,
    rotated_basis_vector,
    translate_angles,
    linear_combination3d,
    map_angle_to_range,
    rotation_matrix
} from "./math_functions.js"

/*
    pipeline
    1. rotate/transform in model space
    2. translate to game space
    3. apply perspective
    3. translate for html canvas
    4. display
*/

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
        this.display_coord_obj = JSON.parse(JSON.stringify(coord_object)); // deepcopy just in case idk
        

        // note: having two coord_obj like this makes things easier
        // then you could transform coords and display things independently

        this.display_k_hat = new Vector(0, 0, 1); // used to track orientation of display model
        this.display_k_hat_theta = 0;// angle made with positive y axis
        this.display_k_hat_phi = Math.PI * 0.5; // angle made with positive z axis

        // position in game space, specifically position of point that would be (0,0,0) in model space
        this.game_pos_x = 0;
        this.game_pos_y = 0;
        this.game_pos_z = 0;

    }

    canvas_pipeline(/*Vector*/ coords) {
        // order is important here

        this.gamespace_translate_coords(coords)

        this.perspective(coords); 

        this.canvas_translate_coords(coords);
        // rounding makes faster
        coords.x = Math.round(coords.x);
        coords.y = Math.round(coords.y);
        coords.z = Math.round(coords.z);
    }

    /**
     * translate coordinates so can be used on canvas element
     * @param {Vector} coords coords passed by reference
     */
    canvas_translate_coords(coords) {
        coords.x = coords.x + this.canvas_halfWidth;
        coords.y = -coords.y + this.canvas_halfHeight;
    }

    /**
     * increments this. gamespace coords
     * @param {Number} x_change 
     * @param {Number} y_change 
     * @param {Number} z_change 
     */
    gamespace_move(x_change, y_change, z_change) {
        this.game_pos_x += x_change;
        this.game_pos_y += y_change;
        this.game_pos_z += z_change;
    }

    /**
     * rewrites this. gamespace coords
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     */
    gamespace_position_set(x, y, z) {
        this.game_pos_x = x
        this.game_pos_y = y
        this.game_pos_z = z
    }

    /**
     * given model space coords, give game space coords
     * @param {Vector} coords passed by ref
     */
    gamespace_translate_coords(coords) {
        coords.x += this.game_pos_x;
        coords.y += this.game_pos_y;
        coords.z += this.game_pos_z;
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
     * 
     * @param {Number} rotate_angle
     * @param {Number} rotation_axis axis of rotation 0 = x, 1 = y, 2 = z
     * 
     * @param {Boolean} use_current_coords perform transformation on current display coords instead of base template model coords
     * used for composing transformations successively
     */
    rotate(rotate_angle, rotation_axis, use_current_coords=false) {
        
        // theta = map_angle_to_range(theta);
        // phi = map_angle_to_range(phi);
    
        let model = use_current_coords ? this.display_coord_obj : this.model_coord_obj;
        
        // angle translation
        // let translated_angles = translate_angles(theta, phi);
        // let x_col = rotated_basis_vector(translated_angles[0][0], translated_angles[0][1]);
        
        let r_matrix = rotation_matrix(rotate_angle, rotation_axis);

        let x_col = r_matrix[0];
        // let y_col = rotated_basis_vector(translated_angles[1][0], translated_angles[1][1]),
        let y_col = r_matrix[1],
            // z_col = rotated_basis_vector(theta, phi);
            z_col = r_matrix[2];

        const new_points = []; // array of Vectors
        const point_count = model.points.length;
        for (let i = 0; i < point_count; i++) {
            let new_point = linear_combination3d(model.points[i], x_col, y_col, z_col);
            new_points.push(new_point);
        }

        let new_k_hat = linear_combination3d(this.display_k_hat, x_col, y_col, z_col);
        let h = Math.sqrt(new_k_hat.x**2 + new_k_hat.z**2)
        this.display_k_hat_theta = Math.atan2(new_k_hat.y, h) // use atan2 specifically
        this.display_k_hat_phi = Math.atan2(new_k_hat.z, new_k_hat.x) // use atan2 specifically

        this.display_coord_obj = undefined;
        this.display_coord_obj = new this.coord_class(new_points, this.display_k_hat_theta, this.display_k_hat_phi);
    }

    /**
     * @param {*} surface_index index in Array coord_object.surfaces
     */
     draw_surface(surface_index) {
        
        let faces = ["back", "front", "right", "left", "top", "bottom"];

        let surface_ref = this.display_coord_obj.surfaces[surface_index];

        let phi = surface_ref[4];
        let half_pi = Math.PI * 0.5;
        if (phi <= -half_pi || phi >= half_pi) {
            console.log(faces[Math.floor(surface_index/2)], "false");
            return;
        }
        console.log(faces[Math.floor(surface_index/2)], "true");

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
        let colors = ["red", "blue", "pink", "green", "orange", "purple"];
        const ctx = this.canvas.getContext("2d");
        for (let i = 0; i < 6; i++) {
            // console.log(colors[i]);
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