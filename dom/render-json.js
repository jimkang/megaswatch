function renderJSON({colors}) {
  document.getElementById('json').textContent = JSON.stringify(colors, null, '  ');
}

module.exports = renderJSON;
