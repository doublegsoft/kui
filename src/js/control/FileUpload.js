
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
  this.name = opts.name;
  this.fetchUrl = opts.url.fetch;
  this.usecase = opts.usecase;
  this.uploadUrl = opts.url.upload || '/api/v3/common/upload';
  this.local = opts.local;
  this.params = opts.params;
  this.onRemove = opts.onRemove || function (model) {};
}

FileUpload.prototype.fetch = async function (containerId) {
  if (!this.fetchUrl) {
    this.local = [];
    this.render(containerId);
    return;
  }
  let self = this;
  self.local = await xhr.promise({
    url: this.fetchUrl,
    params: self.params,
  });
  self.render(containerId);
};

FileUpload.prototype.append = function (item) {
  if (!item) return;
  let url = '';
  if (item.filepath) {
    item.filepath = item.filepath.replace('/www/', '');
  }
  url = item.filepath;
  let ul = dom.find('ul', this.container);
  let li = dom.create('li', 'list-group-item', 'list-group-item-input');
  li.style.lineHeight = '32px';

  let div = dom.templatize(`
    <div class="full-width d-flex">
      <a class="btn-link">
        <i class="far fa-file-alt mr-2"></i>
      </a>
      <span class="text-info" style="padding-bottom: 8px;">{{filename}}</span>
      <a class="btn-link ml-auto pointer">
        <i class="fas fa-trash-alt text-danger"></i>
      </a>
    </div>
  `, item);
  let link = div.children[1];
  let remove = div.children[2];
  // let link = dom.create('span', 'text-info');
  // link.style.paddingBottom = '8px';
  // link.innerText = item.filename;
  // let icon = null;
  // if (item.extension === 'xls' || item.extension === 'xlsx') {
  //   icon = dom.element(FILE_TYPE_EXCEL);
  // } else if (item.extension === 'doc' || item.extension === 'docx') {
  //   icon = dom.element(FILE_TYPE_WORD);
  // } else if (item.extension === 'ppt' || item.extension === 'pptx') {
  //   icon = dom.element(FILE_TYPE_POWERPOINT);
  // } else if (item.extension === 'pdf') {
  //   icon = dom.element(FILE_TYPE_PDF);
  // } else if (item.extension === 'png' || item.extension === 'jpg') {
  //   icon = dom.element(FILE_TYPE_IMAGE);
  // } else {
  //   icon = dom.element(FILE_TYPE_FILE);
  // }
  // icon.classList.add('mr-2');

  // li.appendChild(icon);
  // li.appendChild(link);
  li.appendChild(div);
  link.setAttribute('data-img-url', item.filepath);
  link.setAttribute('data-file-path', item.filepath);
  link.setAttribute('data-file-name', item.filename);
  link.setAttribute('data-file-type', item.type);
  link.setAttribute('data-file-size', item.size);
  link.setAttribute('data-file-ext', item.extension);
  if (item.storedFileId) {
    link.setAttribute('data-file-id', item.storedFileId);
  }

  li.setAttribute('data-file-path', item.filepath);
  li.setAttribute('data-file-name', item.filename);
  li.setAttribute('data-file-type', item.type);
  li.setAttribute('data-file-size', item.size);
  li.setAttribute('data-file-ext', item.extension);
  if (item.storedFileId) {
    li.setAttribute('data-file-id', item.storedFileId);
  }
  ul.appendChild(li);

  dom.bind(remove, 'click', ev => {
    let li = dom.ancestor(ev.target, 'li');
    let fileId = li.getAttribute('data-file-id');
    dialog.confirm('确定删除此附件？', () => {
      li.remove();
      if (this.onRemove) {
        this.onRemove(fileId);
      }
    });
  });
};

FileUpload.prototype.render = async function(containerId) {
  let self = this;
  if (typeof this.local === 'undefined') {
    await this.fetch(containerId);
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
      success: resp => {
        let item = resp.data;
        item.filename = this.files[0].name;
        let idx = item.filename.lastIndexOf('.');
        let ext = '';
        if (idx != -1) {
          ext = input.value.substring(input.value.lastIndexOf('.') + 1);
        }
        item.filename = item.filename.replaceAll('/www', '');
        item.type = this.files[0].type;
        item.size = this.files[0].size;
        item.extension = ext;
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