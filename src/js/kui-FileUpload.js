function FileUpload(opts) {
  this.buttonId = opts.buttonId;
  this.fileId = opts.fileId;

  this.uploadUrl = opts.url.upload;
  this.downloadUrl = opts.url.download;

  this.normalText = '<i class="fas fa-arrow-circle-up"></i>上传';
  this.loadingText = '<i class="fa fa-spinner fa-spin"></i>文件上传中……';

  this.initialize();
};

FileUpload.prototype.render = function(containerId, params) {
  this.container = document.getElementById(containerId);
  this.container.innerHTML = '';

  let ul = document.createElement('ul');
  ul.classList.add('list-group');

  this.container.append(ul);
};

FileUpload.prototype.initialize = function() {
  let button = document.getElementById(this.buttonId);
  let file = document.getElementById(this.fileId);
  let self = this;

  button.addEventListener('click', function(ev) {
    file.click(ev);
  });

  file.addEventListener('change', function(ev) {
    if (!('files' in file)) return;
    if (file.files.length == 0) return;

    let form = new FormData();
    form.append("file", file.files[0]);

    button.innerHTML = self.loadingText;
    button.classList.add('disabled');

    let ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", function (ev) {
      let loaded = ev.loaded;
      let total = ev.total;
    }, false);

    // complete
    ajax.addEventListener("load", function(ev) {
      let resp = JSON.parse(ev.target.responseText);
      let data = resp.data;
      let input = document.createElement('input');
      input.setAttribute('name', '');
      input.setAttribute('type', 'hidden');
      input.setAttribute('value', data.id);
      self.container.append(input);
      self.addFileItem(file.files[0]);
      button.classList.remove('disabled');
      button.innerHTML = self.normalText;
    }, false);

    // error
    ajax.addEventListener("error", function() {
      dialog.error('文件上传出错！');
      button.classList.remove('disabled');
      button.innerHTML = self.normalText;
    }, false);

    // abort
    ajax.addEventListener("abort", function() {
      button.classList.remove('disabled');
      button.innerHTML = self.normalText;
    }, false);

    ajax.open("POST", self.uploadUrl);
    ajax.send(form);

  });
};

FileUpload.prototype.addFileItem = function(fl) {
  let ul = this.container.querySelector('ul');
  let li = document.createElement('li');
  li.classList.add('list-group-item');
  li.style.padding = '0';

  let a = document.createElement('a');
  a.classList.add('btn', 'btn-link');
  a.setAttribute('href', 'javascript:void(0)');
  a.text = fl.name;

  li.append(a);
  ul.append(li);
};