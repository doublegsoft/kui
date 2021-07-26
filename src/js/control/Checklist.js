
function Checklist(opts) {
  opts.fields = opts.fields || {};
  this.url = opts.url;
  this.title = opts.title;
  this.name = opts.name;
  this.fieldId = opts.fields.id;
  this.text = opts.fields['text'];
  this.value = opts.fields['value'];
  this.selections = opts.selections || [];
  this.data = opts.data || {};
  this.click = opts.click || function () {};
  this.usecase = opts.usecase || '';
  this.readonly = opts.readonly == true;
  this.searchable = (typeof opts.searchable === 'undefined') ? true : opts.searchable;
}

Checklist.prototype.request = function (containerId) {
  if (typeof containerId  === 'string') {
    this.container = dom.find(containerId);
  } else {
    this.container = containerId;
  }
  this.container.style.overflowY = 'auto';
  this.container.innerHTML = '';
  let self = this;
  if (this.url) {
    xhr.post({
      url: this.url,
      usecase: this.usecase,
      data: this.data,
      success: function (resp) {
        self.container.appendChild(self.root(resp.data));
      }
    });
  } else {
    self.container.appendChild(self.root(this.data));
  }
};

Checklist.prototype.getSelections = function() {
  let ret = [];
  let listItems = this.container.querySelectorAll('li');
  for (let i = 0; i < listItems.length; i++) {
    let li = listItems[i];
    let checkbox = li.querySelector('input');
    if (checkbox.checked) {
      let obj = {};
      obj[this.name] = checkbox.getAttribute('data-id');
      ret.push(obj);
    }
  }
  return ret;
};

Checklist.prototype.uncheckAll = function() {
  let ret = [];
  let listItems = this.container.querySelectorAll('li');
  for (let i = 0; i < listItems.length; i++) {
    let li = listItems[i];
    let checkbox = li.querySelector('input');
    checkbox.checked = false;
  }
  return ret;
};

Checklist.prototype.setSelections = function(selections) {
  let listItems = this.container.querySelectorAll('li');
  for (let i = 0; i < listItems.length; i++) {
    let li = listItems[i];
    let checkbox = li.querySelector('input');
    for (let j = 0; j < selections.length; j++) {
      let sel = selections[j];
      if (sel[this.value] == checkbox.getAttribute('data-id')) {
        checkbox.checked = true;
        break;
      }
    }
  }
};

Checklist.prototype.top = function() {
  let div = dom.element(`
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text font-16 text-primary" style="border-bottom-left-radius: unset; cursor: pointer;">
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
  let buttonCheck = div.firstElementChild.firstElementChild;
  dom.bind(buttonCheck, 'click', event => {
    let icon = buttonCheck.querySelector('i');
    if (icon.classList.contains('fa-check-square')) {
      icon.classList.remove('fa-check-square');
      icon.classList.add('fa-square');
    } else {
      icon.classList.remove('fa-square');
      icon.classList.add('fa-check-square');
    }
  });
  return div;
}

Checklist.prototype.root = function (data) {
  let self = this;
  let ret = dom.create('div');
  if (this.searchable === true) {
    ret.appendChild(this.top());
  }

  if (typeof data === 'undefined') data = [];
  let ul = document.createElement('ul');
  ul.classList.add('list-group');
  let i = 0;
  for (i = 0; i < data.length; i++) {
    let item = data[i];
    let li = document.createElement('li');
    li.classList.add('list-group-item', 'list-group-item-action', 'form-check', 'form-check-inline', 'pointer');
    li.style.marginRight = '0';
    li.style.height = '36px';
    li.style.paddingLeft = '10.5px';
    li.style.paddingTop = '7px';
    li.style.paddingBottom = '7px';
    if (this.readonly)
      li.style.backgroundColor = 'rgb(240, 243, 245)';

    if (i == 0 && this.searchable === true) {
      li.style.borderTopLeftRadius = 'unset';
      li.style.borderTopRightRadius = 'unset';
      li.style.borderTop = 'none';
    }

    let check = document.createElement('input');
    check.disabled = self.readonly;
    check.value = item[this.value];
    check.classList.add('form-check-input', 'pointer', 'checkbox', 'color-info', 'is-outline');
    check.setAttribute('name', this.name);
    check.setAttribute('data-id', item[this.value]);
    check.setAttribute('type', 'checkbox');
    for (let j = 0; j < this.selections.length; j++) {
      let sel = this.selections[j];
      if (sel[this.value] == item[this.value]) {
        check.setAttribute("checked", true);
        break;
      }
    }
    let label = document.createElement('label');
    label.classList.add('form-check-label', 'pointer');
    label.textContent = item[this.text];

    if (!this.readonly) {
      li.addEventListener('click', function (ev) {
        check.checked = !check.checked;
        self.click(check.checked, check.getAttribute('data-id'));
      });
      check.addEventListener('input', function (ev) {
        this.checked = !this.checked;
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      });
    }

    li.append(check);
    li.append(label);

    ul.append(li);
  }

  let listContainer = dom.create('div');
  listContainer.style.overflowY = 'auto';
  listContainer.style.overflowX = 'hidden';
  listContainer.style.maxHeight = '211px';
  listContainer.appendChild(ul);

  ret.appendChild(listContainer);
  return ret;
};

Checklist.prototype.render = function (containerId, opts) {
  if (opts) {
    this.selections = opts.selections || [];
  } else {
    this.selections = [];
  }
  this.request(containerId);
};
