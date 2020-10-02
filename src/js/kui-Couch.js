
function CouchDB(host, database) {
  this.host = host;
  this.database = database;
}

CouchDB.prototype.find = function () {

};

if (typeof module !== 'undefined')
  module.exports = CouchDB;