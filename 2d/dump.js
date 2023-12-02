// let template_points = [[0,0], [100, 0]];
    // let s_points = [];
    // const point_count = template_points.length;
    // for (let i = 0; i < point_count; i++) {
    //     s_points.push(new Vector(template_points[i][0], template_points[i][1]));
    // }
    // let s_lines = [
    //     s_points[0], s_points[1]
    // ];
    
    // const arrow = new Shape(
    //     canvas_elem, 
    //     s_points,
    //     s_lines,
    //     true
    // )
    
    // let theta = 0;
    // let old_theta = theta;
    // let i_hat, j_hat;
    // const context = canvas.getContext("2d");
    // const interval = setInterval(
    //     () => {
    //         if (theta > 1) {
    //             clearInterval(interval);
    //         }
    //         console.log(theta - old_theta);

    //         i_hat = rotated_basis_vector(theta);
    //         j_hat = rotated_basis_vector(theta + Math.PI/2);

    //         for (let i = 0; i < point_count; i++) {
    //             let point = s_points[i]; // Vector(i-hat scalar, j-hat scalar)
    //             // linear combination
    //             let new_x = point.x * i_hat.x + point.y * j_hat.x;
    //             let new_y = point.x * i_hat.y + point.y * j_hat.y;
    
    //             point.x = new_x;
    //             point.y = new_y;
    //         }

    //         context.clearRect(0, 0, canvas.width, canvas.height);
    //         arrow.draw_lines();
            
    //         old_theta = theta;
    //         theta += 0.017;
    //     },
    //     100
    // );