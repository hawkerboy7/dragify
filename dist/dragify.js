(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Dragify, Handler, log,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Handler = require("./handler");

log = function(msg) {
  if (console.warn) {
    return console.warn(msg);
  } else {
    return console.log(msg);
  }
};

if (typeof MiniEventEmitter === "undefined" || MiniEventEmitter === null) {
  log("Dragify ~ Dragify depends on the MiniEventEmitter.\nhttps://github.com/hawkerboy7/mini-event-emitter\nDefine it before Dragify");
}

Dragify = (function(superClass) {
  extend(Dragify, superClass);

  function Dragify(containers, options) {
    var ref, ref1, x, y;
    this.containers = containers;
    Dragify.__super__.constructor.apply(this, arguments);
    if (!options) {
      if (!!this.containers && this.containers.constructor === Object) {
        options = this.containers;
        this.containers = [];
      } else if (!!this.containers && this.containers.constructor === Array) {
        options = {};
      } else {
        this.containers = [];
        options = {};
      }
    } else {
      if (!this.containers || this.containers.constructor !== Array) {
        this.containers = [];
      }
      if (options.containers) {
        this.containers = this.containers.concat(options.containers);
      }
    }
    if (this.containers.length === 0 && (options.isContainer == null)) {
      return log("Dragify ~ You provided neither the `options.containers` nor the 'isContainer` function. At least one is required.");
    }
    this.options = {
      threshold: {
        x: 3,
        y: 3
      },
      transition: true,
      isContainer: function(el) {
        return false;
      }
    };
    if (options.transition != null) {
      this.options.transition = options.transition;
    }
    if ((x = (ref = options.threshold) != null ? ref.x : void 0) != null) {
      this.options.threshold.x = x;
    }
    if ((y = (ref1 = options.threshold) != null ? ref1.y : void 0) != null) {
      this.options.threshold.y = y;
    }
    if (options.isContainer != null) {
      this.options.isContainer = options.isContainer;
    }
    new Handler(this);
  }

  return Dragify;

})(MiniEventEmitter);

window.Dragify = Dragify;

},{"./handler":3}],2:[function(require,module,exports){
var Error;

Error = (function() {
  function Error(dragify) {
    var ref;
    this.dragify = dragify;
    this.block = !((ref = this.dragify.options) != null ? ref.error : void 0);
  }

  Error.prototype.error = function(id) {
    var msg;
    if (this.block) {
      return;
    }
    msg = "Dragify ~ ";
    if (id === 1.1) {
      msg += "First argument 'Containers' must be an array";
    }
    if (id === 1.2) {
      msg += "'isContainer' must be a function";
    }
    if (id === 2.1) {
      msg += "Dragify was unable to find the correct offset, please report an issue on https://github.com/hawkerboy7/dragify/issues/new. Please provide an example in which this error occurs";
    }
    if (console.warn) {
      return console.warn(msg);
    } else {
      return console.log(msg);
    }
  };

  return Error;

})();

module.exports = Error;

},{}],3:[function(require,module,exports){
var Error, Handler,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Error = require('./error');

Handler = (function() {
  function Handler(dragify) {
    this.dragify = dragify;
    this.mousemove = bind(this.mousemove, this);
    this.mousedown = bind(this.mousedown, this);
    this.mouseup = bind(this.mouseup, this);
    this.load();
    this.setup();
    this.listeners();
  }

  Handler.prototype.load = function() {
    return this.error = (new Error({
      dragify: this.dragify
    })).error;
  };

  Handler.prototype.setup = function() {
    if (!this.dragify.containers) {
      this.dragify.containers = [];
    }
    if (this.dragify.containers.constructor !== Array) {
      return this.error(1.1);
    }
    if (!typeof this.dragify.options.isContainer === "function") {
      return this.error(1.2);
    }
    this.setData();
    return this.create();
  };

  Handler.prototype.setData = function() {
    this.data = {
      index: null,
      start: {},
      offset: {},
      source: null,
      parent: null,
      treshhold: {}
    };
    return this.previous = {};
  };

  Handler.prototype.listeners = function() {
    window.addEventListener('touchend', this.mouseup);
    window.addEventListener('touchstart', this.mousedown);
    window.addEventListener('mouseup', this.mouseup);
    return window.addEventListener('mousedown', this.mousedown);
  };

  Handler.prototype.mouseup = function(e) {
    if (e.button !== 0) {
      return;
    }
    window.removeEventListener('touchmove', this.mousemove);
    window.removeEventListener('mousemove', this.mousemove);
    if (this.active) {
      return this.reset();
    }
  };

  Handler.prototype.mousedown = function(ev) {
    var check, found, x, y;
    if (ev.button !== 0) {
      return;
    }
    if (!(this.node = this.validMousedown(ev.target))) {
      return;
    }
    this.data.source = this.node.parentNode;
    this.data.index = this.getIndex(this.node);
    this.data.start.x = ev.clientX;
    this.data.start.y = ev.clientY;
    x = ev.offsetX;
    y = ev.offsetY;
    found = false;
    check = (function(_this) {
      return function(target) {
        if (target === _this.node) {
          return;
        }
        x += target.offsetLeft;
        y += target.offsetTop;
        if (target.parentNode) {
          return check(target.parentNode);
        }
        return true;
      };
    })(this);
    if (check(ev.target)) {
      return this.error(2.1);
    }
    this.data.offset = {
      x: x,
      y: y
    };
    window.addEventListener('touchmove', this.mousemove);
    return window.addEventListener('mousemove', this.mousemove);
  };

  Handler.prototype.validMousedown = function(target) {
    var check, validate;
    check = (function(_this) {
      return function(el) {
        var e, error;
        try {
          return _this.validContainer(el);
        } catch (error) {
          e = error;
          return false;
        }
      };
    })(this);
    validate = (function(_this) {
      return function(node) {
        if (check(node.parentNode)) {
          return node;
        }
        if (node.parentNode) {
          return validate(node.parentNode);
        }
        return false;
      };
    })(this);
    return validate(target);
  };

  Handler.prototype.validContainer = function(el) {
    if (!el || el === document) {
      return false;
    }
    return this.dragify.containers.indexOf(el) !== -1 || this.dragify.options.isContainer(el);
  };

  Handler.prototype.getIndex = function(node) {
    var child, i, index, len, ref;
    ref = node.parentNode.childNodes;
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      child = ref[index];
      if (child === node) {
        return index;
      }
    }
    return null;
  };

  Handler.prototype.mousemove = function(e1) {
    this.e = e1;
    this.e.preventDefault();
    this.e.X = this.e.clientX;
    this.e.Y = this.e.clientY;
    if (!this.active) {
      if (Math.abs(this.e.X - this.data.start.x) > this.dragify.options.threshold.x) {
        this.active = true;
      }
      if (Math.abs(this.e.Y - this.data.start.y) > this.dragify.options.threshold.y) {
        this.active = true;
      }
      if (!this.active) {
        return;
      }
      this.set();
    }
    if (this.active) {
      return this.position();
    }
  };

  Handler.prototype.position = function() {
    var target;
    this.mirror.style.transform = "translate(" + (this.e.X - this.data.offset.x) + "px," + (this.e.Y - this.data.offset.y) + "px)";
    target = document.elementFromPoint(this.e.X, this.e.Y);
    if (target && target === this.previous.target) {
      return;
    }
    this.previous.target = target;
    if (!(target = this.validParent(target))) {
      return;
    }
    if (target === this.previous.valid) {
      return;
    }
    if (this.node === target) {
      return;
    }
    this.previous.valid = target;
    return this["switch"](target);
  };

  Handler.prototype.validParent = function(target) {
    var find, valid;
    if (!target) {
      return;
    }
    valid = false;
    if (this.validContainer(target)) {
      valid = target;
    }
    find = (function(_this) {
      return function(el) {
        if (_this.validContainer(el.parentNode)) {
          return valid = el;
        } else {
          if (el.parentNode) {
            return find(el.parentNode);
          }
        }
      };
    })(this);
    if (!valid) {
      find(target);
    }
    return valid;
  };

  Handler.prototype["switch"] = function(target1) {
    this.target = target1;
    if (this.validContainer(this.target)) {
      if (this.node.parentNode !== this.target) {
        this.transfer();
      }
      return;
    }
    if (this.target.parentNode !== this.node.parentNode || (this.getIndex(this.node)) > (this.getIndex(this.target))) {
      return this.insert(this.target.parentNode, this.node, this.target);
    } else {
      return this.insert(this.target.parentNode, this.node, this.target.nextSibling);
    }
  };

  Handler.prototype.insert = function(parent, node, target) {
    var replaced;
    parent.insertBefore(node, target);
    replaced = this.target !== parent ? this.target : void 0;
    return this.dragify.emit('move', this.node, this.node.parentNode, this.data.source, replaced);
  };

  Handler.prototype.transfer = function() {
    var below, child, i, index, len, lower, lowest, ref, ref1, target, val;
    lowest = null;
    ref = this.target.childNodes;
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      child = ref[index];
      ref1 = this.distance({
        top: child.offsetTop,
        bottom: child.offsetTop + child.clientHeight
      }), val = ref1[0], lower = ref1[1];
      if (!lowest || val < lowest) {
        lowest = val;
        target = child;
        below = lower;
      }
    }
    if (this.target.childNodes[this.target.childNodes.length - 1] === target && below) {
      target = null;
    }
    return this.insert(this.target, this.node, target);
  };

  Handler.prototype.distance = function(pos) {
    var below, bottom, val, y;
    below = false;
    y = this.e.offsetY;
    val = Math.abs(y - pos.top);
    if (val > (bottom = Math.abs(y - pos.bottom))) {
      val = bottom;
    }
    return [val, y > pos.bottom];
  };

  Handler.prototype.create = function() {
    this.mirror = document.createElement('div');
    this.mirror.tabIndex = 0;
    return this.mirror.className = 'dragify--mirror';
  };

  Handler.prototype.set = function() {
    var clone;
    this.previous.valid = this.node.parentNode;
    this.dragify.emit('drag', this.node, this.node.parentNode);
    this.mirror.appendChild(clone = this.node.cloneNode(true));
    clone.style.width = this.node.offsetWidth + "px";
    clone.style.height = this.node.offsetHeight + "px";
    document.body.appendChild(this.mirror);
    this.mirror.focus();
    this.addClass(document.body, 'dragify--body');
    if (this.dragify.options.transition) {
      this.addClass(this.node, 'dragify--transition');
    }
    return this.addClass(this.node, 'dragify--opaque');
  };

  Handler.prototype.reset = function() {
    var remove;
    this.active = false;
    while (this.mirror.firstChild) {
      this.mirror.removeChild(this.mirror.firstChild);
    }
    document.body.removeChild(this.mirror);
    this.mirror.removeAttribute('style');
    this.removeClass(document.body, 'dragify--body');
    this.removeClass(this.node, 'dragify--opaque');
    remove = (function(_this) {
      return function(node) {
        return setTimeout(function() {
          return _this.removeClass(node, 'dragify--transition');
        }, 500);
      };
    })(this);
    if (this.dragify.options.transition) {
      remove(this.node);
    }
    if (this.data.source === this.node.parentNode && this.data.index === this.getIndex(this.node)) {
      this.dragify.emit('cancel', this.node, this.node.parentNode);
    } else {
      this.dragify.emit('drop', this.node, this.node.parentNode, this.data.source);
    }
    this.dragify.emit('end', this.node);
    this.node = null;
    this.target = null;
    return this.setData();
  };

  Handler.prototype.addClass = function(node, className) {
    var classes;
    classes = [];
    if (node.className) {
      classes = node.className.split(' ');
    }
    classes.push(className);
    return node.className = classes.join(' ');
  };

  Handler.prototype.removeClass = function(node, className) {
    var classes;
    classes = node.className.split(' ');
    classes.splice(classes.indexOf(className), 1);
    if (classes.length === 0) {
      return node.removeAttribute('class');
    } else {
      return node.className = classes.join(' ');
    }
  };

  return Handler;

})();

module.exports = Handler;

},{"./error":2}]},{},[1])
Contact GitHub API Training Shop Blog About
© 2017 GitHub, Inc. Terms Privacy Security Status Help
