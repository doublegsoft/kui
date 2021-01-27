function Couch(host, database) {
  this.host = host;
  this.database = database;
}

Couch.prototype.read = function (docId) {
  let url = this.host + '/' + this.database + '/' + docId;
  let method = 'POST';
  let result = this.request({
    url: url
  }, method);
  return result;
};

Couch.prototype.save = function(doc) {
  let url = this.host + '/' + this.database;
  let method = 'POST';
  if (doc.id) {
    url += '/' + doc.id + '?rev=' + doc.rev;
    doc.id = undefined;
    method = 'PUT';
  }
  let result = this.request({
    url: url,
    data: doc
  }, method);
  if (result.id) {
    doc.id = result.id;
    doc.rev = result.rev;
  } else {
    doc.error = result;
  }
  return doc;
};

Couch.prototype.upload = function(doc, file) {

};

Couch.prototype.request = function (opts, method) {
  let url = opts.url;
  let data = opts.data;
  let type = opts.type || 'json';
  let success = opts.success;
  let error = opts.error;

  let req  = new XMLHttpRequest();
  req.open(method, url, false);
  req.setRequestHeader("Content-Type", "application/json");
  req.onload = function () {
    let resp = req.responseText;
    if (type == 'json')
      try {
        resp = JSON.parse(resp);
      } catch (err) {
        if (error) error(resp);
        return;
      }
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
  return JSON.parse(req.responseText);
};

if (typeof module !== 'undefined')
  module.exports = Couch;