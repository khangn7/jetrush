import { Cube_coords, Ship_coords } from "./coords.js";
import {
    CubeShape,
    Shape
} from "./shape.js";
import {
    Vector
} from "./math_functions.js";
import { SHIP_VERTICES } from "../model/ship.js";

// out of 1, how much times should buildings be short vs tall
const HEIGHT_R_CUTOFF = 0.94; 

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
 export function makeBuilding(canvas_elem, width, height, x, y, z) {
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
    for (let i = 0; i < template_points.length; i++) {
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
 * @param {Object} info 
 *      info = {
            row_length: how long each row is (near to far),
            building_width:
            building_height: max building height,
            row_x: 
            map_y:
            start_z: z for furthest building away
        }
 * @return {Array[Shape]} buildings [building1, building2, building3, ...],
        buildings will in order of most negative to positive z (far to near)
*/
function makeRow(canvas_elem, info) {
    const {
        row_length, 
        building_width, 
        building_height,
        row_x,
        map_y,
        start_z
    } = info;

    let row = [];
    
    for (let i = 0; i < row_length; i++) {

        let h = buildingHeight(building_height);
        row.push(makeBuilding(
            canvas_elem,
            building_width,
            h,
            row_x,
            map_y + 0.5 * h,
            start_z + i * building_width
        ))
    }

    return row;
} 

export class blockOfBuildings {
    /**
     * 
     * @param {Object} canvas_elem 
     * @param {Object} info 
    *       info = {
                row_count:
                row_length: 
                building_width:
                building_height: max building height,
                center_x:
                map_y:
                start_z: z for furthest building away
            }
    */
    constructor(canvas_elem, info) {
        info = JSON.parse(JSON.stringify(info));

        this.building_w = info.building_width;
        this.max_height = info.building_height;
        this.map_y = info.map_y;
        this.canvas = canvas_elem;

        const row_count = info.row_count;
        let rows = [];
        const furthest_x = info.center_x - this.building_w * Math.floor(0.5 * row_count)
        for(let i = 0; i < row_count; i++) {
            info.row_x = furthest_x + i * this.building_w;
            rows.push(makeRow(
                canvas_elem,
                info
            ))
        }

         // rows will be negative x to positive x
         // buildings in rows[i] will be negative z to positive z
        this.rows = rows;
    }

    // add new buildings to the back and remove buildings in front
    advanceColumn() {
        const rows = this.rows;
        const i_n = rows.length;
        for (let i = 0; i < i_n; i++) {

            // remove building in front
            let b = rows[i].pop(); 

            // add new building
            let h = buildingHeight(this.max_height); 
            let furthest_z = rows[i][0].world_pos.z;
            rows[i].unshift(makeBuilding(
                b.canvas,
                b.width,
                h,
                b.world_pos.x,
                this.map_y + 0.5 * h,
                furthest_z - b.width
            ))
        }
    }

    // add another row on left side of block
    addLeftRow() {
        let w = this.building_w;
        let leftmost_x = this.rows[0][0].world_pos.x;
        let furthest_z = this.rows[0][0].world_pos.z;
        this.rows.unshift(makeRow(
            this.canvas,
            {
                row_length: this.rows[0].length,
                building_width: w,
                building_height: this.max_height,
                row_x: leftmost_x - w,
                map_y: this.map_y,
                start_z: furthest_z
            }
        ));
    }

    // add another row on right side of block
    addRightRow() {
        let w = this.building_w;
        let rightmost_x = this.rows[this.rows.length - 1][0].world_pos.x;
        let furthest_z = this.rows[0][0].world_pos.z;
        this.rows.unshift(makeRow(
            this.canvas,
            {
                row_length: this.rows[0].length,
                building_width: w,
                building_height: this.max_height,
                row_x: rightmost_x + w,
                map_y: this.map_y,
                start_z: furthest_z
            }
        ));
    }



    // assumes that all rows have the same length
    // will access index out of bounds if not
    perform_on_all(func) {
        const rows = this.rows;
        const i_n = rows.length;
        const j_n = rows[0].length;
        for (let i = 0; i < i_n; i++) {
            for (let j = 0; j < j_n; j++) {
                func(rows[i][j]);
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
    }

    // assumes that all rows have the same length
    // will access index out of bounds if not
    draw() {
        // find row that's closest to x=0
        const rows = this.rows;
        let closest_i = 0;
        let closest_x = Math.abs(rows[0][0].world_pos.x);
        const row_count = rows.length;
        for (let row_i = 1; row_i < row_count; row_i++) {
            let b_x = Math.abs(rows[row_i][0].world_pos.x)
            if (b_x < closest_x) {
                closest_x = b_x;
                closest_i = row_i;
            }
        }

        const row_length = rows[0].length;

        // need to draw left side then right side,
        // and right side should contain closest_i building
        // (building with x coord closest to 0)
        // that building should be that last thing drawn

        // draw buildings to left of that, from negative x towards origin
        for (let i = 0; i < closest_i; i++) {
            for (let j = 0; j < row_length; j++) {
                rows[i][j].draw_surfaces();   
            }
        }
        // draw buildings in that row and to right of it
        // drawing in order of most positive x towards origin (right to left)
        for (let i = row_count - 1; i >= closest_i; i--) {
            for (let j = 0; j < row_length; j++) {
                rows[i][j].draw_surfaces();
            }
        }
    }


}

function buildingHeight(max) {
    let r = Math.random()
    if (r < HEIGHT_R_CUTOFF) {
        let r2 = Math.random()
        return 0.1 * r2 * max
    } else {
        return (0.6 + 0.4 * Math.random()) * max
        // return r * max
    }
}

export function makeShip(canvas_elem, scale) {
    let points = JSON.parse(JSON.stringify(SHIP_VERTICES));
    for (let i = 0; i < points.length; i++) {
        points[i] = new Vector(
            points[i][0] * scale, 
            points[i][1] * scale, 
            points[i][2] * scale
        );
    }
    const ship_coords = new Ship_coords(points);
    return new Ship(canvas_elem, ship_coords, Ship_coords);
}

export class Ship extends Shape {
    /**
     * 
     * @param {*} canvas 
     * @param {Cube_coords} coord_object 
     */
    constructor(canvas, coord_object) {
        super(canvas, coord_object, Ship_coords);

        this.hitpoints;
        let surface_count = this.model_coord_obj.surfaces.length;
        this.color_map = Array(surface_count).fill(0);
        this.colors = [
            [143/1.2, 184/1.2, 143/1.2]
        ]
    }

    /**
     * // gray 144, 144, 144
     */
    async draw_surfaces() {
        const surface_count = this.model_coord_obj.surfaces.length;

        const ctx = this.canvas.getContext("2d");
        let color;

        for (let i = 0; i < surface_count; i++) {
            color = this.colors[this.color_map[i]];
            this.draw_surface(i, color);

        }
    }
    
}