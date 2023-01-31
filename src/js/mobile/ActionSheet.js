
function ActionSheet(opt) {
  this.title = opt.title || '';
  this.actions = opt.actions || [];
}

ActionSheet.prototype.root = function() {
  let ret = dom.templatize(`
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom" style="background: transparent;">
        <div class="action-sheet">
          <div class="title">{{title}}</div>
          <div class="actions"></div>
          <div class="cancel">取消</div>
        </div>
      </div>
    </div>
  `, this);

  this.bottom = dom.find('.popup-bottom', ret);
  let cancel = dom.find('.cancel', ret);
  let mask = dom.find('.popup-mask', ret);
  let actions = dom.find('.actions', ret);

  dom.bind(mask, 'click', ev => {
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  for (let i = 0; i < this.actions.length; i++) {
    let action = dom.templatize(`
      <div class="action">{{text}}</div>
    `, this.actions[i]);
    dom.bind(action, 'click', ev => {
      this.close();
      this.actions[i].onClick(ev);
    });
    if (i == this.actions.length - 1) {
      action.classList.add('last');
    }
    actions.appendChild(action);
  }
  this.bottom.classList.add('in');

  setTimeout(() => {
    this.bottom.style.bottom = '0';
  }, 300);

  return ret;
};

ActionSheet.prototype.show = function (container) {
  container.appendChild(this.root());
};

ActionSheet.prototype.close = function () {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};