var utils = {};

/**
 * 
 */
utils.append = function (container, html) {
  var range = document.createRange();
  var fragment = range.createContextualFragment(html);
  container.innerHTML = '';
  container.appendChild(fragment);
};

utils.message = function (errors) {
  if (!errors && errors.length == 0) {
    return;
  }
  var ret = '';
  for (var i = 0; i < errors.length; i++) {
    ret += errors[i].message + '<br>';
  }
  return ret;
};

utils.prompt = function (errors) {
  if (!errors && errors.length == 0) {
    return;
  }
  for (var i = 0; i < errors.length; i++) {
    $(errors[i].element).addClass('is-invalid');
  }
};