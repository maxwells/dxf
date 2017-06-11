'use strict';

var cloneDeep = require('lodash.clonedeep');

var logger = require('./util/logger');

module.exports = function (parseResult) {

  var blocksByName = parseResult.blocks.reduce(function (acc, b) {
    acc[b.name] = b;
    return acc;
  }, {});

  var gatherEntities = function gatherEntities(entities, transforms) {
    var current = [];
    entities.forEach(function (e) {
      if (e.type === 'INSERT') {
        var insert = e;
        var block = blocksByName[insert.block];
        if (!block) {
          logger.error('no block found for insert. block:', insert.block);
          return;
        }
        var t = {
          x: insert.x + block.x,
          y: insert.y + block.y,
          xScale: insert.xscale,
          yScale: insert.yscale,
          rotation: insert.rotation
        };
        // Add the insert transform and recursively add entities
        var transforms2 = transforms.slice(0);
        transforms2.push(t);

        // Use the insert layer
        var blockEntities = block.entities.map(function (be) {
          var be2 = cloneDeep(be);
          be2.layer = insert.layer;
          return be2;
        });
        current = current.concat(gatherEntities(blockEntities, transforms2));
      } else {
        // Top-level entity. Clone and add the transforms
        // The transforms are reversed so they occur in
        // order of application - i.e. the transform of the
        // top-level insert is applied last
        var e2 = cloneDeep(e);
        e2.transforms = transforms.slice().reverse();
        current.push(e2);
      }
    });
    return current;
  };

  return gatherEntities(parseResult.entities, []);
};
