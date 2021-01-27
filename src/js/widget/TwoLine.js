

function TwoLine(opt) {
  this.model = opt.model;
}

TwoLine.prototype.renderTo = function(container) {
  let model = this.model;
  let html = `
    <div class="d-flex align-items-center">
      <div class="bg-gradient-primary">
        <svg class="c-icon c-icon-xl">
          <use xlink:href="vendors/@coreui/icons/svg/free.svg#cil-settings"></use>
        </svg>
      </div>
      <div>
        <div class="text-value text-primary font-16">${model.primary}</div>
        <div class="text-muted font-weight-bold small">${model.secondary}</div>
      </div>
    </div>
  `;
  let el = dom.element(html);
  if (!model.icon) {
    el.children[0].remove();
  }
  container.appendChild(el);
};