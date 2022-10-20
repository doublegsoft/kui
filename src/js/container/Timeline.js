
function Timeline(opt) {
  this.url = opt.url;
  this.params = opt.params || {};

  this.data = opt.data || [];

  this.fnTitle = opt.title || function(row, index) { return ''; };
  this.fnSubtitle = opt.subtitle || function(row, index) { return ''; };
  this.fnContent = opt.content || function(row, index) { return ''; };

  this.onComplete = opt.onComplete;
}

Timeline.prototype.createTile = function(row, index) {
  let ret = dom.element(`
    <li class="timeline-item">
      <div class="time"></div>
      <div class="small text-muted"></div>
      <p></p>
    </li>
  `);
  let title = ret.children[0];
  let subtitle = ret.children[1];
  let content = ret.children[2];
  if (this.fnTitle) {
    let el = this.fnTitle(row, index);
    if (typeof el === 'undefined')
      title.innerHTML = '';
    else if (typeof el === 'string' || typeof el === 'number')
      title.innerHTML = el;
    else
      title.appendChild(el);
  }
  if (this.fnSubtitle) {
    let el = this.fnSubtitle(row, index);
    if (typeof el === 'undefined')
      subtitle.innerHTML = '';
    else if (typeof el === 'string' || typeof el === 'number')
      subtitle.innerHTML = el;
    else
      subtitle.appendChild(el);
  }
  if (this.fnContent) {
    let el = this.fnContent(row, index);
    if (typeof el === 'undefined')
      content.innerHTML = '';
    else if (typeof el === 'string' || typeof el === 'number')
      content.innerHTML = el;
    else
      content.appendChild(el);
  }
  return ret;
};

Timeline.prototype.render = function(container, params) {
  let self = this;
  if (typeof container === 'string') {
    this.container = document.querySelector(container);
  } else {
    this.container = container;
  }
  this.container.innerHTML = '';

  params = params || {};
  let ul = dom.create('ul', 'timeline-simple');
  this.container.appendChild(ul);

  let requestParams = {};
  utils.clone(this.params, requestParams);
  utils.clone(params, requestParams);
  if (this.url) {
    xhr.post({
      url: this.url,
      params: requestParams,
      success: function (resp) {
        if (!resp.data) return;
        let data = resp.data;
        console.log(data);
        for (let i = 0; i < data.length; i++) {
          ul.appendChild(self.createTile(data[i], i));
        }
      }
    });
  } else {
    for (let i = 0; i < self.data.length; i++) {
      ul.appendChild(self.createTile(self.data[i], i));
    }
  }
  if (self.onComplete) {
    self.onComplete();
  }
};