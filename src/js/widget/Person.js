
function Person(opt) {
  this.value = opt.value;
  this.model = opt.model;
  this.onPersonClicked = opt.onPersonClicked;
}

Person.prototype.renderTo = function(container) {
  container.innerHTML = '';
  let model = this.model;
  let el = dom.element(`
    <div class="ui yellow image label bg-info text-white">
      <img src="${model.avatar}" height="32">
      <span>${model.name}</span>
      <p class="detail">${model.detail}</p>
    </div>
  `);
  if (this.onPersonClicked) {
    el.classList.add('pointer');
    dom.model(el, this.value);
    dom.bind(el, 'click', event => {
      let div = dom.ancestor(event.target, 'div');
      this.onPersonClicked(dom.model(div));
    });
  }
  container.appendChild(el);
};