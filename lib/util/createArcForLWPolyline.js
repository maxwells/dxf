'use strict';

var v2 = require('vecks').vec2;

/**
 * Create the arcs point for a LWPOLYLINE. The start and end are excluded
 *
 * See diagram.png for description of points and angles used.
 */
module.exports = function (from, to, bulge, resolution) {
  // Resolution in degrees
  if (!resolution) {
    resolution = 5;
  }

  // If the bulge is < 0, the arc goes clockwise. So we simply
  // reverse a and b and invert sign
  // Bulge = tan(theta/4)
  var theta = void 0;
  var a = void 0;
  var b = void 0;

  if (bulge < 0) {
    theta = Math.atan(-bulge) * 4;
    a = from;
    b = to;
  } else {
    // Default is counter-clockwise
    theta = Math.atan(bulge) * 4;
    a = to;
    b = from;
  }

  var ab = v2.sub(b, a);
  var l_ab = v2.length(ab);
  var c = v2.add(a, v2.multiply(ab, 0.5));

  // Distance from center of arc to line between form and to points
  var l_cd = Math.abs(l_ab / 2 / Math.tan(theta / 2));

  var norm_ab = v2.norm(ab);

  var d = void 0;
  if (theta < Math.PI) {
    var norm_dc = [norm_ab[0] * Math.cos(Math.PI / 2) - norm_ab[1] * Math.sin(Math.PI / 2), norm_ab[1] * Math.cos(Math.PI / 2) + norm_ab[0] * Math.sin(Math.PI / 2)];

    // D is the center of the arc
    d = v2.add(c, v2.multiply(norm_dc, -l_cd));
  } else {
    var norm_cd = [norm_ab[0] * Math.cos(Math.PI / 2) - norm_ab[1] * Math.sin(Math.PI / 2), norm_ab[1] * Math.cos(Math.PI / 2) + norm_ab[0] * Math.sin(Math.PI / 2)];

    // D is the center of the arc
    d = v2.add(c, v2.multiply(norm_cd, l_cd));
  }

  // Add points between start start and eng angle relative
  // to the center point
  var startAngle = Math.atan2(b[1] - d[1], b[0] - d[0]) / Math.PI * 180;
  var endAngle = Math.atan2(a[1] - d[1], a[0] - d[0]) / Math.PI * 180;
  if (endAngle < startAngle) {
    endAngle += 360;
  }
  var r = v2.length(v2.sub(b, d));

  var startInter = Math.floor(startAngle / resolution) * resolution + resolution;
  var endInter = Math.ceil(endAngle / resolution) * resolution - resolution;

  var points = [];
  for (var i = startInter; i <= endInter; i += resolution) {
    points.push(v2.add(d, [Math.cos(i / 180 * Math.PI) * r, Math.sin(i / 180 * Math.PI) * r]));
  }
  // Maintain the right ordering to join the from and to points
  if (bulge < 0) {
    points.reverse();
  }
  return points;
};
