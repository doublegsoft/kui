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