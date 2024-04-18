import { Cube_coords } from "./coords.js";
import {
    CubeShape
} from "./shape.js";
import {
    Vector
} from "./math_functions.js";

const HEIGHT_R_CUTOFF = 0.9;

class Building extends CubeShape {
    constructor(canvas, coord_object, width, height) {
        super(canvas, coord_object)
        this.width = width;
        this.height = height;
    }
}

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

/**
 * 
 * @param {Object} canvas_elem 
 * @param {Boolean} right_side left doesn't include row centered at x=0
 * @param {Object} info 
 *      info = {
            row_count: how many rows there are (left to right),
            row_length: how long each row is (near to far),
            building_width:
            building_height: max building height,
            map_y:
            start_z: z for furthest building away
        }
 * @return {Array[Array]} buildings [row1, row2, row3], rows go along z axis
        rows are ordered most positive x to 0 for right side, most negative x to -width for left side
        in each row, buildings are ordered most negative z to most positive z
        this is must it's the display order
 */
function makeBlock(canvas_elem, right_side, info) {
    const row_count = info.right_row_count;
    const {
        row_length, 
        building_width, 
        building_height,
        map_y,
        start_z
    } = info;

    let buildings = [];
    for (let i = 0; i < row_count; i++) {
        buildings.push([]);
    }

    let furthest_x, add;
    if (right_side) {
        furthest_x = (row_count - 1) * building_width
        add = -1;
    } else {
        furthest_x = -row_count * building_width
        add = 1;
    }
    
    for (let i = 0; i < row_length; i++) {
        for (let j = 0; j < row_count; j++) {

            let h = buildingHeight(building_height);
            buildings[j].push(make_building(
                canvas_elem,
                building_width,
                h,
                furthest_x + add * j * building_width,
                map_y + 0.5 * h,
                start_z + i * building_width
            ))

        }
    }

    return buildings;
}

export class blockOfBuildings {
    /**
     * 
     * @param {Object} canvas_elem 
     * @param {Object} info 
    *       info = {
                right_row_count: how many rows there are (from x=0 to right),
                row_length: how long each row is (near to far),
                building_width:
                building_height: max building height,
                map_y:
                start_z: z for furthest building away
            }
    */
    constructor(canvas_elem, info) {

        // contains all rows of buildings with world_pos.x >= -0.5 * building width
        this.right_buildings = makeBlock(canvas_elem, true, info);
        
        // contains all rows of buildings with world_pos.x < -0.5 * building width
        info.right_row_count--;
        this.left_buildings = makeBlock(canvas_elem, false, info);
        this.building_w = info.building_width;
    }

    perform_on_all(func) {

        // note: based on game, will never need to account for 
        // left side or right side being empty
        // but will create error here if they are

        let rb = this.right_buildings,
            lb = this.left_buildings;
        let row_count = lb.length;
        let row_length = lb[0].length;
        for(let i = 0; i < row_count; i++) {
            for (let j = 0; j < row_length; j++) {
                func(lb[i][j]);
            }
        }
        row_count = rb.length;
        for (let i = 0; i < row_count; i++) {
            for (let j = 0; j < row_length; j++) {
                func(rb[i][j]);
            }
        }
        
    }

    /**
     * moves all buildings
     * @param {Array[Array]} buildings array returned by blockOfBuildings()
     * @param {Number} x_change 
     * @param {Number} y_change 
     * @param {Number} z_change 
     */
    move(x_change, y_change, z_change) {
        this.perform_on_all((building) => {
            building.worldspace_move(x_change, y_change, z_change)
        })

        // move rows from right side to left side if necessary
        let rb = this.right_buildings,
            lb = this.left_buildings;
        let half_bw = this.building_w * 0.5;
        for (let row_i in rb) {
            // if first building in row i is...
            if (rb[row_i][0].world_pos.x < -half_bw) {
                lb.push(rb.pop());
            }
        }
        // move rows from left side to right side if necessary
        for (let row_i in lb) {
            if (lb[row_i][0].world_pos.x >= -half_bw) {
                rb.push(lb.pop());
            }
        }
    }

    draw() {
        this.perform_on_all((building) => {
            building.draw_surfaces();
        })

        // then redraw row that's closest to x=0

        const rb = this.left_buildings;
        const lb = this.right_buildings;

        // find closest in left side 
        let left_i = 0;
        let left_x = lb[left_i][0].world_pos.x;
        for (let row_i in lb) {
            let row_x = lb[row_i][0].world_pos.x;
            if (Math.abs(row_x) < Math.abs(left_x)) {
                left_i = row_i;
                left_x = row_x;
            }
        } 

        // and on the right side
        let right_i = 0;
        let right_x = rb[right_i][0].world_pos.x;
        for (let row_i in rb) {
            let row_x = rb[row_i][0].world_pos.x;
            if (Math.abs(row_x) < Math.abs(right_x)) {
                right_i = row_i;
                right_x = row_x;
            }
        }
        
        //  if left_i == -1, then right_i != -1. and vice versa
        let closest_row;
        if (Math.abs(left_x) < Math.abs(right_x)) {
            closest_row = lb[left_i];
        } else {
            closest_row = rb[left_i];
        }
        
        for (let i in closest_row) {
            closest_row[i].draw_surfaces();
        }

    }


}



export function addNewColumn(buildings) {
    for (let i in buildings) {
        // remove closest buildings
        buildings[i].pop();
        // add new furthest buildings
        buildings[i].unshift()
    }
}

export function buildingHeight(max) {
    let r = Math.random()
    if (r < HEIGHT_R_CUTOFF) {
        let r2 = Math.random()
        return 0.1 * r2 * max
    } else {
        return r * max
    }
}
