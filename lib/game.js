import { Cube_coords } from "./coords.js";
import {
    CubeShape
} from "./shape.js";
import {
    Vector
} from "./math_functions.js";

/**
 * 
 * @param {*} canvas_elem 
 * @param {Number} width 
 * @param {Number} height 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} z 
 * @returns {CubeShape}
 */
 export function make_building(canvas_elem, width, height, x, y, z) {
    let template_points = [
        // [x, y, z]
        [-1, -1, -1], // back bottom left
        [1, -1, -1], // back bottom right
        
        [1, 1, -1], // back top right
        [-1, 1, -1], // back top left

        [-1, -1, 1], // front bottom left
        [1, -1, 1], // front bottom right

        [1, 1, 1], // front top right
        [-1, 1, 1] // front top left
    ];
    const halfwidth = 0.5 * width;
    const halfheight = 0.5 * height;
    for (let i in template_points) {
        template_points[i] = new Vector(
            template_points[i][0] * halfwidth, 
            template_points[i][1] * halfheight, 
            template_points[i][2] * halfwidth
        );
    }
    const cube_coords = new Cube_coords(template_points);

    const cube = new Building(canvas_elem, cube_coords, width, height);

    cube.worldspace_position_set(x, y, z)

    return cube;

}

export function rowOfBuildings(canvas_elem, row_x, row_y, start_z, amount, width, max_height) {
    let cuboids = [];
    for (let i = 0; i < amount; i++) {
        let building = make_building(
            canvas_elem, 
            width, 
            max_height,
            row_x,
            row_y,
            start_z - width * i
        );
        cuboids.push(building);
    }
    return cuboids;
}

class Building extends CubeShape {
    constructor(canvas, coord_object, width, height) {
        super(canvas, coord_object)
        this.width = width;
        this.height = height;
    }
}