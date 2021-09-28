
function Timeline(opt) {
  this.url = opt.url;
  this.params = opt.params || {};

  this.data = opt.data || [];

  this.fnTitle = opt.title;
  this.fnSubtitle = opt.subtitle;
  this.fnContent = opt.content;
}

Timeline.prototype.createTile = function(row) {
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
    title.innerHTML = this.fnTitle(row);
  }
  if (this.fnSubtitle) {
    subtitle.innerHTML = this.fnSubtitle(row);
  }
  if (this.fnContent) {
    content.innerHTML = this.fnContent(row);
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
  let ul = dom.create('ul', 'timeline-ia');
  this.container.appendChild(ul);

  let requestParams = {};
  utils.clone(this.params, requestParams);
  utils.clone(params, requestParams);
  xhr.post({
    url: this.url,
    params: requestParams,
    success: function(resp) {
      if (!resp.data) return;
      let data = resp.data;
      for (let i = 0; i < data.length; i++) {
        ul.appendChild(self.createTile(data[i]));
      }
    }
  });
};