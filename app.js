var interpolate = require('d3-interpolate');
var range = require('d3-array').range;
var color = require('d3-color');
var flatten = require('lodash.flatten');
var createProbable = require('probable').createProbable;
var RouteState = require('route-state');
var render = require('./dom/render');
var renderJSON = require('./dom/render-json');

// Pulls in a seedrandom that is global (window.Math.seedrandom). 
// On the other hand, it does not try to pull in the huge Node crypto module.
require('./node_modules/seedrandom/seedrandom.min');

const numberOfSegments = 5;

var routeState;

((function go() {
  routeState = RouteState({
    followRoute: followRoute,
    windowObject: window
  });
  routeState.routeFromHash();
})());

function followRoute(routeDict) {
  if (!routeDict.seed) {
    routeState.addToRoute({seed: (new Date()).toISOString()});
    return;
  }

  // Sets Math.random to a RNG that uses this seed:
  window.Math.seedrandom(routeDict.seed);
  var probable = createProbable({random: Math.random});

  var colors = getColors({
    probable,
    numberOfColors: routeDict.numberOfColors,
  });


  render({colors, rootId: 'spectrum'});
  render({colors: probable.shuffle(colors), rootId: 'swatches'});
  renderJSON({colors});
}


function getColors({probable, numberOfColors = 300, }) {
  const segmentSize = ~~(numberOfColors/numberOfSegments);
  const hueRangePerSegment = 360/numberOfSegments;
  const chroma = 85;
  const luminence = 55;
  const swatchWidth = 20;

  return flatten(range(numberOfSegments).map(interpolateInSegment));

  // console.log(JSON.stringify(colors, null, 2));

  function interpolateInSegment(segmentIndex) {
    const startHue = segmentIndex * hueRangePerSegment;
    const endHue = (segmentIndex + 1) * hueRangePerSegment;
    var interpolator = interpolate.interpolateHcl(
      color.hcl(startHue, chroma, luminence),
      color.hcl(endHue, chroma, luminence)
    );
    return range(segmentSize).map(i => interpolator(i/segmentSize));
  }
}
