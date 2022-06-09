  /* * * * * * * * * * * * * * * * * * * * *\* * * * * * *\
 /*     ___           *                      \            *\
|*    ,' ." *     \                    *      \            *|
|*   /  /      *   \                           \       *   *|
|*  |  Claire.js   Ver. 0.1.0    \              *          *|
|*   \  \            \        *   \         *              *|
|*    `._'>  *        *            *    \                  *|
|*                                       \                 *|
|*   A library for bringing starry skies into your site.   *|
|*                                         \               *|
|*           Author: Samjna (snw2015@gmail.com)            *|
|*                                           \             *|
|_*                Last Updated: 2022/6/10    *           *_|
 \|*                                                     *|/
  \* * * * * * * * * * * * * * * * * * * * * * * * * * * */


// TODO: settings by attribute

(function($) {


// Constants
// TODO: move these into the class

$.FPS = 50;
$.UPS = 50;

$.BASE_SIZE = 250000;
$.BORDER = 5;
$.STAR_NUM = 25;

$.MIN_STAR_SIZE = 0.8;
$.MAX_STAR_SIZE = 1.8;

$.MIN_SHINING_SPEED = 0.15;
$.MAX_SHINING_SPEED = 0.5;

// Star Shines Red
$.SSR_RATE = 0.02;

$.SHOOTING_STAR_RATE = 0.003;
$.SHOOTING_STAR_MIN_SPEED = 4.5;
$.SHOOTING_STAR_MAX_SPEED = 6.5;
$.SHOOTING_STAR_MIN_START_ANGLE = 0.12 * Math.PI;
$.SHOOTING_STAR_MAX_START_ANGLE = 0.38 * Math.PI;
$.SHOOTING_STAR_TAIL_LENGTH = 30;
$.SHOOTING_STAR_MAX_DELTA = 0.001 * Math.PI;
$.SHOOTING_STAR_MAX_ANGLE = 0.44 * Math.PI;


// Utility Functions

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


/*
  A class storing the information about a stable star.
 */
class Star {
  constructor(x, y, size, shiningSpeed, shiningOffset, isSSR) {
    this.pos = [x, y];
    this.size = size;
    this.shiningSpeed = shiningSpeed;
    this.shiningOffset = shiningOffset;
    this.isSSR = isSSR;
    this.update();
  }

  get x() {
    return this.pos[0];
  }

  get y() {
    return this.pos[1];
  }

  updateShiny() {
    this.shiningOffset += this.shiningSpeed / $.FPS;
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

/*
  A class storing the information about a shooting star.
 */
class ShootingStar {
  constructor(x, y, size, speed, angle, delta, maxAngle, tailLength,
      screenWidth, screenHeight) {
    this.pos = [[x, y]];
    this.size = size;
    this.speed = speed;
    this.angle = angle;
    this.delta = delta;
    this.maxAngle = maxAngle;
    this.tailLength = tailLength;
    this.tailChange = 0.1 ** (1 / tailLength);
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.finished = false;
  }

  update() {
    this.pos.unshift([this.pos[0][0] + this.speed * Math.cos(this.angle),
      this.pos[0][1] + this.speed * Math.sin(this.angle)
    ]);
    if (this.pos.length > this.tailLength) {
      const pos = this.pos.pop();
      this.finished = pos[0] > this.screenWidth || pos[1] > this.screenHeight;
    }
    this.angle += this.delta;
    this.angle = Math.min(this.angle, this.maxAngle);
  }

  paint(ctx) {
    var lightness = 1;
    for (var i = 0; i < this.pos.length - 1; i++) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${lightness})`;
      lightness *= this.tailChange;
      line(ctx, this.pos[i][0], this.pos[i][1],
         this.pos[i + 1][0], this.pos[i + 1][1], this.size);
    }
  }
}

/*
  Normal sky, contains stable and shooting stars.
 */
class StarrySky {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.width = canvas.scrollWidth;
    this.height = canvas.scrollHeight;
    this.starNum = Math.floor($.STAR_NUM * this.width * this.height / $.BASE_SIZE);
    this.initStars();
    this.shootingStars = [];
  }

  initStars() {
    this.stars = new Array(this.starNum);
    for (var i = 0; i < this.starNum; i++) {
      this.stars[i] = new Star(
        randint($.BORDER, this.width - $.BORDER), // x
        randint($.BORDER, this.height - $.BORDER), // y
        rand($.MIN_STAR_SIZE, $.MAX_STAR_SIZE), // size
        rand($.MIN_SHINING_SPEED, $.MAX_SHINING_SPEED), // shining speed
        rand(), // shining offset
        rand() < $.SSR_RATE // is SSR
      );
    }
  }

  update() {
    for (var star of this.stars) {
      star.update();
    }

    for (var star of this.shootingStars) {
      star.update();
    }

    this.shootingStars = this.shootingStars.filter(star => !star.finished);

    if (rand() < $.SHOOTING_STAR_RATE) {
      this.shootingStars.push(new ShootingStar(
        randint($.BORDER, this.width - $.BORDER), // x
        randint($.BORDER, this.height - $.BORDER), // y
        rand($.MIN_STAR_SIZE, $.MAX_STAR_SIZE), // size
        rand($.SHOOTING_STAR_MIN_SPEED, $.SHOOTING_STAR_MAX_SPEED), // speed
        rand($.SHOOTING_STAR_MIN_START_ANGLE, $.SHOOTING_STAR_MAX_START_ANGLE), // angle
        rand($.SHOOTING_STAR_MAX_DELTA), // delta
        $.SHOOTING_STAR_MAX_ANGLE, // max angle
        $.SHOOTING_STAR_TAIL_LENGTH, // tail length
        this.width, // screen width
        this.height, // screen height
      ));
    }
  }

  paint() {
    this.paintBackground();
    this.paintStars();
    this.paintShootingStars();
  }

  paintBackground() {
    const gradient = this.ctx.createLinearGradient(
      this.width / 3, -this.height * 0.2, this.width / 3 * 2, this.height * 1.3
    );
    gradient.addColorStop(0.3, "rgb(0, 0, 0)");
    gradient.addColorStop(1.0, "rgb(20, 30, 140)");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  paintStars() {
    for (var star of this.stars) {
      star.paint(this.ctx);
    }
  }

  paintShootingStars() {
    for (var star of this.shootingStars) {
      star.paint(this.ctx);
    }
  }

  start() {
    this.paintThread = setInterval(() => this.paint(), 1000 / $.FPS);
    this.updateThread = setInterval(() => this.update(), 1000 / $.UPS);
  }

  end() {
    clearInterval(this.paintThread);
    clearInterval(this.updateThread);
  }
}


// Setup
Claire = (arg1) => {
  return new ClaireC(arg1);
}

Claire.global = $;
Claire.onStart = null;
Claire.skies = {};

class ClaireC {
  constructor(arg1) {
    this.id = null;
    if (typeof arg1 === 'function') {
      Claire.onStart = arg1;
    } else {
      this.id = arg1;
    }
  }

  resize() {
    if (this.id && Claire.skies[this.id]) {
      Claire.skies[this.id].end();
      var sky = new StarrySky(document.getElementById(this.id));
      sky.start();
      Claire.skies[this.id] = sky;
    }
  }
}

document.addEventListener("DOMContentLoaded", (e) => {
  for (var canvas of document.getElementsByClassName("claire-starry")) {
    var sky = new StarrySky(canvas);
    sky.start();
    Claire.skies[canvas.id] = sky;
  }
  if (this.onStart) this.onStart();
});

window.Claire = Claire;


}({}));
