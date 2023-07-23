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
  // 懒加载标志，通常用于多级联动时的次级列表，不主动加载
  this.lazy = opt.lazy === true;
  this.hoverable = opt.hoverable !== false;
  this.activateable = opt.activateable === true;
  this.itemClass = opt.itemClass || [];
  this.slidingActions = opt.slidingActions || [];

  this.emptyHtml = opt.emptyHtml || `
    <div class="d-flex flex-wrap mt-2">
      <img class="m-auto" src="img/nodata.png" width="60%">
      <div style="flex-basis: 100%; height: 0;"></div>
      <div class="text-muted m-auto mt-2" style="font-weight: bold;">没有任何数据</div>
    </div>
  `;
  this.idField = opt.idField;

  /*!
  ** 用于比较用的标识字段。
  */
  this.compare = opt.compare || function(selection, row) {return false;};
  this.selections = opt.selections || [];
  this.local = opt.local || [];
  this.create = opt.create || function(idx, row) {};
  this.complete = opt.complete;

  this.draggable = opt.draggable === true;

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
ListView.prototype.fetch = async function (params) {
  let requestParams = {};
  params = params || {};
  utils.clone(this.params, requestParams);
  utils.clone(params, requestParams);
  let self = this;
  if (this.url) {
    this.data = this.data || {};
    this.data.start = this.start;
    this.data.limit = this.limit;

    let data = await xhr.promise({
      url: this.url,
      params: requestParams,
    });
    Array.prototype.push.apply(self.local, data);
  }
  if (self.local.length == 0) {
    if (this.emptyHtml) {
      this.contentContainer.innerHTML = this.emptyHtml;
    }
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
  this.container.innerHTML = '';
  let ulHeight = this.height - 37;
  // style="height: 120px; overflow-y: auto; border: 1px solid rgba(0, 0, 0, 0.125); border-top: none;"
  if (this.onFilter) {
    let topbar = dom.element(`
      <div class="input-group position-sticky" style="top: 0; left: 0; z-index: 10;">
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
    let input = dom.find('input', topbar);
    dom.bind(input, 'input', ev => {
      clearTimeout(this.delayToSearch);
      this.delayToSearch = setTimeout(() => {
        this.onFilter(this, input.value);
      }, 500);
    });
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

  this.contentContainer = dom.create('div', 'full-width');
  let ul = dom.create('ul', 'list-group', 'full-width');
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
    this.contentContainer.appendChild(ulContainer);
  } else {
    this.contentContainer.appendChild(ul);
  }
  this.container.appendChild(this.contentContainer);

  if (loading !== false && this.lazy !== true)
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
  // 如果指定了远程链接，则本地数据无效
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

ListView.prototype.remove = function(model) {
  if (this.idField) {
    let ul = dom.find('ul', this.container);
    for (let i = 0; i < ul.children.length; i++) {
      let child = ul.children[i];
      let childModel = dom.model(child);
      if (childModel[this.idField] === model[this.idField]) {
        child.remove();
      }
    }
  }
};

/**
 * Appends list item dom element(s) with the given data to list view.
 *
 * @param {any} data
 *        an array or object
 *
 * @private
 */
ListView.prototype.append = function(data, index) {
  let self = this;
  let ul = this.container.querySelector('ul');
  let len = ul.querySelectorAll('li').length;

  if (Array.isArray(data)) {
    let rows = data;
    for (let i = 0; i < rows.length; i++) {
      this.append(rows[i]);
    }
    if (self.complete) {
      self.complete(data);
    }
  } else {
    let row = data;
    // check duplicated
    if (this.idField) {
      for (let i = 0; i < ul.children.length; i++) {
        let child = ul.children[i];
        let childModel = dom.model(child);
        if (childModel[this.idField] === row[this.idField]) {
          return;
        }
      }
    }

    let li = dom.create('li', 'list-group-item');
    if (this.hoverable !== false) {
      li.classList.add('list-group-item-action');
    }
    if (this.activateable === true) {
      dom.bind(li, 'click', ev => {
        for (let i = 0; i < li.parentElement.children.length; i++) {
          let el = li.parentElement.children[i];
          el.classList.remove('active');
        }
        li.classList.add('active');
      });
    }
    for (let i = 0; i < this.itemClass.length; i++) {
      li.classList.add(this.itemClass[i]);
    }
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

    let div = this.create(len, row, li);
    div.style.width = '100%';

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

    if (this.slidingActions.length > 0) {
      this.actionElements = [];
      for (let i = 0; i < this.slidingActions.length; i++) {
        let slidingAction = this.slidingActions[i];
        slidingAction.width = parseInt(slidingAction.width || 64);
        li.appendChild(slidingAction.create());
      }
      dom.bind(li, 'touchstart', ev => {
        this.touchStartX = ev.touches[0].screenX;
        this.touchStartY = ev.touches[0].screenY;
      });
      dom.bind(li, 'touchmove', ev => {
        this.touchMoveX = ev.touches[0].screenX;
        this.touchMoveY = ev.touches[0].screenY;
        let distanceX = this.touchStartX - this.touchMoveX;
        let distanceY = this.touchStartY - this.touchMoveY;
        if (Math.abs(distanceX) < 30) return;
        if (Math.abs(distanceY) > 30) return;
        if (distanceX > 0) {
          let avg = distanceX / this.slidingActions.length;
          for (let j = 1; j < li.children.length; j++) {
            let rect = li.children[j].getBoundingClientRect();
            if (rect.width >= this.slidingActions[j - 1].width) {
              continue;
            }
            if (avg >= this.slidingActions[j - 1].width) avg = this.slidingActions[j - 1].width;
            li.children[j].style.minWidth = avg + 'px';
            li.children[j].style.display = '';
          }
        } else {
          distanceX = -distanceX / 10;
          let avg = distanceX / this.slidingActions.length;
          for (let j = 1; j < li.children.length; j++) {
            let rect = li.children[j].getBoundingClientRect();
            let width = rect.width - avg;
            width = width <= 5 ? 0 : width;
            if (width == 0) {
              li.children[j].style.width = '0';
              li.children[j].style.minWidth = 'unset';
            } else {
              li.children[j].style.minWidth = width + 'px';
            }
          }
        }
      });
      dom.bind(li, 'touchend', ev => {
        this.touchendX = ev.changedTouches[0].screenX;
        this.touchendY = ev.changedTouches[0].screenY;
        let distanceX = this.touchStartX - this.touchendX;
        let distanceY = this.touchStartY - this.touchendY;
        if (Math.abs(distanceX) < 30) return;
        if (Math.abs(distanceY) > 30) return;
        if (distanceX >= 30) {
          this.expandSlidingActions(li);
        } else if (distanceX <= -30) {
          this.collapseSlidingActions(li);
        } else {
          this.collapseSlidingActions(li);
        }
      });
    }

    if (this.idField) {
      li.setAttribute("data-list-item-id", row[this.idField])
    }
    dom.model(li, row);

    if (typeof index === 'number') {
      if (index < 0) {
        ul.insertBefore(li, ul.children[ul.children.length + index]);
      } else {
        ul.insertBefore(li, ul.children[index]);
      }
    } else {
      ul.appendChild(li);
    }

    if (this.onRemove) {
      let link = dom.element(`
        <a class="btn text-danger float-right font-18" style="padding: 0; margin-left: auto;">
          <i class="fas fa-times" style=""></i>
        </a>
      `);
      dom.bind(link, 'click', function(ev) {
        ev.stopPropagation();
        self.onRemove(this.parentElement, dom.model(this.parentElement));
      });
      dom.model(link, row);
      li.appendChild(link);
    }

    if (this.onReorder)
      this.setReorderable(li);
    else if (this.draggable) {
      li.setAttribute("draggable", "true");
      li.addEventListener('dragover', function (event) {
        event.preventDefault();
      });
      li.addEventListener("dragstart", function(event) {

      });
    }
  }
};

ListView.prototype.setLocal = function(data) {
  if (!data || data.length == 0) {
    this.contentContainer.innerHTML = '';
    if (this.emptyHtml) {
      this.contentContainer.innerHTML = this.emptyHtml;
    }
    return;
  } else {
    this.contentContainer.innerHTML = '';
  }
  let ul = dom.find('ul', this.contentContainer);
  if (ul == null) {
    let ul = dom.create('ul', 'list-group', 'full-width');
    if (this.borderless) {
      ul.classList.add('b-a-0');
    }
    let ulContainer = dom.create('div');
    let ulHeight = this.height - 37;
    ulContainer.style.height = ulHeight + 'px';
    ulContainer.style.overflowY = 'auto';
    ulContainer.style.border = '1px solid rgba(0, 0, 0, 0.125)';
    ulContainer.style.borderTop = '';
    ulContainer.appendChild(ul);
    this.contentContainer.appendChild(ulContainer);
  } else {
    ul.innerHTML = '';
  }
  for (let row of data) {
    this.append(row);
  }
};

ListView.prototype.replace = function(data) {
  let ul = this.container.querySelector('ul');
  for (let i = 0; i < ul.children.length; i++) {
    let li = ul.children[i];
    let model = dom.model(li);
    if (model[this.idField] === data[this.idField]) {
      dom.model(li, data);
      li.innerHTML = '';
      li.appendChild(this.create(i, data));
      break;
    }
  }
};

ListView.prototype.search = function(query) {
  let ul = this.container.querySelector('ul');
  for (let i = 0; i < ul.children.length; i++) {
    let li = ul.children[i];
    if (li.innerText.indexOf(query) != -1) {
      li.style.display = '';
    } else {
      li.style.display = 'none';
    }
  }
};

ListView.prototype.setReorderable = function(li) {
  let ul = dom.find('ul', this.container);

  ul.addEventListener('dragover', function (event) {
    event.preventDefault();
  });
  ul.ondrop = event => {
    if (this.onReorder) {
      this.onReorder(dom.model(this.draggingElement), this.getItemIndex(this.draggingElement),
        this.draggingElementOriginalIndex);
    }
    this.draggingElement.style.opacity = '';
    this.draggingElement = null;
    this.clonedDraggingElement = null;
  };

  li.setAttribute("draggable", "true");
  li.ondragover = event => {
    let li = dom.ancestor(event.target, 'li');
    let ul = li.parentElement;
    if (li == this.draggingElement) {
      return;
    }

    let liIndex = this.getItemIndex(li);
    if (liIndex < this.draggingElementIndex) {
      ul.insertBefore(this.draggingElement, li);
    } else if (liIndex > this.draggingElementIndex) {
      if (li.nextElementSibling == null) {
        ul.appendChild(this.draggingElement);
      } else {
        ul.insertBefore(this.draggingElement, li.nextElementSibling);
      }
    }

    this.draggingElementIndex = liIndex;
    event.preventDefault();
  };
  li.ondragstart = event => {
    let li = dom.ancestor(event.target, 'li');
    let ul = li.parentElement;
    let x = event.layerX;
    let y = event.layerY;
    let target = event.target;
    y = target.offsetTop + y;

    this.clonedDraggingElement = li.cloneNode(true);

    this.draggingElement = li;
    this.draggingElement.style.opacity = "0.3";
    this.draggingElementIndex = this.getItemIndex(li);
    this.draggingElementOriginalIndex = this.draggingElementIndex;

    event.dataTransfer.setData("id", li.getAttribute('data-list-item-id'));
    event.dataTransfer.setData("y", y);
  };
};

ListView.prototype.getItemIndex = function(li) {
  let ul = li.parentElement;
  for (let i = 0; i < ul.children.length; i++) {
    if (li == ul.children[i]) {
      return i;
    }
  }
};

ListView.prototype.setHeight = function(height) {
  let ul = this.container.querySelector('ul');
  ul.style.height = height + 'px';
};

ListView.prototype.activate = function(li) {
  let ul = this.container.querySelector('ul');
  for (let i = 0; i < ul.children.length; i++) {
    ul.children[i].classList.remove('active');
  }
  li.classList.add('active');
};

ListView.prototype.getCheckedValues = function () {
  if (!this.onCheck) return [];
  let checkboxes = this.container.querySelectorAll('input.checkbox');
  let ret = [];
  for (let checkbox of checkboxes) {
    if (checkbox.checked === true) {
      let li = dom.ancestor(checkbox, 'li');
      ret.push(dom.model(li));
    }
  }
  return ret;
};

ListView.prototype.expandSlidingActions = function (li) {
  let width = li.children[1].getBoundingClientRect().width;
  if (width >= this.slidingActions[0].width.width) return;
  let fun = (li) => {
    for (let i = 1; i < li.children.length; i++) {
      let action = li.children[i];
      let rect = action.getBoundingClientRect();
      if ((rect.width + 5) >= this.slidingActions[i - 1].width) {
        action.style.minWidth = this.slidingActions[i - 1].width + 'px';
        clearInterval(this.interval4SlidingActions);
        continue;
      };
      action.style.minWidth = (rect.width + 5) + 'px';
    }
  };
  this.interval4SlidingActions = setInterval(() => {
    fun(li);
  }, 5);
};

ListView.prototype.collapseSlidingActions = function (li) {
  let width = li.children[1].getBoundingClientRect().width;
  if (width <= 0) return;
  this.interval4SlidingActions = setInterval(() => {
    for (let i = 1; i < li.children.length; i++) {
      let action = li.children[i];
      let rect = action.getBoundingClientRect();
      if ((rect.width - 5) <= 0) {
        action.style.width = '0';
        action.style.minWidth = 'unset';
        action.style.display = 'none';
        clearInterval(this.interval4SlidingActions);
        continue;
      };
      action.style.minWidth = (rect.width - 5) + 'px';
    }
  }, 10);

};

ListView.prototype.subscribe = function(name, callback) {

};