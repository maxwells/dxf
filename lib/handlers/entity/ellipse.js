'use strict';

var common = require('./common');

var TYPE = 'ELLIPSE';

module.exports.TYPE = TYPE;

module.exports.process = function (tuples) {

  return tuples.reduce(function (entity, tuple) {
    var type = tuple[0];
    var value = tuple[1];
    switch (type) {
      case 10:
        entity.x = value;
        break;
      case 11:
        entity.majorX = value;
        break;
      case 20:
        entity.y = value;
        break;
      case 21:
        entity.majorY = value;
        break;
      case 30:
        entity.z = value;
        break;
      case 31:
        entity.majorZ = value;
        break;
      case 40:
        entity.axisRatio = value;
        break;
      case 41:
        entity.startAngle = value;
        break;
      case 42:
        entity.endAngle = value;
        break;
      default:
        Object.assign(entity, common(type, value));
        break;
    }
    return entity;
  }, {
    type: TYPE
  });
};
