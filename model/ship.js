// 25 vertices as described here -
// https://docs.google.com/document/d/1Yp2yHPpARgLEpbdvNprUdbOWpWIGP3AA5BYyEIk0bqg/edit?usp=sharing
// made for use along with coords class in coords.js
export const SHIP_VERTICES = [
    // head
    [0, 0, -100],   // A
	[0, -10, -50],  // B
	[-20, 0, -50],  // C
	[20, 0, -50],   // D
	[0, 20, -50],   // E

    // body
    [20, 0, 20], 	// F
	[0, 0, 20 ],	// G
	[-20, 0, 20 ],	// H
	[0, -10, 0],	// I

    // wings
    // left wing
    [-80, 0,-8],	// J
	[-80, 0, 0],	// K
	[-35, 0, -17],	// L
	[-15, 0, -21],	// M
    // right wing
    [15, 0, -21],	// N
    [35, 0, -17],	// O
    [80, 0, -8],	// P
    [80, 0, 0],	// Q

    // tail
    [-45, 0, 40],	// R
    [-35, 0, 48],	// S
    [-2, 0, 50],	// T
    [0, 0, 50],     // U
    [2, 0, 50],     // V
    [0, 20, 60],	// W
    [35, 0, 48],	// X
    [45, 0, 40],	// Y

]