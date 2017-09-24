function WireControl({settingIdBase, onSettingUpdate}) {
  var eventListenerAdded = false;
  var field = document.getElementById(settingIdBase + '-field');
  var text = document.getElementById(settingIdBase + '-text');
  return wireControl;

  function wireControl({currentValue}) {
    field.value = currentValue;
    text.textContent = currentValue;
    if (!eventListenerAdded) {
      field.addEventListener('change', onFieldChange);
      eventListenerAdded = true;
    }

    function onFieldChange() {
      text.textContent = field.value;
      var updateObject = {};
      updateObject[settingIdBase] = field.value;
      onSettingUpdate(updateObject);
    }
  }
}

module.exports = WireControl;
