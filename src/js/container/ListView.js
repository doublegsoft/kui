/**
 * Encapsulates all functions of list view container.
 * <p>
 * And the functions are listed below:
 *
 * 1. RELOAD a list
 * 2. ADD an item to a list
 * 3. REMOVE an item from a list
 * 4. CHANGE an item in a list
 * 5. REORDER items in a list
 * 6. LOAD more items into a list
 * 7. CHECK an item in a list
 * 8. SELECT an item in a list
 */
function ListView(opt) {
  // the remote data source
  this.url = opt.url;
  this.usecase = opt.usecase;
  this.params = opt.params || {};

  /*!
  ** 用于比较用的标识字段。
  */
  this.compare = opt.compare || function(selection, row) {return false;};
  this.selections = opt.selections || [];
  this.local = opt.local || [];
  this.create = opt.create || function(idx, row) {};
  this.complete = opt.complete;

  this.start = opt.start || 0;
  this.limit = opt.limit || -1;

  this.borderless = opt.borderless || false;
  this.height = opt.height;
  this.tooltip = opt.tooltip;
  this.required = opt.required || false;
  // event callback
  this.onRemove = opt.onRemove;
  this.onReorder = opt.onReorder;
  this.onCheck = opt.onCheck;
  this.onSelect = opt.onSelect;
  this.onFilter = opt.onFilter;
  this.onAdd = opt.onAdd;
  this.onSearch = opt.onSearch;
  this.onClick = opt.onClick;

  this.observableItems = new rxjs.Observable();
};

/**
 * Fetch data from remote data source.
 */
ListView.prototype.fetch = function (params) {
  let requestParams = {};
  params = params || {};
  utils.clone(this.params, requestParams);
  utils.clone(params, requestParams);
  let self = this;
  if (this.url) {
    this.data = this.data || {};
    this.data.start = this.start;
    this.data.limit = this.limit;
    xhr.post({
      url: this.url,
      params: requestParams,
      success: function (resp) {
        Array.prototype.push.apply(self.local, resp.data);
        self.append(resp.data);
        if (self.complete) {
          self.complete();
        }
      }
    });
  } else {
    self.append(this.local);
  }
};

/**
 * Renders a list view under its container.
 */
ListView.prototype.render = function(containerId, loading) {
  if (typeof containerId === 'string')
    this.container = document.querySelector(containerId);
  else
    this.container = containerId;

  let ulHeight = this.height - 37;
  // style="height: 120px; overflow-y: auto; border: 1px solid rgba(0, 0, 0, 0.125); border-top: none;"
  if (this.onFilter) {
    let topbar = dom.element(`
      <div class="input-group">
        <div class="input-group-prepend">
          <span class="input-group-text" style="border-bottom-left-radius: unset;">
            <i class="fas fa-search"></i>
          </span>
        </div>
        <input class="form-control" placeholder="搜索..."  style="border-bottom-right-radius: unset;">
        <div class="input-group-append">
          <span class="input-group-text pointer text-primary" style="border-bottom-right-radius: unset;">
            <i class="fas fa-plus"></i>
          </span>
          <span class="input-group-text" style="border-bottom-right-radius: unset;">
            <i class="fas fa-question icon-general"></i>
          </span>
          <span class="input-group-text" style="border-bottom-right-radius: unset;">
            <i class="fas fa-asterisk icon-required"></i>
          </span>
        </div>
      </div>
    `);
    if (!this.required) {
      topbar.children[2].children[2].remove();
    }
    if (!this.tooltip) {
      topbar.children[2].children[1].remove();
    }
    if (!this.onAdd) {
      topbar.children[2].children[0].remove();
    }
    if (topbar.children[2].children.length == 0) {
      topbar.children[2].remove();
    }
    this.container.appendChild(topbar);
  }

  let ul = dom.create('ul', 'list-group');
  if (this.borderless) {
    ul.classList.add('b-a-0');
  }
  if (this.onFilter) {
    let ulContainer = dom.create('div');
    ulContainer.style.height = ulHeight + 'px';
    ulContainer.style.overflowY = 'auto';
    ulContainer.style.border = '1px solid rgba(0, 0, 0, 0.125)';
    ulContainer.style.borderTop = '';

    ulContainer.appendChild(ul);
    this.container.appendChild(ulContainer);
  } else {
    this.container.appendChild(ul);
  }

  if (loading !== false)
    this.reload();
};

/**
 * Reloads list items into a list.
 */
ListView.prototype.reload = function(params) {
  params = params || {};
  let ul = dom.find('ul', this.container);
  ul.innerHTML = '';

  this.start = 0;
  if (this.url)
    this.local = [];
  this.fetch(params);
};

/**
 * Loads more list items into a list.
 */
ListView.prototype.load = function() {
  this.start = this.local.length;
  this.fetch();
};

/**
 * Removes an item from a list.
 * <p>
 * And it is an event handler.
 */
ListView.prototype.remove = function(event) {
  event.preventDefault();
  event.stopPropagation();
  let self = this;
  let clicked = event.target;
  let found = clicked;
  while (found.tagName != 'LI') {
    found = found.parentElement;
  }

  let model = dom.model(found);
  if (self.onRemove) {
    self.onRemove(model);
  }
  // remove dom element
  found.remove();
};

ListView.prototype.reorder = function(event) {
  let self = this;
  let clicked = event.target;
  let found = clicked;
  while (found.tagName != 'LI') {
    found = found.parentElement;
  }

  let model = dom.model(found);
  if (self.onReorder) {
    self.onReorder(model);
  }
  // remove dom element
  found.remove();
};

/**
 * Appends list item dom element(s) with the given data to list view.
 *
 * @param {any} data
 *        an array or object
 *
 * @private
 */
ListView.prototype.append = function(data) {
  let self = this;
  let ul = this.container.querySelector('ul');
  let len = ul.querySelectorAll('li').length;

  if (Array.isArray(data)) {
    let rows = data;
    for (let i = 0; i < rows.length; i++) {
      this.append(rows[i]);
    }
    if (self.complete) {
      self.complete();
    }
  } else {
    let row = data;
    let li = dom.create('li', 'list-group-item', 'list-group-item-action');
    if (this.borderless) {
      li.classList.add('b-a-0');
    }
    if (this.onClick) {
      dom.bind(li, 'click', this.onClick);
    }
    li.style.paddingLeft = '16px';
    li.style.paddingRight = '16px';
    li.style.paddingTop = '8px';
    li.style.paddingBottom = '8px';
    li.style.display = 'flex';
    li.style.alignItems = 'center';

    if (this.onFilter) {
      li.style.borderLeftWidth = '0';
      li.style.borderRightWidth = '0';
      li.style.borderBottomWidth = '0';
    }

    let div = this.create(len, row);

    if (this.onCheck) {
      let input = dom.element(`
        <input class="pointer checkbox color-info is-outline mr-2" type="checkbox">
      `);
      for (let i = 0; i < this.selections.length; i++) {
        if (this.compare(this.selections[i], row)) {
          input.setAttribute('checked', true);
          break;
        }
      }
      dom.bind(input, 'change', function() {
        self.onCheck(this.checked, dom.model(this), this);
      });
      dom.model(input, row);
      li.appendChild(input);
    }
    li.appendChild(div);
    if (this.onRemove) {
      let link = dom.element(`
        <a class="btn text-danger float-right font-18" style="padding: 0; margin-left: auto">
          <i class="fas fa-times position-relative" style="top: 2px;"></i>
        </a>
      `);
      dom.bind(link, 'click', function() {
        self.onRemove(this.parentElement, dom.model(this));
      });
      dom.model(link, row);
      li.appendChild(link);
    }
    dom.model(li, row);
    ul.appendChild(li);
    if (this.onReorder)
      this.setReorderable(li);
  }
};

ListView.prototype.setReorderable = function(li) {
  let ul = dom.find('ul', this.container);

  ul.addEventListener('dragover', function (event) {
    event.preventDefault();
  });
  ul.addEventListener('drop', function (event) {
    // let y = parseInt(event.dataTransfer.getData('y'));
    let id = event.dataTransfer.getData('id');
    let dragged = null;
    for (let i = 0; i < ul.children.length; i++) {
      let li = ul.children[i];
      if (li.getAttribute('data-model-id') == id) {
        dragged = li;
        break;
      }
    }
    let parent = event.target.parentNode;
    parent.insertBefore(dragged, event.target.nextSibling);
  });

  li.setAttribute("draggable", "true");
  li.addEventListener('dragover', function (event) {
    event.preventDefault();
  });
  li.addEventListener("dragstart", function(event) {
    let x = event.layerX;
    let y = event.layerY;
    let target = event.target;
    y = target.offsetTop + y;

    event.dataTransfer.setData("id", dom.model(event.target).id);
    event.dataTransfer.setData("y", y);
  });
};

ListView.prototype.subscribe = function(name, callback) {

};