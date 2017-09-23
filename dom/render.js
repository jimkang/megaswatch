var d3 = require('d3-selection');

function render({colors, rootId}) {
  var itemRoot = d3.select('#' + rootId);
  var items = itemRoot.selectAll('div').data(colors);
  items.exit().remove();
  var newItems = items.enter().append('div');
  var updateItems = newItems.merge(items);
  updateItems.style('background-color', x => x);
}

module.exports = render;
