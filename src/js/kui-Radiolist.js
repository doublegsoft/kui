
function Checklist(opts) {
  this.url = opts.url;
  this.title = opts.title;
  this.name = opts.name;
  this.text = opts.fields['text'];
  this.value = opts.fields['value'];
  this.selections = opts.selections || [];
  this.data = opts.data || {};
  this.click = opts.click || function () {};
}

Checklist.prototype.request = function (containerId) {
  this.container = document.getElementById(containerId);
  this.container.style.overflowY = 'auto';
  this.container.innerHTML = '';
  let self = this;
  xhr.post({
    url: this.url,
    data: this.data,
    success: function(resp) {
      self.container.append(self.root(resp.data));
    }
  });
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
      if (sel.id == checkbox.getAttribute('data-id')) {
        checkbox.checked = true;
        break;
      }
    }
  }
}

Checklist.prototype.root = function (data) {
  let self = this;
  if (typeof data === 'undefined') data = [];
  let ul = document.createElement('ul');
  ul.classList.add('list-group');
  let i = 0;
  for (i = 0; i < data.length; i++) {
    let item = data[i];
    let li = document.createElement('li');
    li.classList.add('list-group-item', 'list-group-item-action', 'form-check', 'form-check-inline');
    li.style.marginRight = '0';

    let check = document.createElement('input');
    check.classList.add('form-check-input');
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
    label.classList.add('form-check-label');
    label.textContent = item[this.text];

    li.addEventListener('click', function(ev) {
      check.checked = !check.checked;
      self.click(check.checked, check.getAttribute('data-id'));
    });

    li.append(check);
    li.append(label);

    ul.append(li);
  }
  return ul;
};

Checklist.prototype.render = function (containerId) {
  this.request(containerId);
};
