/**
 * Tag template example:
 *
 * <pre>
 *   <span class="tag-removable success">
 *     <strong>瓣膜换术后</strong>
 *     <i class="fas fa-times"></i>
 *   </span>
 * </pre>
 *
 * @param opts
 * @constructor
 */
function Tags(opts) {
  this.container = dom.find(opts.containerId);
  this.onRemove = opts.onRemove;
  this.onClick = opts.onClick;
}

Tags.TEMPLATE_HTML = `
  <span class="{{severity}}" data-tag-id="{{id}}">
    <strong>{{text}}</strong>
    <i class="fas fa-times"></i>
  </span>
`;

Tags.prototype.replaceTag = function(tag) {
  // check duplicated
  for (let i = 0; i < this.container.children.length; i++) {
    let elTag = this.container.children[i];
    let tagId = elTag.getAttribute('data-tag-id');
    if (tagId == tag.id) {
      elTag.setAttribute('class', tag.severity);
      return;
    }
  }
  let self = this;
  let el = dom.templatize(Tags.TEMPLATE_HTML, tag);

  if (this.onClick) {
    el.classList.add('pointer');
    dom.bind(el, 'click', (ev) => {
      self.onClick({
        id: el.getAttribute('data-tag-id'),
      })
    });
  }

  let i = dom.find('i', el);
  if (this.onRemove) {
    el.classList.add('tag-removable');
    dom.bind(i, 'click', (ev) => {
      self.onRemove({
        id: el.getAttribute('data-tag-id'),
      });
      el.remove();
    });
  } else {
    el.classList.add('tag-readonly');
    i.remove();
  }
  this.container.appendChild(el);
};

Tags.prototype.getValues = function() {

};