function Medias(opts) {
  this.params = opts.params || {};
  // 只读
  this.readonly = opts.readonly === true;
  this.width = opts.width || '80';
  this.height = this.width;
  // 多个还是单个
  this.multiple = opts.multiple !== false;
  // 上传的链接路径
  this.url = opts.url || '/api/v3/common/upload';
  // 读取已上传的图片的配置项
  this.fetch = opts.fetch;
  // 单个删除已上传的图片的配置项
  this.remove = opts.remove;
  // 媒体类型
  this.mediaType = opts.mediaType || 'image';
}

Medias.prototype.render = function (containerId, value) {
  this.value = value;
  this.container = dom.find(containerId);
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      let row = value[i];
      // row is object
      this.appendMedia(row);
    }
  } else  {
    this.appendMedia(value);
  }
  if (this.readonly === false) {
    let plus = this.createPlusElement();
    this.container.appendChild(plus);
  }
};

Medias.prototype.createPlusElement = function () {
  if (this.mediaType == 'image') {
    this.plus = dom.templatize(`
      <div class="d-flex align-items-center justify-content-center pointer" 
                  style="height: {{width}}px; width: {{width}}px; border: 1px solid #eee;">
        <i class="fas fa-plus" style="color: #bbb;"></i>
        <input type="file" accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
               style="display: none">
      </div>
    `, this);
  } else {
    this.plus = dom.templatize(`
      <div class="d-flex align-items-center justify-content-center pointer" 
                  style="height: {{width}}px; width: {{width}}px; border: 1px solid #eee;">
        <i class="fas fa-plus" style="color: #bbb;"></i>
        <input type="file" accept="video/mp4,video/x-m4v,video/*" style="display: none">
      </div>
    `, this);
  }
  let input = dom.find('input', this.plus);
  input.onchange = ev => {
    if (!input.files || input.files.length == 0) return;
    if (!this.url) {
      this.readImageAsLocal(input.files[0]);
    } else {
      this.readImageAsRemote(input.files[0]);
    }
  };
  dom.bind(this.plus, 'click', ev => {
    input.click();
  });
  return this.plus;
};

Medias.prototype.readImageAsLocal = function (file) {
  let img = file;
  let reader = new FileReader();
  reader.onload = () => {
    if (this.mediaType === 'image') {
      this.appendImage({
        url: reader.result,
      })
    } else {
      this.appendVideoImage(file, 2);
    }
  };
  reader.readAsDataURL(img);
};

Medias.prototype.readImageAsRemote = function (file) {
  xhr.upload({
    url: this.url,
    params: {
      ...this.params,
      file: file,
    },
    success: res => {
      if (res.data) {
        res = res.data;
      }
      if (this.mediaType === 'image') {
        this.appendImage({
          imagePath: res.webpath,
        });
      } else {
        this.appendVideoImage({
          videoPath: res.webpath,
        }, 2);
      }
    },
  })
};

Medias.prototype.appendMedia = function (media) {
  if (this.mediaType === 'image') {
    if (typeof media === 'string') {
      media = {
        imagePath: media,
      }
    }
    this.appendImage(media);
  } else {
    if (typeof media === 'string') {
      media = {
        videoPath: media,
      }
    }
    this.appendVideoImage(media, 2);
  }
};

Medias.prototype.appendImage = function (img) {
  let el = dom.templatize(`
    <div class="d-flex align-items-center justify-content-center pointer position-relative" 
         style="height: {{width}}px; width: {{width}}px; border: 1px solid #eee;">
      <img src="{{imagePath}}" style="width: 100%; height: 100%;">
      <a widget-media-id="{{id}}" class="btn-link position-absolute" style="bottom: 0; right: 4px;">
        <i class="fas fa-trash-alt text-danger"></i>
      </a>
    </div>
  `, {...img, width: this.width});
  dom.model(el, img);

  let image = dom.find('img', el);
  dom.bind(image, 'click', ev => {
    ev.stopPropagation();
    ev.preventDefault();
    if (this.mediaType == 'image') {
      let viewer = new Viewer(image, {
        toolbar: false,
        navbar: false,
        tooltip: false,
        title: false,
      });
      viewer.show();
    } else if (this.mediaType == 'video') {
      this.play(img.videoPath);
    }
  });
  let buttonDelete = dom.find('a', el);
  if (this.readonly === false) {
    this.container.insertBefore(el, this.plus);
    dom.bind(buttonDelete, 'click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      if (this.remove) {

      } else {
        el.remove();
      }
      if (this.multiple === false) {
        let plus = this.createPlusElement();
        this.container.appendChild(plus);
      }
    });
  } else {
    buttonDelete.remove();
    this.container.appendChild(el);
  }
  if (this.multiple === false && this.plus) {
    this.plus.remove();
  }
};

Medias.prototype.appendVideoImage = function (file, secs) {
  let canvas = document.createElement('canvas');
  canvas.style.width = this.width + 'px';
  canvas.style.height = this.width + 'px';
  canvas.width = this.width * window.devicePixelRatio;
  canvas.height = this.width * window.devicePixelRatio;
  canvas.getContext("2d").scale(window.devicePixelRatio, window.devicePixelRatio);
  let me = this, video = document.createElement('video');
  video.onloadedmetadata = () => {
    if ('function' === typeof secs) {
      secs = secs(video.duration);
    }
    video.currentTime = Math.min(Math.max(0, (secs < 0 ? video.duration : 0) + secs), video.duration);
  };
  video.onseeked = ev => {
    let height = video.videoHeight;
    let width = video.videoWidth;
    let ratio = height / width;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (ratio < 1) {
      ctx.drawImage(video, 0, (this.height - this.width * ratio) / 2, this.width, this.width * ratio);
    } else {
      ratio = width / height;
      ctx.drawImage(video, (this.height - this.width * ratio) / 2, 0, this.width * ratio, this.height);
    }
    this.appendImage({
      imagePath: canvas.toDataURL('image/png'),
      videoPath: file.videoPath,
    });
    canvas.remove();
    video.remove();
  };
  video.onerror = function(e) {

  };
  // let url = URL.createObjectURL(file);
  // video.src = url;
  video.src = file.videoPath;
};

Medias.prototype.play = function (path) {
  ajax.shade({
    url: 'html/misc/video/player.html?path=' + path,
    containerId: document.body,
    success: () => {
      pagePlayer.show({
        path: path,
      });
    }
  });
};