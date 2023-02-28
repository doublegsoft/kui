
const FILE_TYPE_EXCEL = '<i class="far fa-file-excel"></i>';
const FILE_TYPE_WORD = '<i class="far fa-file-word"></i>';
const FILE_TYPE_POWERPOINT = '<i class="far fa-file-powerpoint"></i>';
const FILE_TYPE_PDF = '<i class="far fa-file-pdf"></i>';
const FILE_TYPE_VIDEO = '<i class="far fa-file-video"></i>';
const FILE_TYPE_AUDIO = '<i class="far fa-file-audio"></i>';
const FILE_TYPE_IMAGE = '<i class="far fa-file-image"></i>';
const FILE_TYPE_ARCHIVE = '<i class="far fa-file-archive"></i>';
const FILE_TYPE_FILE = '<i class="far fa-file-alt"></i>';

function FileUpload(opts) {
  // upload url
  this.fetchUrl = opts.url.fetch;
  this.usecase = opts.usecase;
  this.uploadUrl = opts.url.upload;
  this.local = opts.local;
  this.params = opts.params;
}

FileUpload.prototype.fetch = function (containerId) {
  if (!this.fetchUrl) {
    this.local = [];
    this.render(containerId);
    return;
  }
  let self = this;
  xhr.post({
    url: this.fetchUrl,
    success: function (resp) {
      self.local = resp.data;
      self.render(containerId);
    }
  });
};

FileUpload.prototype.append = function (item) {
  if (!item) return;
  let url = '';
  if (item.filepath) {
    item.filepath.replace('/www/', '');
  }
  let ul = dom.find('ul', this.container);
  let li = dom.create('li', 'list-group-item', 'list-group-item-input');
  let link = dom.create('a', 'btn', 'btn-link', 'text-info');
  link.style.paddingBottom = '8px';
  link.innerText = item.filename;
  let icon = null;
  if (item.extension === '.xls' || item.extension === '.xlsx') {
    icon = dom.element(FILE_TYPE_EXCEL);
  } else if (item.extension === '.doc' || item.extension === '.docx') {
    icon = dom.element(FILE_TYPE_WORD);
  } else if (item.extension === '.ppt' || item.extension === '.pptx') {
    icon = dom.element(FILE_TYPE_POWERPOINT);
  } else if (item.extension === '.pdf') {
    icon = dom.element(FILE_TYPE_PDF);
  } else if (item.extension === '.png' || item.extension === '.jpg') {
    icon = dom.element(FILE_TYPE_IMAGE);
  } else {
    icon = dom.element(FILE_TYPE_FILE);
  }
  li.appendChild(icon);
  li.appendChild(link);
  link.setAttribute('data-img-url', url);
  let img = dom.element('<img widget-id="widget-' + url + '" src="' + url + '" width="48" height="48" style="display: none;">');
  li.appendChild(img);
  ul.appendChild(li);

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

FileUpload.prototype.render = function(containerId) {
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
    </div>`
  );
  upload.addEventListener('click', function() {
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
  this.container.appendChild(ul);
  for (let i = 0; i < this.local.length; i++) {
    let item = this.local[i];
    this.append(item);
  }
};