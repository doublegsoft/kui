
const FILE_TYPE_EXCEL = '<i class="far fa-file-excel"></i>';
const FILE_TYPE_WORD = '<i class="far fa-file-word"></i>';
const FILE_TYPE_POWERPOINT = '<i class="far fa-file-powerpoint"></i>';
const FILE_TYPE_PDF = '<i class="far fa-file-pdf"></i>';
const FILE_TYPE_VIDEO = '<i class="far fa-file-video"></i>';
const FILE_TYPE_AUDIO = '<i class="far fa-file-audio"></i>';
const FILE_TYPE_IMAGE = '<i class="far fa-file-image"></i>';
const FILE_TYPE_ARCHIVE = '<i class="far fa-file-archive"></i>';
const FILE_TYPE_FILE = '<i class="far fa-file-alt"></i>';

function FileList(opts) {
  // upload url
  this.fetchUrl = opts.url.fetch;
  this.usecase = opts.usecase;
  this.uploadUrl = opts.url.upload
  this.local = opts.local || [];
}

FileList.prototype.fetch = function (containerId) {
  let self = this;
  xhr.post({
    url: this.fetchUrl,
    usecase: this.usecase,
    success: function (resp) {
      self.local = resp.data;
      self.render(containerId);
    }
  });
};

FileList.prototype.append = function (item) {
  let ul = dom.find('ul', this.container);
  let li = dom.create('li', 'list-group-item', 'list-group-item-input');
  let link = dom.create('link', 'btn', 'btn-link');
  link.innerText = 'item.name';
  let icon = null;
  if (item.extension === '.xls' || item.extension === '.xlsx') {
    icon = dom.element(FILE_TYPE_EXCEL);
  } else if (item.extension === '.doc' || item.extension === '.docx') {
    icon = dom.element(FILE_TYPE_EXCEL);
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
};

FileList.prototype.render = function(containerId) {
  if (typeof this.local === 'undefined') {
    this.fetch(containerId);
    return;
  }
  if (typeof containerId === 'string')
    this.container = document.querySelector(containerId);
  else
    this.container = container;
  this.container.innerHTML = '';
  let ul = dom.create('ul', 'list-group');
  this.container.appendChild(ul);
  for (let i = 0; i < this.local.length; i++) {
    let item = this.local[i];
    this.append(item);
  }
};