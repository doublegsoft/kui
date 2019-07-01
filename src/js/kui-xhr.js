/**
 * xhr will replace ajax which encapsulates jquery ajax in kui framework.
 * 
 * @since 2.0
 * 
 * @version 1.0.0 - Created on Jan 26, 2019.
 */
var xhr = {};

/**
 * @private
 */
xhr.request = function (opts, method) {

  var url = opts.url;
  var data = opts.data;
  var type = opts.type || 'json';
  var success = opts.success;
  var error = opts.error;

  var req  = new XMLHttpRequest();
  req.open(method, url, false);
  req.setRequestHeader("Content-Type", "application/json");
  req.onload = function () {
    var resp = req.responseText;
    if (type == 'json') 
      resp = JSON.parse(resp);
    if (req.readyState == 4 && req.status == "200") {
      if (success) success(resp);
    } else {
      if (error) error(resp);
    }
  }
  if (data)
    req.send(JSON.stringify(data));
  else 
    req.send(null);
};

/**
 * @see xhr.request
 */
xhr.get = function (opts) {
  xhr.request(opts, 'GET');
};

xhr.post = function (opts) {
  xhr.request(opts, 'POST');
};

xhr.put = function (opts) {
  xhr.request(opts, 'PUT');
};

xhr.delete = function (opts) {
  xhr.request(opts, 'DELETE');
};

xhr.connect = function (opts) {
  xhr.request(opts, 'CONNECT');
};

xhr.postx = function (opts) {

  var url = opts.url;
  var data = opts.data;
  var type = opts.type || 'json';
  var success = opts.success;
  var error = opts.error;

  // var result = await new Promise(resolved => {
  //   var req  = new XMLHttpRequest();
  //   req.open(method, url, true);
  //   req.onload = function () {
  //     var resp = req.responseText;
  //     if (type == 'json') 
  //       resp = JSON.parse(resp);
  //     if (req.readyState == 4 && req.status == "200") {
  //       if (success) success(resp);
  //     } else {
  //       if (error) error(resp);
  //     }
  //   }
  // });
}