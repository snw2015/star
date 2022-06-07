// TODO: circle
// TODO: shooting stars
// TODO: as library
const FPS = 50;
const UPS = 50;

const SIZE = 500;
const BORDER = 5;
const STAR_NUM = 25;

const MIN_STAR_SIZE = 0.8;
const MAX_STAR_SIZE = 1.8;

const MIN_SHINING_SPEED = 0.15;
const MAX_SHINING_SPEED = 0.5;

// Star Shines Red
const SSR_RATE = 0.02;

const SHOOTING_STAR_RATE = 0.003;
const SHOOTING_STAR_MIN_SPEED = 4.5;
const SHOOTING_STAR_MAX_SPEED = 6.5;
const SHOOTING_STAR_MIN_ANGLE = 0.12 * Math.PI;
const SHOOTING_STAR_MAX_ANGLE = 0.38 * Math.PI;
const SHOOTING_STAR_TAIL_LENGTH = 25;
const SHOOTING_STAR_TAIL_SPEED = 0.1 ** (1 / SHOOTING_STAR_TAIL_LENGTH);
const SHOOTING_STAR_MAX_DELTA = 0.001 * Math.PI;

class Star {
  constructor() {
    this.pos = [randint(BORDER, SIZE - BORDER), randint(BORDER, SIZE - BORDER)];
    this.size = rand(MIN_STAR_SIZE, MAX_STAR_SIZE);
    this.shiningSpeed = rand(MIN_SHINING_SPEED, MAX_SHINING_SPEED)
    this.shiningOffset = rand();
    this.isSSR = rand() < SSR_RATE;
    this.update();
  }

  get x() {
    return this.pos[0];
  }

  get y() {
    return this.pos[1];
  }

  updateShiny() {
    this.shiningOffset += this.shiningSpeed / FPS;
    this.shiningOffset %= 1;
    this.lightness = Math.sqrt(Math.abs(this.shiningOffset * 2 - 1));
  }

  update() {
    this.updateShiny();
  }

  paint(ctx) {
    if (this.isSSR) {
      ctx.fillStyle = `rgba(220, 45, 60, ${this.lightness})`;
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.lightness})`;
    }
    circle(ctx, this.x, this.y, this.size);
  }
}

class ShootingStar {
  constructor() {
    this.pos = [[randint(BORDER, SIZE - BORDER), randint(BORDER, SIZE / 3 * 2 - BORDER)]];
    this.size = rand(MIN_STAR_SIZE, MAX_STAR_SIZE);
    this.speed = rand(SHOOTING_STAR_MIN_SPEED, SHOOTING_STAR_MAX_SPEED);
    this.angle = rand(SHOOTING_STAR_MIN_ANGLE, SHOOTING_STAR_MAX_ANGLE);
    this.finished = false;
  }

  update() {
    this.pos.unshift([this.pos[0][0] + this.speed * Math.cos(this.angle),
      this.pos[0][1] + this.speed * Math.sin(this.angle)]);
    if (this.pos.length > SHOOTING_STAR_TAIL_LENGTH) {
      const pos = this.pos.pop();
      this.finished = pos[0] > SIZE || pos[1] > SIZE;
    }
    this.angle += SHOOTING_STAR_MAX_DELTA;
  }

  paint(ctx) {
    var lightness = 1;
    for (var i = 0; i < this.pos.length - 1; i++) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${lightness})`;
      lightness *= SHOOTING_STAR_TAIL_SPEED;
      line(ctx, this.pos[i][0], this.pos[i][1], this.pos[i+1][0], this.pos[i+1][1], this.size);
    }
  }
}

var ctx = null;
var stars = null;
var shootingStars = null;

function line(ctx, x1, y1, x2, y2, width) {
  var w = ctx.lineWidth;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.lineWidth = w;
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

function randint(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min));
}

function rand(min, max) {
  if (max === undefined) {
    if (min === undefined) {
      min = 1;
    }
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
}

function initStars() {
  stars = new Array(STAR_NUM);
  for (var i = 0; i < STAR_NUM; i++) {
    stars[i] = new Star();
  }
}

function update() {
  for (var star of stars) {
    star.update();
  }
  for (var star of shootingStars) {
    star.update();
  }
  if (rand() < SHOOTING_STAR_RATE) {
    shootingStars.push(new ShootingStar());
  }
}

function paint() {
  paintBackground();
  paintStars();
  paintShootingStars();
}

function paintBackground() {
  const gradient = ctx.createLinearGradient(SIZE / 3, -SIZE * 0.2, SIZE / 3 * 2, SIZE * 1.3);
  gradient.addColorStop(0.3, "rgb(0, 0, 0)");
  gradient.addColorStop(1.0, "rgb(20, 30, 140)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function paintStars() {
  for (var star of stars) {
    star.paint(ctx);
  }
}

function paintShootingStars() {
  for (var star of shootingStars) {
    star.paint(ctx);
  }
}

function start() {
  ctx = $("#canvas-1")[0].getContext('2d');
  initStars();
  shootingStars = [];
  setInterval(paint, 1000 / FPS);
  setInterval(update, 1000 / UPS);
}

$(start);
