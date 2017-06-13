'use strict';

var pd = require('pretty-data').pd;

var BoundingBox = require('./BoundingBox');
var denormalise = require('./denormalise');
var entityToPolyline = require('./entityToPolyline');
var colors = require('./util/colors');
var logger = require('./util/logger');

function polylineToPath(rgb, polyline) {
  var color24bit = rgb[2] | rgb[1] << 8 | rgb[0] << 16;
  var prepad = color24bit.toString(16);
  for (var i = 0, il = 6 - prepad.length; i < il; ++i) {
    prepad = '0' + prepad;
  }
  var hex = '#' + prepad;

  // SVG is white by default, so make white lines black
  if (hex === '#ffffff') {
    hex = '#000000';
  }

  var d = polyline.reduce(function (acc, point, i) {
    acc += i === 0 ? 'M' : 'L';
    acc += point[0] + ',' + point[1];
    return acc;
  }, '');
  return '<path fill="none" stroke="' + hex + '" stroke-width="0.1%" d="' + d + '"/>';
}

/**
 * Convert the interpolate polylines to SVG
 */
module.exports = function () {
  var defaultRGB = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [0, 0, 0];

  var paths = [];
  var bbox = new BoundingBox();

  for (var _len = arguments.length, parseds = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    parseds[_key - 1] = arguments[_key];
  }

  parseds.forEach(function (parsed) {
    var entities = denormalise(parsed);
    var polylines = entities.map(function (e) {
      return entityToPolyline(e);
    });

    polylines.forEach(function (polyline) {
      polyline.forEach(function (point) {
        bbox.expandByPoint(point[0], point[1]);
      });
    });

    polylines.forEach(function (polyline, i) {
      var entity = entities[i];
      var layerTable = parsed.tables.layers[entity.layer];

      var rgb = layerTable && colors[layerTable.colorNumber];
      if (rgb === undefined) {
        rgb = defaultRGB;
      }

      var p2 = polyline.map(function (p) {
        return [p[0], bbox.maxY - p[1]];
      });
      paths.push(polylineToPath(rgb, p2));
    });
  });

  var svgString = '<?xml version="1.0"?>';
  svgString += '<svg xmlns="http://www.w3.org/2000/svg"';
  svgString += ' xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"';
  svgString += ' preserveAspectRatio="xMinYMin meet"';
  svgString += ' viewBox="' + (-1 + bbox.minX) + ' ' + -1 + ' ' + (bbox.width + 2) + ' ' + (bbox.height + 2) + '"';
  svgString += ' width="100%" height="100%">' + paths + '</svg>';
  return pd.xml(svgString);
};
