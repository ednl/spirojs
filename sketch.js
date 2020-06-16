const margin = 1.05;
const pointsize = 20;

let count = 30;
let speed = 20;
let angle = 0;

let centre, diameter, diff, step, base, bg;

let sCount;
let sSpeed;

function scaleX(s) {
	return round(map(s, -margin, margin, 0, width));
}

function scaleY(s) {
	return round(map(s, -margin, margin, height, 0));
}

function drawline(a) {
	const x = cos(a);
	const y = sin(a);
	line(scaleX(x), scaleY(y), scaleX(-x), scaleY(-y));
}

// f(x) = \_/ for x = [0..1]
function tooth(val) {
	const x = fract(val);
	if (x <= 0.33333)
		return round(map(x, 0, 0.33333, 255, 0));
	if (x >= 0.66667)
		return round(map(x, 0.66667, 1, 0, 255));
	return 0;
}

function newbase() {
	diff = PI / count;
	base = [];
	for (let i = 0; i < count * 2; ++i) {
		const a = i * diff;   // baseline angle
		const x = cos(a);     // baseline vector x
		const y = sin(a);     // baseline vector y
		const c = i / count;  // colour fraction
		base.push({
			a: a,
			x: x,
			y: y,
			sx: scaleX(x),
			sy: scaleY(y),
			c: color(
				tooth(c + 0.33333),
				tooth(c + 0.66667),
				tooth(c)
			)
		});
	}
}

function setup() {
	createCanvas(800, 800);
	strokeWeight(2);
	stroke(0);
	bg = color(255, 204, 153);

	const div = createDiv('<small><a href="https://twitter.com/ednl">@ednl</a> | <a href="https://github.com/ednl/spirojs">view code</a></small>');
	div.style('font-family', 'sans-serif');

	centre = {
		sx: scaleX(0),
		sy: scaleY(0)
	};
	diameter = (scaleX(1) - centre.sx) * 2;
	newbase();

	sCount = createSlider(1, 72, count, 1);
	sCount.position(scaleX(-1.025), scaleY(-1));
	sCount.style('width', `${scaleX(0.9) - scaleX(0)}px`);

	sSpeed = createSlider(0, 200, speed);
	sSpeed.position(scaleX(0.1025), scaleY(-1));
	sSpeed.style('width', `${scaleX(0.9) - scaleX(0)}px`);
	step = speed / 1000;
}

function draw() {
	// Clear canvas
	background(bg);

	// Unit circle
	noFill();
	circle(centre.sx, centre.sy, diameter);

	// Variable line count
	const n = sCount.value();
	if (n != count) {
		count = n;
		newbase();
		console.log(count);
	}

	// Draw projection lines
	for (let i = 0; i < count; ++i)
		line(base[i].sx, base[i].sy, base[i + count].sx, base[i + count].sy);

	// Project vector (x,y) on each line
	for (let i = 0; i < count * 2; ++i) {
		const mag = cos(angle - base[i].a);  // projected size from angle difference
		const px = mag * base[i].x;          // projected vector.x
		const py = mag * base[i].y;          // projected vector.y
		fill(base[i].c);
		circle(scaleX(px), scaleY(py), pointsize);
	}

	// Variable speed
	const v = sSpeed.value();
	if (v != speed) {
		speed = v;
		step = speed / 1000;
		console.log(step);
	}

	// Advance time
	angle += step;
	if (angle >= TWO_PI)
		angle = 0;
}