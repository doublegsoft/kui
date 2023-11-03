function Images(opts) {
  // 只读
  this.readonly = opts.readonly === true;
  this.width = opts.width || '80';
}

Images.prototype.render = function (containerId) {
  this.container = dom.find(containerId);

  if (this.readonly === false) {
    let plus = this.createPlusElement();
    this.container.appendChild(plus);
  }
};

Images.prototype.createPlusElement = function () {
  this.plus = dom.templatize(`
    <div class="d-flex align-items-center justify-content-center pointer" 
                style="height: {{width}}px; width: {{width}}px; border: 1px solid #eee;">
      <i class="fas fa-plus" style="color: #bbb;"></i>
      <input type="file" accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
             style="display: none">
    </div>
  `, this);
  let input = dom.find('input', this.plus);
  input.onchange = ev => {
    if (!input.files || input.files.length == 0) return;
    let img = input.files[0];
    let reader = new FileReader();
    reader.onload = () => {
      this.appendImage({
        url: reader.result,
      })
    };
    reader.readAsDataURL(img);
  };
  dom.bind(this.plus, 'click', ev => {
    input.click();
  });
  return this.plus;
};

Images.prototype.appendImage = function (img) {
  let elData = {
    width: this.width,
    src: img.url,
  };
  let el = dom.templatize(`
    <div class="d-flex align-items-center justify-content-center pointer" 
                style="height: {{width}}px; width: {{width}}px; border: 1px solid #eee;">
      <img src="{{src}}" style="width: 100%; height: 100%;">
    </div>
  `, elData);

  if (this.readonly === false) {
    this.container.insertBefore(el, this.plus);
  } else {
    this.container.appendChild(el);
  }
};