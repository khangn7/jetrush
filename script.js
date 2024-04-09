/*
https://docs.google.com/document/d/1O4p7wp5PDOXYR603c-Hvf3A5mCqCEAJT4kB97HY5n2I/edit?usp=sharing

using the canvas as a cartesian plane
right handed coordinates

when displaying a 3d vector, we'll only use it's x and y values

*/

import { 
    Cube_coords,
    // Grid_coords,
    Line_coords
} from "./lib/coords.js";

import {
    Vector
} from "./lib/math_functions.js";

import {
    Shape,
    GridShape,
    CubeShape
} from "./lib/shape.js";



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

    let map_y = -25;

    // let ground = make_cuboid(canvas_elem, 200, 1500, 0, map_y - 100, -820);
    // ground.rotate_xyz(Math.PI * 0.5, 0);
    // ground.rotate_xyz(Math.PI * 0.5, 2, true);

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "burlyslateblue";
    ctx.beginPath();
    ctx.rect(20, 20, 150, 100);
    ctx.stroke();

    let display_things = [];

    let row_start_z = -1500;
    let row = rowOfCuboids(canvas_elem, map_y, -1500, 10, 10, 50)
    display_things = display_things.concat(row);

    

    const paintframe = (things /* array of Shapes */) => {
        clearCanvas(canvas_elem);
        for (let i in things) {
            things[i].draw_surfaces();
            // things[i].draw_lines();
        }
    };

    paintframe(display_things);

    return;

    const FPS = 60;

    let running = false;

    let interval;

    document.addEventListener("click", ()=> {
        if (!running) {
            running = true
            interval = setInterval(() => {

                for (let i = 0; i < row.length; i++) {
                    row[i].worldspace_move(0, 0, 5);
                }
                if (row[1].world_pos.z > -10) {
                    for (let i = 0; i < row.length; i++) {
                        row[i].worldspace_position_set()
                    }
                }

                paintframe(display_things);
        
            }, 1000/FPS);

        } else {
            clearInterval(interval);
            console.log("interval stopped");
            running = false
        }
    });

    document.body.click();

}

main();

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
function make_cuboid(canvas_elem, width, height, x, y, z) {
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

function rowOfCuboids(canvas_elem, row_y, row_z, amount, width, max_height) {
    let x = - (amount/2) * (2 * width) +  width;
    let cuboids = [];
    let flip = 0;
    for (let i = 0; i < amount; i++) {
        let height = Math.random() * max_height;
        height *= flip ? 1 : 0.4;
        flip = flip ? 0 : 1;
        cuboids.push(make_cuboid(canvas_elem, width, height, x, row_y + 0.5*height, row_z))
        x += width * 2;
    }
    return cuboids;
}

// function make_grid(canvas_elem) {
//     let x_square_count = 10;
//     let z_square_count = 10;

//     // _points=false, x_range, z_range, y, x_square_count, z_square_count
//     const grid_coords = new Grid_coords(false, 100, 10000, -100, x_square_count, z_square_count);

//     const grid = new GridShape(
//         canvas_elem,
//         grid_coords.points, 
//         grid_coords.lines,
//         Grid_coords,
//         true,// dont_hardcopy. here this is used so references in s_lines can be used.
//              // as in, so we only need to change values of s_points and s_lines values point to them
//         {
//             x_square_count: x_square_count,
//             z_square_count: z_square_count
//         }
//     );

//     return grid;
// }

function clearCanvas(canvas) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}