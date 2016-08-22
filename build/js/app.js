var Dragify, Handler, MiniEventEmitter, msg,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MiniEventEmitter = require('mini-event-emitter');

Handler = require('./handler');

if (MiniEventEmitter == null) {
  msg = 'Dragify depends on the MiniEventEmitter.\nhttps://github.com/hawkerboy7/mini-event-emitter\nDefine it before Dragify';
  if (console.warn) {
    console.warn(msg);
  } else {
    console.log(msg);
  }
}

Dragify = (function(superClass) {
  extend(Dragify, superClass);

  function Dragify(containers, options) {
    var ref, ref1, x, y;
    this.containers = containers;
    Dragify.__super__.constructor.apply(this, arguments);
    this.options = {
      threshold: {
        x: 3,
        y: 3
      },
      transition: true
    };
    if ((options != null ? options.transition : void 0) != null) {
      this.options.transition = options.transition;
    }
    if ((x = options != null ? (ref = options.threshold) != null ? ref.x : void 0 : void 0) != null) {
      this.options.threshold.x = x;
    }
    if ((y = options != null ? (ref1 = options.threshold) != null ? ref1.y : void 0 : void 0) != null) {
      this.options.threshold.y = y;
    }
    new Handler(this);
  }

  return Dragify;

})(MiniEventEmitter);

module.exports = Dragify;
