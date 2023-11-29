const http = require('http');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const formidable = require('formidable');
const hostname = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 9000;

http.createServer(function (request, response) {

  if (request.url == '/api/v3/common/upload' && request.method == 'POST') {
    let form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
      let now = moment().format('YYYYMMDD');
      let filepath = './dl/' + now + '/';
      if (!fs.existsSync(filepath))
        fs.mkdirSync(filepath);

      now = moment().format('YYYYMMDDhhmmss');
      filepath += now;
      let tempFilePath = files.file[0].filepath;
      filepath += path.extname(files.file[0].originalFilename);

      fs.copyFile(tempFilePath, filepath, fs.constants.COPYFILE_EXCL, err => {
        if (err) throw err;
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ webpath: filepath.substring(1) }, null, 2));
      });

    });
    return;
  }

  let filePath = request.url;
  let questionIndex = filePath.indexOf('?');
  if (questionIndex != -1) {
    filePath = filePath.substring(0, questionIndex);
  }
  if (filePath == '/') {
    filePath = './desktop/index.html';
  } else {
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
      filePath += '/index.html';
    } else {
      filePath = './' + filePath;
    }
  }

  let extname = String(path.extname(filePath)).toLowerCase();
  let mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
    '.ico' : 'image/x-icon'
  };

  let contentType = mimeTypes[extname] || 'application/octet-stream';

  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
    filePath += '/index.html';
    contentType = 'text/html';
  }

  fs.readFile(filePath, function(error, content) {
    if (error) {
      if(error.code == 'ENOENT') {
        fs.readFile('public/404.html', function(error, content) {
          response.writeHead(404, { 'Content-Type': 'text/html' });
          response.end(content, 'utf-8');
        });
      }
      else {
        response.writeHead(500);
        response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
      }
    }
    else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });

}).listen(port);
console.log(`Server running at http://${hostname}:${port}/`);