function ImageUpload(opts) {
  // upload url
  this.fetchUrl = opts.url.fetch;
  this.usecase = opts.usecase;
  this.uploadUrl = opts.url.upload;
  this.local = opts.local;
  this.params = opts.params;
  // 第三方拍照预留接口
  this.capture = opts.capture;
}

ImageUpload.prototype.fetch = function (containerId) {
  let self = this;
  xhr.post({
    url: this.fetchUrl,
    data: this.params || {},
    success: function (resp) {
      self.local = resp.data;
      self.render(containerId);
    }
  });
};

ImageUpload.prototype.append = function (item) {
  let ul = dom.find('ul', this.container);
  let li = dom.create('li', 'list-group-item', 'p-0');
  li.style.height = '100px';
  li.style.width = 'calc(98%/ 3)';
  li.style.flexGrow = '0';
  let link = dom.create('a', 'btn', 'btn-link', 'text-info', 'p-0');

  li.appendChild(link);
  ul.appendChild(li);

  let rect = li.getBoundingClientRect();

  let img = null;
  if (item.filepath) {
    let url = item.filepath.replace('/www/', '');
    link.setAttribute('data-img-url', url);
    img = dom.element('<img widget-id="widget-' + url + '" src="' + url + '">');
  } else {
    img = dom.element('<img src="' + item.imgdata + '">');
  }
  img.setAttribute('width', rect.width + 'px');
  img.setAttribute('height', rect.height + 'px');
  link.appendChild(img);

  dom.bind(link, 'click', function() {
    let url = link.getAttribute('data-img-url');
    let viewerContainer = dom.find('.viewer-container');
    if (viewerContainer != null) {
      viewerContainer.remove();
    }

    let img = dom.find('img[widget-id="widget-' + url + '"]');
    let viewer = new Viewer(img);
    viewer.show();
  });
};

ImageUpload.prototype.render = function(containerId) {
  let self = this;
  if (typeof this.local === 'undefined') {
    this.fetch(containerId);
    return;
  }
  if (typeof containerId === 'string')
    this.container = document.querySelector(containerId);
  else
    this.container = containerId;
  this.container.innerHTML = '';

  let div = dom.create('div', 'input-group', 'full-width');

  let input = dom.create('input', 'form-control');
  input.setAttribute('name', this.name);
  input.setAttribute('readonly', true);

  let fileinput = dom.create('input');
  fileinput.setAttribute('type', 'file');
  fileinput.style.display = 'none';
  let upload = dom.element(`
    <div class="input-group-append">
      <span class="input-group-text pointer">
        <i class="fas fa-upload text-primary"></i>
      </span>
      <span class="input-group-text pointer">
        <i class="fas fa-camera text-primary"></i>
      </span>
    </div>`
  );
  // 有拍照功能
  if (!this.capture) {
    upload.children[1].remove();
  } else {
    upload.children[1].addEventListener('click', function() {
      self.capture(function(path, imgdata) {
        let params = {};
        utils.clone(self.params, params);
        params.filedata = imgdata;
        params.fileext = path.substring(path.lastIndexOf('.') + 1);
        xhr.post({
          url: '/api/v3/common/image',
          params: params,
          success: function(resp) {
            let item = resp.data;
            item.filename = item.filepath.substring(item.filepath.lastIndexOf('/') + 1);
            self.append(item);
          }
        })
      });
    });
  }
  upload.children[0].addEventListener('click', function() {
    fileinput.click();
  });
  fileinput.addEventListener('change', function(event) {
    event.preventDefault();
    event.stopPropagation();
    input.value = fileinput.files[0].name;
    xhr.upload({
      url: self.uploadUrl,
      params: self.params,
      file: this.files[0],
      success: function(resp) {
        let item = resp.data;
        item.filename = item.filepath.substring(item.filepath.lastIndexOf('/') + 1);
        self.append(item);
      }
    });
  });
  div.appendChild(fileinput);
  div.appendChild(input);
  div.appendChild(upload);
  this.container.append(div);

  let ul = dom.create('ul', 'list-group', 'full-width', 'overflow-hidden');
  ul.style.display = 'flex';
  ul.style.flexWrap = 'wrap';
  ul.style.flexDirection = 'row';
  this.container.appendChild(ul);
  for (let i = 0; i < this.local.length; i++) {
    let item = this.local[i];
    this.append(item);
  }
};