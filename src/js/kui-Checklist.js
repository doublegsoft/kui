
function Checklist(opts) {
  this.url = opts.url;
  this.title = opts.title;
  this.name = opts.name;
  this.text = opts.fields['text'];
  this.value = opts.fields['value'];
  this.data = opts.data;
}

Checklist.prototype.request = function (containerId) {
  let container = document.getElementById(containerId);
  container.style.overflowY = 'auto';
  container.innerHTML = '';
  let self = this;
  xhr.get({
    url: this.url,
    data: this.data,
    success: function(resp) {
      container.append(self.root(resp.data));
    }
  });
};

Checklist.prototype.root = function (data) {
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

    let label = document.createElement('label');
    label.classList.add('form-check-label');
    label.textContent = item[this.text];

    li.addEventListener('click', function(ev) {
      check.checked = !check.checked;
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
