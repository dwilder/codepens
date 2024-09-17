const initialConditions = {
  x: 20, // Percent from left
  y: 50, // Percent from top
  vx: 0.2,
  vy: 0.15,
};

const scaleFactors = {
  proportional: 0.000000001,
  inverse: 0.00005,
  inverse_squared: 0.0008,
};

const physicsTypes = {
  proportional: 'proportional',
  inverse: 'inverse',
  inverseSquared: 'inverseSquared',
};

const Orb = function (obj) {
  const that = this;

  this.orb = obj;
  this.radius;
  this.x;
  this.y;
  this.vx;
  this.vy;

  this.maxF;

  this.init = function () {
    this.radius = this.orb.offsetWidth / 2;

    const w = this.orb.parentNode.offsetWidth;
    const h = this.orb.parentNode.offsetHeight;

    this.x = this.radius + ((w - this.radius * 2) * initialConditions.x) / 100;
    this.y = this.radius + ((h - this.radius * 2) * initialConditions.y) / 100;
    this.vx = initialConditions.vx;
    this.vy = initialConditions.vy;
    this.maxF = 0;

    this.setEvents();
  };

  this.setEvents = function () {
    addEvent('touchmove', this.orb, that.move);
    addEvent('mousedown', this.orb, that.initMove);
  };

  this.initMove = function (e) {
    addEvent('mousemove', that.orb, that.move);
    addEvent('mouseup', that.orb, function () {
      removeEvent('mousemove', that.orb, that.move);
    });
  };

  this.move = function (e) {
    e.preventDefault();

    const x = e.changedTouches?.[0]?.pageX ?? e.clientX;
    const y = e.changedTouches?.[0]?.pageY ?? e.clientY;

    that.x = x;
    that.y = y;
    that.setPosition();
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

  this.applyForce = function (fx, fy, dt) {
    this.vx = this.vx + fx * dt;
    this.vy = this.vy + fy * dt;
    this.x = this.x + this.vx * dt;
    this.y = this.y + this.vy * dt;

    this.setPosition();
  };

  this.setPosition = function () {
    this.orb.style.left = +this.x - +this.radius + 'px';
    this.orb.style.top = +this.y - +this.radius + 'px';
  };

  this.init();
};

const Field = function (obj) {
  this.field = obj;
  this.scaleFactor = 0.001;
  this.physics;
  this.width;
  this.height;
  this.scaleDimension;

  this.init = function () {
    this.physics = physicsTypes.proportional;
    this.width = this.field.offsetWidth;
    this.height = this.field.offsetHeight;
    this.scaleDimension = Math.max(this.width, this.height);
  };

  this.force = function (x, y) {
    // translate to center
    const tx = this.width / 2 - x;
    const ty = this.height / 2 - y;

    if (this.physics == physicsTypes.inverse) {
      return this.inverseField(tx, ty);
    } else if (this.physics == physicsTypes.inverseSquared) {
      return this.inverseSquaredField(tx, ty);
    }
    return this.proportionalField(tx, ty);
  };

  this.inverseField = function (x, y) {
    const r = Math.sqrt(x * x + y * y);
    if (r < 1) {
      return { x: 0, y: 0 };
    } else {
      return {
        x: (scaleFactors.inverse * this.scaleDimension * x) / r ** 2,
        y: (scaleFactors.inverse * this.scaleDimension * y) / r ** 2,
      };
    }
  };

  this.inverseSquaredField = function (x, y) {
    const r = Math.sqrt(x * x + y * y);
    if (r < 1) {
      return { x: 0, y: 0 };
    } else {
      return {
        x: (scaleFactors.inverse_squared * this.scaleDimension * x) / r ** 3,
        y: (scaleFactors.inverse_squared * this.scaleDimension * y) / r ** 3,
      };
    }
  };

  this.proportionalField = function (x, y) {
    return {
      x: scaleFactors.proportional * this.scaleDimension * x,
      y: scaleFactors.proportional * this.scaleDimension * y,
    };
  };

  this.init();
};

const Source = function (obj) {
  this.source = obj;
  this.x;
  this.y;

  this.init = function () {
    this.x = this.source.offsetLeft;
    this.y = this.source.offsetTop;
  };

  this.glow = function (fx, fy) {
    const fr = Math.sqrt(fx * fx + fy * fy);
    const spread = Math.floor(200000 * fr);
    const blur = spread + 10;
    const shadow = '0 0 ' + blur + 'px ' + spread + 'px rgba(255,255,255,0.9)';
    this.source.style.boxShadow = shadow;
  };

  this.init();
};

const Status = function (obj) {
  this.status = obj;
  this.fieldWidth;
  this.fieldHeight;
  this.maxV;
  this.maxF;
  this.width;
  this.x;
  this.y;
  this.vx;
  this.vy;
  this.fx;
  this.fy;

  this.init = function () {
    var divs = this.status.getElementsByTagName('div');
    this.x = divs[0];
    this.y = divs[3];
    this.vx = divs[1];
    this.vy = divs[4];
    this.fx = divs[2];
    this.fy = divs[5];
    this.width = this.status.offsetWidth - 32;

    this.maxV = 0;
    this.maxF = 0;
  };

  this.setDimensions = function (w, h) {
    this.fieldWidth = w;
    this.fieldHeight = h;
  };

  this.report = function (x, y, vx, vy, fx, fy) {
    const maxV = Math.max(Math.abs(vx), Math.abs(vy));
    if (maxV > this.maxV) {
      this.maxV = maxV;
    }

    const maxF = Math.max(Math.abs(fx), Math.abs(fy));
    if (maxF > this.maxF) {
      this.maxF = maxF;
    }

    this.x.style.width = (this.width * x) / this.fieldWidth + 'px';
    this.x.textContent = 'X: ' + Math.floor(x);
    this.y.style.width = (this.width * y) / this.fieldHeight + 'px';
    this.y.textContent = 'Y: ' + Math.floor(y);

    this.vx.style.width = (this.width * Math.abs(vx)) / this.maxV + 'px';
    this.vx.textContent = 'Vx: ' + vx.toFixed(2);

    this.vy.style.width = (this.width * Math.abs(vy)) / this.maxV + 'px';
    this.vy.textContent = 'Vy: ' + vy.toFixed(2);

    this.fx.style.width = (this.width * Math.abs(fx)) / this.maxF + 'px';
    this.fx.textContent = 'Fx: ' + fx.toFixed(6);

    this.fy.style.width = (this.width * Math.abs(fy)) / this.maxF + 'px';
    this.fy.textContent = 'Fy: ' + fy.toFixed(6);
  };

  this.init();
};

const run = function () {
  let animated = true;

  const field = new Field(document.getElementsByTagName('div')[0]);
  const orb = new Orb(document.getElementById('orb'));
  const source = new Source(document.getElementById('source'));

  const desc = document.getElementById('control-description');
  const status = new Status(document.getElementById('status'));
  status.setDimensions(field.width, field.height);

  let dt;
  let tNow,
    tThen = new Date();

  const testBounds = function () {
    if (orb.left() < 0) {
      orb.x = orb.radius;
      orb.vx = -orb.vx;
    }
    if (orb.right() > field.width) {
      orb.x = field.width - orb.radius;
      orb.vx = -orb.vx;
    }
    if (orb.top() < 0) {
      orb.y = orb.radius;
      orb.vy = -orb.vy;
    }
    if (orb.bottom() > field.height) {
      orb.y = field.height - orb.radius;
      orb.vy = -orb.vy;
    }
  };

  const applyForce = function (fx, fy, dt) {
    orb.applyForce(fx, fy, dt);
  };

  addEvent('click', document.getElementById('orb-control'), function () {
    if (animated) {
      animated = false;
      this.className = this.className.replace(
        'orb-control-stop',
        'orb-control-play'
      );
      desc.textContent = 'Touch the orb to the source to reset the velocity';
    } else {
      animated = true;
      this.className = this.className.replace(
        'orb-control-play',
        'orb-control-stop'
      );
      desc.textContent = 'Stop the orb and drag it to a new position';
    }
  });

  addEvent('change', document.getElementById('force'), function (e) {
    field.physics = e.target.value;
  });

  const animate = () => {
    tNow = new Date();
    dt = tNow - tThen;
    const f = field.force(orb.x, orb.y);

    if (animated == true) {
      applyForce(f.x, f.y, dt);
    } else {
      // Test if the orb touches the source. Reset velocity.
      const y = Math.abs(orb.y - source.y);
      const x = Math.abs(orb.x - source.x);
      if (Math.sqrt(x * x + y * y) < orb.radius) {
        orb.vx = 0;
        orb.vy = 0;
      }
    }

    testBounds();
    source.glow(f.x, f.y);
    status.report(orb.x, orb.y, orb.vx, orb.vy, f.x, f.y);

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

const removeEvent = function (type, obj, func) {
  if (obj && obj.removeEventListener) {
    obj.removeEventListener(type, func, false);
  } else if (obj && obj.detachEvent) {
    obj.detachEvent('on' + type, func);
  }
};

run();
