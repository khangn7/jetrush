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
    Cube_coords,
    // Grid_coords
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

    // const grid1 = make_grid(canvas_elem);
    // const grid2 = make_grid(canvas_elem);

    let cube = make_cube(canvas_elem);
    let display_things = [cube];
    const paintframe = (things /* array of Shapes */) => {
        clearCanvas(canvas_elem);
        for (let i in things) {
            things[i].draw_lines();
        }
    };

    // let grid_halfsize = 10000;
    // grid2.user_translate('z', grid_halfsize);

    // cube.draw_surface(0);
    console.log(cube.surfaces[0])

    paintframe(display_things);

    // return

    const FPS = 60;

    const SPEED = 100;
    let phi = 0, theta = 0;

    let running = false;

    let interval;

    document.addEventListener("click", ()=> {
        if (!running) {
            running = true
            interval = setInterval(() => {

                if (phi > 6.28) {
                    phi = 0;
                }

                phi += Math.PI * 0.005;
                theta += Math.PI * 0.005;
        
                cube.rotate_and_draw(Math.PI * 0.6, phi);
        
            }, 1000/FPS);

        } else {
            clearInterval(interval);
            console.log("interval stopped");
            running = false
        }
    });

}

main();

function make_cube(canvas_elem) {
    let template_points = [
        // [x, y, z]
        [-100, -100, -100], // back bottom left
        [100, -100, -100], // back bottom right
        [100, 100, -100], // back top right
        [-100, 100, -100], // back top left

        [-100, -100, 100], // front bottom left
        [100, -100, 100], // front bottom right
        [100, 100, 100], // front top right
        [-100, 100, 100] // front top left
    ];
    for (let i in template_points) {
        template_points[i] = new Vector(
            template_points[i][0] * 0.7, 
            template_points[i][1] * 0.7, 
            template_points[i][2] * 0.7
        );
    }
    const cube_coords = new Cube_coords(template_points);

    // const cube = new Shape(
    //     canvas_elem,
    //     cube_coords.points, 
    //     cube_coords.lines,
    //     Cube_coords,
    //     true // dont_hardcopy. here this is used so references in s_lines can be used.
    //          // as in, so we only need to change values of s_points and s_lines values point to them
    // );

    const cube = new CubeShape(canvas_elem, cube_coords);

    return cube;

}

function make_grid(canvas_elem) {
    let x_square_count = 10;
    let z_square_count = 10;

    // _points=false, x_range, z_range, y, x_square_count, z_square_count
    const grid_coords = new Grid_coords(false, 100, 10000, -100, x_square_count, z_square_count);

    const grid = new GridShape(
        canvas_elem,
        grid_coords.points, 
        grid_coords.lines,
        Grid_coords,
        true,// dont_hardcopy. here this is used so references in s_lines can be used.
             // as in, so we only need to change values of s_points and s_lines values point to them
        {
            x_square_count: x_square_count,
            z_square_count: z_square_count
        }
    );

    return grid;
}

function clearCanvas(canvas) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}