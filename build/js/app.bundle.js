(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Dragify, Handler, MiniEventEmitter,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MiniEventEmitter = require("mini-event-emitter");

Handler = require("./handler");

Dragify = (function(superClass) {
  extend(Dragify, superClass);

  function Dragify(containers, options) {
    var msg, ref, ref1, x, y;
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
      msg = "Dragify ~ You provided neither the `containers` array nor the 'isContainer` function. At least one is required.";
      if (console.warn) {
        console.warn(msg);
      } else {
        console.log(msg);
      }
      return;
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

module.exports = Dragify;

},{"./handler":3,"mini-event-emitter":5}],2:[function(require,module,exports){
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

Error = require("./error");

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
    this.dragify.settings.name = "Dragify";
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
    window.addEventListener("mouseup", this.mouseup);
    return window.addEventListener("mousedown", this.mousedown);
  };

  Handler.prototype.mouseup = function(e) {
    if (e.button !== 0) {
      return;
    }
    window.removeEventListener("mousemove", this.mousemove);
    if (this.active) {
      return this.reset();
    }
  };

  Handler.prototype.mousedown = function(ev) {
    var check, found, x, y;
    if (ev.button !== 0 || this.active) {
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
    return window.addEventListener("mousemove", this.mousemove);
  };

  Handler.prototype.validMousedown = function(target) {
    var check, validate;
    check = (function(_this) {
      return function(el) {
        var e;
        try {
          return _this.validContainer(el);
        } catch (error) {
          e = error;
          return false;
        }
      };
    })(this);
    validate = function(node) {
      if (check(node.parentNode)) {
        return node;
      }
      if (node.parentNode) {
        return validate(node.parentNode);
      }
      return false;
    };
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
    return this.dragify.emitIf("move", this.node, this.node.parentNode, this.data.source, replaced);
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
    this.mirror = document.createElement("div");
    this.mirror.tabIndex = 0;
    return this.mirror.className = "dragify--mirror";
  };

  Handler.prototype.set = function() {
    var clone;
    this.previous.valid = this.node.parentNode;
    this.dragify.emitIf("drag", this.node, this.node.parentNode);
    this.mirror.appendChild(clone = this.node.cloneNode(true));
    clone.style.width = this.node.offsetWidth + "px";
    clone.style.height = this.node.offsetHeight + "px";
    document.body.appendChild(this.mirror);
    this.mirror.focus();
    this.addClass(document.body, "dragify--body");
    if (this.dragify.options.transition) {
      this.addClass(this.node, "dragify--transition");
    }
    return this.addClass(this.node, "dragify--opaque");
  };

  Handler.prototype.reset = function() {
    var remove;
    this.active = false;
    while (this.mirror.firstChild) {
      this.mirror.removeChild(this.mirror.firstChild);
    }
    document.body.removeChild(this.mirror);
    this.mirror.removeAttribute("style");
    this.removeClass(document.body, "dragify--body");
    this.removeClass(this.node, "dragify--opaque");
    remove = (function(_this) {
      return function(node) {
        return setTimeout(function() {
          return _this.removeClass(node, "dragify--transition");
        }, 500);
      };
    })(this);
    if (this.dragify.options.transition) {
      remove(this.node);
    }
    if (this.data.source === this.node.parentNode && this.data.index === this.getIndex(this.node)) {
      this.dragify.emitIf("cancel", this.node, this.node.parentNode);
    } else {
      this.dragify.emitIf("drop", this.node, this.node.parentNode, this.data.source);
    }
    this.dragify.emitIf("end", this.node);
    this.node = null;
    this.target = null;
    return this.setData();
  };

  Handler.prototype.addClass = function(node, className) {
    var classes;
    classes = [];
    if (node.className) {
      classes = node.className.split(" ");
    }
    classes.push(className);
    return node.className = classes.join(" ");
  };

  Handler.prototype.removeClass = function(node, className) {
    var classes;
    classes = node.className.split(" ");
    classes.splice(classes.indexOf(className), 1);
    if (classes.length === 0) {
      return node.removeAttribute("class");
    } else {
      return node.className = classes.join(" ");
    }
  };

  return Handler;

})();

module.exports = Handler;

},{"./error":2}],4:[function(require,module,exports){
var MiniEventEmitter,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

MiniEventEmitter = (function() {
  function MiniEventEmitter(mini, obj) {
    this.mini = mini;
    this.removeFn = bind(this.removeFn, this);
    this.removeFns = bind(this.removeFns, this);
    this.emit = bind(this.emit, this);
    this.emitIf = bind(this.emitIf, this);
    this.off = bind(this.off, this);
    this.on = bind(this.on, this);
    this.mini.settings = {
      name: (obj != null ? obj.name : void 0) || "MiniEventEmitter",
      error: (obj != null ? obj.error : void 0) || false,
      trace: (obj != null ? obj.trace : void 0) || false
    };
    this.mini.events = {};
    this.mini.groups = {};
  }

  MiniEventEmitter.prototype.on = function(event, group, fn) {
    var events, groups, ref;
    ref = this.optional(group, fn), group = ref[0], fn = ref[1];
    if (!this.valid("on", event, group, fn)) {
      return this.mini;
    }
    if ((groups = this.mini.groups)[group]) {
      if (groups[group][event]) {
        groups[group][event].push(fn);
      } else {
        groups[group][event] = [fn];
      }
    } else {
      groups[group] = {};
      groups[group][event] = [fn];
    }
    if ((events = this.mini.events)[event]) {
      events[event].push(fn);
    } else {
      events[event] = [fn];
    }
    return this.mini;
  };

  MiniEventEmitter.prototype.off = function(event, group, fn) {
    var fns, index, ref;
    if (arguments.length === 0) {
      return this.removeAll();
    }
    ref = this.optional(group, fn), group = ref[0], fn = ref[1];
    if (!this.valid("off", event, group, fn)) {
      return this.mini;
    }
    if (!this.mini.groups[group]) {
      this.error("off", 7, event, group);
      return this.mini;
    }
    if (!event) {
      return this.removeGroup(group);
    }
    if (!(fns = this.mini.groups[group][event])) {
      this.error("off", 8, event, group);
      return this.mini;
    }
    if (!fn) {
      return this.removeFns(event, group, fns);
    }
    if (-1 === (index = fns.indexOf(fn))) {
      this.error("off", 2, event, group);
      return this.mini;
    }
    this.removeFn(event, group, fns, fn, index);
    return this.mini;
  };

  MiniEventEmitter.prototype.emitIf = function() {
    return this._emit(arguments, true);
  };

  MiniEventEmitter.prototype.emit = function() {
    return this._emit(arguments);
  };

  MiniEventEmitter.prototype._emit = function(args, skip) {
    var event, fn, fns, i, len;
    args = Array.from(args);
    event = args.shift();
    if (!(fns = this.validEvent(event, skip))) {
      return this.mini;
    }
    this.trace(event, args);
    for (i = 0, len = fns.length; i < len; i++) {
      fn = fns[i];
      fn.apply(fn, args);
    }
    return this.mini;
  };

  MiniEventEmitter.prototype.valid = function(name, event, group, fn) {
    if (name === "on") {
      if (!this.isString(event)) {
        return this.error(name, 1);
      }
      if (!this.isString(group)) {
        return this.error(name, 5);
      }
      if (!this.isFunction(fn)) {
        return this.error(name, 6, event, group);
      }
    }
    if (name === "off") {
      if (event !== null && !this.isString(event)) {
        return this.error(name, 1);
      }
      if (!this.isString(group)) {
        return this.error(name, 5);
      }
      if (fn && !this.isFunction(fn)) {
        return this.error(name, 6, event, group);
      }
    }
    return true;
  };

  MiniEventEmitter.prototype.validEvent = function(event, skip) {
    var fns;
    if (!event) {
      return this.error("emit", 3);
    }
    if (!this.isString(event)) {
      return this.error("emit", 1);
    }
    if (!(fns = this.mini.events[event])) {
      if (!skip) {
        this.error("emit", 4, event);
      }
      return null;
    }
    return fns;
  };

  MiniEventEmitter.prototype.error = function(name, id, event, group) {
    var msg;
    if (!this.mini.settings.error) {
      return null;
    }
    msg = this.mini.settings.name + " ~ " + name + " ~ ";
    if (id === 1) {
      msg += "Event name must be a string";
    }
    if (id === 2) {
      msg += "Provided function to remove with event \"" + event + "\" in group \"" + group + "\" is not found";
    }
    if (id === 3) {
      msg += "Event was not provided";
    }
    if (id === 4) {
      msg += "EventListener for event \"" + event + "\" does not exist";
    }
    if (id === 5) {
      msg += "Provided group must be a string";
    }
    if (id === 6) {
      msg += "The last param provided with event \"" + event + "\" and group \"" + group + "\" is expected to be a function";
    }
    if (id === 7) {
      msg += "Provided group \"" + group + "\" is not found";
    }
    if (id === 8) {
      msg += "Event \"" + event + "\" does not exist for the provided group \"" + group + "\"";
    }
    if (console) {
      if (console.warn) {
        console.warn(msg);
      } else {
        console.log(msg);
      }
    }
    return null;
  };

  MiniEventEmitter.prototype.optional = function(group, fn) {
    if ((fn == null) && this.isFunction(group)) {
      fn = group;
      group = "";
    } else {
      if (!group) {
        group = "";
      }
    }
    return [group, fn];
  };

  MiniEventEmitter.prototype.removeAll = function() {
    this.mini.events = {};
    this.mini.groups = {};
    return this.mini;
  };

  MiniEventEmitter.prototype.removeGroup = function(group) {
    var event, fns, ref;
    ref = this.mini.groups[group];
    for (event in ref) {
      fns = ref[event];
      this.removeFns(event, group, fns);
    }
    return this.mini;
  };

  MiniEventEmitter.prototype.removeFns = function(event, group, fns) {
    var fn, i;
    for (i = fns.length - 1; i >= 0; i += -1) {
      fn = fns[i];
      this.removeFn(event, group, fns, fn);
    }
    return this.mini;
  };

  MiniEventEmitter.prototype.removeFn = function(event, group, fns, fn, index) {
    if (!index) {
      index = fns.indexOf(fn);
    }
    fns.splice(index, 1);
    if (fns.length === 0) {
      delete this.mini.groups[group][event];
    }
    if (0 === this.objLength(this.mini.groups[group])) {
      delete this.mini.groups[group];
    }
    index = this.mini.events[event].indexOf(fn);
    this.mini.events[event].splice(index, 1);
    if (this.mini.events[event].length === 0) {
      return delete this.mini.events[event];
    }
  };

  MiniEventEmitter.prototype.trace = function(event, args) {
    var msg;
    if (this.mini.settings.trace) {
      msg = this.mini.settings.name + " ~ trace ~ " + event;
      if (args.length === 0) {
        if (console.debug) {
          return console.log("%c " + msg, "color: #13d");
        } else {
          return console.log(msg);
        }
      } else {
        if (console.debug) {
          return console.log("%c " + msg, "color: #13d", args);
        } else {
          return console.log(msg, args);
        }
      }
    }
  };

  MiniEventEmitter.prototype.isString = function(event) {
    return typeof event === "string" || event instanceof String;
  };

  MiniEventEmitter.prototype.objLength = function(obj) {
    return Object.keys(obj).length;
  };

  MiniEventEmitter.prototype.isFunction = function(fn) {
    return typeof fn === "function";
  };

  return MiniEventEmitter;

})();

module.exports = MiniEventEmitter;

},{}],5:[function(require,module,exports){
var Handler, MiniEventEmitter;

Handler = require("./handler");

MiniEventEmitter = (function() {
  function MiniEventEmitter(obj) {
    var handler;
    handler = new Handler(this, obj);
    this.on = handler.on;
    this.off = handler.off;
    this.emit = handler.emit;
    this.emitIf = handler.emitIf;
    this.trigger = handler.emit;
    this.triggerIf = handler.emitIf;
  }

  return MiniEventEmitter;

})();

module.exports = MiniEventEmitter;

},{"./handler":4}]},{},[1])