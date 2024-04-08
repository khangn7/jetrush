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

    let cube = make_cube(canvas_elem);

    let line_coords = new Line_coords([
        new Vector(0, -50, 0),
        new Vector(100, -50, 100)
    ]);
    let line1 = new Shape(canvas_elem, line_coords, Line_coords);
    // line_coords = new Line_coords([
    //     new Vector(0, 0, 0),
    //     new Vector(0, -100, 0)
    // ]);
    // let line2 = new Shape(canvas_elem, line_coords, Line_coords);
    
    let display_things = {
        // "line1": line1, 
        // "line2": line2, 
        "cube": cube
    };
    const paintframe = (things /* array of Shapes */) => {
        clearCanvas(canvas_elem);
        for (let i in things) {
            things[i].draw_surfaces();
            // things[i].draw_lines();
        }
    };

    
    // line1.worldspace_position_set(0, 0, -200)

    cube.worldspace_position_set(0, 0, -200)
    // // console.log(cube.display_coord_obj)
    // console.log(cube.furthest_z);

    // // // cube.rotate(1, 1);
    // // // // cube.rotate(1, 0, true);

    // paintframe(display_things);

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

                // if (phi > 3.14) {
                //     phi += 0;
                // } else {
                //     phi -= Math.PI * 0.001;
                // }

                // line1.worldspace_move(0, 0, 1);
                // cube.worldspace_move(0, 0, 1);
                if (cube.furthest_z > -5) {
                    clearInterval(interval);
                }
                console.log("step");

                phi += Math.PI * 0.01;
                // // console.log(phi)
                cube.rotate_xyz(phi, 1);
                cube.rotate_xyz(
                    phi,
                    0,
                    true
                );

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
    const scale = 0.2;
    for (let i in template_points) {
        template_points[i] = new Vector(
            template_points[i][0] * scale, 
            template_points[i][1] * scale, 
            template_points[i][2] * scale
        );
    }
    const cube_coords = new Cube_coords(template_points);

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