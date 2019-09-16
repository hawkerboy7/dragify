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
    if (ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA" || ev.target.tagName === "LABEL") {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9hcHAuanMiLCJidWlsZC9qcy9lcnJvci5qcyIsImJ1aWxkL2pzL2hhbmRsZXIuanMiLCJub2RlX21vZHVsZXMvbWluaS1ldmVudC1lbWl0dGVyL2J1aWxkL2hhbmRsZXIuanMiLCJub2RlX21vZHVsZXMvbWluaS1ldmVudC1lbWl0dGVyL2J1aWxkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBEcmFnaWZ5LCBIYW5kbGVyLCBNaW5pRXZlbnRFbWl0dGVyLFxuICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuTWluaUV2ZW50RW1pdHRlciA9IHJlcXVpcmUoXCJtaW5pLWV2ZW50LWVtaXR0ZXJcIik7XG5cbkhhbmRsZXIgPSByZXF1aXJlKFwiLi9oYW5kbGVyXCIpO1xuXG5EcmFnaWZ5ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKERyYWdpZnksIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIERyYWdpZnkoY29udGFpbmVycywgb3B0aW9ucykge1xuICAgIHZhciBtc2csIHJlZiwgcmVmMSwgeCwgeTtcbiAgICB0aGlzLmNvbnRhaW5lcnMgPSBjb250YWluZXJzO1xuICAgIERyYWdpZnkuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBpZiAoISF0aGlzLmNvbnRhaW5lcnMgJiYgdGhpcy5jb250YWluZXJzLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMuY29udGFpbmVycztcbiAgICAgICAgdGhpcy5jb250YWluZXJzID0gW107XG4gICAgICB9IGVsc2UgaWYgKCEhdGhpcy5jb250YWluZXJzICYmIHRoaXMuY29udGFpbmVycy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJzID0gW107XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLmNvbnRhaW5lcnMgfHwgdGhpcy5jb250YWluZXJzLmNvbnN0cnVjdG9yICE9PSBBcnJheSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lcnMgPSBbXTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLmNvbnRhaW5lcnMpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXJzID0gdGhpcy5jb250YWluZXJzLmNvbmNhdChvcHRpb25zLmNvbnRhaW5lcnMpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5jb250YWluZXJzLmxlbmd0aCA9PT0gMCAmJiAob3B0aW9ucy5pc0NvbnRhaW5lciA9PSBudWxsKSkge1xuICAgICAgbXNnID0gXCJEcmFnaWZ5IH4gWW91IHByb3ZpZGVkIG5laXRoZXIgdGhlIGBjb250YWluZXJzYCBhcnJheSBub3IgdGhlICdpc0NvbnRhaW5lcmAgZnVuY3Rpb24uIEF0IGxlYXN0IG9uZSBpcyByZXF1aXJlZC5cIjtcbiAgICAgIGlmIChjb25zb2xlLndhcm4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICB0aHJlc2hvbGQ6IHtcbiAgICAgICAgeDogMyxcbiAgICAgICAgeTogM1xuICAgICAgfSxcbiAgICAgIHRyYW5zaXRpb246IHRydWUsXG4gICAgICBpc0NvbnRhaW5lcjogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH07XG4gICAgaWYgKG9wdGlvbnMudHJhbnNpdGlvbiAhPSBudWxsKSB7XG4gICAgICB0aGlzLm9wdGlvbnMudHJhbnNpdGlvbiA9IG9wdGlvbnMudHJhbnNpdGlvbjtcbiAgICB9XG4gICAgaWYgKCh4ID0gKHJlZiA9IG9wdGlvbnMudGhyZXNob2xkKSAhPSBudWxsID8gcmVmLnggOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgIHRoaXMub3B0aW9ucy50aHJlc2hvbGQueCA9IHg7XG4gICAgfVxuICAgIGlmICgoeSA9IChyZWYxID0gb3B0aW9ucy50aHJlc2hvbGQpICE9IG51bGwgPyByZWYxLnkgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgIHRoaXMub3B0aW9ucy50aHJlc2hvbGQueSA9IHk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmlzQ29udGFpbmVyICE9IG51bGwpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5pc0NvbnRhaW5lciA9IG9wdGlvbnMuaXNDb250YWluZXI7XG4gICAgfVxuICAgIG5ldyBIYW5kbGVyKHRoaXMpO1xuICB9XG5cbiAgcmV0dXJuIERyYWdpZnk7XG5cbn0pKE1pbmlFdmVudEVtaXR0ZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdpZnk7XG4iLCJ2YXIgRXJyb3I7XG5cbkVycm9yID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBFcnJvcihkcmFnaWZ5KSB7XG4gICAgdmFyIHJlZjtcbiAgICB0aGlzLmRyYWdpZnkgPSBkcmFnaWZ5O1xuICAgIHRoaXMuYmxvY2sgPSAhKChyZWYgPSB0aGlzLmRyYWdpZnkub3B0aW9ucykgIT0gbnVsbCA/IHJlZi5lcnJvciA6IHZvaWQgMCk7XG4gIH1cblxuICBFcnJvci5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbihpZCkge1xuICAgIHZhciBtc2c7XG4gICAgaWYgKHRoaXMuYmxvY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbXNnID0gXCJEcmFnaWZ5IH4gXCI7XG4gICAgaWYgKGlkID09PSAxLjEpIHtcbiAgICAgIG1zZyArPSBcIkZpcnN0IGFyZ3VtZW50ICdDb250YWluZXJzJyBtdXN0IGJlIGFuIGFycmF5XCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gMS4yKSB7XG4gICAgICBtc2cgKz0gXCInaXNDb250YWluZXInIG11c3QgYmUgYSBmdW5jdGlvblwiO1xuICAgIH1cbiAgICBpZiAoaWQgPT09IDIuMSkge1xuICAgICAgbXNnICs9IFwiRHJhZ2lmeSB3YXMgdW5hYmxlIHRvIGZpbmQgdGhlIGNvcnJlY3Qgb2Zmc2V0LCBwbGVhc2UgcmVwb3J0IGFuIGlzc3VlIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9oYXdrZXJib3k3L2RyYWdpZnkvaXNzdWVzL25ldy4gUGxlYXNlIHByb3ZpZGUgYW4gZXhhbXBsZSBpbiB3aGljaCB0aGlzIGVycm9yIG9jY3Vyc1wiO1xuICAgIH1cbiAgICBpZiAoY29uc29sZS53YXJuKSB7XG4gICAgICByZXR1cm4gY29uc29sZS53YXJuKG1zZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhtc2cpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gRXJyb3I7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gRXJyb3I7XG4iLCJ2YXIgRXJyb3IsIEhhbmRsZXIsXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG5FcnJvciA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xuXG5IYW5kbGVyID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBIYW5kbGVyKGRyYWdpZnkpIHtcbiAgICB0aGlzLmRyYWdpZnkgPSBkcmFnaWZ5O1xuICAgIHRoaXMubW91c2Vtb3ZlID0gYmluZCh0aGlzLm1vdXNlbW92ZSwgdGhpcyk7XG4gICAgdGhpcy5tb3VzZWRvd24gPSBiaW5kKHRoaXMubW91c2Vkb3duLCB0aGlzKTtcbiAgICB0aGlzLm1vdXNldXAgPSBiaW5kKHRoaXMubW91c2V1cCwgdGhpcyk7XG4gICAgdGhpcy5sb2FkKCk7XG4gICAgdGhpcy5zZXR1cCgpO1xuICAgIHRoaXMubGlzdGVuZXJzKCk7XG4gIH1cblxuICBIYW5kbGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZXJyb3IgPSAobmV3IEVycm9yKHtcbiAgICAgIGRyYWdpZnk6IHRoaXMuZHJhZ2lmeVxuICAgIH0pKS5lcnJvcjtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZHJhZ2lmeS5zZXR0aW5ncy5uYW1lID0gXCJEcmFnaWZ5XCI7XG4gICAgaWYgKCF0aGlzLmRyYWdpZnkuY29udGFpbmVycykge1xuICAgICAgdGhpcy5kcmFnaWZ5LmNvbnRhaW5lcnMgPSBbXTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZHJhZ2lmeS5jb250YWluZXJzLmNvbnN0cnVjdG9yICE9PSBBcnJheSkge1xuICAgICAgcmV0dXJuIHRoaXMuZXJyb3IoMS4xKTtcbiAgICB9XG4gICAgaWYgKCF0eXBlb2YgdGhpcy5kcmFnaWZ5Lm9wdGlvbnMuaXNDb250YWluZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIHRoaXMuZXJyb3IoMS4yKTtcbiAgICB9XG4gICAgdGhpcy5zZXREYXRhKCk7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlKCk7XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUuc2V0RGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZGF0YSA9IHtcbiAgICAgIGluZGV4OiBudWxsLFxuICAgICAgc3RhcnQ6IHt9LFxuICAgICAgb2Zmc2V0OiB7fSxcbiAgICAgIHNvdXJjZTogbnVsbCxcbiAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgIHRyZXNoaG9sZDoge31cbiAgICB9O1xuICAgIHJldHVybiB0aGlzLnByZXZpb3VzID0ge307XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cCk7XG4gICAgcmV0dXJuIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duKTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5tb3VzZXVwID0gZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLmJ1dHRvbiAhPT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZSk7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXNldCgpO1xuICAgIH1cbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5tb3VzZWRvd24gPSBmdW5jdGlvbihldikge1xuICAgIHZhciBjaGVjaywgZm91bmQsIHgsIHk7XG4gICAgaWYgKGV2LmJ1dHRvbiAhPT0gMCB8fCB0aGlzLmFjdGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXYudGFyZ2V0LnRhZ05hbWUgPT09IFwiSU5QVVRcIiB8fCBldi50YXJnZXQudGFnTmFtZSA9PT0gXCJURVhUQVJFQVwiIHx8IGV2LnRhcmdldC50YWdOYW1lID09PSBcIkxBQkVMXCIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCEodGhpcy5ub2RlID0gdGhpcy52YWxpZE1vdXNlZG93bihldi50YXJnZXQpKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmRhdGEuc291cmNlID0gdGhpcy5ub2RlLnBhcmVudE5vZGU7XG4gICAgdGhpcy5kYXRhLmluZGV4ID0gdGhpcy5nZXRJbmRleCh0aGlzLm5vZGUpO1xuICAgIHRoaXMuZGF0YS5zdGFydC54ID0gZXYuY2xpZW50WDtcbiAgICB0aGlzLmRhdGEuc3RhcnQueSA9IGV2LmNsaWVudFk7XG4gICAgeCA9IGV2Lm9mZnNldFg7XG4gICAgeSA9IGV2Lm9mZnNldFk7XG4gICAgZm91bmQgPSBmYWxzZTtcbiAgICBjaGVjayA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICBpZiAodGFyZ2V0ID09PSBfdGhpcy5ub2RlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHggKz0gdGFyZ2V0Lm9mZnNldExlZnQ7XG4gICAgICAgIHkgKz0gdGFyZ2V0Lm9mZnNldFRvcDtcbiAgICAgICAgaWYgKHRhcmdldC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgcmV0dXJuIGNoZWNrKHRhcmdldC5wYXJlbnROb2RlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkodGhpcyk7XG4gICAgaWYgKGNoZWNrKGV2LnRhcmdldCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVycm9yKDIuMSk7XG4gICAgfVxuICAgIHRoaXMuZGF0YS5vZmZzZXQgPSB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeVxuICAgIH07XG4gICAgcmV0dXJuIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlKTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS52YWxpZE1vdXNlZG93biA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHZhciBjaGVjaywgdmFsaWRhdGU7XG4gICAgY2hlY2sgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgICB2YXIgZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMudmFsaWRDb250YWluZXIoZWwpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGUgPSBlcnJvcjtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcyk7XG4gICAgdmFsaWRhdGUgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICBpZiAoY2hlY2sobm9kZS5wYXJlbnROb2RlKSkge1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlKG5vZGUucGFyZW50Tm9kZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICByZXR1cm4gdmFsaWRhdGUodGFyZ2V0KTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS52YWxpZENvbnRhaW5lciA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgaWYgKCFlbCB8fCBlbCA9PT0gZG9jdW1lbnQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZHJhZ2lmeS5jb250YWluZXJzLmluZGV4T2YoZWwpICE9PSAtMSB8fCB0aGlzLmRyYWdpZnkub3B0aW9ucy5pc0NvbnRhaW5lcihlbCk7XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUuZ2V0SW5kZXggPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdmFyIGNoaWxkLCBpLCBpbmRleCwgbGVuLCByZWY7XG4gICAgcmVmID0gbm9kZS5wYXJlbnROb2RlLmNoaWxkTm9kZXM7XG4gICAgZm9yIChpbmRleCA9IGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpbmRleCA9ICsraSkge1xuICAgICAgY2hpbGQgPSByZWZbaW5kZXhdO1xuICAgICAgaWYgKGNoaWxkID09PSBub2RlKSB7XG4gICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUubW91c2Vtb3ZlID0gZnVuY3Rpb24oZTEpIHtcbiAgICB0aGlzLmUgPSBlMTtcbiAgICB0aGlzLmUucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLmUuWCA9IHRoaXMuZS5jbGllbnRYO1xuICAgIHRoaXMuZS5ZID0gdGhpcy5lLmNsaWVudFk7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZSkge1xuICAgICAgaWYgKE1hdGguYWJzKHRoaXMuZS5YIC0gdGhpcy5kYXRhLnN0YXJ0LngpID4gdGhpcy5kcmFnaWZ5Lm9wdGlvbnMudGhyZXNob2xkLngpIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKE1hdGguYWJzKHRoaXMuZS5ZIC0gdGhpcy5kYXRhLnN0YXJ0LnkpID4gdGhpcy5kcmFnaWZ5Lm9wdGlvbnMudGhyZXNob2xkLnkpIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnNldCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uKCk7XG4gICAgfVxuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLnBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRhcmdldDtcbiAgICB0aGlzLm1pcnJvci5zdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZShcIiArICh0aGlzLmUuWCAtIHRoaXMuZGF0YS5vZmZzZXQueCkgKyBcInB4LFwiICsgKHRoaXMuZS5ZIC0gdGhpcy5kYXRhLm9mZnNldC55KSArIFwicHgpXCI7XG4gICAgdGFyZ2V0ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh0aGlzLmUuWCwgdGhpcy5lLlkpO1xuICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0ID09PSB0aGlzLnByZXZpb3VzLnRhcmdldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnByZXZpb3VzLnRhcmdldCA9IHRhcmdldDtcbiAgICBpZiAoISh0YXJnZXQgPSB0aGlzLnZhbGlkUGFyZW50KHRhcmdldCkpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0YXJnZXQgPT09IHRoaXMucHJldmlvdXMudmFsaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMubm9kZSA9PT0gdGFyZ2V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucHJldmlvdXMudmFsaWQgPSB0YXJnZXQ7XG4gICAgcmV0dXJuIHRoaXNbXCJzd2l0Y2hcIl0odGFyZ2V0KTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS52YWxpZFBhcmVudCA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHZhciBmaW5kLCB2YWxpZDtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YWxpZCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLnZhbGlkQ29udGFpbmVyKHRhcmdldCkpIHtcbiAgICAgIHZhbGlkID0gdGFyZ2V0O1xuICAgIH1cbiAgICBmaW5kID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgaWYgKF90aGlzLnZhbGlkQ29udGFpbmVyKGVsLnBhcmVudE5vZGUpKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbGlkID0gZWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGVsLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmaW5kKGVsLnBhcmVudE5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSh0aGlzKTtcbiAgICBpZiAoIXZhbGlkKSB7XG4gICAgICBmaW5kKHRhcmdldCk7XG4gICAgfVxuICAgIHJldHVybiB2YWxpZDtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZVtcInN3aXRjaFwiXSA9IGZ1bmN0aW9uKHRhcmdldDEpIHtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDE7XG4gICAgaWYgKHRoaXMudmFsaWRDb250YWluZXIodGhpcy50YXJnZXQpKSB7XG4gICAgICBpZiAodGhpcy5ub2RlLnBhcmVudE5vZGUgIT09IHRoaXMudGFyZ2V0KSB7XG4gICAgICAgIHRoaXMudHJhbnNmZXIoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMudGFyZ2V0LnBhcmVudE5vZGUgIT09IHRoaXMubm9kZS5wYXJlbnROb2RlIHx8ICh0aGlzLmdldEluZGV4KHRoaXMubm9kZSkpID4gKHRoaXMuZ2V0SW5kZXgodGhpcy50YXJnZXQpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5zZXJ0KHRoaXMudGFyZ2V0LnBhcmVudE5vZGUsIHRoaXMubm9kZSwgdGhpcy50YXJnZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnNlcnQodGhpcy50YXJnZXQucGFyZW50Tm9kZSwgdGhpcy5ub2RlLCB0aGlzLnRhcmdldC5uZXh0U2libGluZyk7XG4gICAgfVxuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uKHBhcmVudCwgbm9kZSwgdGFyZ2V0KSB7XG4gICAgdmFyIHJlcGxhY2VkO1xuICAgIHBhcmVudC5pbnNlcnRCZWZvcmUobm9kZSwgdGFyZ2V0KTtcbiAgICByZXBsYWNlZCA9IHRoaXMudGFyZ2V0ICE9PSBwYXJlbnQgPyB0aGlzLnRhcmdldCA6IHZvaWQgMDtcbiAgICByZXR1cm4gdGhpcy5kcmFnaWZ5LmVtaXRJZihcIm1vdmVcIiwgdGhpcy5ub2RlLCB0aGlzLm5vZGUucGFyZW50Tm9kZSwgdGhpcy5kYXRhLnNvdXJjZSwgcmVwbGFjZWQpO1xuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLnRyYW5zZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJlbG93LCBjaGlsZCwgaSwgaW5kZXgsIGxlbiwgbG93ZXIsIGxvd2VzdCwgcmVmLCByZWYxLCB0YXJnZXQsIHZhbDtcbiAgICBsb3dlc3QgPSBudWxsO1xuICAgIHJlZiA9IHRoaXMudGFyZ2V0LmNoaWxkTm9kZXM7XG4gICAgZm9yIChpbmRleCA9IGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpbmRleCA9ICsraSkge1xuICAgICAgY2hpbGQgPSByZWZbaW5kZXhdO1xuICAgICAgcmVmMSA9IHRoaXMuZGlzdGFuY2Uoe1xuICAgICAgICB0b3A6IGNoaWxkLm9mZnNldFRvcCxcbiAgICAgICAgYm90dG9tOiBjaGlsZC5vZmZzZXRUb3AgKyBjaGlsZC5jbGllbnRIZWlnaHRcbiAgICAgIH0pLCB2YWwgPSByZWYxWzBdLCBsb3dlciA9IHJlZjFbMV07XG4gICAgICBpZiAoIWxvd2VzdCB8fCB2YWwgPCBsb3dlc3QpIHtcbiAgICAgICAgbG93ZXN0ID0gdmFsO1xuICAgICAgICB0YXJnZXQgPSBjaGlsZDtcbiAgICAgICAgYmVsb3cgPSBsb3dlcjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMudGFyZ2V0LmNoaWxkTm9kZXNbdGhpcy50YXJnZXQuY2hpbGROb2Rlcy5sZW5ndGggLSAxXSA9PT0gdGFyZ2V0ICYmIGJlbG93KSB7XG4gICAgICB0YXJnZXQgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pbnNlcnQodGhpcy50YXJnZXQsIHRoaXMubm9kZSwgdGFyZ2V0KTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5kaXN0YW5jZSA9IGZ1bmN0aW9uKHBvcykge1xuICAgIHZhciBiZWxvdywgYm90dG9tLCB2YWwsIHk7XG4gICAgYmVsb3cgPSBmYWxzZTtcbiAgICB5ID0gdGhpcy5lLm9mZnNldFk7XG4gICAgdmFsID0gTWF0aC5hYnMoeSAtIHBvcy50b3ApO1xuICAgIGlmICh2YWwgPiAoYm90dG9tID0gTWF0aC5hYnMoeSAtIHBvcy5ib3R0b20pKSkge1xuICAgICAgdmFsID0gYm90dG9tO1xuICAgIH1cbiAgICByZXR1cm4gW3ZhbCwgeSA+IHBvcy5ib3R0b21dO1xuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWlycm9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICB0aGlzLm1pcnJvci50YWJJbmRleCA9IDA7XG4gICAgcmV0dXJuIHRoaXMubWlycm9yLmNsYXNzTmFtZSA9IFwiZHJhZ2lmeS0tbWlycm9yXCI7XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsb25lO1xuICAgIHRoaXMucHJldmlvdXMudmFsaWQgPSB0aGlzLm5vZGUucGFyZW50Tm9kZTtcbiAgICB0aGlzLmRyYWdpZnkuZW1pdElmKFwiZHJhZ1wiLCB0aGlzLm5vZGUsIHRoaXMubm9kZS5wYXJlbnROb2RlKTtcbiAgICB0aGlzLm1pcnJvci5hcHBlbmRDaGlsZChjbG9uZSA9IHRoaXMubm9kZS5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgIGNsb25lLnN0eWxlLndpZHRoID0gdGhpcy5ub2RlLm9mZnNldFdpZHRoICsgXCJweFwiO1xuICAgIGNsb25lLnN0eWxlLmhlaWdodCA9IHRoaXMubm9kZS5vZmZzZXRIZWlnaHQgKyBcInB4XCI7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLm1pcnJvcik7XG4gICAgdGhpcy5taXJyb3IuZm9jdXMoKTtcbiAgICB0aGlzLmFkZENsYXNzKGRvY3VtZW50LmJvZHksIFwiZHJhZ2lmeS0tYm9keVwiKTtcbiAgICBpZiAodGhpcy5kcmFnaWZ5Lm9wdGlvbnMudHJhbnNpdGlvbikge1xuICAgICAgdGhpcy5hZGRDbGFzcyh0aGlzLm5vZGUsIFwiZHJhZ2lmeS0tdHJhbnNpdGlvblwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYWRkQ2xhc3ModGhpcy5ub2RlLCBcImRyYWdpZnktLW9wYXF1ZVwiKTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZW1vdmU7XG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgICB3aGlsZSAodGhpcy5taXJyb3IuZmlyc3RDaGlsZCkge1xuICAgICAgdGhpcy5taXJyb3IucmVtb3ZlQ2hpbGQodGhpcy5taXJyb3IuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGhpcy5taXJyb3IpO1xuICAgIHRoaXMubWlycm9yLnJlbW92ZUF0dHJpYnV0ZShcInN0eWxlXCIpO1xuICAgIHRoaXMucmVtb3ZlQ2xhc3MoZG9jdW1lbnQuYm9keSwgXCJkcmFnaWZ5LS1ib2R5XCIpO1xuICAgIHRoaXMucmVtb3ZlQ2xhc3ModGhpcy5ub2RlLCBcImRyYWdpZnktLW9wYXF1ZVwiKTtcbiAgICByZW1vdmUgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5yZW1vdmVDbGFzcyhub2RlLCBcImRyYWdpZnktLXRyYW5zaXRpb25cIik7XG4gICAgICAgIH0sIDUwMCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpO1xuICAgIGlmICh0aGlzLmRyYWdpZnkub3B0aW9ucy50cmFuc2l0aW9uKSB7XG4gICAgICByZW1vdmUodGhpcy5ub2RlKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZGF0YS5zb3VyY2UgPT09IHRoaXMubm9kZS5wYXJlbnROb2RlICYmIHRoaXMuZGF0YS5pbmRleCA9PT0gdGhpcy5nZXRJbmRleCh0aGlzLm5vZGUpKSB7XG4gICAgICB0aGlzLmRyYWdpZnkuZW1pdElmKFwiY2FuY2VsXCIsIHRoaXMubm9kZSwgdGhpcy5ub2RlLnBhcmVudE5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRyYWdpZnkuZW1pdElmKFwiZHJvcFwiLCB0aGlzLm5vZGUsIHRoaXMubm9kZS5wYXJlbnROb2RlLCB0aGlzLmRhdGEuc291cmNlKTtcbiAgICB9XG4gICAgdGhpcy5kcmFnaWZ5LmVtaXRJZihcImVuZFwiLCB0aGlzLm5vZGUpO1xuICAgIHRoaXMubm9kZSA9IG51bGw7XG4gICAgdGhpcy50YXJnZXQgPSBudWxsO1xuICAgIHJldHVybiB0aGlzLnNldERhdGEoKTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5hZGRDbGFzcyA9IGZ1bmN0aW9uKG5vZGUsIGNsYXNzTmFtZSkge1xuICAgIHZhciBjbGFzc2VzO1xuICAgIGNsYXNzZXMgPSBbXTtcbiAgICBpZiAobm9kZS5jbGFzc05hbWUpIHtcbiAgICAgIGNsYXNzZXMgPSBub2RlLmNsYXNzTmFtZS5zcGxpdChcIiBcIik7XG4gICAgfVxuICAgIGNsYXNzZXMucHVzaChjbGFzc05hbWUpO1xuICAgIHJldHVybiBub2RlLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbihcIiBcIik7XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihub2RlLCBjbGFzc05hbWUpIHtcbiAgICB2YXIgY2xhc3NlcztcbiAgICBjbGFzc2VzID0gbm9kZS5jbGFzc05hbWUuc3BsaXQoXCIgXCIpO1xuICAgIGNsYXNzZXMuc3BsaWNlKGNsYXNzZXMuaW5kZXhPZihjbGFzc05hbWUpLCAxKTtcbiAgICBpZiAoY2xhc3Nlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBub2RlLnJlbW92ZUF0dHJpYnV0ZShcImNsYXNzXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbm9kZS5jbGFzc05hbWUgPSBjbGFzc2VzLmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gSGFuZGxlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGVyO1xuIiwidmFyIE1pbmlFdmVudEVtaXR0ZXIsXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG5NaW5pRXZlbnRFbWl0dGVyID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBNaW5pRXZlbnRFbWl0dGVyKG1pbmksIG9iaikge1xuICAgIHRoaXMubWluaSA9IG1pbmk7XG4gICAgdGhpcy5yZW1vdmVGbiA9IGJpbmQodGhpcy5yZW1vdmVGbiwgdGhpcyk7XG4gICAgdGhpcy5yZW1vdmVGbnMgPSBiaW5kKHRoaXMucmVtb3ZlRm5zLCB0aGlzKTtcbiAgICB0aGlzLmVtaXQgPSBiaW5kKHRoaXMuZW1pdCwgdGhpcyk7XG4gICAgdGhpcy5lbWl0SWYgPSBiaW5kKHRoaXMuZW1pdElmLCB0aGlzKTtcbiAgICB0aGlzLm9mZiA9IGJpbmQodGhpcy5vZmYsIHRoaXMpO1xuICAgIHRoaXMub24gPSBiaW5kKHRoaXMub24sIHRoaXMpO1xuICAgIHRoaXMubWluaS5zZXR0aW5ncyA9IHtcbiAgICAgIG5hbWU6IChvYmogIT0gbnVsbCA/IG9iai5uYW1lIDogdm9pZCAwKSB8fCBcIk1pbmlFdmVudEVtaXR0ZXJcIixcbiAgICAgIGVycm9yOiAob2JqICE9IG51bGwgPyBvYmouZXJyb3IgOiB2b2lkIDApIHx8IGZhbHNlLFxuICAgICAgdHJhY2U6IChvYmogIT0gbnVsbCA/IG9iai50cmFjZSA6IHZvaWQgMCkgfHwgZmFsc2VcbiAgICB9O1xuICAgIHRoaXMubWluaS5ldmVudHMgPSB7fTtcbiAgICB0aGlzLm1pbmkuZ3JvdXBzID0ge307XG4gIH1cblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50LCBncm91cCwgZm4pIHtcbiAgICB2YXIgZXZlbnRzLCBncm91cHMsIHJlZjtcbiAgICByZWYgPSB0aGlzLm9wdGlvbmFsKGdyb3VwLCBmbiksIGdyb3VwID0gcmVmWzBdLCBmbiA9IHJlZlsxXTtcbiAgICBpZiAoIXRoaXMudmFsaWQoXCJvblwiLCBldmVudCwgZ3JvdXAsIGZuKSkge1xuICAgICAgcmV0dXJuIHRoaXMubWluaTtcbiAgICB9XG4gICAgaWYgKChncm91cHMgPSB0aGlzLm1pbmkuZ3JvdXBzKVtncm91cF0pIHtcbiAgICAgIGlmIChncm91cHNbZ3JvdXBdW2V2ZW50XSkge1xuICAgICAgICBncm91cHNbZ3JvdXBdW2V2ZW50XS5wdXNoKGZuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdyb3Vwc1tncm91cF1bZXZlbnRdID0gW2ZuXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZ3JvdXBzW2dyb3VwXSA9IHt9O1xuICAgICAgZ3JvdXBzW2dyb3VwXVtldmVudF0gPSBbZm5dO1xuICAgIH1cbiAgICBpZiAoKGV2ZW50cyA9IHRoaXMubWluaS5ldmVudHMpW2V2ZW50XSkge1xuICAgICAgZXZlbnRzW2V2ZW50XS5wdXNoKGZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnRzW2V2ZW50XSA9IFtmbl07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1pbmk7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24oZXZlbnQsIGdyb3VwLCBmbikge1xuICAgIHZhciBmbnMsIGluZGV4LCByZWY7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbW92ZUFsbCgpO1xuICAgIH1cbiAgICByZWYgPSB0aGlzLm9wdGlvbmFsKGdyb3VwLCBmbiksIGdyb3VwID0gcmVmWzBdLCBmbiA9IHJlZlsxXTtcbiAgICBpZiAoIXRoaXMudmFsaWQoXCJvZmZcIiwgZXZlbnQsIGdyb3VwLCBmbikpIHtcbiAgICAgIHJldHVybiB0aGlzLm1pbmk7XG4gICAgfVxuICAgIGlmICghdGhpcy5taW5pLmdyb3Vwc1tncm91cF0pIHtcbiAgICAgIHRoaXMuZXJyb3IoXCJvZmZcIiwgNywgZXZlbnQsIGdyb3VwKTtcbiAgICAgIHJldHVybiB0aGlzLm1pbmk7XG4gICAgfVxuICAgIGlmICghZXZlbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbW92ZUdyb3VwKGdyb3VwKTtcbiAgICB9XG4gICAgaWYgKCEoZm5zID0gdGhpcy5taW5pLmdyb3Vwc1tncm91cF1bZXZlbnRdKSkge1xuICAgICAgdGhpcy5lcnJvcihcIm9mZlwiLCA4LCBldmVudCwgZ3JvdXApO1xuICAgICAgcmV0dXJuIHRoaXMubWluaTtcbiAgICB9XG4gICAgaWYgKCFmbikge1xuICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlRm5zKGV2ZW50LCBncm91cCwgZm5zKTtcbiAgICB9XG4gICAgaWYgKC0xID09PSAoaW5kZXggPSBmbnMuaW5kZXhPZihmbikpKSB7XG4gICAgICB0aGlzLmVycm9yKFwib2ZmXCIsIDIsIGV2ZW50LCBncm91cCk7XG4gICAgICByZXR1cm4gdGhpcy5taW5pO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUZuKGV2ZW50LCBncm91cCwgZm5zLCBmbiwgaW5kZXgpO1xuICAgIHJldHVybiB0aGlzLm1pbmk7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdElmID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXQoYXJndW1lbnRzLCB0cnVlKTtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXQoYXJndW1lbnRzKTtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZW1pdCA9IGZ1bmN0aW9uKGFyZ3MsIHNraXApIHtcbiAgICB2YXIgZXZlbnQsIGZuLCBmbnMsIGksIGxlbjtcbiAgICBhcmdzID0gQXJyYXkuZnJvbShhcmdzKTtcbiAgICBldmVudCA9IGFyZ3Muc2hpZnQoKTtcbiAgICBpZiAoIShmbnMgPSB0aGlzLnZhbGlkRXZlbnQoZXZlbnQsIHNraXApKSkge1xuICAgICAgcmV0dXJuIHRoaXMubWluaTtcbiAgICB9XG4gICAgdGhpcy50cmFjZShldmVudCwgYXJncyk7XG4gICAgZm9yIChpID0gMCwgbGVuID0gZm5zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBmbiA9IGZuc1tpXTtcbiAgICAgIGZuLmFwcGx5KGZuLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubWluaTtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS52YWxpZCA9IGZ1bmN0aW9uKG5hbWUsIGV2ZW50LCBncm91cCwgZm4pIHtcbiAgICBpZiAobmFtZSA9PT0gXCJvblwiKSB7XG4gICAgICBpZiAoIXRoaXMuaXNTdHJpbmcoZXZlbnQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yKG5hbWUsIDEpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmlzU3RyaW5nKGdyb3VwKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvcihuYW1lLCA1KTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5pc0Z1bmN0aW9uKGZuKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvcihuYW1lLCA2LCBldmVudCwgZ3JvdXApO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobmFtZSA9PT0gXCJvZmZcIikge1xuICAgICAgaWYgKGV2ZW50ICE9PSBudWxsICYmICF0aGlzLmlzU3RyaW5nKGV2ZW50KSkge1xuICAgICAgICByZXR1cm4gdGhpcy5lcnJvcihuYW1lLCAxKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5pc1N0cmluZyhncm91cCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IobmFtZSwgNSk7XG4gICAgICB9XG4gICAgICBpZiAoZm4gJiYgIXRoaXMuaXNGdW5jdGlvbihmbikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IobmFtZSwgNiwgZXZlbnQsIGdyb3VwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUudmFsaWRFdmVudCA9IGZ1bmN0aW9uKGV2ZW50LCBza2lwKSB7XG4gICAgdmFyIGZucztcbiAgICBpZiAoIWV2ZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5lcnJvcihcImVtaXRcIiwgMyk7XG4gICAgfVxuICAgIGlmICghdGhpcy5pc1N0cmluZyhldmVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVycm9yKFwiZW1pdFwiLCAxKTtcbiAgICB9XG4gICAgaWYgKCEoZm5zID0gdGhpcy5taW5pLmV2ZW50c1tldmVudF0pKSB7XG4gICAgICBpZiAoIXNraXApIHtcbiAgICAgICAgdGhpcy5lcnJvcihcImVtaXRcIiwgNCwgZXZlbnQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBmbnM7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbihuYW1lLCBpZCwgZXZlbnQsIGdyb3VwKSB7XG4gICAgdmFyIG1zZztcbiAgICBpZiAoIXRoaXMubWluaS5zZXR0aW5ncy5lcnJvcikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIG1zZyA9IHRoaXMubWluaS5zZXR0aW5ncy5uYW1lICsgXCIgfiBcIiArIG5hbWUgKyBcIiB+IFwiO1xuICAgIGlmIChpZCA9PT0gMSkge1xuICAgICAgbXNnICs9IFwiRXZlbnQgbmFtZSBtdXN0IGJlIGEgc3RyaW5nXCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gMikge1xuICAgICAgbXNnICs9IFwiUHJvdmlkZWQgZnVuY3Rpb24gdG8gcmVtb3ZlIHdpdGggZXZlbnQgXFxcIlwiICsgZXZlbnQgKyBcIlxcXCIgaW4gZ3JvdXAgXFxcIlwiICsgZ3JvdXAgKyBcIlxcXCIgaXMgbm90IGZvdW5kXCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gMykge1xuICAgICAgbXNnICs9IFwiRXZlbnQgd2FzIG5vdCBwcm92aWRlZFwiO1xuICAgIH1cbiAgICBpZiAoaWQgPT09IDQpIHtcbiAgICAgIG1zZyArPSBcIkV2ZW50TGlzdGVuZXIgZm9yIGV2ZW50IFxcXCJcIiArIGV2ZW50ICsgXCJcXFwiIGRvZXMgbm90IGV4aXN0XCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gNSkge1xuICAgICAgbXNnICs9IFwiUHJvdmlkZWQgZ3JvdXAgbXVzdCBiZSBhIHN0cmluZ1wiO1xuICAgIH1cbiAgICBpZiAoaWQgPT09IDYpIHtcbiAgICAgIG1zZyArPSBcIlRoZSBsYXN0IHBhcmFtIHByb3ZpZGVkIHdpdGggZXZlbnQgXFxcIlwiICsgZXZlbnQgKyBcIlxcXCIgYW5kIGdyb3VwIFxcXCJcIiArIGdyb3VwICsgXCJcXFwiIGlzIGV4cGVjdGVkIHRvIGJlIGEgZnVuY3Rpb25cIjtcbiAgICB9XG4gICAgaWYgKGlkID09PSA3KSB7XG4gICAgICBtc2cgKz0gXCJQcm92aWRlZCBncm91cCBcXFwiXCIgKyBncm91cCArIFwiXFxcIiBpcyBub3QgZm91bmRcIjtcbiAgICB9XG4gICAgaWYgKGlkID09PSA4KSB7XG4gICAgICBtc2cgKz0gXCJFdmVudCBcXFwiXCIgKyBldmVudCArIFwiXFxcIiBkb2VzIG5vdCBleGlzdCBmb3IgdGhlIHByb3ZpZGVkIGdyb3VwIFxcXCJcIiArIGdyb3VwICsgXCJcXFwiXCI7XG4gICAgfVxuICAgIGlmIChjb25zb2xlKSB7XG4gICAgICBpZiAoY29uc29sZS53YXJuKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybihtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUub3B0aW9uYWwgPSBmdW5jdGlvbihncm91cCwgZm4pIHtcbiAgICBpZiAoKGZuID09IG51bGwpICYmIHRoaXMuaXNGdW5jdGlvbihncm91cCkpIHtcbiAgICAgIGZuID0gZ3JvdXA7XG4gICAgICBncm91cCA9IFwiXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghZ3JvdXApIHtcbiAgICAgICAgZ3JvdXAgPSBcIlwiO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW2dyb3VwLCBmbl07XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5taW5pLmV2ZW50cyA9IHt9O1xuICAgIHRoaXMubWluaS5ncm91cHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcy5taW5pO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUdyb3VwID0gZnVuY3Rpb24oZ3JvdXApIHtcbiAgICB2YXIgZXZlbnQsIGZucywgcmVmO1xuICAgIHJlZiA9IHRoaXMubWluaS5ncm91cHNbZ3JvdXBdO1xuICAgIGZvciAoZXZlbnQgaW4gcmVmKSB7XG4gICAgICBmbnMgPSByZWZbZXZlbnRdO1xuICAgICAgdGhpcy5yZW1vdmVGbnMoZXZlbnQsIGdyb3VwLCBmbnMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5taW5pO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUZucyA9IGZ1bmN0aW9uKGV2ZW50LCBncm91cCwgZm5zKSB7XG4gICAgdmFyIGZuLCBpO1xuICAgIGZvciAoaSA9IGZucy5sZW5ndGggLSAxOyBpID49IDA7IGkgKz0gLTEpIHtcbiAgICAgIGZuID0gZm5zW2ldO1xuICAgICAgdGhpcy5yZW1vdmVGbihldmVudCwgZ3JvdXAsIGZucywgZm4pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5taW5pO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUZuID0gZnVuY3Rpb24oZXZlbnQsIGdyb3VwLCBmbnMsIGZuLCBpbmRleCkge1xuICAgIGlmICghaW5kZXgpIHtcbiAgICAgIGluZGV4ID0gZm5zLmluZGV4T2YoZm4pO1xuICAgIH1cbiAgICBmbnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICBpZiAoZm5zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZGVsZXRlIHRoaXMubWluaS5ncm91cHNbZ3JvdXBdW2V2ZW50XTtcbiAgICB9XG4gICAgaWYgKDAgPT09IHRoaXMub2JqTGVuZ3RoKHRoaXMubWluaS5ncm91cHNbZ3JvdXBdKSkge1xuICAgICAgZGVsZXRlIHRoaXMubWluaS5ncm91cHNbZ3JvdXBdO1xuICAgIH1cbiAgICBpbmRleCA9IHRoaXMubWluaS5ldmVudHNbZXZlbnRdLmluZGV4T2YoZm4pO1xuICAgIHRoaXMubWluaS5ldmVudHNbZXZlbnRdLnNwbGljZShpbmRleCwgMSk7XG4gICAgaWYgKHRoaXMubWluaS5ldmVudHNbZXZlbnRdLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGRlbGV0ZSB0aGlzLm1pbmkuZXZlbnRzW2V2ZW50XTtcbiAgICB9XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUudHJhY2UgPSBmdW5jdGlvbihldmVudCwgYXJncykge1xuICAgIHZhciBtc2c7XG4gICAgaWYgKHRoaXMubWluaS5zZXR0aW5ncy50cmFjZSkge1xuICAgICAgbXNnID0gdGhpcy5taW5pLnNldHRpbmdzLm5hbWUgKyBcIiB+IHRyYWNlIH4gXCIgKyBldmVudDtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBpZiAoY29uc29sZS5kZWJ1Zykge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIiVjIFwiICsgbXNnLCBcImNvbG9yOiAjMTNkXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhtc2cpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoY29uc29sZS5kZWJ1Zykge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIiVjIFwiICsgbXNnLCBcImNvbG9yOiAjMTNkXCIsIGFyZ3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhtc2csIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLmlzU3RyaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICByZXR1cm4gdHlwZW9mIGV2ZW50ID09PSBcInN0cmluZ1wiIHx8IGV2ZW50IGluc3RhbmNlb2YgU3RyaW5nO1xuICB9O1xuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9iakxlbmd0aCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5pc0Z1bmN0aW9uID0gZnVuY3Rpb24oZm4pIHtcbiAgICByZXR1cm4gdHlwZW9mIGZuID09PSBcImZ1bmN0aW9uXCI7XG4gIH07XG5cbiAgcmV0dXJuIE1pbmlFdmVudEVtaXR0ZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWluaUV2ZW50RW1pdHRlcjtcbiIsInZhciBIYW5kbGVyLCBNaW5pRXZlbnRFbWl0dGVyO1xuXG5IYW5kbGVyID0gcmVxdWlyZShcIi4vaGFuZGxlclwiKTtcblxuTWluaUV2ZW50RW1pdHRlciA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gTWluaUV2ZW50RW1pdHRlcihvYmopIHtcbiAgICB2YXIgaGFuZGxlcjtcbiAgICBoYW5kbGVyID0gbmV3IEhhbmRsZXIodGhpcywgb2JqKTtcbiAgICB0aGlzLm9uID0gaGFuZGxlci5vbjtcbiAgICB0aGlzLm9mZiA9IGhhbmRsZXIub2ZmO1xuICAgIHRoaXMuZW1pdCA9IGhhbmRsZXIuZW1pdDtcbiAgICB0aGlzLmVtaXRJZiA9IGhhbmRsZXIuZW1pdElmO1xuICAgIHRoaXMudHJpZ2dlciA9IGhhbmRsZXIuZW1pdDtcbiAgICB0aGlzLnRyaWdnZXJJZiA9IGhhbmRsZXIuZW1pdElmO1xuICB9XG5cbiAgcmV0dXJuIE1pbmlFdmVudEVtaXR0ZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWluaUV2ZW50RW1pdHRlcjtcbiJdfQ==
