const margin = 1.05;
const textMinsize = 10;
const textScaling = 64;
const lineWidthSmall = 1;
const lineWidthLarge = 2;

let count = 24;
let speed = 20;
let angle = 0;

let fgCol, bgCol, slideCount, slideSpeed, divInfo;
let centre, diameter, ballSize, step, baseLines, lineWidth;

function scaleX(s) {
	return round(map(s, -margin, margin, 0, width));
}

function scaleY(s) {
	return round(map(s, -margin, margin, height, 0));
}

function getTextsize() {
	return max(textMinsize, floor(height / textScaling));
}

// d' = min(w', h') = min(ww, wh - t')
// t' = max(10, d'/s)
// 1) t' = 10
//    h' = wh - 10
//    w' = wh - 10
// 2) t' = d'/s
//    h' = wh - d'/s
//    d' = min(w', h')
//    2.1) d' = w'
//         w' = ww
//         h' = ww
//         t' = ww/s
//    2.2) d' = h'
//         h' = wh - h'/s
//         h' = wh/(1+1/s)
//         w' = wh/(1+1/s)
//         t' = wh/(s+1)
function getDimension() {
	const t1 = textMinsize;
	const t2 = windowWidth / textScaling;
	const t3 = windowHeight / (1 + textScaling);
	const t = ceil(max(t1, min(t2, t3))) * 2;  // factor 2 for sufficient lineheight
	return min(windowWidth, windowHeight - t);
}

function windowResized() {
	const dim = getDimension();
	resizeCanvas(dim, dim);
	newBaselines();
	calcPositions();
}	

// Preconditions:
//   meaningful value for global count
function newBaselines() {
	baseLines = [];
	for (let i = 0; i < count; ++i) {
		const a = i * PI / count;  // baseline angle
		const x = cos(a);          // baseline vector x
		const y = sin(a);          // baseline vector y
		const c = i / count;       // colour fraction
		baseLines.push({
			a: a,
			x: x,
			y: y,
			sx1: scaleX(x),
			sy1: scaleY(y),
			sx2: scaleX(-x),  // opposite radius = diameter
			sy2: scaleY(-y),
			c: color(
				tooth(c + 0.33333),
				tooth(c + 0.66667),
				tooth(c)
			)		
		});		
	}		
}		

// Preconditions:
//   resized canvas with new width,height
//   existing dom objects: slideCount, slideSpeed, divInfo
function calcPositions() {
	centre = { sx: scaleX(0), sy: scaleY(0) };
	diameter = (scaleX(1) - centre.sx) * 2;
	ballSize = round(width / 40);
	lineWidth = width >= 800 ? lineWidthLarge : lineWidthSmall;
	textSize(getTextsize());

	const sw = scaleX(0.9) - scaleX(0);
	slideCount.position(scaleX(-1.025), scaleY(-1));
	slideCount.style('width', `${sw}px`);
	slideSpeed.position(scaleX(0.1025), scaleY(-1));
	slideSpeed.style('width', `${sw}px`);
	
	divInfo.style('width', `${width}px`);
	divInfo.style('font-size', `${getTextsize()}px`);
}	

// Falling, zero, rising
// f(x) = \_/ for x = [0..1]
function tooth(val) {
	const x = fract(val);
	if (x <= 0.33333)
		return round(map(x, 0, 0.33333, 255, 0));
	if (x >= 0.66667)			
		return round(map(x, 0.66667, 1, 0, 255));
	return 0;			
}

function setup() {
	const dim = getDimension();
	createCanvas(dim, dim);

	fgCol = color(0);
	bgCol = color(255, 204, 153);
	stroke(fgCol);
	textSize(getTextsize());

	divInfo = createDiv('<a href="https://twitter.com/ednl">Twitter</a> | <a href="https://github.com/ednl/spirojs">Github</a> | <a href="https://youtu.be/snHKEpCv0Hk">Numberphile</a>');
	divInfo.style('font-family', 'Calibri, Arial, sans-serif');
	divInfo.style('text-align', 'right');
	
	slideCount = createSlider(1, 72, count, 1);
	slideSpeed = createSlider(0, 200, speed);
	step = speed / 1000;
	
	newBaselines();
	calcPositions();
}

function draw() {
	// Check variable line count slider
	const n = slideCount.value();
	if (n != count) {
		count = n;
		newBaselines();
	}
	
	// Check variable speed slider
	const v = slideSpeed.value();
	if (v != speed) {
		speed = v;
		step = speed / 1000;
	}
	
	// Clear canvas
	background(bgCol);

	// Slider values
	fill(fgCol);
	strokeWeight(0);
	textAlign(LEFT, BOTTOM);
	text(count, slideCount.x + 5, slideCount.y);
	textAlign(RIGHT, BOTTOM);
	text(speed, slideSpeed.x + slideSpeed.width - 5, slideSpeed.y);
	strokeWeight(lineWidth);

	// Draw unit circle
	noFill();
	circle(centre.sx, centre.sy, diameter);

	// Draw base lines for projection
	// (two opposite radii = one diameter)
	for (const base of baseLines)
		line(base.sx1, base.sy1, base.sx2, base.sy2);

	// Project circling vector (x,y) on each line
	// (separate loop or else circles and lines will intersect)
	for (const base of baseLines) {
		const mag = cos(angle - base.a);  // projected size from angle difference
		const px = mag * base.x;          // projected vector.x
		const py = mag * base.y;          // projected vector.y
		fill(base.c);                     // RGB colour
		circle(scaleX(px), scaleY(py), ballSize);
	}	

	// Advance time
	angle += step;
	if (angle >= TWO_PI)
		angle = 0;
}