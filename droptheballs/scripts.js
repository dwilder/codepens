const numberOfSpheres = 25;
const dampeningCoefficient = 0.9; // Between 0.1 and 1.0
const pointGravityScalingFactor = 0.000001;
const gravityScalingFactor = {
  x: 0,
  y: 0.001,
};
const sphereRadius = {
  min: 10,
  max: 30,
};
const physicsTypes = {
  gravity: 'gravity',
  pointGravity: 'pointGravity',
};

const spheres = [];

const Sphere = function () {
  this.color = '#aad';
  this.glow = '#ccf';
  this.shadow;
  this.radius;
  this.x;
  this.y;
  this.vx;
  this.vy;
  this.am;
  this.ang;

  this.init = function () {
    this.radius = this.getRadius();
    this.x = this.radius;
    this.y = this.radius;
    this.vx = 0;
    this.vy = 0;
    this.am = 0;
    this.ang = Math.PI / 4;
    this.setColor();
  };

  this.getRadius = function () {
    if (typeof sphereRadius == 'number') {
      return sphereRadius;
    }
    return Math.round(
      Math.random() * (sphereRadius.max - sphereRadius.min) + sphereRadius.min
    );
  };

  this.setColor = function () {
    const rand = Math.random() * 4;
    if (rand < 1) {
      this.color = '#aad';
      this.glow = '#ccf';
    } else if (rand < 2) {
      this.color = '#ada';
      this.glow = '#cfc';
    } else if (rand < 3) {
      this.color = '#daa';
      this.glow = '#fcc';
    } else {
      this.color = '#dad';
      this.glow = '#fcf';
    }
  };

  this.resetPosition = function (fieldWidth, fieldHeight) {
    this.x =
      Math.floor(Math.random() * (fieldWidth - 2 * this.radius)) + this.radius;
    this.y =
      Math.floor(Math.random() * (fieldHeight - 2 * this.radius)) + this.radius;
  };

  this.resetVelocity = function () {
    this.vx = Math.random() * 0.01;
    this.vy = Math.random() * 0.01;
  };

  this.applyForce = function (fx, fy, dt) {
    const newVx = this.vx + fx * dt;
    const newVy = this.vy + fy * dt;
    this.x += (dt * (this.vx + newVx)) / 2;
    this.y += (dt * (this.vy + newVy)) / 2;
    this.vx = newVx;
    this.vy = newVy;
  };

  this.left = function () {
    return this.x - this.radius;
  };
  this.right = function () {
    return this.x + this.radius;
  };
  this.top = function () {
    return this.y - this.radius;
  };
  this.bottom = function () {
    return this.y + this.radius;
  };

  this.draw = function (c) {
    c.beginPath();
    c.fillStyle = this.color;
    c.strokeStyle = this.glow;
    c.lineWidth = 2;
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    c.stroke();
    c.fill();
    c.closePath();

    c.beginPath();
    c.fillStyle = this.glow;
    c.arc(
      this.x - (Math.sin(this.ang) * this.radius) / 3,
      this.y - (Math.cos(this.ang) * this.radius) / 3,
      this.radius / 3,
      0,
      2 * Math.PI
    );
    c.fill();
    c.closePath();
  };

  this.init();
};

const setInitialConditions = function (spheres, fieldWidth, fieldHeight) {
  let overlap;

  // set positions
  for (let i = 0; i < numberOfSpheres; i++) {
    overlap = true;
    while (overlap) {
      spheres[i].resetPosition(fieldWidth, fieldHeight);
      if (checkOverlap(spheres, i) == false) {
        overlap = false;
      }
    }
    spheres[i].resetVelocity();
  }
};

const checkOverlap = function (spheres, i) {
  if (spheres.length < 2 || i == 0) {
    return false;
  }

  for (let j = 0; j < i; j++) {
    // test whether the spheres are within their combined radius
    // minimim distance from center to center
    const minD = spheres[i].radius + spheres[j].radius;

    // actual distance from center to center
    const x = Math.abs(spheres[i].x - spheres[j].x);
    const y = Math.abs(spheres[i].y - spheres[j].y);

    if (minD > Math.sqrt(x ** 2 + y ** 2)) {
      return true;
    }
  }
  return false;
};

const Field = function () {
  const that = this;

  this.physics;
  this.friction;
  this.width;
  this.height;
  this.point = {
    x: 0,
    y: 0,
    radius: 10,
    color: '#777',
    stroke: '#eee',
    width: 2,
  };

  this.init = function (w, h) {
    this.physics = physicsTypes.gravity;
    this.friction = 0;
    this.width = w;
    this.height = h;
  };

  this.force = function (x, y) {
    if (this.physics == physicsTypes.pointGravity) {
      return this.pointGravity(x, y, this.point.x, this.point.y);
    }
    return gravityScalingFactor;
  };

  this.pointGravity = function (x, y, pX, pY) {
    const scale = pointGravityScalingFactor;
    const xt = pX - x;
    const yt = pY - y;
    const r = Math.sqrt(xt * xt + yt * yt);

    if (Math.abs(xt) < 1 && Math.abs(yt) < 1) {
      return { x: 0, y: 0 };
    }

    const fx = (scale * xt * Math.abs(xt)) / r;
    const fy = (scale * yt * Math.abs(yt)) / r;

    return { x: fx, y: fy };
  };

  this.switch = function (e) {
    if (typeof e == 'undefined') e = window.event;
    e.preventDefault();
    if (that.physics == physicsTypes.gravity) {
      that.point.x = e.changedTouches?.[0]?.pageX ?? e.clientX;
      that.point.y = e.changedTouches?.[0]?.pageY ?? e.clientY;
      that.physics = physicsTypes.pointGravity;
    } else {
      that.physics = physicsTypes.gravity;
    }
  };

  this.draw = function (c) {
    if (this.physics == physicsTypes.pointGravity) {
      c.beginPath();
      c.fillStyle = this.point.color;
      c.strokeStyle = this.point.stroke;
      c.lineWidth = this.point.width;
      c.arc(this.point.x, this.point.y, this.point.radius - 1, 0, 2 * Math.PI);
      c.stroke();
      c.fill();
      c.closePath();
    }
  };
};

const applyForce = function (field, spheres, dt) {
  for (let i = 0; i < spheres.length; i++) {
    const force = field.force(
      spheres[i].x,
      spheres[i].y,
      spheres[i].vx,
      spheres[i].vy
    );
    spheres[i].applyForce(force.x, force.y, dt);
  }
};

const testBounds = function (field, spheres) {
  for (let i = 0; i < spheres.length; i++) {
    if (spheres[i].left() < 0) {
      spheres[i].x = spheres[i].radius;
      const newVx = -spheres[i].vx * dampeningCoefficient;
      spheres[i].vx = newVx;
    } else if (spheres[i].right() > field.width) {
      spheres[i].x = field.width - spheres[i].radius;
      const newVx = -spheres[i].vx * dampeningCoefficient;
      spheres[i].vx = newVx;
    }

    if (spheres[i].top() < 0) {
      spheres[i].y = spheres[i].radius;
      const newVy = -spheres[i].vy * dampeningCoefficient;
      spheres[i].vy = newVy;
    } else if (spheres[i].bottom() > field.height) {
      spheres[i].y = field.height - spheres[i].radius;
      const newVy = -spheres[i].vy * dampeningCoefficient;
      spheres[i].vy = newVy;
    }
  }
};

const testImpacts = function (spheres, physics) {
  for (let i = 0; i < spheres.length; i++) {
    for (let j = i + 1; j < spheres.length; j++) {
      const x = Math.abs(spheres[i].x - spheres[j].x);
      const y = Math.abs(spheres[i].y - spheres[j].y);
      const r = Math.sqrt(x ** 2 + y ** 2);
      if (r <= spheres[i].radius + spheres[j].radius) {
        // impact
        impact(spheres[i], spheres[j], physics);
      }
    }
  }
};

const impact = function (s1, s2, physics) {
  const x = s2.x - s1.x,
    y = s2.y - s1.y;

  // angle between spheres
  let phi = Math.acos(x / Math.sqrt(x ** 2 + y ** 2));
  if (y < 0) {
    phi = 2 * Math.PI - phi;
  }

  // velocities
  const v1 = Math.sqrt(s1.vx ** 2 + s1.vy ** 2);
  const v2 = Math.sqrt(s2.vx ** 2 + s2.vy ** 2);

  // angles of motion
  let theta1 = Math.acos(s1.vx / v1);
  if (s1.vy < 0) {
    theta1 = 2 * Math.PI - theta1;
  }
  let theta2 = Math.acos(s2.vx / v2);
  if (s2.vy < 0) {
    theta2 = 2 * Math.PI - theta2;
  }

  s1.vx =
    dampeningCoefficient *
    (v2 * Math.cos(theta2 - phi) * Math.cos(phi) +
      v1 * Math.sin(theta1 - phi) * Math.cos(phi + Math.PI / 2));
  s1.vy =
    dampeningCoefficient *
    (v2 * Math.cos(theta2 - phi) * Math.sin(phi) +
      v1 * Math.sin(theta1 - phi) * Math.sin(phi + Math.PI / 2));

  s2.vx =
    dampeningCoefficient *
    (v1 * Math.cos(theta1 - phi) * Math.cos(phi) +
      v2 * Math.sin(theta2 - phi) * Math.cos(phi + Math.PI / 2));
  s2.vy =
    dampeningCoefficient *
    (v1 * Math.cos(theta1 - phi) * Math.sin(phi) +
      v2 * Math.sin(theta2 - phi) * Math.sin(phi + Math.PI / 2));

  if (physics == physicsTypes.pointGravity) {
    s1.vx *= dampeningCoefficient;
    s1.vy *= dampeningCoefficient;
    s2.vx *= dampeningCoefficient;
    s2.vy *= dampeningCoefficient;
  }

  s2.x = s1.x + Math.cos(phi) * (s2.radius + s1.radius);
  s2.y = s1.y + Math.sin(phi) * (s2.radius + s1.radius);
};

const report = function (a) {
  const report = document.getElementById('report');
  report.textContent = a;
};

const run = function () {
  const canvas = document.getElementById('field');
  canvas.width = document.body.offsetWidth;
  const minHeight = 400;
  const footerHeight = 100;
  const height = document.body.offsetHeight - footerHeight;
  canvas.height = Math.max(height, minHeight);

  const ctx = canvas.getContext('2d');

  const field = new Field();
  field.init(canvas.width, canvas.height);

  for (let i = 0; i < numberOfSpheres; i++) {
    spheres[i] = new Sphere();
  }

  setInitialConditions(spheres, canvas.width, canvas.height);

  addEvent('touchstart', canvas, field.switch);
  addEvent('click', canvas, field.switch);

  let tNow,
    tThen = new Date(),
    dt;

  const draw = function (dt) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    field.draw(ctx);
    for (let i = 0; i < spheres.length; i++) {
      spheres[i].draw(ctx);
    }
  };

  const animate = () => {
    tNow = new Date();
    dt = tNow - tThen;

    applyForce(field, spheres, dt);
    testBounds(field, spheres);
    testImpacts(spheres, field.physics);
    draw(dt);

    tThen = tNow;

    window.requestAnimationFrame(animate);
  };

  window.requestAnimationFrame(animate);
};

const addEvent = function (type, obj, func) {
  if (obj && obj.addEventListener) {
    obj.addEventListener(type, func, false);
  } else if (obj && obj.attachEvent) {
    obj.attachEvent('on' + type, func);
  }
};

window.onload = run;
