(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Dragify, Events, Handler,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Events = require('mini-event-emitter');

Handler = require('./handler');

Dragify = (function(superClass) {
  extend(Dragify, superClass);

  function Dragify(containers, options) {
    var ref, ref1;
    this.containers = containers;
    Dragify.__super__.constructor.apply(this, arguments);
    this.options = {
      threshold: {
        x: (options != null ? (ref = options.threshold) != null ? ref.x : void 0 : void 0) || 3,
        y: (options != null ? (ref1 = options.threshold) != null ? ref1.y : void 0 : void 0) || 3
      }
    };
    new Handler(this);
  }

  return Dragify;

})(Events);

module.exports = Dragify;

},{"./handler":3,"mini-event-emitter":4}],2:[function(require,module,exports){
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
    if (id === 1) {
      msg += "First argument 'Containers' must be an array";
    }
    if (id === 2) {
      msg += "Event name must be a string";
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
    if (this.dragify.containers.constructor !== Array) {
      return this.error(1);
    }
    this.setData();
    return this.create();
  };

  Handler.prototype.setData = function() {
    return this.data = {
      index: null,
      start: {},
      offset: {},
      source: null,
      parent: null,
      treshhold: {}
    };
  };

  Handler.prototype.listeners = function() {
    var container, i, len, ref;
    ref = this.dragify.containers;
    for (i = 0, len = ref.length; i < len; i++) {
      container = ref[i];
      this.listen(container);
    }
    return window.addEventListener('mouseup', this.mouseup);
  };

  Handler.prototype.mouseup = function(e) {
    if (e.button !== 0) {
      return;
    }
    window.removeEventListener('mousemove', this.mousemove);
    if (this.active) {
      return this.reset();
    }
  };

  Handler.prototype.listen = function(container) {
    var i, len, node, ref, results, set;
    set = (function(_this) {
      return function(node) {
        return node.addEventListener('mousedown', function(ev) {
          return _this.mousedown(ev, node);
        });
      };
    })(this);
    ref = container.childNodes;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      node = ref[i];
      results.push(set(node));
    }
    return results;
  };

  Handler.prototype.mousedown = function(ev, node) {
    if (ev.button !== 0) {
      return;
    }
    this.node = node;
    this.data.source = node.parentNode;
    this.data.parent = node.parentNode;
    this.data.index = this.getIndex(node);
    this.data.start.x = ev.x || ev.clientX;
    this.data.start.y = ev.y || ev.clientY;
    this.data.offset = {
      x: ev.offsetX,
      y: ev.offsetY
    };
    return window.addEventListener('mousemove', this.mousemove);
  };

  Handler.prototype.mousemove = function(e1) {
    var base, base1;
    this.e = e1;
    (base = this.e).x || (base.x = this.e.clientX);
    (base1 = this.e).y || (base1.y = this.e.clientY);
    if (!this.active) {
      if (Math.abs(this.e.x - this.data.start.x) > this.dragify.options.threshold.x) {
        this.active = true;
      }
      if (Math.abs(this.e.y - this.data.start.y) > this.dragify.options.threshold.y) {
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
    this.mirror.style.transform = "translate(" + (this.e.x - this.data.offset.x) + "px," + (this.e.y - this.data.offset.y) + "px)";
    target = document.elementFromPoint(this.e.x, this.e.y);
    if (target === this.target) {
      return;
    }
    this.target = target;
    if (this.target) {
      return this["switch"]();
    }
  };

  Handler.prototype["switch"] = function() {
    var found, i, len, parent, ref, ref1;
    if (this.target !== this.data.parent) {
      this.data.parent = this.target.parentNode;
      this.dragify.emit('over', this.node, this.target, this.data.source);
    }
    found = false;
    ref = this.dragify.containers;
    for (i = 0, len = ref.length; i < len; i++) {
      parent = ref[i];
      if (((ref1 = this.target) != null ? ref1.parentNode : void 0) === parent) {
        found = true;
        break;
      }
      if (this.target === parent && this.node.parentNode !== parent) {
        return this.transfer();
      }
    }
    if (!found) {
      return;
    }
    if (this.target.parentNode !== this.node.parentNode || (this.getIndex(this.node)) > (this.getIndex(this.target))) {
      return this.insert(this.target.parentNode, this.node, this.target);
    } else {
      return this.insert(this.target.parentNode, this.node, this.target.nextSibling);
    }
  };

  Handler.prototype.insert = function(parent, node, target) {
    this.dragify.emit('move', this.node, this.node.parentNode, this.data.source);
    return parent.insertBefore(node, target);
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
    this.dragify.emit('drag', this.node, this.node.parentNode);
    this.mirror.appendChild(clone = this.node.cloneNode(true));
    clone.style.width = this.node.offsetWidth + "px";
    clone.style.height = this.node.offsetHeight + "px";
    document.body.appendChild(this.mirror);
    this.mirror.focus();
    this.addClass(document.body, 'dragify--body');
    return this.addClass(this.node, 'dragify--transition dragify--opaque');
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
    remove(this.node);
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

},{"./error":2}],4:[function(require,module,exports){
var MiniEventEmitter;

MiniEventEmitter = (function() {
  var _emit, error, isFunction, isString, objLength, optional;

  function MiniEventEmitter(obj) {
    this.settings = {
      error: (obj != null ? obj.error : void 0) || false,
      trace: (obj != null ? obj.trace : void 0) || false,
      worker: (obj != null ? obj.worker : void 0) || null
    };
    this.events = {};
    this.groups = {};
    if (!this.settings.worker) {
      return;
    }
    this.worker = webworkify(this.settings.worker);
    this.worker.addEventListener('message', (function(_this) {
      return function(arg) {
        var data;
        data = arg.data;
        return _emit({
          self: _this,
          args: data.args,
          event: data.event,
          internal: true
        });
      };
    })(this));
  }

  MiniEventEmitter.prototype.on = function(event, group, fn) {
    var ref;
    ref = optional(group, fn), group = ref[0], fn = ref[1];
    if (!isString(event)) {
      return error(this, 'on', 1);
    }
    if (!isString(group)) {
      return error(this, 'on', 5);
    }
    if (!isFunction(fn)) {
      return error(this, 'on', 6, event, group);
    }
    if (this.groups[group]) {
      if (this.groups[group][event]) {
        this.groups[group][event].push(fn);
      } else {
        this.groups[group][event] = [fn];
      }
    } else {
      this.groups[group] = {};
      this.groups[group][event] = [fn];
    }
    if (this.events[event]) {
      this.events[event].push(fn);
    } else {
      this.events[event] = [fn];
    }
    return this;
  };

  MiniEventEmitter.prototype.off = function(event, group, fn) {
    var actions, index1, index2, ref, ref1, removeFn;
    removeFn = (function(_this) {
      return function() {
        var action, i, index, len;
        for (i = 0, len = actions.length; i < len; i++) {
          action = actions[i];
          index = _this.events[event].indexOf(action);
          _this.events[event].splice(index, 1);
        }
        if (_this.events[event].length === 0) {
          return delete _this.events[event];
        }
      };
    })(this);
    ref = optional(group, fn), group = ref[0], fn = ref[1];
    if (event && !isString(event)) {
      return error(this, 'off', 1);
    }
    if (!isString(group)) {
      return error(this, 'off', 5);
    }
    if (fn && !isFunction(fn)) {
      return error(this, 'off', 6, event, group);
    }
    if (event && !this.groups[group]) {
      return error(this, 'off', 7, event, group);
    }
    if (!event) {
      ref1 = this.groups[group];
      for (event in ref1) {
        actions = ref1[event];
        removeFn();
      }
      delete this.groups[group];
      return this;
    }
    if (!(actions = this.groups[group][event])) {
      return error(this, 'off', 4, event, group);
    }
    if (!fn) {
      removeFn();
      delete this.groups[group][event];
      if (0 === objLength(this.groups[group])) {
        delete this.groups[group];
      }
      return this;
    }
    if (-1 === (index1 = actions.indexOf(fn))) {
      return error(this, 'off', 2, event, group);
    }
    actions.splice(index1, 1);
    if (actions.length === 0) {
      delete this.groups[group][event];
    }
    if (0 === objLength(this.groups[group])) {
      delete this.groups[group];
    }
    index2 = this.events[event].indexOf(fn);
    this.events[event].splice(index2, 1);
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
    return this;
  };

  MiniEventEmitter.prototype.emit = function() {
    var args, event;
    args = Array.from(arguments);
    event = args.shift();
    return _emit({
      self: this,
      args: args,
      event: event,
      internal: false
    });
  };

  MiniEventEmitter.prototype.trigger = function() {
    this.emit.apply(this, arguments);
    return this;
  };

  isString = function(event) {
    return typeof event === 'string' || event instanceof String;
  };

  objLength = function(obj) {
    return Object.keys(obj).length;
  };

  isFunction = function(fn) {
    return typeof fn === 'function';
  };

  error = function(self, name, id, event, group) {
    var msg;
    if (!self.settings.error) {
      return self;
    }
    msg = "MiniEventEmitter ~ " + name + " ~ ";
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
      msg += "Event \"" + event + "\" does not exist";
    }
    if (id === 5) {
      msg += "Provided group must be a string";
    }
    if (id === 6) {
      msg += "The last param provided with event \"" + event + "\" and group \"" + group + "\" is expected to be a function";
    }
    if (id === 7) {
      msg += "Provided Group \"" + group + "\" doesn't have any events";
    }
    if (console.warn) {
      console.warn(msg);
    } else {
      console.log(msg);
    }
    return self;
  };

  optional = function(group, fn) {
    if ((fn == null) && isFunction(group)) {
      fn = group;
      group = '';
    } else {
      if (!group) {
        group = '';
      }
    }
    return [group, fn];
  };

  _emit = function(arg) {
    var action, args, event, i, internal, len, list, msg, self;
    self = arg.self, event = arg.event, args = arg.args, internal = arg.internal;
    if (!event) {
      return error(self, 'emit', 3);
    }
    if (!isString(event)) {
      return error(self, 'emit', 1);
    }
    if (!(list = self.events[event])) {
      return error(self, 'emit', 4, event);
    }
    if (self.settings.worker && !internal) {
      self.worker.postMessage({
        args: args,
        event: event
      });
    } else {
      if (self.settings.trace) {
        msg = "MiniEventEmitter ~ trace ~ " + event;
        if (console.debug) {
          console.debug(msg);
        } else {
          console.log(msg);
        }
      }
      for (i = 0, len = list.length; i < len; i++) {
        action = list[i];
        action.apply(action, args);
      }
    }
    return self;
  };

  return MiniEventEmitter;

})();

(function() {
  var msg;
  if ((typeof module !== "undefined" && module !== null) && module.exports) {
    return module.exports = MiniEventEmitter;
  } else if (window) {
    return window.MiniEventEmitter = MiniEventEmitter;
  } else {
    msg = "Cannot expose MiniEventEmitter";
    if (console.warn) {
      return console.warn(msg);
    } else {
      return console.log(msg);
    }
  }
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9kZS1idWlsZGVyL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9hcHAuanMiLCJidWlsZC9qcy9lcnJvci5qcyIsImJ1aWxkL2pzL2hhbmRsZXIuanMiLCJub2RlX21vZHVsZXMvbWluaS1ldmVudC1lbWl0dGVyL2J1aWxkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIERyYWdpZnksIEV2ZW50cywgSGFuZGxlcixcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbkV2ZW50cyA9IHJlcXVpcmUoJ21pbmktZXZlbnQtZW1pdHRlcicpO1xuXG5IYW5kbGVyID0gcmVxdWlyZSgnLi9oYW5kbGVyJyk7XG5cbkRyYWdpZnkgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoRHJhZ2lmeSwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gRHJhZ2lmeShjb250YWluZXJzLCBvcHRpb25zKSB7XG4gICAgdmFyIHJlZiwgcmVmMTtcbiAgICB0aGlzLmNvbnRhaW5lcnMgPSBjb250YWluZXJzO1xuICAgIERyYWdpZnkuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgdGhyZXNob2xkOiB7XG4gICAgICAgIHg6IChvcHRpb25zICE9IG51bGwgPyAocmVmID0gb3B0aW9ucy50aHJlc2hvbGQpICE9IG51bGwgPyByZWYueCA6IHZvaWQgMCA6IHZvaWQgMCkgfHwgMyxcbiAgICAgICAgeTogKG9wdGlvbnMgIT0gbnVsbCA/IChyZWYxID0gb3B0aW9ucy50aHJlc2hvbGQpICE9IG51bGwgPyByZWYxLnkgOiB2b2lkIDAgOiB2b2lkIDApIHx8IDNcbiAgICAgIH1cbiAgICB9O1xuICAgIG5ldyBIYW5kbGVyKHRoaXMpO1xuICB9XG5cbiAgcmV0dXJuIERyYWdpZnk7XG5cbn0pKEV2ZW50cyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRHJhZ2lmeTtcbiIsInZhciBFcnJvcjtcblxuRXJyb3IgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIEVycm9yKGRyYWdpZnkpIHtcbiAgICB2YXIgcmVmO1xuICAgIHRoaXMuZHJhZ2lmeSA9IGRyYWdpZnk7XG4gICAgdGhpcy5ibG9jayA9ICEoKHJlZiA9IHRoaXMuZHJhZ2lmeS5vcHRpb25zKSAhPSBudWxsID8gcmVmLmVycm9yIDogdm9pZCAwKTtcbiAgfVxuXG4gIEVycm9yLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgdmFyIG1zZztcbiAgICBpZiAodGhpcy5ibG9jaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBtc2cgPSBcIkRyYWdpZnkgfiBcIjtcbiAgICBpZiAoaWQgPT09IDEpIHtcbiAgICAgIG1zZyArPSBcIkZpcnN0IGFyZ3VtZW50ICdDb250YWluZXJzJyBtdXN0IGJlIGFuIGFycmF5XCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gMikge1xuICAgICAgbXNnICs9IFwiRXZlbnQgbmFtZSBtdXN0IGJlIGEgc3RyaW5nXCI7XG4gICAgfVxuICAgIGlmIChjb25zb2xlLndhcm4pIHtcbiAgICAgIHJldHVybiBjb25zb2xlLndhcm4obXNnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBFcnJvcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFcnJvcjtcbiIsInZhciBFcnJvciwgSGFuZGxlcixcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbkVycm9yID0gcmVxdWlyZSgnLi9lcnJvcicpO1xuXG5IYW5kbGVyID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBIYW5kbGVyKGRyYWdpZnkpIHtcbiAgICB0aGlzLmRyYWdpZnkgPSBkcmFnaWZ5O1xuICAgIHRoaXMubW91c2Vtb3ZlID0gYmluZCh0aGlzLm1vdXNlbW92ZSwgdGhpcyk7XG4gICAgdGhpcy5tb3VzZWRvd24gPSBiaW5kKHRoaXMubW91c2Vkb3duLCB0aGlzKTtcbiAgICB0aGlzLm1vdXNldXAgPSBiaW5kKHRoaXMubW91c2V1cCwgdGhpcyk7XG4gICAgdGhpcy5sb2FkKCk7XG4gICAgdGhpcy5zZXR1cCgpO1xuICAgIHRoaXMubGlzdGVuZXJzKCk7XG4gIH1cblxuICBIYW5kbGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZXJyb3IgPSAobmV3IEVycm9yKHtcbiAgICAgIGRyYWdpZnk6IHRoaXMuZHJhZ2lmeVxuICAgIH0pKS5lcnJvcjtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmRyYWdpZnkuY29udGFpbmVycy5jb25zdHJ1Y3RvciAhPT0gQXJyYXkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVycm9yKDEpO1xuICAgIH1cbiAgICB0aGlzLnNldERhdGEoKTtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGUoKTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YSA9IHtcbiAgICAgIGluZGV4OiBudWxsLFxuICAgICAgc3RhcnQ6IHt9LFxuICAgICAgb2Zmc2V0OiB7fSxcbiAgICAgIHNvdXJjZTogbnVsbCxcbiAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgIHRyZXNoaG9sZDoge31cbiAgICB9O1xuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb250YWluZXIsIGksIGxlbiwgcmVmO1xuICAgIHJlZiA9IHRoaXMuZHJhZ2lmeS5jb250YWluZXJzO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29udGFpbmVyID0gcmVmW2ldO1xuICAgICAgdGhpcy5saXN0ZW4oY29udGFpbmVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5tb3VzZXVwKTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5tb3VzZXVwID0gZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLmJ1dHRvbiAhPT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5tb3VzZW1vdmUpO1xuICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucmVzZXQoKTtcbiAgICB9XG4gIH07XG5cbiAgSGFuZGxlci5wcm90b3R5cGUubGlzdGVuID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgdmFyIGksIGxlbiwgbm9kZSwgcmVmLCByZXN1bHRzLCBzZXQ7XG4gICAgc2V0ID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbihldikge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5tb3VzZWRvd24oZXYsIG5vZGUpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcyk7XG4gICAgcmVmID0gY29udGFpbmVyLmNoaWxkTm9kZXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgbm9kZSA9IHJlZltpXTtcbiAgICAgIHJlc3VsdHMucHVzaChzZXQobm9kZSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5tb3VzZWRvd24gPSBmdW5jdGlvbihldiwgbm9kZSkge1xuICAgIGlmIChldi5idXR0b24gIT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICB0aGlzLmRhdGEuc291cmNlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIHRoaXMuZGF0YS5wYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgdGhpcy5kYXRhLmluZGV4ID0gdGhpcy5nZXRJbmRleChub2RlKTtcbiAgICB0aGlzLmRhdGEuc3RhcnQueCA9IGV2LnggfHwgZXYuY2xpZW50WDtcbiAgICB0aGlzLmRhdGEuc3RhcnQueSA9IGV2LnkgfHwgZXYuY2xpZW50WTtcbiAgICB0aGlzLmRhdGEub2Zmc2V0ID0ge1xuICAgICAgeDogZXYub2Zmc2V0WCxcbiAgICAgIHk6IGV2Lm9mZnNldFlcbiAgICB9O1xuICAgIHJldHVybiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5tb3VzZW1vdmUpO1xuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUxKSB7XG4gICAgdmFyIGJhc2UsIGJhc2UxO1xuICAgIHRoaXMuZSA9IGUxO1xuICAgIChiYXNlID0gdGhpcy5lKS54IHx8IChiYXNlLnggPSB0aGlzLmUuY2xpZW50WCk7XG4gICAgKGJhc2UxID0gdGhpcy5lKS55IHx8IChiYXNlMS55ID0gdGhpcy5lLmNsaWVudFkpO1xuICAgIGlmICghdGhpcy5hY3RpdmUpIHtcbiAgICAgIGlmIChNYXRoLmFicyh0aGlzLmUueCAtIHRoaXMuZGF0YS5zdGFydC54KSA+IHRoaXMuZHJhZ2lmeS5vcHRpb25zLnRocmVzaG9sZC54KSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChNYXRoLmFicyh0aGlzLmUueSAtIHRoaXMuZGF0YS5zdGFydC55KSA+IHRoaXMuZHJhZ2lmeS5vcHRpb25zLnRocmVzaG9sZC55KSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5hY3RpdmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbigpO1xuICAgIH1cbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5wb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0YXJnZXQ7XG4gICAgdGhpcy5taXJyb3Iuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGUoXCIgKyAodGhpcy5lLnggLSB0aGlzLmRhdGEub2Zmc2V0LngpICsgXCJweCxcIiArICh0aGlzLmUueSAtIHRoaXMuZGF0YS5vZmZzZXQueSkgKyBcInB4KVwiO1xuICAgIHRhcmdldCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQodGhpcy5lLngsIHRoaXMuZS55KTtcbiAgICBpZiAodGFyZ2V0ID09PSB0aGlzLnRhcmdldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICBpZiAodGhpcy50YXJnZXQpIHtcbiAgICAgIHJldHVybiB0aGlzW1wic3dpdGNoXCJdKCk7XG4gICAgfVxuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlW1wic3dpdGNoXCJdID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZvdW5kLCBpLCBsZW4sIHBhcmVudCwgcmVmLCByZWYxO1xuICAgIGlmICh0aGlzLnRhcmdldCAhPT0gdGhpcy5kYXRhLnBhcmVudCkge1xuICAgICAgdGhpcy5kYXRhLnBhcmVudCA9IHRoaXMudGFyZ2V0LnBhcmVudE5vZGU7XG4gICAgICB0aGlzLmRyYWdpZnkuZW1pdCgnb3ZlcicsIHRoaXMubm9kZSwgdGhpcy50YXJnZXQsIHRoaXMuZGF0YS5zb3VyY2UpO1xuICAgIH1cbiAgICBmb3VuZCA9IGZhbHNlO1xuICAgIHJlZiA9IHRoaXMuZHJhZ2lmeS5jb250YWluZXJzO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgcGFyZW50ID0gcmVmW2ldO1xuICAgICAgaWYgKCgocmVmMSA9IHRoaXMudGFyZ2V0KSAhPSBudWxsID8gcmVmMS5wYXJlbnROb2RlIDogdm9pZCAwKSA9PT0gcGFyZW50KSB7XG4gICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy50YXJnZXQgPT09IHBhcmVudCAmJiB0aGlzLm5vZGUucGFyZW50Tm9kZSAhPT0gcGFyZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYW5zZmVyKCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghZm91bmQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMudGFyZ2V0LnBhcmVudE5vZGUgIT09IHRoaXMubm9kZS5wYXJlbnROb2RlIHx8ICh0aGlzLmdldEluZGV4KHRoaXMubm9kZSkpID4gKHRoaXMuZ2V0SW5kZXgodGhpcy50YXJnZXQpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5zZXJ0KHRoaXMudGFyZ2V0LnBhcmVudE5vZGUsIHRoaXMubm9kZSwgdGhpcy50YXJnZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnNlcnQodGhpcy50YXJnZXQucGFyZW50Tm9kZSwgdGhpcy5ub2RlLCB0aGlzLnRhcmdldC5uZXh0U2libGluZyk7XG4gICAgfVxuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uKHBhcmVudCwgbm9kZSwgdGFyZ2V0KSB7XG4gICAgdGhpcy5kcmFnaWZ5LmVtaXQoJ21vdmUnLCB0aGlzLm5vZGUsIHRoaXMubm9kZS5wYXJlbnROb2RlLCB0aGlzLmRhdGEuc291cmNlKTtcbiAgICByZXR1cm4gcGFyZW50Lmluc2VydEJlZm9yZShub2RlLCB0YXJnZXQpO1xuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLmdldEluZGV4ID0gZnVuY3Rpb24obm9kZSkge1xuICAgIHZhciBjaGlsZCwgaSwgaW5kZXgsIGxlbiwgcmVmO1xuICAgIHJlZiA9IG5vZGUucGFyZW50Tm9kZS5jaGlsZE5vZGVzO1xuICAgIGZvciAoaW5kZXggPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaW5kZXggPSArK2kpIHtcbiAgICAgIGNoaWxkID0gcmVmW2luZGV4XTtcbiAgICAgIGlmIChjaGlsZCA9PT0gbm9kZSkge1xuICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLnRyYW5zZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJlbG93LCBjaGlsZCwgaSwgaW5kZXgsIGxlbiwgbG93ZXIsIGxvd2VzdCwgcmVmLCByZWYxLCB0YXJnZXQsIHZhbDtcbiAgICBsb3dlc3QgPSBudWxsO1xuICAgIHJlZiA9IHRoaXMudGFyZ2V0LmNoaWxkTm9kZXM7XG4gICAgZm9yIChpbmRleCA9IGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpbmRleCA9ICsraSkge1xuICAgICAgY2hpbGQgPSByZWZbaW5kZXhdO1xuICAgICAgcmVmMSA9IHRoaXMuZGlzdGFuY2Uoe1xuICAgICAgICB0b3A6IGNoaWxkLm9mZnNldFRvcCxcbiAgICAgICAgYm90dG9tOiBjaGlsZC5vZmZzZXRUb3AgKyBjaGlsZC5jbGllbnRIZWlnaHRcbiAgICAgIH0pLCB2YWwgPSByZWYxWzBdLCBsb3dlciA9IHJlZjFbMV07XG4gICAgICBpZiAoIWxvd2VzdCB8fCB2YWwgPCBsb3dlc3QpIHtcbiAgICAgICAgbG93ZXN0ID0gdmFsO1xuICAgICAgICB0YXJnZXQgPSBjaGlsZDtcbiAgICAgICAgYmVsb3cgPSBsb3dlcjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMudGFyZ2V0LmNoaWxkTm9kZXNbdGhpcy50YXJnZXQuY2hpbGROb2Rlcy5sZW5ndGggLSAxXSA9PT0gdGFyZ2V0ICYmIGJlbG93KSB7XG4gICAgICB0YXJnZXQgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pbnNlcnQodGhpcy50YXJnZXQsIHRoaXMubm9kZSwgdGFyZ2V0KTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5kaXN0YW5jZSA9IGZ1bmN0aW9uKHBvcykge1xuICAgIHZhciBiZWxvdywgYm90dG9tLCB2YWwsIHk7XG4gICAgYmVsb3cgPSBmYWxzZTtcbiAgICB5ID0gdGhpcy5lLm9mZnNldFk7XG4gICAgdmFsID0gTWF0aC5hYnMoeSAtIHBvcy50b3ApO1xuICAgIGlmICh2YWwgPiAoYm90dG9tID0gTWF0aC5hYnMoeSAtIHBvcy5ib3R0b20pKSkge1xuICAgICAgdmFsID0gYm90dG9tO1xuICAgIH1cbiAgICByZXR1cm4gW3ZhbCwgeSA+IHBvcy5ib3R0b21dO1xuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWlycm9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5taXJyb3IudGFiSW5kZXggPSAwO1xuICAgIHJldHVybiB0aGlzLm1pcnJvci5jbGFzc05hbWUgPSAnZHJhZ2lmeS0tbWlycm9yJztcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xvbmU7XG4gICAgdGhpcy5kcmFnaWZ5LmVtaXQoJ2RyYWcnLCB0aGlzLm5vZGUsIHRoaXMubm9kZS5wYXJlbnROb2RlKTtcbiAgICB0aGlzLm1pcnJvci5hcHBlbmRDaGlsZChjbG9uZSA9IHRoaXMubm9kZS5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgIGNsb25lLnN0eWxlLndpZHRoID0gdGhpcy5ub2RlLm9mZnNldFdpZHRoICsgXCJweFwiO1xuICAgIGNsb25lLnN0eWxlLmhlaWdodCA9IHRoaXMubm9kZS5vZmZzZXRIZWlnaHQgKyBcInB4XCI7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLm1pcnJvcik7XG4gICAgdGhpcy5taXJyb3IuZm9jdXMoKTtcbiAgICB0aGlzLmFkZENsYXNzKGRvY3VtZW50LmJvZHksICdkcmFnaWZ5LS1ib2R5Jyk7XG4gICAgcmV0dXJuIHRoaXMuYWRkQ2xhc3ModGhpcy5ub2RlLCAnZHJhZ2lmeS0tdHJhbnNpdGlvbiBkcmFnaWZ5LS1vcGFxdWUnKTtcbiAgfTtcblxuICBIYW5kbGVyLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZW1vdmU7XG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgICB3aGlsZSAodGhpcy5taXJyb3IuZmlyc3RDaGlsZCkge1xuICAgICAgdGhpcy5taXJyb3IucmVtb3ZlQ2hpbGQodGhpcy5taXJyb3IuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGhpcy5taXJyb3IpO1xuICAgIHRoaXMubWlycm9yLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcbiAgICB0aGlzLnJlbW92ZUNsYXNzKGRvY3VtZW50LmJvZHksICdkcmFnaWZ5LS1ib2R5Jyk7XG4gICAgdGhpcy5yZW1vdmVDbGFzcyh0aGlzLm5vZGUsICdkcmFnaWZ5LS1vcGFxdWUnKTtcbiAgICByZW1vdmUgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5yZW1vdmVDbGFzcyhub2RlLCAnZHJhZ2lmeS0tdHJhbnNpdGlvbicpO1xuICAgICAgICB9LCA1MDApO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKTtcbiAgICByZW1vdmUodGhpcy5ub2RlKTtcbiAgICBpZiAodGhpcy5kYXRhLnNvdXJjZSA9PT0gdGhpcy5ub2RlLnBhcmVudE5vZGUgJiYgdGhpcy5kYXRhLmluZGV4ID09PSB0aGlzLmdldEluZGV4KHRoaXMubm9kZSkpIHtcbiAgICAgIHRoaXMuZHJhZ2lmeS5lbWl0KCdjYW5jZWwnLCB0aGlzLm5vZGUsIHRoaXMubm9kZS5wYXJlbnROb2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kcmFnaWZ5LmVtaXQoJ2Ryb3AnLCB0aGlzLm5vZGUsIHRoaXMubm9kZS5wYXJlbnROb2RlLCB0aGlzLmRhdGEuc291cmNlKTtcbiAgICB9XG4gICAgdGhpcy5kcmFnaWZ5LmVtaXQoJ2VuZCcsIHRoaXMubm9kZSk7XG4gICAgdGhpcy5ub2RlID0gbnVsbDtcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgcmV0dXJuIHRoaXMuc2V0RGF0YSgpO1xuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLmFkZENsYXNzID0gZnVuY3Rpb24obm9kZSwgY2xhc3NOYW1lKSB7XG4gICAgdmFyIGNsYXNzZXM7XG4gICAgY2xhc3NlcyA9IFtdO1xuICAgIGlmIChub2RlLmNsYXNzTmFtZSkge1xuICAgICAgY2xhc3NlcyA9IG5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgJyk7XG4gICAgfVxuICAgIGNsYXNzZXMucHVzaChjbGFzc05hbWUpO1xuICAgIHJldHVybiBub2RlLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbignICcpO1xuICB9O1xuXG4gIEhhbmRsZXIucHJvdG90eXBlLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24obm9kZSwgY2xhc3NOYW1lKSB7XG4gICAgdmFyIGNsYXNzZXM7XG4gICAgY2xhc3NlcyA9IG5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgJyk7XG4gICAgY2xhc3Nlcy5zcGxpY2UoY2xhc3Nlcy5pbmRleE9mKGNsYXNzTmFtZSksIDEpO1xuICAgIGlmIChjbGFzc2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5vZGUucmVtb3ZlQXR0cmlidXRlKCdjbGFzcycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbm9kZS5jbGFzc05hbWUgPSBjbGFzc2VzLmpvaW4oJyAnKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIEhhbmRsZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlcjtcbiIsInZhciBNaW5pRXZlbnRFbWl0dGVyO1xuXG5NaW5pRXZlbnRFbWl0dGVyID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgX2VtaXQsIGVycm9yLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgb2JqTGVuZ3RoLCBvcHRpb25hbDtcblxuICBmdW5jdGlvbiBNaW5pRXZlbnRFbWl0dGVyKG9iaikge1xuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICBlcnJvcjogKG9iaiAhPSBudWxsID8gb2JqLmVycm9yIDogdm9pZCAwKSB8fCBmYWxzZSxcbiAgICAgIHRyYWNlOiAob2JqICE9IG51bGwgPyBvYmoudHJhY2UgOiB2b2lkIDApIHx8IGZhbHNlLFxuICAgICAgd29ya2VyOiAob2JqICE9IG51bGwgPyBvYmoud29ya2VyIDogdm9pZCAwKSB8fCBudWxsXG4gICAgfTtcbiAgICB0aGlzLmV2ZW50cyA9IHt9O1xuICAgIHRoaXMuZ3JvdXBzID0ge307XG4gICAgaWYgKCF0aGlzLnNldHRpbmdzLndvcmtlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLndvcmtlciA9IHdlYndvcmtpZnkodGhpcy5zZXR0aW5ncy53b3JrZXIpO1xuICAgIHRoaXMud29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgdmFyIGRhdGE7XG4gICAgICAgIGRhdGEgPSBhcmcuZGF0YTtcbiAgICAgICAgcmV0dXJuIF9lbWl0KHtcbiAgICAgICAgICBzZWxmOiBfdGhpcyxcbiAgICAgICAgICBhcmdzOiBkYXRhLmFyZ3MsXG4gICAgICAgICAgZXZlbnQ6IGRhdGEuZXZlbnQsXG4gICAgICAgICAgaW50ZXJuYWw6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfVxuXG4gIE1pbmlFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oZXZlbnQsIGdyb3VwLCBmbikge1xuICAgIHZhciByZWY7XG4gICAgcmVmID0gb3B0aW9uYWwoZ3JvdXAsIGZuKSwgZ3JvdXAgPSByZWZbMF0sIGZuID0gcmVmWzFdO1xuICAgIGlmICghaXNTdHJpbmcoZXZlbnQpKSB7XG4gICAgICByZXR1cm4gZXJyb3IodGhpcywgJ29uJywgMSk7XG4gICAgfVxuICAgIGlmICghaXNTdHJpbmcoZ3JvdXApKSB7XG4gICAgICByZXR1cm4gZXJyb3IodGhpcywgJ29uJywgNSk7XG4gICAgfVxuICAgIGlmICghaXNGdW5jdGlvbihmbikpIHtcbiAgICAgIHJldHVybiBlcnJvcih0aGlzLCAnb24nLCA2LCBldmVudCwgZ3JvdXApO1xuICAgIH1cbiAgICBpZiAodGhpcy5ncm91cHNbZ3JvdXBdKSB7XG4gICAgICBpZiAodGhpcy5ncm91cHNbZ3JvdXBdW2V2ZW50XSkge1xuICAgICAgICB0aGlzLmdyb3Vwc1tncm91cF1bZXZlbnRdLnB1c2goZm4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5ncm91cHNbZ3JvdXBdW2V2ZW50XSA9IFtmbl07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ3JvdXBzW2dyb3VwXSA9IHt9O1xuICAgICAgdGhpcy5ncm91cHNbZ3JvdXBdW2V2ZW50XSA9IFtmbl07XG4gICAgfVxuICAgIGlmICh0aGlzLmV2ZW50c1tldmVudF0pIHtcbiAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XS5wdXNoKGZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ldmVudHNbZXZlbnRdID0gW2ZuXTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24oZXZlbnQsIGdyb3VwLCBmbikge1xuICAgIHZhciBhY3Rpb25zLCBpbmRleDEsIGluZGV4MiwgcmVmLCByZWYxLCByZW1vdmVGbjtcbiAgICByZW1vdmVGbiA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYWN0aW9uLCBpLCBpbmRleCwgbGVuO1xuICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSBhY3Rpb25zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgYWN0aW9uID0gYWN0aW9uc1tpXTtcbiAgICAgICAgICBpbmRleCA9IF90aGlzLmV2ZW50c1tldmVudF0uaW5kZXhPZihhY3Rpb24pO1xuICAgICAgICAgIF90aGlzLmV2ZW50c1tldmVudF0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3RoaXMuZXZlbnRzW2V2ZW50XS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gZGVsZXRlIF90aGlzLmV2ZW50c1tldmVudF07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcyk7XG4gICAgcmVmID0gb3B0aW9uYWwoZ3JvdXAsIGZuKSwgZ3JvdXAgPSByZWZbMF0sIGZuID0gcmVmWzFdO1xuICAgIGlmIChldmVudCAmJiAhaXNTdHJpbmcoZXZlbnQpKSB7XG4gICAgICByZXR1cm4gZXJyb3IodGhpcywgJ29mZicsIDEpO1xuICAgIH1cbiAgICBpZiAoIWlzU3RyaW5nKGdyb3VwKSkge1xuICAgICAgcmV0dXJuIGVycm9yKHRoaXMsICdvZmYnLCA1KTtcbiAgICB9XG4gICAgaWYgKGZuICYmICFpc0Z1bmN0aW9uKGZuKSkge1xuICAgICAgcmV0dXJuIGVycm9yKHRoaXMsICdvZmYnLCA2LCBldmVudCwgZ3JvdXApO1xuICAgIH1cbiAgICBpZiAoZXZlbnQgJiYgIXRoaXMuZ3JvdXBzW2dyb3VwXSkge1xuICAgICAgcmV0dXJuIGVycm9yKHRoaXMsICdvZmYnLCA3LCBldmVudCwgZ3JvdXApO1xuICAgIH1cbiAgICBpZiAoIWV2ZW50KSB7XG4gICAgICByZWYxID0gdGhpcy5ncm91cHNbZ3JvdXBdO1xuICAgICAgZm9yIChldmVudCBpbiByZWYxKSB7XG4gICAgICAgIGFjdGlvbnMgPSByZWYxW2V2ZW50XTtcbiAgICAgICAgcmVtb3ZlRm4oKTtcbiAgICAgIH1cbiAgICAgIGRlbGV0ZSB0aGlzLmdyb3Vwc1tncm91cF07XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaWYgKCEoYWN0aW9ucyA9IHRoaXMuZ3JvdXBzW2dyb3VwXVtldmVudF0pKSB7XG4gICAgICByZXR1cm4gZXJyb3IodGhpcywgJ29mZicsIDQsIGV2ZW50LCBncm91cCk7XG4gICAgfVxuICAgIGlmICghZm4pIHtcbiAgICAgIHJlbW92ZUZuKCk7XG4gICAgICBkZWxldGUgdGhpcy5ncm91cHNbZ3JvdXBdW2V2ZW50XTtcbiAgICAgIGlmICgwID09PSBvYmpMZW5ndGgodGhpcy5ncm91cHNbZ3JvdXBdKSkge1xuICAgICAgICBkZWxldGUgdGhpcy5ncm91cHNbZ3JvdXBdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmICgtMSA9PT0gKGluZGV4MSA9IGFjdGlvbnMuaW5kZXhPZihmbikpKSB7XG4gICAgICByZXR1cm4gZXJyb3IodGhpcywgJ29mZicsIDIsIGV2ZW50LCBncm91cCk7XG4gICAgfVxuICAgIGFjdGlvbnMuc3BsaWNlKGluZGV4MSwgMSk7XG4gICAgaWYgKGFjdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICBkZWxldGUgdGhpcy5ncm91cHNbZ3JvdXBdW2V2ZW50XTtcbiAgICB9XG4gICAgaWYgKDAgPT09IG9iakxlbmd0aCh0aGlzLmdyb3Vwc1tncm91cF0pKSB7XG4gICAgICBkZWxldGUgdGhpcy5ncm91cHNbZ3JvdXBdO1xuICAgIH1cbiAgICBpbmRleDIgPSB0aGlzLmV2ZW50c1tldmVudF0uaW5kZXhPZihmbik7XG4gICAgdGhpcy5ldmVudHNbZXZlbnRdLnNwbGljZShpbmRleDIsIDEpO1xuICAgIGlmICh0aGlzLmV2ZW50c1tldmVudF0ubGVuZ3RoID09PSAwKSB7XG4gICAgICBkZWxldGUgdGhpcy5ldmVudHNbZXZlbnRdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBNaW5pRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIGV2ZW50O1xuICAgIGFyZ3MgPSBBcnJheS5mcm9tKGFyZ3VtZW50cyk7XG4gICAgZXZlbnQgPSBhcmdzLnNoaWZ0KCk7XG4gICAgcmV0dXJuIF9lbWl0KHtcbiAgICAgIHNlbGY6IHRoaXMsXG4gICAgICBhcmdzOiBhcmdzLFxuICAgICAgZXZlbnQ6IGV2ZW50LFxuICAgICAgaW50ZXJuYWw6IGZhbHNlXG4gICAgfSk7XG4gIH07XG5cbiAgTWluaUV2ZW50RW1pdHRlci5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZW1pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGlzU3RyaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICByZXR1cm4gdHlwZW9mIGV2ZW50ID09PSAnc3RyaW5nJyB8fCBldmVudCBpbnN0YW5jZW9mIFN0cmluZztcbiAgfTtcblxuICBvYmpMZW5ndGggPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJztcbiAgfTtcblxuICBlcnJvciA9IGZ1bmN0aW9uKHNlbGYsIG5hbWUsIGlkLCBldmVudCwgZ3JvdXApIHtcbiAgICB2YXIgbXNnO1xuICAgIGlmICghc2VsZi5zZXR0aW5ncy5lcnJvcikge1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuICAgIG1zZyA9IFwiTWluaUV2ZW50RW1pdHRlciB+IFwiICsgbmFtZSArIFwiIH4gXCI7XG4gICAgaWYgKGlkID09PSAxKSB7XG4gICAgICBtc2cgKz0gXCJFdmVudCBuYW1lIG11c3QgYmUgYSBzdHJpbmdcIjtcbiAgICB9XG4gICAgaWYgKGlkID09PSAyKSB7XG4gICAgICBtc2cgKz0gXCJQcm92aWRlZCBmdW5jdGlvbiB0byByZW1vdmUgd2l0aCBldmVudCBcXFwiXCIgKyBldmVudCArIFwiXFxcIiBpbiBncm91cCBcXFwiXCIgKyBncm91cCArIFwiXFxcIiBpcyBub3QgZm91bmRcIjtcbiAgICB9XG4gICAgaWYgKGlkID09PSAzKSB7XG4gICAgICBtc2cgKz0gXCJFdmVudCB3YXMgbm90IHByb3ZpZGVkXCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gNCkge1xuICAgICAgbXNnICs9IFwiRXZlbnQgXFxcIlwiICsgZXZlbnQgKyBcIlxcXCIgZG9lcyBub3QgZXhpc3RcIjtcbiAgICB9XG4gICAgaWYgKGlkID09PSA1KSB7XG4gICAgICBtc2cgKz0gXCJQcm92aWRlZCBncm91cCBtdXN0IGJlIGEgc3RyaW5nXCI7XG4gICAgfVxuICAgIGlmIChpZCA9PT0gNikge1xuICAgICAgbXNnICs9IFwiVGhlIGxhc3QgcGFyYW0gcHJvdmlkZWQgd2l0aCBldmVudCBcXFwiXCIgKyBldmVudCArIFwiXFxcIiBhbmQgZ3JvdXAgXFxcIlwiICsgZ3JvdXAgKyBcIlxcXCIgaXMgZXhwZWN0ZWQgdG8gYmUgYSBmdW5jdGlvblwiO1xuICAgIH1cbiAgICBpZiAoaWQgPT09IDcpIHtcbiAgICAgIG1zZyArPSBcIlByb3ZpZGVkIEdyb3VwIFxcXCJcIiArIGdyb3VwICsgXCJcXFwiIGRvZXNuJ3QgaGF2ZSBhbnkgZXZlbnRzXCI7XG4gICAgfVxuICAgIGlmIChjb25zb2xlLndhcm4pIHtcbiAgICAgIGNvbnNvbGUud2Fybihtc2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICBvcHRpb25hbCA9IGZ1bmN0aW9uKGdyb3VwLCBmbikge1xuICAgIGlmICgoZm4gPT0gbnVsbCkgJiYgaXNGdW5jdGlvbihncm91cCkpIHtcbiAgICAgIGZuID0gZ3JvdXA7XG4gICAgICBncm91cCA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWdyb3VwKSB7XG4gICAgICAgIGdyb3VwID0gJyc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBbZ3JvdXAsIGZuXTtcbiAgfTtcblxuICBfZW1pdCA9IGZ1bmN0aW9uKGFyZykge1xuICAgIHZhciBhY3Rpb24sIGFyZ3MsIGV2ZW50LCBpLCBpbnRlcm5hbCwgbGVuLCBsaXN0LCBtc2csIHNlbGY7XG4gICAgc2VsZiA9IGFyZy5zZWxmLCBldmVudCA9IGFyZy5ldmVudCwgYXJncyA9IGFyZy5hcmdzLCBpbnRlcm5hbCA9IGFyZy5pbnRlcm5hbDtcbiAgICBpZiAoIWV2ZW50KSB7XG4gICAgICByZXR1cm4gZXJyb3Ioc2VsZiwgJ2VtaXQnLCAzKTtcbiAgICB9XG4gICAgaWYgKCFpc1N0cmluZyhldmVudCkpIHtcbiAgICAgIHJldHVybiBlcnJvcihzZWxmLCAnZW1pdCcsIDEpO1xuICAgIH1cbiAgICBpZiAoIShsaXN0ID0gc2VsZi5ldmVudHNbZXZlbnRdKSkge1xuICAgICAgcmV0dXJuIGVycm9yKHNlbGYsICdlbWl0JywgNCwgZXZlbnQpO1xuICAgIH1cbiAgICBpZiAoc2VsZi5zZXR0aW5ncy53b3JrZXIgJiYgIWludGVybmFsKSB7XG4gICAgICBzZWxmLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgICAgIGFyZ3M6IGFyZ3MsXG4gICAgICAgIGV2ZW50OiBldmVudFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzZWxmLnNldHRpbmdzLnRyYWNlKSB7XG4gICAgICAgIG1zZyA9IFwiTWluaUV2ZW50RW1pdHRlciB+IHRyYWNlIH4gXCIgKyBldmVudDtcbiAgICAgICAgaWYgKGNvbnNvbGUuZGVidWcpIHtcbiAgICAgICAgICBjb25zb2xlLmRlYnVnKG1zZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yIChpID0gMCwgbGVuID0gbGlzdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBhY3Rpb24gPSBsaXN0W2ldO1xuICAgICAgICBhY3Rpb24uYXBwbHkoYWN0aW9uLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgcmV0dXJuIE1pbmlFdmVudEVtaXR0ZXI7XG5cbn0pKCk7XG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIG1zZztcbiAgaWYgKCh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZSAhPT0gbnVsbCkgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICByZXR1cm4gbW9kdWxlLmV4cG9ydHMgPSBNaW5pRXZlbnRFbWl0dGVyO1xuICB9IGVsc2UgaWYgKHdpbmRvdykge1xuICAgIHJldHVybiB3aW5kb3cuTWluaUV2ZW50RW1pdHRlciA9IE1pbmlFdmVudEVtaXR0ZXI7XG4gIH0gZWxzZSB7XG4gICAgbXNnID0gXCJDYW5ub3QgZXhwb3NlIE1pbmlFdmVudEVtaXR0ZXJcIjtcbiAgICBpZiAoY29uc29sZS53YXJuKSB7XG4gICAgICByZXR1cm4gY29uc29sZS53YXJuKG1zZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhtc2cpO1xuICAgIH1cbiAgfVxufSkoKTtcbiJdfQ==
