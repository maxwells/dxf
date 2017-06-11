'use strict';

var logger = require('../util/logger');
var handlers = [require('./entity/point'), require('./entity/line'), require('./entity/lwpolyline'), require('./entity/polyline'), require('./entity/vertex'), require('./entity/vertex'), require('./entity/circle'), require('./entity/arc'), require('./entity/ellipse'), require('./entity/spline'), require('./entity/solid'), require('./entity/mtext'), require('./entity/insert')].reduce(function (acc, mod) {
  acc[mod.TYPE] = mod;
  return acc;
}, {});

module.exports = function (tuples) {

  var entities = [];
  var entityGroups = [];
  var currentEntityTuples = void 0;

  // First group them together for easy processing
  tuples.forEach(function (tuple) {
    var type = tuple[0];
    if (type === 0) {
      currentEntityTuples = [];
      entityGroups.push(currentEntityTuples);
    }
    currentEntityTuples.push(tuple);
  });

  var currentPolyline = void 0;
  entityGroups.forEach(function (tuples) {
    var entityType = tuples[0][1];
    var contentTuples = tuples.slice(1);

    if (handlers.hasOwnProperty(entityType)) {
      var e = handlers[entityType].process(contentTuples);
      // "POLYLINE" cannot be parsed in isolation, it is followed by
      // N "VERTEX" entities and ended with a "SEQEND" entity.
      // Essentially we convert POLYLINE to LWPOLYLINE - the extra
      // vertex flags are not supported
      if (entityType === 'POLYLINE') {
        currentPolyline = e;
        entities.push(e);
      } else if (entityType === 'VERTEX') {
        if (currentPolyline) {
          currentPolyline.vertices.push(e);
        } else {
          logger.error('ignoring invalid VERTEX entity');
        }
      } else if (entityType === 'SEQEND') {
        currentPolyline = undefined;
      } else {
        // All other entities
        entities.push(e);
      }
    } else {
      logger.warn('unsupported type in ENTITIES section:', entityType);
    }
  });

  return entities;
};
