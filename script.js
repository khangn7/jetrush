/*
https://docs.google.com/document/d/1O4p7wp5PDOXYR603c-Hvf3A5mCqCEAJT4kB97HY5n2I/edit?usp=sharing

using the canvas as a cartesian plane
right handed coordinates

when displaying a 3d vector, we'll only use it's x and y values

*/

import { 
    blockOfBuildings,
} from "./lib/game.js"

const Z_CLIP = -100;

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

    const map_y = -80;



    const BUILDING_SPEED = 5; // how fast buildings move towards user
    const block_x_center = 100;
    const start_z = -2000; // furthest building z
    const building_width = 60;
    const building_height = 300; // max
    const row_length = 30;
    const row_count = 1;
    const buildings = new blockOfBuildings(
        canvas_elem,
        {
            row_count: row_count,
            row_length: row_length,
            building_width:building_width,
            building_height: building_height,
            center_x: block_x_center,
            map_y: map_y,
            start_z: start_z,
        }
    ); 
    
    const paintframe = () => {
        clearCanvas(canvas_elem);

        // draw buildings
        buildings.draw() ;

    };
    paintframe();

    // setTimeout(()=>{
    //     buildings.addRightRow();
    //     console.log(buildings.rows)
    //     paintframe();

    // }, 2000);
    // return;

    const FPS = 75;

    let running = false;

    let interval;

    const MOVE_SPEED = 2; // how fast buildings move left/right
    const moveKeys = {
        right: false,
        left: false
    };
    document.addEventListener("keydown", (e) => {
        if (e.code == "ArrowRight") {
            moveKeys.right = true
        } else if (e.code == "ArrowLeft") {
            moveKeys.left = true
        }
    });
    document.addEventListener("keyup", (e) => {
        if (e.code == "ArrowRight") {
            moveKeys.right = false
        } else if (e.code == "ArrowLeft") {
            moveKeys.left = false
        }
    });
    // return;

    // GAME LOOP
    document.addEventListener("click", ()=> {
        if (!running) {
            running = true
            interval = setInterval(() => {

                let row_length = buildings.rows[0].length;
                let closest_z = buildings.rows[0][row_length - 1].world_pos.z;

                // move buildings towards user
                if (closest_z < Z_CLIP) {
                    buildings.move(0, 0, -BUILDING_SPEED);
                } else {
                    buildings.advanceColumn();
                }

                // move left and right
                if (moveKeys.right) {
                    buildings.move(-MOVE_SPEED, 0, 0);
                }
                if (moveKeys.left) {
                    buildings.move(MOVE_SPEED, 0, 0);
                }


                paintframe();
        
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