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
  this.removable = (opts.removable === true);
}

Tags.TEMPLATE_HTML = `
  <span class="{{severity}}" data-tag-id="{{id}}">
    <strong>{{text}}</strong>
    <i class="fas fa-times"></i>
  </span>
`;

Tags.prototype.addTag = function(tag) {
  let el = dom.templatize(Tags.TEMPLATE_HTML, tag);
  let i = dom.find('i', el);
  if (this.removable === true) {
    el.classList.add('tag-removable');
    dom.bind(i, 'click', (ev) => {
      el.remove();
    });
  } else {
    el.classList.add('tag-readonly');
    i.remove();
  }
  this.container.appendChild(el);
};

Tags.prototype.render = function() {

};