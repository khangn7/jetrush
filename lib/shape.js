
// "point" = vertex

import { Cube_coords } from "./coords.js";
import { fade, sunlight } from "./light.js";
import {
    Vector,
    // rotated_basis_vector,
    // translate_angles,
    linear_combination3d,
    rotation_matrix,
    dotProduct,
    addVectors
} from "./math_functions.js"
import {
    PERSPECTIVE,
    VIEWPORT_Z,
    VIEWPORT_HEIGHT,
    BUILDING_COLOR
} from "./settings.js"

/*
    pipeline
    1. rotate/transform in model space
    2. translate to world space
    3. apply perspective (project from world space to viewport)
    4. cull backfaces
    5. translate for html canvas (viewport to device)
    6. display
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

        // this.display_coord_obj is positional coords in virtual space to use to display
        // this property can be reassigned
        this.display_coord_obj = JSON.parse(JSON.stringify(coord_object)); // deepcopy just in case idk
        

        // note: having two coord_obj like this makes things easier
        // then you could transform coords and display things independently

        // position in world space, specifically position of point that would be (0,0,0) in model space
        this.world_pos = new Vector(0,0,0);

        // used to see if shape is past z = 0 boundary
        let furthest_z = Infinity;
        for (let vertex of coord_object.points) {
            furthest_z = Math.min(vertex.z, furthest_z);
        }
        this.furthest_z = furthest_z;

        // used for viewport to canvas coord mapping
        // generate viewport width based on aspect ratio
        this.VIEWPORT_WIDTH = VIEWPORT_HEIGHT * (canvas.clientWidth/canvas.clientHeight);
        this.cv_height_ratio = canvas.clientHeight/VIEWPORT_HEIGHT;
        this.cv_width_ratio = canvas.clientWidth/this.VIEWPORT_WIDTH;
    }

    // call after EVERY TIME shape is rotated/moved
    // used to see if shape is past z = 0 boundary
    set_furthest_z() {
        let furthest_z = Infinity;
        for (let vertex of this.display_coord_obj.points) {
            furthest_z = Math.min(vertex.z, furthest_z);
        }
        this.furthest_z = furthest_z + this.world_pos.z;
    }

    /**
     * model space coords -> viewport coords
     * passed by reference
     * @param {Vector} coords 
     */
    pipeline(coords) {
        // order is important here

        this.worldspace_translate_coords(coords)
        if (PERSPECTIVE) {
            this.perspective(coords);
        }
        this.canvas_translate_coords(coords);

        // rounding makes faster
        coords.x = coords.x;
        coords.y = coords.y;
        coords.z = coords.z;
    }

    /**
     * viewport coords -> html canvas coords
     * 
     * translate coordinates so can be used on canvas element
     * @param {Vector} coords coords passed by reference
     */
    canvas_translate_coords(coords) {
        coords.x *= this.cv_width_ratio // viewport to canvas
        coords.x += this.canvas_halfWidth; // center in screen
        coords.y *= this.cv_height_ratio // viewport to canvas
        coords.y = -coords.y + this.canvas_halfHeight; // center in screen
    }

    /**
     * increments worldspace coords
     * @param {Number} x_change 
     * @param {Number} y_change 
     * @param {Number} z_change 
     */
    worldspace_move(x_change, y_change, z_change) {
        this.world_pos.x += x_change;
        this.world_pos.y += y_change;
        this.world_pos.z += z_change;

        this.set_furthest_z();
    }

    /**
     * rewrite world space coords
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     */
    worldspace_position_set(x, y, z) {
        this.world_pos.x = x
        this.world_pos.y = y
        this.world_pos.z = z

        this.set_furthest_z();
    }

    /**
     * given model space coords, give world space coords
     * @param {Vector} coords passed by ref
     */
    worldspace_translate_coords(coords) {
        coords.x += this.world_pos.x;
        coords.y += this.world_pos.y;
        coords.z += this.world_pos.z;
    }

    /**
     * 
     * 
     * @param {Vector} coords passed by reference
     * scales x and y values based on z value
     * more negative z ("further" away from viewer) = smaller x and y
     * more positive z ("closer" to viewer) = bigger x and y
     */
    perspective(coords) {
        let percent = (VIEWPORT_Z/coords.z);
        coords.x *= percent * this.canvasHeight;
        coords.y *= percent * this.canvasHeight;
    }

    draw_lines() {
        const shape = this.display_coord_obj;
        const line_count = shape.lines.length;

        const ctx = this.canvas.getContext("2d");
        for (let i = 0; i < line_count; i += 2) {
            
            ctx.beginPath();

            let display_coord = new Vector(shape.lines[i].x, shape.lines[i].y, shape.lines[i].z);
            this.pipeline(display_coord);
            ctx.moveTo(display_coord.x, display_coord.y);
            
            display_coord = new Vector(shape.lines[i + 1].x, shape.lines[i + 1].y, shape.lines[i + 1].z);
            this.pipeline(display_coord);
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
    rotate_xyz(rotate_angle, rotation_axis, use_current_coords=false) {
    
        let model = use_current_coords ? this.display_coord_obj : this.model_coord_obj;
        
        let r_matrix = rotation_matrix(rotate_angle, rotation_axis);

        let x_col = r_matrix[0],
            y_col = r_matrix[1],
            z_col = r_matrix[2];

        const new_points = []; // array of Vectors
        const point_count = model.points.length;
        for (let i = 0; i < point_count; i++) {
            let new_point = linear_combination3d(model.points[i], x_col, y_col, z_col);
            new_points.push(new_point);
        }

        this.display_coord_obj = undefined;
        this.display_coord_obj = new this.coord_class(new_points);

        this.set_furthest_z();


    }
    /**
     * rotates shape around axis described by theta and phi
     * @param {Number} rotate_angle angle of rotation
     * @param {Number} theta angle that axis of rotation makes with positive y axis
     * @param {Number} phi angle that axis of rotation makes with positive z axis
     * 
     */
    rotate_around_vector(rotate_angle, theta, phi) {
        this.rotate_xyz(rotate_angle, 2);
        this.rotate_xyz(theta, 0, true);
        this.rotate_xyz(phi, 1, true);
    }


    /**
     * @param {*} surface_index index in Array coord_object.surfaces
     * @param {Array[Number]} [256, 256, 256]
     */
     draw_surface(surface_index, color, orthographic=!PERSPECTIVE, draw_normal=false) {

        let surface_ref = this.display_coord_obj.surfaces[surface_index];

        // backface cull
        let v_to_surface = orthographic ? new Vector(0,0,-1) : addVectors(surface_ref.corner1, this.world_pos);
        // console.log(v_to_surface);  
        let dot = dotProduct(v_to_surface, surface_ref.normal);
        if (dot >= 0) {
            return;
        }


        const ctx = this.canvas.getContext("2d");
        
        
        // color pipeline

        // sunlight
        color = sunlight(color, surface_ref.normal)
        // fade
        let center = addVectors(surface_ref.center, this.world_pos);
        color = fade(color, Math.sqrt(center.x**2 + center.y**2 + center.z**2));

        color = color.map(x => String(x))
        ctx.fillStyle = "rgba(" + color.join() + ", 1)";

        
        
        ctx.beginPath();

        let point_ref = surface_ref.corner1;
        let display_coord = new Vector(point_ref.x, point_ref.y, point_ref.z);
        this.pipeline(display_coord);
        ctx.moveTo(display_coord.x, display_coord.y);

        let corners = [surface_ref.corner2, surface_ref.corner3];
        for (let i = 0; i < 2; i++) {

            let point_ref = corners[i];
            display_coord = new Vector(point_ref.x, point_ref.y, point_ref.z);
            this.pipeline(display_coord);

            ctx.lineTo(display_coord.x, display_coord.y);

        }

        ctx.fill();

        // FOR DRAWING NORMALS OF SURFACE
        // currently weird
        if (draw_normal) {
            ctx.beginPath();

            display_coord = new Vector(surface_ref.center.x, surface_ref.center.y, surface_ref.center.z);
            this.pipeline(display_coord);
            ctx.moveTo(display_coord.x, display_coord.y);
        
            display_coord = addVectors(surface_ref.center, surface_ref.normal);
            display_coord = addVectors(display_coord, this.world_pos);
            this.pipeline(display_coord);
            ctx.lineTo(display_coord.x, display_coord.y);

            ctx.stroke();
        }
    }

    draw_surfaces(color) {
        let surface_count = this.model_coord_obj.surfaces.length;
        for (let i = 0; i < surface_count; i++) {
            this.draw_surface(i, color);
        }
    }
}

export class CubeShape extends Shape {
    /**
     * 
     * @param {*} canvas 
     * @param {Cube_coords} coord_object 
     */
    constructor(canvas, coord_object) {
        super(canvas, coord_object, Cube_coords);
    }

    /**
     * 
     * @param {Array[Number]} color [256, 256, 256]
     * // gray 144, 144, 144
     */
    draw_surfaces(color=false) {
        const ctx = this.canvas.getContext("2d");
        color = color ? color : BUILDING_COLOR; // default
        for (let i = 0; i < 6; i++) {
            // console.log(colors[i]);
            // ctx.fillStyle = color ? color : colors[i];
            this.draw_surface(i * 2, color);
            this.draw_surface(i * 2 + 1, color);
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
