
function TreelikeList(opts) {
  this.itemCount = opts.itemCount || 6;
  this.filterRoot = opts.filters.root;
  this.filterChild = opts.filters.child;

  this.name = opts.name;
  this.params = opts.params || {};

  this.checkable = opts.checkable || false;
  this.filterable = opts.filterable || false;

  this.fieldId = opts.fields.id;
  this.fieldName = opts.fields.name;
  this.fieldParentId = opts.fields.parentId;
  this.fieldChildId = opts.fields.childId;
  this.fieldChildName = opts.fields.childName;

  this.urlRoot = opts.url.root;
  this.urlChild = opts.url.child;
  if (opts.usecase) {
    this.usecaseRoot = opts.usecase.root || '';
    this.usecaseChild = opts.usecase.child;
  }

  this.observableChecked = new rxjs.Subject();
  this.observableSelected = new rxjs.Subject();
}

TreelikeList.prototype.top = function() {
  let self = this;
  let div = dom.element(`
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text font-16 text-primary" style="border-bottom-left-radius: unset; cursor: pointer;">
          <i class="far fa-minus-square"></i>
        </span>
        <span class="input-group-text font-16 text-primary" style="cursor: pointer;">
          <i class="far fa-square"></i>
        </span>
        <span class="input-group-text text-primary" style="border-bottom-left-radius: unset; cursor: pointer;">
          <i class="fas fa-undo-alt"></i>
        </span>
      </div>
      <input class="form-control" placeholder="搜索关键字">
      <div class="input-group-append">
        <span class="input-group-text" style="border-bottom-right-radius: unset;">
          <i class="fas fa-asterisk icon-required"></i>
        </span>
      </div>
    </div>
  `);
  // check or uncheck all
  let buttonCheck = div.firstElementChild.children[1];
  dom.bind(buttonCheck, 'click', event => {
    let icon = buttonCheck.querySelector('i');
    if (icon.classList.contains('fa-check-square')) {
      icon.classList.remove('fa-check-square');
      icon.classList.add('fa-square');
      self.container.querySelectorAll('input').forEach(checkbox => {
        checkbox.checked = false;
      });
    } else {
      icon.classList.remove('fa-square');
      icon.classList.add('fa-check-square');
      self.container.querySelectorAll('input').forEach(checkbox => {
        checkbox.checked = true;
      });
    }
  });
  // expand or collapse tree
  let buttonExpand = div.firstElementChild.children[0];
  dom.bind(buttonExpand, 'click', event => {
    let icon = buttonExpand.querySelector('i');
    if (icon.classList.contains('fa-minus-square')) {
      icon.classList.remove('fa-minus-square');
      icon.classList.add('fa-plus-square');
    } else {
      icon.classList.remove('fa-plus-square');
      icon.classList.add('fa-minus-square');
    }
  });
  // restore check to initial state
  let buttonRestore = div.firstElementChild.children[2];
  dom.bind(buttonExpand, 'click', event => {

  });
  return div;
};

TreelikeList.prototype.root = function(data) {
  let self = this;
  let ret = dom.create('div');
  if (this.filterable) {
    ret.appendChild(this.top());
  }

  if (typeof data === 'undefined') data = [];
  let ul = document.createElement('ul');
  ul.classList.add('list-group');
  let i = 0;
  for (i = 0; i < data.length; i++) {
    let item = data[i];
    this.appendItem(ul, item, 0);
  }

  let listContainer = dom.create('div');
  listContainer.style.overflowY = 'auto';
  listContainer.style.overflowX = 'hidden';
  listContainer.style.maxHeight = (35 * this.itemCount + 1) + 'px';
  listContainer.appendChild(ul);

  ret.appendChild(listContainer);
  return ret;
};

TreelikeList.prototype.appendItem = function(ul, item, level) {
  let self = this;
  let li = document.createElement('li');
  li.classList.add('list-group-item', 'list-group-item-action', 'form-check', 'form-check-inline', 'pointer');
  li.style.marginRight = '0';
  li.style.height = '36px';
  li.style.paddingLeft = 10.5 + 22 * level + 'px';
  li.style.paddingTop = '7px';
  li.style.paddingBottom = '7px';
  if (this.readonly)
    li.style.backgroundColor = 'rgb(240, 243, 245)';

  if (ul.children.length == 0) {
    li.style.borderTopLeftRadius = 'unset';
    li.style.borderTopRightRadius = 'unset';
    li.style.borderTop = 'none';
  }

  li.setAttribute('data-tree-item-level', level);
  if (item[this.fieldChildId]) {
    li.setAttribute('data-tree-item-parent-id', item[this.fieldParentId]);
    li.setAttribute('data-tree-item-id', item[this.fieldChildId]);
  } else {
    if (level != 0)
      li.setAttribute('data-tree-item-parent-id', item[this.fieldParentId]);
    li.setAttribute('data-tree-item-id', item[this.fieldId]);
  }

  let expand = dom.create('a', 'text-primary', 'font-16', 'mr-2');
  expand.innerHTML = '<i class="far fa-minus-square position-relative" style="top: 1px;"></i>';
  dom.bind(expand, 'click', function (event) {
    self.expandItem(li);
  });

  let check = dom.create('input', 'form-check-input', 'pointer', 'checkbox', 'color-info', 'is-outline');
  check.disabled = self.readonly;

  check.setAttribute('name', this.name);
  check.setAttribute('type', 'checkbox');
  if (item[this.fieldChildId]) {
    check.value = item[this.fieldChildId];
  } else {
    check.value = item[this.fieldId];
  }
  check.setAttribute('data-tree-item-state', 'none');
  dom.model(check, item);

  let label = document.createElement('label');
  label.classList.add('form-check-label', 'pointer');
  if (item[this.fieldChildId]) {
    label.textContent = item[this.fieldChildName];
  } else {
    label.textContent = item[this.fieldName];
  }

  if (!this.readonly) {
    li.addEventListener('click', function (ev) {
      ev.stopPropagation();
      if (ev.target.tagName == 'INPUT') {
        let check = ev.target;
        check.setAttribute('style', 'background: transparent!important;')
        let state = check.getAttribute('data-tree-item-state');
        if (state == 'none' || state == 'some') {
          // check all children
          self.checkItem(dom.ancestor(ev.target, 'li'), true);
          check.setAttribute('data-tree-item-state', 'all');
          check.checked = true;
        } else {
          // uncheck all children
          self.checkItem(dom.ancestor(ev.target, 'li'), false);
          check.setAttribute('data-tree-item-state', 'none');
          check.checked = false;
        }
        self.changeParentItem(li);
        // publish
        self.publishObservableChecked();
      } else if (ev.target.tagName == 'LI') {
        let li = ev.target;
        for (let i = 0; i < li.parentElement.children.length; i++)
          li.parentElement.children[i].classList.remove('active');
        li.classList.add('active');
      }
    });
  }

  li.append(expand);
  li.append(check);
  li.append(label);

  ul.append(li);

  if (!item.children || item.children.length == 0) {
    expand.classList.remove('text-primary');
    expand.classList.add('text-transparent');
  }

  item.children = item.children || [];
  for (let i = 0; i < item.children.length; i++) {
    this.appendItem(ul, item.children[i], level + 1);
  }
};

TreelikeList.prototype.changeParentItem = function (li) {
  let parentId = li.getAttribute('data-tree-item-parent-id');
  if (!parentId || parentId == '') return;
  let ul = li.parentElement;
  for (let i = 0; i < ul.children.length; i++) {
    let liChild = ul.children[i];
    let id = liChild.getAttribute('data-tree-item-id');
    if (id == parentId) {
      let state = this.getChildStates(liChild);
      let check = dom.find('input', liChild);
      if (state == 'none') {
        check.checked = false;
        check.setAttribute('style', 'background: transparent!important;')
      } else if (state == 'all') {
        check.checked = true;
        check.setAttribute('style', 'background: transparent!important;')
      } else {
        check.checked = true;
        check.setAttribute('style', 'background: #ababab!important;')
      }
      check.setAttribute('data-tree-item-state', state);
      this.changeParentItem(liChild);
      break;
    }
  }
};

TreelikeList.prototype.getChildStates = function (li) {
  let ul = dom.find('ul', this.container);
  let start = false;
  let level = li.getAttribute('data-tree-item-level');
  let checkedOne = false;
  let uncheckedOne = false;
  // check children
  for (let i = 0; i < ul.children.length; i++) {
    let liChild = ul.children[i];
    if (liChild.getAttribute('data-tree-item-id') == li.getAttribute('data-tree-item-id')) {
      start = true;
    } else {
      continue;
    }
    if (start) {
      let levelChild = liChild.getAttribute('data-tree-item-level');
      if (levelChild > level) {
        if (dom.find('input', liChild).checked) checkedOne = true;
        else uncheckedOne = true;
      } else {
        break;
      }
    }
  }
  if (uncheckedOne && checkedOne) return 'some';
  if (checkedOne) return 'all';
  return 'none';
};

TreelikeList.prototype.expandItem = function(li) {
  let ul = li.parentElement;
  let level = parseInt(li.getAttribute('data-tree-item-level'));
  let expand = dom.find('i', li);
  if (expand.classList.contains('fa-minus-square')) {
    expand.classList.remove('fa-minus-square');
    expand.classList.add('fa-plus-square');

    let liNext = li.nextSibling;
    while (liNext) {
      let levelNext = parseInt(liNext.getAttribute('data-tree-item-level'));
      if (level >= levelNext) break;
      liNext.classList.remove('show');
      liNext.classList.add('hide');
      liNext = liNext.nextSibling;
    }
  } else {
    expand.classList.remove('fa-plus-square');
    expand.classList.add('fa-minus-square');

    let liNext = li.nextSibling;
    while (liNext) {
      let levelNext = parseInt(liNext.getAttribute('data-tree-item-level'));
      if (level == levelNext) break;
      if (level + 1 == levelNext) {
        liNext.classList.remove('hide');
        liNext.classList.add('show');
        dom.find('i', liNext).classList.remove('fa-minus-square');
        dom.find('i', liNext).classList.add('fa-plus-square');
      }
      liNext = liNext.nextSibling;
    }
  }
};

TreelikeList.prototype.checkItem = function(li, state) {
  let ul = dom.find('ul', this.container);
  let start = false;
  let level = li.getAttribute('data-tree-item-level');
  // check children
  for (let i = 0; i < ul.children.length; i++) {
    let liChild = ul.children[i];
    if (liChild.getAttribute('data-tree-item-id') == li.getAttribute('data-tree-item-id')) {
      start = true;
      continue;
    }
    if (start) {
      let levelChild = liChild.getAttribute('data-tree-item-level');
      if (levelChild > level) {
        let input = dom.find('input', liChild);
        input.checked = state;
      } else {
        break;
      }
    }
  }
};

TreelikeList.prototype.render = function(selector, values) {
  if (typeof selector === 'string') {
    this.container = document.querySelector(selector);
  } else {
    this.container = selector;
  }
  let self = this;
  let params = {};
  utils.clone(this.filterRoot, params);
  utils.clone(this.params, params);
  params._field_id = this.fieldId;
  params._field_parent_id = this.fieldParentId;
  xhr.post({
    url: this.urlRoot,
    usecase: this.usecaseRoot,
    data: params,
    success: function(resp) {
      self.container.appendChild(self.root(resp.data));
      self.setValues(values);
    }
  });
};

TreelikeList.prototype.publishObservableChecked = function() {
  let checked = [];
  this.container.querySelectorAll('input').forEach(checkbox => {
    if (checkbox.checked) {
      checked.push(dom.model(checkbox));
    }
  });
  this.observableChecked.next(checked);
};

TreelikeList.prototype.setValues = function(values) {
  if (!values) return;
  let lis = this.container.querySelectorAll('li');
  for (let i = 0; i < values.length; i++) {
    let val = values[i];
    for (let j = 0; j < lis.length; j++) {
      let li = lis[j];
      let input = dom.find('input', li);
      if (val[this.fieldId] === input.value) {
        input.checked = true;
        input.setAttribute('data-tree-item-state', 'all');
        break;
      }
    }
  }
};

