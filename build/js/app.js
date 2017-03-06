var Dragify, Grid, Handler, MiniEventEmitter, log,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MiniEventEmitter = require("mini-event-emitter");

Grid = require("./grid");

Handler = require("./handler");

log = function(msg) {
  if (console.warn) {
    return console.warn(msg);
  } else {
    return console.log(msg);
  }
};

if (MiniEventEmitter == null) {
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
      return log("Dragify ~ You provided neither the `containers` array nor the 'isContainer` function. At least one is required.");
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
    new Grid(this);
    new Handler(this);
  }

  return Dragify;

})(MiniEventEmitter);

module.exports = Dragify;
