/*
https://docs.google.com/document/d/1O4p7wp5PDOXYR603c-Hvf3A5mCqCEAJT4kB97HY5n2I/edit?usp=sharing

using the canvas as a cartesian plane
right handed coordinates

when displaying a 3d vector, we'll only use it's x and y values

*/

import { 
    blockOfBuildings,
} from "./lib/game.js"

const Z_CLIP = -20;

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

    const map_y = -50;


    const ctx = canvas_elem.getContext("2d");

    // const ground = () => {
    //     ctx.beginPath();
    //     ctx.fillStyle = "black";
    //     ctx.fillRect(0, canvas_elem.clientHeight * 0.5, canvas_elem.clientWidth, canvas_elem.clientHeight*0.5);
    //     ctx.stroke();
    // }

    const clip_z = -20;

    const building_speed = 3;
    const start_z = -600; // furthest building z
    const building_width = 60;
    const building_height = 200; // max
    const row_length = 5;

    // right_buildings = [row1, row2, row3], rows go along z axis
    // rows must be ordered most positive x to 0
    // in each row, buildings must be ordered most negative z to most positive z
    // this is must it's the display order
    const right_row_count = 3;
    const buildings = new blockOfBuildings(
        canvas_elem,
        {
            right_row_count: right_row_count,
            row_length: row_length,
            building_width:building_width,
            building_height: building_height,
            map_y: map_y,
            start_z: start_z,
        }
    ); 
    

    const paintframe = () => {
        clearCanvas(canvas_elem);

        // draw buildings
        buildings.draw();

    };
    buildings.move(-50, 0, 0)
    paintframe(); 

    return;

    const FPS = 60;

    let running = false;

    let interval;

    // GAME LOOP
    document.addEventListener("click", ()=> {
        if (!running) {
            running = true
            interval = setInterval(() => {

                // move buildings
                moveBuildings(left_buildings, 0, 0, 1)
                moveBuildings(right_buildings, 0, 0, 1)

                if (buildings[0][0].z > Z_CLIP) {
                    for (let i in left_buildings) {

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