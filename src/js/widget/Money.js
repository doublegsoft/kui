

function Money(opt) {
  this.model = opt.model;
}

Money.prototype.renderTo = function(container) {
  let model = this.model;
  let html = `
    <div>
      <div>${model.primary}</div>
      <div class="small text-muted">${model.secondary}</div>
    </div>
  `;
  let el = dom.element(html);
  container.appendChild(el);
};