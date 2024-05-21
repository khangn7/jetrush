/*
https://docs.google.com/document/d/1O4p7wp5PDOXYR603c-Hvf3A5mCqCEAJT4kB97HY5n2I/edit?usp=sharing

using the canvas as a cartesian plane
right handed coordinates

when displaying a 3d vector, we'll only use it's x and y values

*/

import { 
    blockOfBuildings,
    makeShip,
} from "./lib/game.js"
import { SHIP_COLOR } from "./lib/settings.js";

const Z_CLIP = -100;

async function main() {

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

    const ship = makeShip(canvas_elem, 2);
    const ship_y = 0;
    ship.worldspace_position_set(0, ship_y, -250);

    const BUILDING_SPEED = 8; // how fast buildings move towards user
    const block_x_center = 0;
    const start_z = -600; // furthest building z
    const building_width = 60;
    const building_height = 300; // max
    const row_length = 10;
    const row_count = 10;


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
        // buildings.draw();

        ship.draw_surfaces();

    };
    paintframe();

    // setTimeout(()=>{
    //     buildings.addLeftRow();
    //     console.log(buildings.rows)
    //     paintframe();

    // }, 2000);
    // return;

    const FPS = 60;

    let running = false;

    let interval;

    const moveKeys = {
        right: false,
        left: false
    };
    document.addEventListener("keydown", (e) => {
        let k = e.key;
        if (k == "ArrowRight" || k == "d") {
            moveKeys.right = true
        } else if (k == "ArrowLeft" || k == "a") {
            moveKeys.left = true
        }
    });
    document.addEventListener("keyup", (e) => {
        let k = e.key;
        if (k == "ArrowRight" || k == "d") {
            moveKeys.right = false
        } else if (k == "ArrowLeft" || k == "a") {
            moveKeys.left = false
        }
    });
    // return;

    let x_velocity = 0;
    const X_VELOCITY_CAP = 2;
    const DECCELERATION = 0.1;
    let move_x = 0;
    const X_BOUNDS_RIGHT = -0.5 * (row_count - 1.5) * building_width;
    const X_BOUNDS_LEFT = 0.5 * (row_count) * building_width;

    const THETA_MAX = Math.PI * 0.1;
    let theta = 0;
    const theta_accel = 0.15;
    const theta_deccel = 0.1;

    // GAME LOOP
    document.addEventListener("click", ()=> {
        if (!running) {
            running = true
            interval = setInterval(() => {

                theta += 0.06;
                ship.rotate_around_vector(theta, 2.4, -0.5);
                paintframe();

                return;

                let row_length = buildings.rows[0].length;
                let closest_z = buildings.rows[0][row_length - 1].world_pos.z;

                // move buildings towards user
                buildings.move(0, 0, BUILDING_SPEED);
                if (closest_z > Z_CLIP) {
                    buildings.advanceColumn();
                }

                // move buildings left/right and rotate ship
                if (moveKeys.right && move_x > X_BOUNDS_RIGHT) {
                    x_velocity = -X_VELOCITY_CAP
                    buildings.move(x_velocity, 0, 0);
                    move_x += x_velocity

                    if (theta > -THETA_MAX) {
                        theta -= theta_accel;
                        ship.rotate_xyz(theta, 2);
                    }

                }
                if (moveKeys.left && move_x < X_BOUNDS_LEFT) { 
                    x_velocity = X_VELOCITY_CAP;
                    buildings.move(x_velocity, 0, 0);
                    move_x += x_velocity

                    if (theta < THETA_MAX) {
                        theta += theta_accel;
                        ship.rotate_xyz(theta, 2);
                    }

                }

                // deccelerate and unrotate ship
                if (x_velocity > 0) {
                    x_velocity -= DECCELERATION;

                    if (theta > 0 && !moveKeys.left) {
                        theta -= theta_deccel;
                        ship.rotate_xyz(theta, 2);
                    }

                } else if (x_velocity < 0) {
                    x_velocity += DECCELERATION;

                    if (theta < 0 && !moveKeys.right) {
                        theta += theta_deccel;
                        ship.rotate_xyz(theta, 2);
                    }

                }
                if (Math.abs(x_velocity) < 0.1) {
                    x_velocity = 0;
                }
                if (Math.abs(theta) < 0.1) {
                    theta = 0;
                    ship.rotate_xyz(theta, 1);
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function clearCanvas(canvas) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}