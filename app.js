var interpolate = require('d3-interpolate');
var range = require('d3-array').range;
var color = require('d3-color');
var flatten = require('lodash.flatten');
var createProbable = require('probable').createProbable;
var RouteState = require('route-state');
var render = require('./dom/render');
var renderJSON = require('./dom/render-json');
var WireControl = require('./dom/wire-control');

// Pulls in a seedrandom that is global (window.Math.seedrandom).
// On the other hand, it does not try to pull in the huge Node crypto module.
require('./node_modules/seedrandom/seedrandom.min');

const numberOfSegments = 5;

var routeState;
var wireNumberOfColors;
var wireChroma;
var wireLuminence;

(function go() {
  routeState = RouteState({
    followRoute: followRoute,
    windowObject: window
  });

  wireNumberOfColors = WireControl({
    settingIdBase: 'numberOfColors',
    onSettingUpdate: routeState.addToRoute
  });
  wireChroma = WireControl({
    settingIdBase: 'chroma',
    onSettingUpdate: routeState.addToRoute
  });
  wireLuminence = WireControl({
    settingIdBase: 'luminence',
    onSettingUpdate: routeState.addToRoute
  });

  routeState.routeFromHash();
})();

function followRoute(routeDict) {
  if (!routeDict.seed) {
    routeState.addToRoute({ seed: new Date().toISOString() });
    return;
  } else if (isNaN(routeDict.numberOfColors)) {
    routeState.addToRoute({ numberOfColors: 300 });
    return;
  } else if (isNaN(routeDict.chroma)) {
    routeState.addToRoute({ chroma: 85 });
    return;
  } else if (isNaN(routeDict.luminence)) {
    routeState.addToRoute({ luminence: 55 });
    return;
  }

  // Sets Math.random to a RNG that uses this seed:
  window.Math.seedrandom(routeDict.seed);
  var probable = createProbable({ random: Math.random });

  var colors = getColors({
    numberOfColors: routeDict.numberOfColors,
    chroma: routeDict.chroma,
    luminence: routeDict.luminence
  });

  render({ colors, rootId: 'spectrum' });
  render({ colors: probable.shuffle(colors), rootId: 'swatches' });
  renderJSON({ colors });
  wireNumberOfColors({ currentValue: routeDict.numberOfColors });
  wireChroma({ currentValue: routeDict.chroma });
  wireLuminence({ currentValue: routeDict.luminence });
}

function getColors({ numberOfColors = 300, chroma, luminence }) {
  const segmentSize = ~~(numberOfColors / numberOfSegments);
  const hueRangePerSegment = 360 / numberOfSegments;

  return flatten(range(numberOfSegments).map(interpolateInSegment));

  // console.log(JSON.stringify(colors, null, 2));

  function interpolateInSegment(segmentIndex) {
    const startHue = segmentIndex * hueRangePerSegment;
    const endHue = (segmentIndex + 1) * hueRangePerSegment;
    var interpolator = interpolate.interpolateHcl(
      color.hcl(startHue, chroma, luminence),
      color.hcl(endHue, chroma, luminence)
    );
    return range(segmentSize)
      .map(i => interpolator(i / segmentSize))
      .map(s => color.hsl(s))
      .map(
        c =>
          `hsla(${c.h.toFixed(2)}, ${(c.s * 100).toFixed(2)}%, ${(
            c.l * 100
          ).toFixed(2)}%, ${c.opacity})`
      );
  }
}
