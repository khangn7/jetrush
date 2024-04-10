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
 export function make_cuboid(canvas_elem, width, height, x, y, z) {
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

    const cube = new CubeShape(canvas_elem, cube_coords);

    cube.worldspace_position_set(x, y, z)

    return cube;

}

export function rowOfCuboids(canvas_elem, row_y, row_z, amount, width, max_height) {
    let x = - (amount/2) * (2 * width) +  width;
    let cuboids = [];
    let flip = Math.round(Math.random());
    for (let i = 0; i < amount; i++) {
        let height = Math.random() * max_height;
        height *= flip ? 1 : 0.4;
        flip = flip ? 0 : 1;
        cuboids.push(make_cuboid(canvas_elem, width, height, x, row_y + 0.5*height, row_z))
        x += width * 2;
    }
    return cuboids;
}

export function setRowPos(row, x, y, z) {
    let x_change = x - row[0].world_pos.x;
    let y_change = y - row[0].world_pos.y;
    let z_change = z - row[0].world_pos.z;
    for (let i = 0; i < row.length; i++) {
        row[i].worldspace_move(x_change, y_change, z_change);
    }
}

export function changeRowPos(row, x_change, y_change, z_change) {
    for (let i = 0; i < row.length; i++) {
        row[i].worldspace_move(x_change, y_change, z_change)
    }
}