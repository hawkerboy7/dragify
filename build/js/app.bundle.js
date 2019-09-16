(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    if (ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA") {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9hcHAuanMiLCJidWlsZC9qcy9lcnJvci5qcyIsImJ1aWxkL2pzL2hhbmRsZXIuanMiLCJub2RlX21vZHVsZXMvbWluaS1ldmVudC1lbWl0dGVyL2J1aWxkL2hhbmRsZXIuanMiLCJub2RlX21vZHVsZXMvbWluaS1ldmVudC1lbWl0dGVyL2J1aWxkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBEcmFnaWZ5LCBIYW5kbGVyLCBNaW5pRXZlbnRFbWl0dGVyLFxuICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuTWluaUV2ZW50RW1pdHRlciA9IHJlcXVpcmUoXCJtaW5pLWV2ZW50LWVtaXR0ZXJcIik7XG5cbkhhbmRsZXIgPSByZXF1aXJlKFwiLi9oYW5kbGVyXCIpO1xuXG5EcmFnaWZ5ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKERyYWdpZnksIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIERyYWdpZnkoY29udGFpbmVycywgb3B0aW9ucykge1xuICAgIHZhciBtc2csIHJlZiwgcmVmMSwgeCwgeTtcbiAgICB0aGlzLmNvbnRhaW5lcnMgPSBjb250YWluZXJzO1xuICAgIERyYWdpZnkuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBpZiAoISF0aGlzLmNvbnRhaW5lcnMgJiYgdGhpcy5jb250YWluZXJzLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMuY29udGFpbmVycztcbiAgICAgICAgdGhpcy5jb250YWluZXJzID0gW107XG4gICAgICB9IGVsc2UgaWYgKCEhdGhpcy5jb250YWluZXJzICYmIHRoaXMuY29udGFpbmVycy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJzID0gW107XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLmNvbnRhaW5lcnMgfHwgdGhpcy5jb250YWluZXJzLmNvbnN0cnVjdG9yICE9PSBBcnJheSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lcnMgPSBbXTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLmNvbnRhaW5lcnMpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJzID0gdGhpcy5jb250YWluZXJzLmNvbmNhdChvcHRpb25zLmNvbnRhaW5lcnMpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5jb250YWluZXJzLmxlbmd0aCA9PT0gMCAmJiAob3B0aW9ucy5pc0NvbnRhaW5lciA9PSBudWxsKSkge1xuICAgICAgbXNnID0gXCJEcmFnaWZ5IH4gWW91IHByb3ZpZGVkIG5laXRoZXIgdGhlIGBjb250YWluZXJzYCBhcnJheSBub3IgdGhlICdpc0NvbnRhaW5lcmAgZnVuY3Rpb24uIEF0IGxlYXN0IG9uZSBpcyByZXF1aXJlZC5cIjtcbiAgICAgIGlmIChjb25zb2xlLndhcm4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICB0aHJlc2hvbGQ6IHtcbiAgICAgICAgeDogMyxcbiAgICAgICAgeTogM1xuICAgICAgfSxcbiAgICAgIHRyYW5zaXRpb246IHRydWUsXG4gICAgICBpc0NvbnRhaW5lcjogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH07XG4gICAgaWYgKG9wdGlvbnMudHJhbnNpdGlvbiAhPSBudWxsKSB7XG4gICAgICB0aGlzLm9wdGlvbnMudHJhbnNpdGlvbiA9IG9wdGlvbnMudHJhbnNpdGlvbjtcbiAgICB9XG4gICAgaWYgKCh4ID0gKHJlZiA9IG9wdGlvbnMudGhyZXNob2xkKSAhPSBudWxsID8gcmVmLnggOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgIHRoaXMub3B0aW9ucy50aHJlc2hvbGQueCA9IHg7XG4gICAgfVxuICAgIGlmICgoeSA9IChyZWYxID0gb3B0aW9ucy50aHJlc2hvbGQpICE9IG51bGwgPyByZWYxLnkgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgIHRoaXMub3B0aW9ucy50aHJlc2hvbGQueSA9IHk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmlzQ29udGFpbmVyICE9IG51bGwpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5pc0NvbnRhaW5lciA9IG9wdGlvbnMuaXNDb250YWluZXI7XG4gICAgfVxuICAgIG5ldyBIYW5kbGVyKHRoaXMpO1xuICB9XG5cbiAgcmV0dXJuIERyYWdpZnk7XG5cbn0pKE1pbmlFdmVudEVtaXR0ZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdpZnk7XG4iLCJ2YXIgRXJyb3I7XG5cbkVycm9yID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBFcnJvcihkcmFnaWZ5KSB7XG4gICAgdmFyIHJlZjtcbiAgICB0aGlzLmRyYWdpZnkgPSBkcmFnaWZ5O1xuICAgIHRoaXMuYmxvY2sgPSAhKChyZWYgPSB0aGlzLmRyYWdpZnkub3B0aW9ucykgIT0gbnVsbCA/IHJlZi5lcnJvciA6IHZvaWQgMCk7XG4gIH1cblxuICBFcnJvci5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbihpZCkge1xuICAgIHZhciBtc2c7XG4gICAgaWYgKHRoaXMuYmxvY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbXNnID0gXCJEcmFnaWZ5IH4gXCI7XG4gICAgaWYgKGlkID09PSAxLjEpIHtcbiAgICAgIG1zZyArPSBcIkZpcnN0IGFyZ3VtZW50ICdDb250YWluZXJzJyBtdXN0IGJlIGFuIGFycmF5XCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gMS4yKSB7XG4gICAgICBtc2cgKz0gXCInaXNDb250YWluZXInIG11c3QgYmUgYSBmdW5jdGlvblwiO1xuICAgIH1cbiAgICBpZiAoaWQgPT09IDIuMSkge1xuICAgICAgbXNnICs9IFwiRHJhZ2lmeSB3YXMgdW5hYmxlIHRvIGZpbmQgdGhlIGNvcnJlY3Qgb2Zmc2V0LCBwbGVhc2UgcmVwb3J0IGFuIGlzc3VlIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9oYXdrZXJib3k3L2RyYWdpZnkvaXNzdWVzL25ldy4gUGxlYXNlIHByb3ZpZGUgYW4gZXhhbXBsZSBpbiB3aGljaCB0aGlzIGVycm9yIG9jY3Vyc1wiO1xuICAgIH1cbiAgICBpZiAoY29uc29sZS53YXJuKSB7XG4gICAgICByZXR1cm4gY29uc29sZS53YXJuKG1zZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhtc2cpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gRXJyb3I7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gRXJyb3I7XG4iLCJ2YXIgRXJyb3IsIEhhbmRsZXIsXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG5FcnJvciA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xuXG5IYW5kbGVyID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBIYW5kbGVyKGRyYWdpZnkpIHtcbiAgICB0aGlzLmRyYWdpZnkgPSBkcmFnaWZ5O1xuICAgIHRoaXMubW91c2Vtb3ZlID0gYmluZCh0aGlzLm1vdXNlbW92ZSwgdGhpcyk7XG4gICAgdGhpcy5tb3VzZWRvd24gPSBiaW5kKHRoaXMubW91c2Vkb3duLCB0aGlzKTtcbiAgICB0aGlzLm1vdXNldXAgPSBiaW5kKHRoaXMubW91c2V1cCwgdGhpcyk7XG4gICAgdGhpcy5sb2FkKCk7XG4gICAgdGhpcy5zZXR1cCgpO1xuICAgIHRoaXMubGlzdGVuZXJzKCk7XG4gIH1cblxuICBIYW5kbGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZXJyb3IgPSAobmV3IEVycm9yKHtcbiAgICAgIGRyYWdpZnk6IHRoaXMuZHJhZ2lmeVxuICAgIH0pKS5lcnJvcjtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZHJhZ2lmeS5zZXR0aW5ncy5uYW1lID0gXCJEcmFnaWZ5XCI7XG4gICAgaWYgKCF0aGlzLmRyYWdpZnkuY29udGFpbmVycykge1xuICAgICAgdGhpcy5kcmFnaWZ5LmNvbnRhaW5lcnMgPSBbXTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZHJhZ2lmeS5jb250YWluZXJzLmNvbnN0cnVjdG9yICE9PSBBcnJheSkge1xuICAgICAgcmV0dXJuIHRoaXMuZXJyb3IoMS4xKTtcbiAgICB9XG4gICAgaWYgKCF0eXBlb2YgdGhpcy5kcmFnaWZ5Lm9wdGlvbnMuaXNDb250YWluZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIHRoaXMuZXJyb3IoMS4yKTtcbiAgICB9XG4gICAgdGhpcy5zZXREYXRhKCk7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlKCk7XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUuc2V0RGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZGF0YSA9IHtcbiAgICAgIGluZGV4OiBudWxsLFxuICAgICAgc3RhcnQ6IHt9LFxuICAgICAgb2Zmc2V0OiB7fSxcbiAgICAgIHNvdXJjZTogbnVsbCxcbiAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgIHRyZXNoaG9sZDoge31cbiAgICB9O1xuICAgIHJldHVybiB0aGlzLnByZXZpb3VzID0ge307XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cCk7XG4gICAgcmV0dXJuIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duKTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5tb3VzZXVwID0gZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLmJ1dHRvbiAhPT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZSk7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXNldCgpO1xuICAgIH1cbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5tb3VzZWRvd24gPSBmdW5jdGlvbihldikge1xuICAgIHZhciBjaGVjaywgZm91bmQsIHgsIHk7XG4gICAgaWYgKGV2LmJ1dHRvbiAhPT0gMCB8fCB0aGlzLmFjdGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXYudGFyZ2V0LnRhZ05hbWUgPT09IFwiSU5QVVRcIiB8fCBldi50YXJnZXQudGFnTmFtZSA9PT0gXCJURVhUQVJFQVwiKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghKHRoaXMubm9kZSA9IHRoaXMudmFsaWRNb3VzZWRvd24oZXYudGFyZ2V0KSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5kYXRhLnNvdXJjZSA9IHRoaXMubm9kZS5wYXJlbnROb2RlO1xuICAgIHRoaXMuZGF0YS5pbmRleCA9IHRoaXMuZ2V0SW5kZXgodGhpcy5ub2RlKTtcbiAgICB0aGlzLmRhdGEuc3RhcnQueCA9IGV2LmNsaWVudFg7XG4gICAgdGhpcy5kYXRhLnN0YXJ0LnkgPSBldi5jbGllbnRZO1xuICAgIHggPSBldi5vZmZzZXRYO1xuICAgIHkgPSBldi5vZmZzZXRZO1xuICAgIGZvdW5kID0gZmFsc2U7XG4gICAgY2hlY2sgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgaWYgKHRhcmdldCA9PT0gX3RoaXMubm9kZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB4ICs9IHRhcmdldC5vZmZzZXRMZWZ0O1xuICAgICAgICB5ICs9IHRhcmdldC5vZmZzZXRUb3A7XG4gICAgICAgIGlmICh0YXJnZXQucGFyZW50Tm9kZSkge1xuICAgICAgICAgIHJldHVybiBjaGVjayh0YXJnZXQucGFyZW50Tm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpO1xuICAgIGlmIChjaGVjayhldi50YXJnZXQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lcnJvcigyLjEpO1xuICAgIH1cbiAgICB0aGlzLmRhdGEub2Zmc2V0ID0ge1xuICAgICAgeDogeCxcbiAgICAgIHk6IHlcbiAgICB9O1xuICAgIHJldHVybiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZSk7XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUudmFsaWRNb3VzZWRvd24gPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICB2YXIgY2hlY2ssIHZhbGlkYXRlO1xuICAgIGNoZWNrID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgdmFyIGU7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnZhbGlkQ29udGFpbmVyKGVsKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBlID0gZXJyb3I7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpO1xuICAgIHZhbGlkYXRlID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgaWYgKGNoZWNrKG5vZGUucGFyZW50Tm9kZSkpIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG4gICAgICBpZiAobm9kZS5wYXJlbnROb2RlKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZShub2RlLnBhcmVudE5vZGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgcmV0dXJuIHZhbGlkYXRlKHRhcmdldCk7XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUudmFsaWRDb250YWluZXIgPSBmdW5jdGlvbihlbCkge1xuICAgIGlmICghZWwgfHwgZWwgPT09IGRvY3VtZW50KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmRyYWdpZnkuY29udGFpbmVycy5pbmRleE9mKGVsKSAhPT0gLTEgfHwgdGhpcy5kcmFnaWZ5Lm9wdGlvbnMuaXNDb250YWluZXIoZWwpO1xuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLmdldEluZGV4ID0gZnVuY3Rpb24obm9kZSkge1xuICAgIHZhciBjaGlsZCwgaSwgaW5kZXgsIGxlbiwgcmVmO1xuICAgIHJlZiA9IG5vZGUucGFyZW50Tm9kZS5jaGlsZE5vZGVzO1xuICAgIGZvciAoaW5kZXggPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaW5kZXggPSArK2kpIHtcbiAgICAgIGNoaWxkID0gcmVmW2luZGV4XTtcbiAgICAgIGlmIChjaGlsZCA9PT0gbm9kZSkge1xuICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUxKSB7XG4gICAgdGhpcy5lID0gZTE7XG4gICAgdGhpcy5lLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5lLlggPSB0aGlzLmUuY2xpZW50WDtcbiAgICB0aGlzLmUuWSA9IHRoaXMuZS5jbGllbnRZO1xuICAgIGlmICghdGhpcy5hY3RpdmUpIHtcbiAgICAgIGlmIChNYXRoLmFicyh0aGlzLmUuWCAtIHRoaXMuZGF0YS5zdGFydC54KSA+IHRoaXMuZHJhZ2lmeS5vcHRpb25zLnRocmVzaG9sZC54KSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChNYXRoLmFicyh0aGlzLmUuWSAtIHRoaXMuZGF0YS5zdGFydC55KSA+IHRoaXMuZHJhZ2lmeS5vcHRpb25zLnRocmVzaG9sZC55KSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5hY3RpdmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbigpO1xuICAgIH1cbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5wb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0YXJnZXQ7XG4gICAgdGhpcy5taXJyb3Iuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGUoXCIgKyAodGhpcy5lLlggLSB0aGlzLmRhdGEub2Zmc2V0LngpICsgXCJweCxcIiArICh0aGlzLmUuWSAtIHRoaXMuZGF0YS5vZmZzZXQueSkgKyBcInB4KVwiO1xuICAgIHRhcmdldCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQodGhpcy5lLlgsIHRoaXMuZS5ZKTtcbiAgICBpZiAodGFyZ2V0ICYmIHRhcmdldCA9PT0gdGhpcy5wcmV2aW91cy50YXJnZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcmV2aW91cy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgaWYgKCEodGFyZ2V0ID0gdGhpcy52YWxpZFBhcmVudCh0YXJnZXQpKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGFyZ2V0ID09PSB0aGlzLnByZXZpb3VzLnZhbGlkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLm5vZGUgPT09IHRhcmdldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnByZXZpb3VzLnZhbGlkID0gdGFyZ2V0O1xuICAgIHJldHVybiB0aGlzW1wic3dpdGNoXCJdKHRhcmdldCk7XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUudmFsaWRQYXJlbnQgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICB2YXIgZmluZCwgdmFsaWQ7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFsaWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy52YWxpZENvbnRhaW5lcih0YXJnZXQpKSB7XG4gICAgICB2YWxpZCA9IHRhcmdldDtcbiAgICB9XG4gICAgZmluZCA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIGlmIChfdGhpcy52YWxpZENvbnRhaW5lcihlbC5wYXJlbnROb2RlKSkge1xuICAgICAgICAgIHJldHVybiB2YWxpZCA9IGVsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChlbC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmluZChlbC5wYXJlbnROb2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcyk7XG4gICAgaWYgKCF2YWxpZCkge1xuICAgICAgZmluZCh0YXJnZXQpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGVbXCJzd2l0Y2hcIl0gPSBmdW5jdGlvbih0YXJnZXQxKSB7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQxO1xuICAgIGlmICh0aGlzLnZhbGlkQ29udGFpbmVyKHRoaXMudGFyZ2V0KSkge1xuICAgICAgaWYgKHRoaXMubm9kZS5wYXJlbnROb2RlICE9PSB0aGlzLnRhcmdldCkge1xuICAgICAgICB0aGlzLnRyYW5zZmVyKCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnRhcmdldC5wYXJlbnROb2RlICE9PSB0aGlzLm5vZGUucGFyZW50Tm9kZSB8fCAodGhpcy5nZXRJbmRleCh0aGlzLm5vZGUpKSA+ICh0aGlzLmdldEluZGV4KHRoaXMudGFyZ2V0KSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmluc2VydCh0aGlzLnRhcmdldC5wYXJlbnROb2RlLCB0aGlzLm5vZGUsIHRoaXMudGFyZ2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaW5zZXJ0KHRoaXMudGFyZ2V0LnBhcmVudE5vZGUsIHRoaXMubm9kZSwgdGhpcy50YXJnZXQubmV4dFNpYmxpbmcpO1xuICAgIH1cbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5pbnNlcnQgPSBmdW5jdGlvbihwYXJlbnQsIG5vZGUsIHRhcmdldCkge1xuICAgIHZhciByZXBsYWNlZDtcbiAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5vZGUsIHRhcmdldCk7XG4gICAgcmVwbGFjZWQgPSB0aGlzLnRhcmdldCAhPT0gcGFyZW50ID8gdGhpcy50YXJnZXQgOiB2b2lkIDA7XG4gICAgcmV0dXJuIHRoaXMuZHJhZ2lmeS5lbWl0SWYoXCJtb3ZlXCIsIHRoaXMubm9kZSwgdGhpcy5ub2RlLnBhcmVudE5vZGUsIHRoaXMuZGF0YS5zb3VyY2UsIHJlcGxhY2VkKTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS50cmFuc2ZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBiZWxvdywgY2hpbGQsIGksIGluZGV4LCBsZW4sIGxvd2VyLCBsb3dlc3QsIHJlZiwgcmVmMSwgdGFyZ2V0LCB2YWw7XG4gICAgbG93ZXN0ID0gbnVsbDtcbiAgICByZWYgPSB0aGlzLnRhcmdldC5jaGlsZE5vZGVzO1xuICAgIGZvciAoaW5kZXggPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaW5kZXggPSArK2kpIHtcbiAgICAgIGNoaWxkID0gcmVmW2luZGV4XTtcbiAgICAgIHJlZjEgPSB0aGlzLmRpc3RhbmNlKHtcbiAgICAgICAgdG9wOiBjaGlsZC5vZmZzZXRUb3AsXG4gICAgICAgIGJvdHRvbTogY2hpbGQub2Zmc2V0VG9wICsgY2hpbGQuY2xpZW50SGVpZ2h0XG4gICAgICB9KSwgdmFsID0gcmVmMVswXSwgbG93ZXIgPSByZWYxWzFdO1xuICAgICAgaWYgKCFsb3dlc3QgfHwgdmFsIDwgbG93ZXN0KSB7XG4gICAgICAgIGxvd2VzdCA9IHZhbDtcbiAgICAgICAgdGFyZ2V0ID0gY2hpbGQ7XG4gICAgICAgIGJlbG93ID0gbG93ZXI7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnRhcmdldC5jaGlsZE5vZGVzW3RoaXMudGFyZ2V0LmNoaWxkTm9kZXMubGVuZ3RoIC0gMV0gPT09IHRhcmdldCAmJiBiZWxvdykge1xuICAgICAgdGFyZ2V0ID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW5zZXJ0KHRoaXMudGFyZ2V0LCB0aGlzLm5vZGUsIHRhcmdldCk7XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUuZGlzdGFuY2UgPSBmdW5jdGlvbihwb3MpIHtcbiAgICB2YXIgYmVsb3csIGJvdHRvbSwgdmFsLCB5O1xuICAgIGJlbG93ID0gZmFsc2U7XG4gICAgeSA9IHRoaXMuZS5vZmZzZXRZO1xuICAgIHZhbCA9IE1hdGguYWJzKHkgLSBwb3MudG9wKTtcbiAgICBpZiAodmFsID4gKGJvdHRvbSA9IE1hdGguYWJzKHkgLSBwb3MuYm90dG9tKSkpIHtcbiAgICAgIHZhbCA9IGJvdHRvbTtcbiAgICB9XG4gICAgcmV0dXJuIFt2YWwsIHkgPiBwb3MuYm90dG9tXTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1pcnJvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgdGhpcy5taXJyb3IudGFiSW5kZXggPSAwO1xuICAgIHJldHVybiB0aGlzLm1pcnJvci5jbGFzc05hbWUgPSBcImRyYWdpZnktLW1pcnJvclwiO1xuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjbG9uZTtcbiAgICB0aGlzLnByZXZpb3VzLnZhbGlkID0gdGhpcy5ub2RlLnBhcmVudE5vZGU7XG4gICAgdGhpcy5kcmFnaWZ5LmVtaXRJZihcImRyYWdcIiwgdGhpcy5ub2RlLCB0aGlzLm5vZGUucGFyZW50Tm9kZSk7XG4gICAgdGhpcy5taXJyb3IuYXBwZW5kQ2hpbGQoY2xvbmUgPSB0aGlzLm5vZGUuY2xvbmVOb2RlKHRydWUpKTtcbiAgICBjbG9uZS5zdHlsZS53aWR0aCA9IHRoaXMubm9kZS5vZmZzZXRXaWR0aCArIFwicHhcIjtcbiAgICBjbG9uZS5zdHlsZS5oZWlnaHQgPSB0aGlzLm5vZGUub2Zmc2V0SGVpZ2h0ICsgXCJweFwiO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5taXJyb3IpO1xuICAgIHRoaXMubWlycm9yLmZvY3VzKCk7XG4gICAgdGhpcy5hZGRDbGFzcyhkb2N1bWVudC5ib2R5LCBcImRyYWdpZnktLWJvZHlcIik7XG4gICAgaWYgKHRoaXMuZHJhZ2lmeS5vcHRpb25zLnRyYW5zaXRpb24pIHtcbiAgICAgIHRoaXMuYWRkQ2xhc3ModGhpcy5ub2RlLCBcImRyYWdpZnktLXRyYW5zaXRpb25cIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFkZENsYXNzKHRoaXMubm9kZSwgXCJkcmFnaWZ5LS1vcGFxdWVcIik7XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVtb3ZlO1xuICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgd2hpbGUgKHRoaXMubWlycm9yLmZpcnN0Q2hpbGQpIHtcbiAgICAgIHRoaXMubWlycm9yLnJlbW92ZUNoaWxkKHRoaXMubWlycm9yLmZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRoaXMubWlycm9yKTtcbiAgICB0aGlzLm1pcnJvci5yZW1vdmVBdHRyaWJ1dGUoXCJzdHlsZVwiKTtcbiAgICB0aGlzLnJlbW92ZUNsYXNzKGRvY3VtZW50LmJvZHksIFwiZHJhZ2lmeS0tYm9keVwiKTtcbiAgICB0aGlzLnJlbW92ZUNsYXNzKHRoaXMubm9kZSwgXCJkcmFnaWZ5LS1vcGFxdWVcIik7XG4gICAgcmVtb3ZlID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMucmVtb3ZlQ2xhc3Mobm9kZSwgXCJkcmFnaWZ5LS10cmFuc2l0aW9uXCIpO1xuICAgICAgICB9LCA1MDApO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKTtcbiAgICBpZiAodGhpcy5kcmFnaWZ5Lm9wdGlvbnMudHJhbnNpdGlvbikge1xuICAgICAgcmVtb3ZlKHRoaXMubm9kZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmRhdGEuc291cmNlID09PSB0aGlzLm5vZGUucGFyZW50Tm9kZSAmJiB0aGlzLmRhdGEuaW5kZXggPT09IHRoaXMuZ2V0SW5kZXgodGhpcy5ub2RlKSkge1xuICAgICAgdGhpcy5kcmFnaWZ5LmVtaXRJZihcImNhbmNlbFwiLCB0aGlzLm5vZGUsIHRoaXMubm9kZS5wYXJlbnROb2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kcmFnaWZ5LmVtaXRJZihcImRyb3BcIiwgdGhpcy5ub2RlLCB0aGlzLm5vZGUucGFyZW50Tm9kZSwgdGhpcy5kYXRhLnNvdXJjZSk7XG4gICAgfVxuICAgIHRoaXMuZHJhZ2lmeS5lbWl0SWYoXCJlbmRcIiwgdGhpcy5ub2RlKTtcbiAgICB0aGlzLm5vZGUgPSBudWxsO1xuICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcbiAgICByZXR1cm4gdGhpcy5zZXREYXRhKCk7XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUuYWRkQ2xhc3MgPSBmdW5jdGlvbihub2RlLCBjbGFzc05hbWUpIHtcbiAgICB2YXIgY2xhc3NlcztcbiAgICBjbGFzc2VzID0gW107XG4gICAgaWYgKG5vZGUuY2xhc3NOYW1lKSB7XG4gICAgICBjbGFzc2VzID0gbm9kZS5jbGFzc05hbWUuc3BsaXQoXCIgXCIpO1xuICAgIH1cbiAgICBjbGFzc2VzLnB1c2goY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gbm9kZS5jbGFzc05hbWUgPSBjbGFzc2VzLmpvaW4oXCIgXCIpO1xuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24obm9kZSwgY2xhc3NOYW1lKSB7XG4gICAgdmFyIGNsYXNzZXM7XG4gICAgY2xhc3NlcyA9IG5vZGUuY2xhc3NOYW1lLnNwbGl0KFwiIFwiKTtcbiAgICBjbGFzc2VzLnNwbGljZShjbGFzc2VzLmluZGV4T2YoY2xhc3NOYW1lKSwgMSk7XG4gICAgaWYgKGNsYXNzZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbm9kZS5yZW1vdmVBdHRyaWJ1dGUoXCJjbGFzc1wiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5vZGUuY2xhc3NOYW1lID0gY2xhc3Nlcy5qb2luKFwiIFwiKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIEhhbmRsZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlcjtcbiIsInZhciBNaW5pRXZlbnRFbWl0dGVyLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxuTWluaUV2ZW50RW1pdHRlciA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gTWluaUV2ZW50RW1pdHRlcihtaW5pLCBvYmopIHtcbiAgICB0aGlzLm1pbmkgPSBtaW5pO1xuICAgIHRoaXMucmVtb3ZlRm4gPSBiaW5kKHRoaXMucmVtb3ZlRm4sIHRoaXMpO1xuICAgIHRoaXMucmVtb3ZlRm5zID0gYmluZCh0aGlzLnJlbW92ZUZucywgdGhpcyk7XG4gICAgdGhpcy5lbWl0ID0gYmluZCh0aGlzLmVtaXQsIHRoaXMpO1xuICAgIHRoaXMuZW1pdElmID0gYmluZCh0aGlzLmVtaXRJZiwgdGhpcyk7XG4gICAgdGhpcy5vZmYgPSBiaW5kKHRoaXMub2ZmLCB0aGlzKTtcbiAgICB0aGlzLm9uID0gYmluZCh0aGlzLm9uLCB0aGlzKTtcbiAgICB0aGlzLm1pbmkuc2V0dGluZ3MgPSB7XG4gICAgICBuYW1lOiAob2JqICE9IG51bGwgPyBvYmoubmFtZSA6IHZvaWQgMCkgfHwgXCJNaW5pRXZlbnRFbWl0dGVyXCIsXG4gICAgICBlcnJvcjogKG9iaiAhPSBudWxsID8gb2JqLmVycm9yIDogdm9pZCAwKSB8fCBmYWxzZSxcbiAgICAgIHRyYWNlOiAob2JqICE9IG51bGwgPyBvYmoudHJhY2UgOiB2b2lkIDApIHx8IGZhbHNlXG4gICAgfTtcbiAgICB0aGlzLm1pbmkuZXZlbnRzID0ge307XG4gICAgdGhpcy5taW5pLmdyb3VwcyA9IHt9O1xuICB9XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudCwgZ3JvdXAsIGZuKSB7XG4gICAgdmFyIGV2ZW50cywgZ3JvdXBzLCByZWY7XG4gICAgcmVmID0gdGhpcy5vcHRpb25hbChncm91cCwgZm4pLCBncm91cCA9IHJlZlswXSwgZm4gPSByZWZbMV07XG4gICAgaWYgKCF0aGlzLnZhbGlkKFwib25cIiwgZXZlbnQsIGdyb3VwLCBmbikpIHtcbiAgICAgIHJldHVybiB0aGlzLm1pbmk7XG4gICAgfVxuICAgIGlmICgoZ3JvdXBzID0gdGhpcy5taW5pLmdyb3VwcylbZ3JvdXBdKSB7XG4gICAgICBpZiAoZ3JvdXBzW2dyb3VwXVtldmVudF0pIHtcbiAgICAgICAgZ3JvdXBzW2dyb3VwXVtldmVudF0ucHVzaChmbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBncm91cHNbZ3JvdXBdW2V2ZW50XSA9IFtmbl07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGdyb3Vwc1tncm91cF0gPSB7fTtcbiAgICAgIGdyb3Vwc1tncm91cF1bZXZlbnRdID0gW2ZuXTtcbiAgICB9XG4gICAgaWYgKChldmVudHMgPSB0aGlzLm1pbmkuZXZlbnRzKVtldmVudF0pIHtcbiAgICAgIGV2ZW50c1tldmVudF0ucHVzaChmbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2ZW50c1tldmVudF0gPSBbZm5dO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5taW5pO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKGV2ZW50LCBncm91cCwgZm4pIHtcbiAgICB2YXIgZm5zLCBpbmRleCwgcmVmO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW1vdmVBbGwoKTtcbiAgICB9XG4gICAgcmVmID0gdGhpcy5vcHRpb25hbChncm91cCwgZm4pLCBncm91cCA9IHJlZlswXSwgZm4gPSByZWZbMV07XG4gICAgaWYgKCF0aGlzLnZhbGlkKFwib2ZmXCIsIGV2ZW50LCBncm91cCwgZm4pKSB7XG4gICAgICByZXR1cm4gdGhpcy5taW5pO1xuICAgIH1cbiAgICBpZiAoIXRoaXMubWluaS5ncm91cHNbZ3JvdXBdKSB7XG4gICAgICB0aGlzLmVycm9yKFwib2ZmXCIsIDcsIGV2ZW50LCBncm91cCk7XG4gICAgICByZXR1cm4gdGhpcy5taW5pO1xuICAgIH1cbiAgICBpZiAoIWV2ZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW1vdmVHcm91cChncm91cCk7XG4gICAgfVxuICAgIGlmICghKGZucyA9IHRoaXMubWluaS5ncm91cHNbZ3JvdXBdW2V2ZW50XSkpIHtcbiAgICAgIHRoaXMuZXJyb3IoXCJvZmZcIiwgOCwgZXZlbnQsIGdyb3VwKTtcbiAgICAgIHJldHVybiB0aGlzLm1pbmk7XG4gICAgfVxuICAgIGlmICghZm4pIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbW92ZUZucyhldmVudCwgZ3JvdXAsIGZucyk7XG4gICAgfVxuICAgIGlmICgtMSA9PT0gKGluZGV4ID0gZm5zLmluZGV4T2YoZm4pKSkge1xuICAgICAgdGhpcy5lcnJvcihcIm9mZlwiLCAyLCBldmVudCwgZ3JvdXApO1xuICAgICAgcmV0dXJuIHRoaXMubWluaTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVGbihldmVudCwgZ3JvdXAsIGZucywgZm4sIGluZGV4KTtcbiAgICByZXR1cm4gdGhpcy5taW5pO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRJZiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9lbWl0KGFyZ3VtZW50cywgdHJ1ZSk7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9lbWl0KGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2VtaXQgPSBmdW5jdGlvbihhcmdzLCBza2lwKSB7XG4gICAgdmFyIGV2ZW50LCBmbiwgZm5zLCBpLCBsZW47XG4gICAgYXJncyA9IEFycmF5LmZyb20oYXJncyk7XG4gICAgZXZlbnQgPSBhcmdzLnNoaWZ0KCk7XG4gICAgaWYgKCEoZm5zID0gdGhpcy52YWxpZEV2ZW50KGV2ZW50LCBza2lwKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLm1pbmk7XG4gICAgfVxuICAgIHRoaXMudHJhY2UoZXZlbnQsIGFyZ3MpO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IGZucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgZm4gPSBmbnNbaV07XG4gICAgICBmbi5hcHBseShmbiwgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1pbmk7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUudmFsaWQgPSBmdW5jdGlvbihuYW1lLCBldmVudCwgZ3JvdXAsIGZuKSB7XG4gICAgaWYgKG5hbWUgPT09IFwib25cIikge1xuICAgICAgaWYgKCF0aGlzLmlzU3RyaW5nKGV2ZW50KSkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvcihuYW1lLCAxKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5pc1N0cmluZyhncm91cCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IobmFtZSwgNSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaXNGdW5jdGlvbihmbikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IobmFtZSwgNiwgZXZlbnQsIGdyb3VwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5hbWUgPT09IFwib2ZmXCIpIHtcbiAgICAgIGlmIChldmVudCAhPT0gbnVsbCAmJiAhdGhpcy5pc1N0cmluZyhldmVudCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IobmFtZSwgMSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaXNTdHJpbmcoZ3JvdXApKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yKG5hbWUsIDUpO1xuICAgICAgfVxuICAgICAgaWYgKGZuICYmICF0aGlzLmlzRnVuY3Rpb24oZm4pKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yKG5hbWUsIDYsIGV2ZW50LCBncm91cCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLnZhbGlkRXZlbnQgPSBmdW5jdGlvbihldmVudCwgc2tpcCkge1xuICAgIHZhciBmbnM7XG4gICAgaWYgKCFldmVudCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXJyb3IoXCJlbWl0XCIsIDMpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNTdHJpbmcoZXZlbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lcnJvcihcImVtaXRcIiwgMSk7XG4gICAgfVxuICAgIGlmICghKGZucyA9IHRoaXMubWluaS5ldmVudHNbZXZlbnRdKSkge1xuICAgICAgaWYgKCFza2lwKSB7XG4gICAgICAgIHRoaXMuZXJyb3IoXCJlbWl0XCIsIDQsIGV2ZW50KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gZm5zO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24obmFtZSwgaWQsIGV2ZW50LCBncm91cCkge1xuICAgIHZhciBtc2c7XG4gICAgaWYgKCF0aGlzLm1pbmkuc2V0dGluZ3MuZXJyb3IpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBtc2cgPSB0aGlzLm1pbmkuc2V0dGluZ3MubmFtZSArIFwiIH4gXCIgKyBuYW1lICsgXCIgfiBcIjtcbiAgICBpZiAoaWQgPT09IDEpIHtcbiAgICAgIG1zZyArPSBcIkV2ZW50IG5hbWUgbXVzdCBiZSBhIHN0cmluZ1wiO1xuICAgIH1cbiAgICBpZiAoaWQgPT09IDIpIHtcbiAgICAgIG1zZyArPSBcIlByb3ZpZGVkIGZ1bmN0aW9uIHRvIHJlbW92ZSB3aXRoIGV2ZW50IFxcXCJcIiArIGV2ZW50ICsgXCJcXFwiIGluIGdyb3VwIFxcXCJcIiArIGdyb3VwICsgXCJcXFwiIGlzIG5vdCBmb3VuZFwiO1xuICAgIH1cbiAgICBpZiAoaWQgPT09IDMpIHtcbiAgICAgIG1zZyArPSBcIkV2ZW50IHdhcyBub3QgcHJvdmlkZWRcIjtcbiAgICB9XG4gICAgaWYgKGlkID09PSA0KSB7XG4gICAgICBtc2cgKz0gXCJFdmVudExpc3RlbmVyIGZvciBldmVudCBcXFwiXCIgKyBldmVudCArIFwiXFxcIiBkb2VzIG5vdCBleGlzdFwiO1xuICAgIH1cbiAgICBpZiAoaWQgPT09IDUpIHtcbiAgICAgIG1zZyArPSBcIlByb3ZpZGVkIGdyb3VwIG11c3QgYmUgYSBzdHJpbmdcIjtcbiAgICB9XG4gICAgaWYgKGlkID09PSA2KSB7XG4gICAgICBtc2cgKz0gXCJUaGUgbGFzdCBwYXJhbSBwcm92aWRlZCB3aXRoIGV2ZW50IFxcXCJcIiArIGV2ZW50ICsgXCJcXFwiIGFuZCBncm91cCBcXFwiXCIgKyBncm91cCArIFwiXFxcIiBpcyBleHBlY3RlZCB0byBiZSBhIGZ1bmN0aW9uXCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gNykge1xuICAgICAgbXNnICs9IFwiUHJvdmlkZWQgZ3JvdXAgXFxcIlwiICsgZ3JvdXAgKyBcIlxcXCIgaXMgbm90IGZvdW5kXCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gOCkge1xuICAgICAgbXNnICs9IFwiRXZlbnQgXFxcIlwiICsgZXZlbnQgKyBcIlxcXCIgZG9lcyBub3QgZXhpc3QgZm9yIHRoZSBwcm92aWRlZCBncm91cCBcXFwiXCIgKyBncm91cCArIFwiXFxcIlwiO1xuICAgIH1cbiAgICBpZiAoY29uc29sZSkge1xuICAgICAgaWYgKGNvbnNvbGUud2Fybikge1xuICAgICAgICBjb25zb2xlLndhcm4obXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9wdGlvbmFsID0gZnVuY3Rpb24oZ3JvdXAsIGZuKSB7XG4gICAgaWYgKChmbiA9PSBudWxsKSAmJiB0aGlzLmlzRnVuY3Rpb24oZ3JvdXApKSB7XG4gICAgICBmbiA9IGdyb3VwO1xuICAgICAgZ3JvdXAgPSBcIlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWdyb3VwKSB7XG4gICAgICAgIGdyb3VwID0gXCJcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFtncm91cCwgZm5dO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWluaS5ldmVudHMgPSB7fTtcbiAgICB0aGlzLm1pbmkuZ3JvdXBzID0ge307XG4gICAgcmV0dXJuIHRoaXMubWluaTtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVHcm91cCA9IGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgdmFyIGV2ZW50LCBmbnMsIHJlZjtcbiAgICByZWYgPSB0aGlzLm1pbmkuZ3JvdXBzW2dyb3VwXTtcbiAgICBmb3IgKGV2ZW50IGluIHJlZikge1xuICAgICAgZm5zID0gcmVmW2V2ZW50XTtcbiAgICAgIHRoaXMucmVtb3ZlRm5zKGV2ZW50LCBncm91cCwgZm5zKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubWluaTtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVGbnMgPSBmdW5jdGlvbihldmVudCwgZ3JvdXAsIGZucykge1xuICAgIHZhciBmbiwgaTtcbiAgICBmb3IgKGkgPSBmbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpICs9IC0xKSB7XG4gICAgICBmbiA9IGZuc1tpXTtcbiAgICAgIHRoaXMucmVtb3ZlRm4oZXZlbnQsIGdyb3VwLCBmbnMsIGZuKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubWluaTtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVGbiA9IGZ1bmN0aW9uKGV2ZW50LCBncm91cCwgZm5zLCBmbiwgaW5kZXgpIHtcbiAgICBpZiAoIWluZGV4KSB7XG4gICAgICBpbmRleCA9IGZucy5pbmRleE9mKGZuKTtcbiAgICB9XG4gICAgZm5zLnNwbGljZShpbmRleCwgMSk7XG4gICAgaWYgKGZucy5sZW5ndGggPT09IDApIHtcbiAgICAgIGRlbGV0ZSB0aGlzLm1pbmkuZ3JvdXBzW2dyb3VwXVtldmVudF07XG4gICAgfVxuICAgIGlmICgwID09PSB0aGlzLm9iakxlbmd0aCh0aGlzLm1pbmkuZ3JvdXBzW2dyb3VwXSkpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLm1pbmkuZ3JvdXBzW2dyb3VwXTtcbiAgICB9XG4gICAgaW5kZXggPSB0aGlzLm1pbmkuZXZlbnRzW2V2ZW50XS5pbmRleE9mKGZuKTtcbiAgICB0aGlzLm1pbmkuZXZlbnRzW2V2ZW50XS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGlmICh0aGlzLm1pbmkuZXZlbnRzW2V2ZW50XS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBkZWxldGUgdGhpcy5taW5pLmV2ZW50c1tldmVudF07XG4gICAgfVxuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLnRyYWNlID0gZnVuY3Rpb24oZXZlbnQsIGFyZ3MpIHtcbiAgICB2YXIgbXNnO1xuICAgIGlmICh0aGlzLm1pbmkuc2V0dGluZ3MudHJhY2UpIHtcbiAgICAgIG1zZyA9IHRoaXMubWluaS5zZXR0aW5ncy5uYW1lICsgXCIgfiB0cmFjZSB+IFwiICsgZXZlbnQ7XG4gICAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgaWYgKGNvbnNvbGUuZGVidWcpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2coXCIlYyBcIiArIG1zZywgXCJjb2xvcjogIzEzZFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2cobXNnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGNvbnNvbGUuZGVidWcpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2coXCIlYyBcIiArIG1zZywgXCJjb2xvcjogIzEzZFwiLCBhcmdzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2cobXNnLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5pc1N0cmluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBldmVudCA9PT0gXCJzdHJpbmdcIiB8fCBldmVudCBpbnN0YW5jZW9mIFN0cmluZztcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vYmpMZW5ndGggPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBmbiA9PT0gXCJmdW5jdGlvblwiO1xuICB9O1xuXG4gIHJldHVybiBNaW5pRXZlbnRFbWl0dGVyO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1pbmlFdmVudEVtaXR0ZXI7XG4iLCJ2YXIgSGFuZGxlciwgTWluaUV2ZW50RW1pdHRlcjtcblxuSGFuZGxlciA9IHJlcXVpcmUoXCIuL2hhbmRsZXJcIik7XG5cbk1pbmlFdmVudEVtaXR0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIE1pbmlFdmVudEVtaXR0ZXIob2JqKSB7XG4gICAgdmFyIGhhbmRsZXI7XG4gICAgaGFuZGxlciA9IG5ldyBIYW5kbGVyKHRoaXMsIG9iaik7XG4gICAgdGhpcy5vbiA9IGhhbmRsZXIub247XG4gICAgdGhpcy5vZmYgPSBoYW5kbGVyLm9mZjtcbiAgICB0aGlzLmVtaXQgPSBoYW5kbGVyLmVtaXQ7XG4gICAgdGhpcy5lbWl0SWYgPSBoYW5kbGVyLmVtaXRJZjtcbiAgICB0aGlzLnRyaWdnZXIgPSBoYW5kbGVyLmVtaXQ7XG4gICAgdGhpcy50cmlnZ2VySWYgPSBoYW5kbGVyLmVtaXRJZjtcbiAgfVxuXG4gIHJldHVybiBNaW5pRXZlbnRFbWl0dGVyO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1pbmlFdmVudEVtaXR0ZXI7XG4iXX0=
