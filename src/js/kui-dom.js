var dom = {};

dom.value = function(id, val) {
  const elm = document.getElementById(id);
  if (val) {
    elm.value = val;
    return;
  }
  return elm.value.trim();
};

dom.empty = function(id) {
  const elm = document.getElementById(id);
  if (elm.value) {
    elm.value = '';
  } else {
    elm.innerHTML = '';
  }
};

dom.valid = function(id) {
  const elm = document.getElementById(id);
  if (typeof elm.value === 'undefined' || elm.value == null || elm.value.trim() == '')
    return false;
  return true;
};