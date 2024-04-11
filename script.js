/*
https://docs.google.com/document/d/1O4p7wp5PDOXYR603c-Hvf3A5mCqCEAJT4kB97HY5n2I/edit?usp=sharing

using the canvas as a cartesian plane
right handed coordinates

when displaying a 3d vector, we'll only use it's x and y values

*/

import {
    rowOfBuildings,
} from "./lib/game.js"



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


    const ctx = canvas_elem.getContext("2d");

    const ground = () => {
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.fillRect(0, canvas_elem.clientHeight * 0.5, canvas_elem.clientWidth, canvas_elem.clientHeight*0.5);
        ctx.stroke();
    }

    let display_things = [];

    const clip_z = -20;

    const building_speed = 7;
    const row_start_z = -1000;
    const building_width = 30;
    const building_height = 200; // max
    const row_amount = 10
    const buildings = [];
    const distance_between_rows = building_width * 5;
    for (let i = 0; i < 5; i++) {
        let row = rowOfBuildings(
            canvas_elem, 
            map_y, 
            row_start_z + i * distance_between_rows, 
            row_amount + Math.round(Math.random()), 
            building_width, 
            building_height
        );
        for (let j = 0; j < row_amount; j++) {
            buildings.push(row[j])
        }
    }
    
    display_things = display_things.concat(buildings);

    

    const paintframe = (things /* array of Shapes */) => {
        clearCanvas(canvas_elem);
        ground();
        // sort shapes by z
        things.sort((a, b) => a.world_pos.z - b.world_pos.z)
        for (let i in things) {
            things[i].draw_surfaces();
        }
    };

    // paintframe(display_things); 

    // return;

    const FPS = 60;

    let running = false;

    let interval;

    document.addEventListener("click", ()=> {
        if (!running) {
            running = true
            interval = setInterval(() => {

                for (let i = 0; i < buildings.length; i++) {
                    buildings[i].worldspace_move(0, 0, building_speed);
                    if (buildings[i].world_pos.z > clip_z) {
                        buildings[i].worldspace_position_set(
                            buildings[i].world_pos.x, 
                            map_y + buildings[i].height * 0.5, 
                            row_start_z
                        )
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