const sliders = [];

const Slider = function (input) {
  const that = this;

  this.input = input;
  this.minText;
  this.maxText;
  this.min;
  this.max;
  this.increment;
  this.options;
  this.currentValue;
  this.val;
  this.slider;
  this.plus;
  this.minus;

  this.init = function () {
    this.currentValue = 0;
    if (this.input.type == 'select-one') {
      this.setOptions();
    } else {
      this.setDataAttr();
    }

    this.build();
    this.setSliderPosition();
    this.hideInput();
    this.setEvents();
  };

  this.setOptions = function () {
    const options = this.input.options;
    let val = 0;

    this.options = {};
    for (let i = 0; i < options.length; i++) {
      this.options[i] = {
        value: options[i].value,
        text: options[i].text,
      };
      if (this.input.value == options[i].value) {
        this.currentValue = i;
      }
    }

    this.min = 0;
    this.minText = this.options[0].text;
    this.max = options.length - 1;
    this.maxText = this.options[options.length - 1].text;
    this.increment = 1;
  };

  this.setDataAttr = function () {
    this.min = this.input.getAttribute('data-min');
    this.minText = this.input.getAttribute('data-min-text');
    this.max = this.input.getAttribute('data-max');
    this.maxText = this.input.getAttribute('data-max-text');
    this.increment = this.input.getAttribute('data-increment');

    this.currentValue = +this.input.value;
  };

  this.build = function () {
    const d = this.create('div', 'slider', this.input.parentNode);
    const dc = this.create('div', 'slider-container', d);
    this.create('div', 'slider-channel', dc);
    this.slider = this.create('div', 'slider-slider', dc);
    const dmin = this.create('div', 'slider-min', d);
    dmin.textContent = this.minText;
    const dmax = this.create('div', 'slider-max', d);
    dmax.textContent = this.maxText;

    const l = this.input.parentNode.getElementsByTagName('label')[0];
    l.textContent = l.textContent + ': ';

    this.val = this.create('span', 'slider-value', l);
    this.setVal(this.currentValue);

    this.plus = this.create('div', 'slider-plus', input.parentNode);
    this.plus.textContent = '+';

    this.minus = this.create('div', 'slider-minus', input.parentNode);
    this.minus.textContent = '-';
  };

  this.create = function (el, cl, par) {
    const n = document.createElement(el);
    n.className = cl;
    par.appendChild(n);
    return n;
  };

  this.hideInput = function () {
    this.input.style.display = 'none';
  };

  this.setEvents = function () {
    addEvent('touchstart', this.slider, that.move);
    addEvent('touchmove', this.slider, that.move);
    addEvent('mousedown', this.slider, that.initMove);
    addEvent('click', this.plus, this.add);
    addEvent('click', this.minus, this.subtract);
  };

  this.initMove = function () {
    addEvent('mousemove', that.slider, that.move);
    addEvent('mouseup', that.slider, function () {
      removeEvent('mousemove', that.slider, that.move);
    });
  };

  this.move = function (e) {
    e.preventDefault();

    const s = e.target;
    const tX = e.changedTouches?.[0]?.pageX ?? e.clientX;
    const sRect = s.getBoundingClientRect();
    const parentRect = s.parentNode.getBoundingClientRect();
    const minX = parentRect.left;
    const maxX = parentRect.right - s.offsetWidth;

    let newX = tX - minX - s.offsetWidth / 2;

    if (newX < 0) {
      newX = 0;
    } else if (newX > s.parentNode.offsetWidth - s.offsetWidth) {
      newX = s.parentNode.offsetWidth - s.offsetWidth;
    }

    s.style.left = newX + 'px';

    const percent = newX / (maxX - minX);
    const range = that.max - that.min;
    let val = +that.min + range * percent;
    val = Math.floor(val / that.increment) * that.increment;
    that.setVal(val);
  };

  this.add = function (e) {
    e.preventDefault();
    let val = +that.currentValue + +that.increment;
    if (val > that.max) {
      val = that.max;
    }
    that.setVal(val);
    that.setSliderPosition();
  };

  this.subtract = function (e) {
    e.preventDefault();
    let val = +that.currentValue - +that.increment;
    if (val < that.min) {
      val = that.min;
    }
    that.setVal(val);
    that.setSliderPosition();
  };

  this.setSliderPosition = function () {
    const rangeX = this.slider.parentNode.offsetWidth - this.slider.offsetWidth;
    const percent = (+this.currentValue - this.min) / (this.max - this.min);
    const newX = Math.floor(rangeX * percent);

    this.slider.style.left = newX + 'px';
  };

  this.setVal = function (val) {
    this.currentValue = val;
    if (typeof this.options == 'object') {
      this.setSelectVal(val);
    } else {
      this.setInputVal(val);
    }
  };

  this.setInputVal = function (val) {
    this.val.textContent = val.toFixed();
    this.input.value = val.toFixed();
  };

  this.setSelectVal = function (val) {
    this.val.textContent = this.options[val].text;
    this.input.value = this.options[val].value;
  };
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
  } else if (obj && obj.removeEvent) {
    obj.removeEvent('on' + type, func);
  }
};

const init = function () {
  const forms = document.forms;
  const inputs = forms[0].elements;
  const count = inputs.length;
  for (let i = 0; i < count; i++) {
    sliders[i] = new Slider(inputs[i]);
    sliders[i].init();
  }
};

init();
