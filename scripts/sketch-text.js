var inc = 0.1;
var scl = 20,
    zoff = 0;
var cols, rows, movement = 0;
var particles = [];
var flowfield;

var wordOneSz = [124, 62, 32];
var wordTwoSz = [200, 100, 0];
var wordThreeSz = [60, 30, 0];

var genX, genY;
var scrn = 0;
var font, bbox, font2, bbox2, bbox3;

var wordOne = "Sean";
var wordTwo = "Alvis";
var wordThree = "Three";

function preload() {
    font = loadFont('Oswald.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 255);
    setDisplay();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    setDisplay();
}

function setDisplay() {
    if (windowWidth > 1024) {
        scrn = 0;
    }
    if (windowWidth <= 1024) {
        scrn = 1;
    }
    if (windowWidth <= 500) {
        scrn = 2;
    }
    cols = floor(width / scl);
    rows = floor(height / scl);
    points = [];
    points2 = [];
    particles = [];
    background(200);
    textFont(font);
    textSize(wordTwoSz[scrn]);

    bbox = font.textBounds(wordTwo, width / 2, height / 2);
    genX = [bbox.x - 300, bbox.x - 155, bbox.x - 80];
    genY = [bbox.y + -20, bbox.y + 25, bbox.y + 13];
    var points = font.textToPoints(wordTwo, (width / 2) - (bbox.w / 2), (height / 2));
    
    for (var i = 0; i < points.length; i++) {
        var pt = points[i];
        particles[i] = new Particle(pt.x, pt.y);
    }

    bbox3 = font.textBounds(wordThree, width / 2, height / 2);
    var points3 = font.textToPoints(wordThree, (width / 2) - (bbox.w / 2), (height / 2));
    
    textSize(wordOneSz[scrn]);
    bbox2 = font.textBounds(wordOne, width / 2, height / 2);
    var points2 = font.textToPoints(wordOne, genX[scrn], genY[scrn]);

    for (var i = 0; i < points2.length; i++) {
        var pt = points2[i];
        particles[points.length + i] = new Particle(pt.x, pt.y);
    }

    flowfield = new Array(cols);
    loop();
}

function draw() {
    fill(200);
    noStroke();
    textSize(wordTwoSz[scrn]);
    text(wordTwo, (width / 2) - (bbox.w / 2), (height / 2));
    textSize(wordOneSz[scrn]);
    fill(200);
    text(wordOne, genX[scrn], genY[scrn]);
    var yoff = 0;

    for (var y = 0; y < rows; y++) {
        var xoff = 0;
        for (var x = 0; x < cols; x++) {
            var index = (x + y * cols);
            var angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
            var v = p5.Vector.fromAngle(angle);
            v.setMag(0.4);
            flowfield[index] = v;
            xoff += inc;
        }
        yoff += inc;
        zoff += 0.001;
    }

    for (var i = 0; i < particles.length; i++) {
        particles[i].follow(flowfield);
        particles[i].update();
        particles[i].edges();
        particles[i].show();
        if (particles[i].stop() == false) {
            noLoop();
        }
    }
}

function Particle(xPos, yPos) {
    this.pos = createVector(xPos, yPos);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxspeed = 3.5; // 1.9
    this.prevPos = this.pos.copy();
    this.life = 50;

    this.update = function () {
        this.vel.add(this.acc);
        this.vel.limit(this.maxspeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        if (this.life > 25) {
            this.life -= 0.33;
        } else {
            this.life -= 0.01;
        }
    }
    this.follow = function (vectors) {
        var x = floor(this.pos.x / scl);
        var y = floor(this.pos.y / scl);
        var index = x + y * cols;
        var force = vectors[index];
        this.applyForce(force);
    }

    this.applyForce = function (force) {
        this.acc.add(force);
    }
    this.show = function () {
        stroke(0, 0, 70, this.life);
        strokeWeight(2);
        line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        this.updatePrev();
    }
    this.updatePrev = function () {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
    }
    this.edges = function () {
        if (this.pos.x > width) {
            this.pos.x = 0;
            this.updatePrev();
        }
        if (this.pos.x < 0) {
            this.pos.x = width;
            this.updatePrev();
        }
        if (this.pos.y > height) {
            this.pos.y = 0;
            this.updatePrev();
        }
        if (this.pos.y < 0) {
            this.pos.y = height;
            this.updatePrev();
        }
    }
    this.stop = function () {
        if (this.life < 0) {
            return false;
        }
    }
}
