var dom = {};

dom.closeRightBar = () => {
  let rightbar = dom.find('div[widget-id=right-bar]')
  if (rightbar != null) {
    rightbar.children[0].classList.add('out');
    setTimeout(function () {
      rightbar.remove();
    }, 300);
  }
};
/*
**************************************************
** Animations.
**************************************************
*/
dom.slideInFromRight = (element, mask) => {
  element.classList.remove('out');
  element.classList.add('in');
  setTimeout(() => {
    element.style.right = '0';
  }, 300 /* 与CSS中动画定义一致 */);
  if (mask) {
    mask.style.display = '';
  }
};

dom.slideOutToRight = (element, right, mask) => {
  if (!element.classList.contains('in')) return;
  if (element.classList.contains('out')) return;
  element.classList.remove('in');
  element.classList.add('out');
  setTimeout(() => {
    element.style.right = right;
  }, 300 /* 与CSS中动画定义一致 */);
  if (mask) {
    mask.style.display = 'none';
  }
};

dom.slideInFromLeft = (element, mask) => {
  element.classList.remove('out');
  element.classList.add('in');
  setTimeout(() => {
    element.style.left = '0';
  }, 300 /* 与CSS中动画定义一致 */);
  if (mask) {
    mask.style.display = '';
  }
};

dom.slideOutToLeft = (element, left, mask) => {
  if (!element.classList.contains('in')) return;
  if (element.classList.contains('out')) return;
  element.classList.remove('in');
  element.classList.add('out');
  setTimeout(() => {
    element.style.left = left;
  }, 300 /* 与CSS中动画定义一致 */);
  if (mask) {
    mask.style.display = 'none';
  }
};

/*
**************************************************
** Operations.
**************************************************
*/
dom.toggle = (clazz, element) => {
  if (Array.isArray(element)) {
    for (let i = 0; i < element.length; i++)
      dom.toggle(clazz, element[i]);
  } else {
    if (element.classList.contains(clazz)) {
      element.classList.remove(clazz);
    } else {
      element.classList.add(clazz);
    }
  }
};

dom.exclusive = (clazz, element, container) => {
  let els = container.querySelectorAll(element.tagName + '.' + clazz);
  for (let el of els) {
    el.classList.remove(clazz);
  }
  element.classList.add(clazz);
};

/*
**************************************************
** Performance
**************************************************
*/
dom.delayTo = what => {
  clearTimeout(dom.timeoutDelayTo);
  dom.timeoutDelayTo = setTimeout(() => {

  }, 600);
};

dom.value = function(selector, val) {
  const elm = document.querySelector(selector);
  if (val) {
    elm.value = val;
    return;
  }
  return elm.value.trim();
};

dom.empty = function(selector) {
  const elm = document.querySelector(selector);
  if (elm.value) {
    elm.value = '';
  } else {
    elm.innerHTML = '';
  }
};

dom.valid = function (selector) {
  const elm = document.querySelector(selector);
  if (typeof elm.value === 'undefined' || elm.value == null || elm.value.trim() == '')
    return false;
  return true;
};

/**
 * Creates an html element.
 *
 * @param tag
 *        the tag name, and css classes
 *
 * @returns {any}
 *        the html element
 */
dom.create = function (tag) {
  let classes = Array.prototype.slice.call(arguments, 1);
  let ret = document.createElement(tag);
  for (let i = 0; i < classes.length; i++) {
    ret.classList.add(classes[i]);
  }
  return ret;
};

/**
 * Makes element matching with selector fixed positioning under its parent element.
 *
 * @param selector
 *        the css selector
 *
 * @returns {{top: number, left: number, width: number, height: number}}
 */
dom.fix = function (selector) {
  let element = null;
  if (typeof selector === 'string')
    element = document.querySelector(selector);
  else
    element = selector;
  let rect = element.getBoundingClientRect();

  let left = rect.left;
  let top = rect.top;
  let width = rect.width;
  let height = rect.height;

  let paddingLeft = parseInt(window.getComputedStyle(element, null).getPropertyValue('padding-left'));
  let paddingRight = parseInt(window.getComputedStyle(element, null).getPropertyValue('padding-right'));
  let paddingTop = parseInt(window.getComputedStyle(element, null).getPropertyValue('padding-top'));
  let paddingBottom = parseInt(window.getComputedStyle(element, null).getPropertyValue('padding-bottom'));

  let marginLeft = parseInt(window.getComputedStyle(element, null).getPropertyValue('margin-left'));
  let marginRight = parseInt(window.getComputedStyle(element, null).getPropertyValue('margin-right'));
  let marginTop = parseInt(window.getComputedStyle(element, null).getPropertyValue('margin-top'));
  let marginBottom = parseInt(window.getComputedStyle(element, null).getPropertyValue('margin-bottom'));

  let parentElement = element.parentElement.parentElement;

  let rectParent = parentElement.getBoundingClientRect();

  let paddingLeftParent = parseInt(window.getComputedStyle(parentElement, null).getPropertyValue('padding-left'));
  let paddingRightParent = parseInt(window.getComputedStyle(parentElement, null).getPropertyValue('padding-right'));
  let paddingTopParent = parseInt(window.getComputedStyle(parentElement, null).getPropertyValue('padding-top'));
  let paddingBottomParent = parseInt(window.getComputedStyle(parentElement, null).getPropertyValue('padding-bottom'));

  element.style.position = 'absolute';
  element.style.top = (top - rectParent.top) + 'px';
  element.style.left = (left - rectParent.left) + 'px';
  element.style.width = 'calc(100% - ' + (paddingLeftParent * 2) + 'px )';
  // (rectParent.width - (paddingLeftParent) * 2) + 'px';

  return {
    top: top - rectParent.top,
    left: left - rectParent.left,
    width: rectParent.width - (paddingLeftParent) * 2,
    height: height + paddingTop + paddingBottom
  }
};

/**
 * Finds all elements which are matching selector under parent or html document.
 *
 * @param selector
 *        the css selector
 *
 * @param parent
 *        the parent element or nothing
 *
 * @returns {any}
 *        the found single element or many elements as an array
 */
dom.find = function(selector, parent) {
  parent = parent || document;
  if (typeof selector !== 'string') return selector;
  let found = parent.querySelectorAll(selector);
  if (found.length == 0) return null;
  if (found.length == 1)  return found[0];
  return found;
};

/**
 * Finds the ancestor matching tag name for the given element.
 *
 * @param selector
 *        the element selector
 *
 * @param tag
 *        the element tag name
 */
dom.ancestor = function(selector, tag, clazz) {
  let element = null;
  clazz = clazz || '';
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  if (element == null) return null;
  tag = tag.toUpperCase();
  let found = element;
  if (clazz == '') {
    while (found != null && found.tagName != tag) {
      found = found.parentElement;
    }
  } else {
    while (found != null && !(found.tagName == tag && found.classList.contains(clazz))) {
      found = found.parentElement;
    }
  }

  return found;
};

/**
 *
 * @param html
 * @returns {null|Element}
 */
dom.element = function (html) {
  let div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild;
};

// dom.clickIn = function (selector, x, y) {
//   let element = null;
//   if (typeof selector === 'string') {
//     element = document.querySelector(selector);
//   } else {
//     element = selector;
//   }
//   let clicked = document.elementFromPoint(x, y);
// };

dom.bind = function (selector, event, handler) {
  let element = null;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  if (element == null)  return;
  if (element)
    // element['on' + event] = handler;
    element.addEventListener(event, handler);
};

/**
 * Gets or sets element data attribute values which element is matching to the selector.
 *
 * @param {Element} selector
 *        the element selector
 *
 * @param {object} data
 *        the data to set to html element, and if is undefined would get data from html element
 */
dom.model = function(selector, data) {
  let elm = null;
  if (typeof selector === 'string')
    elm = document.querySelector(selector);
  else
    elm = selector;
  if (typeof data !== 'undefined') {
    // set
    let attrs = Array.prototype.slice.call(arguments, 2);
    if (attrs.length == 0) {
      for (const key in data) {
        if (key.indexOf('||') == 0 || key.indexOf('//') == 0 || key.indexOf('>>') == 0) continue;
        if (typeof data[key] === 'object') {
          elm.setAttribute(utils.nameAttr(key), JSON.stringify(data[key]));
        } else {
          elm.setAttribute(utils.nameAttr(key), data[key]);
        }
      }
    } else {
      for (let i = 0; i < attrs.length; i++) {
        let key = attrs[i];
        if (key.indexOf('||') == 0 || key.indexOf('//') == 0 || key.indexOf('>>') == 0) continue;
        if (typeof data[key] === 'object') {
          elm.setAttribute(utils.nameAttr(key), JSON.stringify(data[key]));
        } else {
          elm.setAttribute(utils.nameAttr(key), data[key]);
        }
      }
    }
  } else {
    let ret = {};
    Array.prototype.slice.call(elm.attributes).forEach(function(attr) {
      if (attr.name.indexOf('data-model-') == 0) {
        if (attr.value.indexOf('{') == 0) {
          try {
            ret[utils.nameVar(attr.name.slice('data-model-'.length))] = JSON.parse(attr.value);
          } catch (err) {
            ret[utils.nameVar(attr.name.slice('data-model-'.length))] = attr.value;
          }
        } else {
          ret[utils.nameVar(attr.name.slice('data-model-'.length))] = attr.value;
        }
      }
    });
    return ret;
  }
};

/**
 * Collects html attribute values which elements are matching to the given selector.
 *
 * @param {string} selector
 *        the element selector
 *
 * @param {string} {array} name
 *        the attribute name or names
 *
 * @returns {array}
 *        the attribute values
 */
dom.collect = function (selector, name) {
  let ret = [];
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    let item = {};
    if (Array.isArray(name)) {
      for (let j = 0; j < name.length; j++) {
        item[name[j]] = elements[i].getAttribute(utils.nameAttr(name[j]));
      }
    } else {
      item[name] = elements.getAttribute(utils.nameAttr(name[j]));
    }
    ret.push(item);
  }
  return ret;
};

/**
 * Creates a child element and appends to container element.
 *
 * @param {element} container
 *        the container element
 *
 * @param {object} data
 *        the data for child element
 *
 * @param {string} {array} name
 *        the data names to set to element
 *
 * @param {function} creator
 *        the creator function to create element
 */
dom.propagate = function (container, data, name, creator) {
  let element = creator(data);
  if (Array.isArray(name)) {
    for (let i = 0; i < name.length; i++) {
      element.setAttribute(utils.nameAttr(name[i]), data[name[i]]);
    }
  } else {
    element.setAttribute(utils.nameAttr(name), data[name]);
  }
  container.appendChild(element);
};

dom.toggle2 = function (selector, resolve) {
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    element.addEventListener('click',  function() {
      let toggle = this.getAttribute('data-toggle');
      let strs = toggle.split('>>');
      let sources = strs[0].split('+');
      let targets = strs[1].split('+');

      let sourceMatched = false;
      let targetMatched = false;
      for (let i = 0; i < sources.length; i++) {
        let source = sources[i].trim();
        if (source.indexOf('.') == 0) {
          sourceMatched = this.classList.contains(source.substring(1));
        } else {
          let child = this.querySelector(source);
          sourceMatched = child != null;
        }
      }
      if (sourceMatched) {
        for (let i = 0; i < targets.length; i++) {
          let target = targets[i].trim();
          if (target.indexOf('.') === 0) {
            this.classList.add(target.substring(1));
          } else {
            let child = this.querySelector(target.substring(0, target.indexOf('.')));
            child.classList.add(target.substring(target.indexOf('.') + 1));
          }
        }
        for (let i = 0; i < sources.length; i++) {
          let source = sources[i].trim();
          if (source.indexOf('.') == 0) {
            this.classList.remove(source.substring(1));
          } else {
            let child = this.querySelector(source);
            child.classList.remove(source.substring(source.indexOf('.') + 1));
          }
        }
        return;
      }
      for (let i = 0; i < sources.length; i++) {
        let source = sources[i].trim();
        if (source.indexOf('.') == 0) {
          this.classList.add(source.substring(1));
        } else {
          let child = this.querySelector(source.substring(0, source.indexOf('.')));
          child.classList.add(source.substring(source.indexOf('.') + 1));
        }
      }
      for (let i = 0; i < targets.length; i++) {
        let target = targets[i].trim();
        if (target.indexOf('.') == 0) {
          this.classList.remove(target.substring(1));
        } else {
          let child = this.querySelector(target);
          child.classList.remove(target.substring(target.indexOf('.') + 1));
        }
      }
      if (resolve) resovle(this);
    });
  }
};

/**
 *
 * @param selector
 * @param resolve
 */
dom.switch = function (selector, resolve) {
  let container = dom.find(selector);
  let accordion = container.getAttribute('data-switch');
  let sources = accordion.split('+');
  let elements = container.querySelectorAll(sources[0]);
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    element.onclick = ev => {
      // clear all
      let siblings = container.querySelectorAll(sources[0]);
      for (let i = 0; i < siblings.length; i++) {
        siblings[i].classList.remove(sources[1].substring(1));
      }
      element.classList.add(sources[1].substring(1));
      if (resolve) resolve(element);
    };
  }
};

dom.tabs = function(tabsSelector) {
  let tabs = dom.find(tabsSelector);
  if (tabs == null) return;
  let activeClass = tabs.getAttribute('data-tab-active-class');
  for (let i = 0; i < tabs.children.length; i++) {
    let el = tabs.children[i];
    el.addEventListener('click', (ev) => {
      for (let i = 0; i < tabs.children.length; i++) {
        let el = tabs.children[i];
        el.classList.remove(activeClass);
      }
      el.classList.add(activeClass);
    })
  }
};

/**
 * Gets the top location Y of the given element in client area.
 *
 * @param selector
 *        the css selector
 *
 * @returns {number} the element Y value.
 */
dom.top = function (selector) {
  let element = null;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  // let ret = 0;
  // do {
  //   if ( !isNaN( element.offsetTop ) )
  //   {
  //     ret += element.offsetTop;
  //   }
  // } while (element = element.offsetParent);
  // return ret;
  if (element == null) return 0;
  let ret = element.offsetTop;
  if (typeof element.offsetParent !== 'undefined') {
    ret += dom.top(element.offsetParent);
  }
  return ret;
};

/**
 * Gets data from container element matching selector or
 * Sets data to it.
 *
 * @param selector
 *        the container selector
 *
 * @param data
 *        the data or undefined
 */
dom.formdata = function(selector, data) {
  let container = null;
  if (typeof selector === 'string') {
    container = document.querySelector(selector);
  } else {
    container = selector;
  }
  if (typeof data === 'undefined') {
    // get form data
    let values = {};

    // INPUT
    let checkboxCount = {};
    let inputs = container.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      let name = input.name;
      let type = input.type;
      let value = input.value;
      if (type == 'text' || type == 'number' || type == 'password' || type == 'hidden') {
        values[name] = null;
        if (value != '') {
          if (name.indexOf('[]') != -1) {
            values[name] = [value];
          } else {
            values[name] = value;
          }
        } else {
          values[name] = '';
        }
      } else if (type == 'radio') {
        // values[name] = null;
        if (input.checked) {
          values[name] = value;
        }
      } else if (type == 'checkbox') {
        // values[name] = [];
        if (typeof checkboxCount[name] === 'undefined') {
          checkboxCount[name] = 0;
        }
        if (input.checked) {
          if (typeof values[name] === 'undefined') {
            checkboxCount[name] = 0;
            values[name] = [];
          }
          values[name].push(value);
        }
        checkboxCount[name] += 1;
      }
    }
    // SELECT
    let selects = container.querySelectorAll('select');
    for (let i = 0; i < selects.length; i++) {
      let select = selects[i];
      let name = select.name;
      values[name] = null;
      if (select.selectedIndex != -1) {
        if (name.indexOf('[]') != -1) {
          values[name] = [select.value];
        } else {
          values[name] = select.value;
        }
      } else {
        values[name] = '';
      }
    }
    // TEXTAREA
    let textareas = container.querySelectorAll('textarea');
    for (let i = 0; i < textareas.length; i++) {
      let textarea = textareas[i];
      let name = textarea.name;
      values[name] = null;
      // if (textarea.innerHTML.trim() != '') {
      //   values[name] = textarea.innerHTML.replaceAll('<br>', '\n');
      // } else {
      //   values[name] = textarea.value;
      // }
      values[name] = textarea.value;
    }
    // 名称下只存在一个checkbox，就不用变成数组了
    for (let name in checkboxCount) {
      if (name.indexOf('[]') != -1) continue;
      if (checkboxCount[name] == 1 && values[name]) {
        values[name] = values[name][0];
      }
    }
    // 处理模板赋值
    for (let name in values) {
      if (typeof values[name] === 'string' && values[name].indexOf('${') == 0) {
        values[name] = values[values[name].substring(2, values[name].length - 1)];
      }
    }
    return values;
  } else {

    function getValue(obj, name) {
      if (name.indexOf('.') == 0) {
        let parentName = name.substring(0, name.indexOf('.'));
        let childName = name.substring(name.indexOf('.') + 1);
        return getValue(obj[parentName], childName);
      }
      if (typeof obj[name] === 'undefined') return '';
      return obj[name];
    }

    function setValue(container, name, val) {
      let el = dom.find('[name=\'' + name + '\']', container);
      if (el == null) return;
      if (el.length > 1) {
        if (el[0].type == 'radio') {
          let radios = el;
          radios.forEach((el, idx) => {
            if (el.value === val) {
              el.checked = true;
            } else {
              el.checked = false;
            }
          });
        }
      }
      if (el.tagName == 'INPUT') {
        if (el.type == 'check') {
          // TODO
        } else {
          el.value = val || '';
        }
      } else if (el.tagName == 'SELECT') {
        $('select[name=\'' + name + '\']').val(val).trigger('change');
      } else if (el.tagName == 'TEXTAREA') {
        el.innerHTML = val;
      }
    }

    for (let key in data) {
      if (typeof data[key] === 'object') {
        for (let innerKey in data[key]) {
          setValue(container, key + '.' + innerKey, data[key][innerKey]);
        }
      } else {
        setValue(container, key, data[key]);
      }
    }
  }
};

dom.setAttribute = function(selector, property, value) {
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    elements[i][property] = value;
  }
};

dom.removeAttribute = function(selector, property) {
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    elements[i].removeAttribute(property);
  }
};

dom.enable = function(selector) {
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    elements[i].disabled = false;
  }
};

dom.disable = function(selector) {
  let elements;
  if (typeof selector === 'string') {
    elements = document.querySelectorAll(selector);
  } else {
    elements = selector;
  }
  for (let i = 0; i < elements.length; i++) {
    elements[i].disabled = true;
  }
};

/**
 * Gets the index of selector element under its parent element.
 *
 * @param selector
 *        the selector string or dom element
 *
 * @param fieldId
 *        the model id field name
 *
 * @param id (optional)
 *        the model id value
 */
dom.index = function(selector, fieldId, id) {
  let element;
  if (typeof selector === 'string')
    element = dom.find(selector);
  else
    element = selector;
  if (id) {

  } else {
    let elementModelId = element.getAttribute(fieldId);
    let children = element.parentElement.querySelectorAll(element.tagName);
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      let childModelId = child.getAttribute(fieldId);
      if (elementModelId == childModelId) {
        return i;
      }
    }
  }
  return -1;
};

dom.elementAt = function (selector, fieldId, id) {
  let children = document.querySelectorAll(selector);
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let childModelId = child.getAttribute(fieldId);
    if (id == childModelId) {
      return {index: i, element: child};
    }
  }
  return null;
};

dom.elementAtTree = function (selector, fieldId, fieldParentId, id, parentId) {
  let children = document.querySelectorAll(selector);
  let index = 0;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    let childModelId = child.getAttribute(fieldId);
    let childModelParentId = child.getAttribute(fieldParentId);
    if (parentId == childModelParentId) {
      index++;
      if (id == childModelId) {
        return {index: index, element: child};
      }
    }
  }
};


dom.stack = function (paginationTable, td, rowIndex, render) {
  let link = dom.create('a', 'btn', 'btn-link');
  let icon = dom.create('i', 'fas', 'fa-caret-right', 'mr-1');
  link.appendChild(icon);

  dom.bind(link, 'click', function() {
    let icon = dom.find('i', link);
    if (icon.classList.contains('fa-caret-right')) {
      paginationTable.container.querySelectorAll('i.fa-caret-down').forEach(icon => {
        icon.classList.remove('fa-caret-down');
        icon.classList.add('fa-caret-right');
      });
      icon.classList.remove('fa-caret-right');
      icon.classList.add('fa-caret-down');

      // 显示
      paginationTable.stack(rowIndex, function(td) {
        td.parentElement.classList.add('fade', 'fadeIn');
        td.style.paddingLeft = '50px';
        td.style.paddingRight = '50px';
        setTimeout(function() {
          td.parentElement.classList.add('show');
        }, 200);
        render(td)
      });
    } else {
      icon.classList.remove('fa-caret-down');
      icon.classList.add('fa-caret-right');
      td.parentElement.nextSibling.remove();
    }
  });
};

/**
 * 计算元素的内部空间。
 *
 * @param element
 */
dom.inner = function(element) {
  let height = element.clientHeight;
  let width = element.clientWidth;
  let style = getComputedStyle(element);
  return {
    height: height
      - parseInt(style.paddingTop)
      - parseInt(style.paddingBottom),
    width: width
      - parseInt(style.paddingLeft)
      - parseInt(style.paddingLeft)
  }
};

/**
 * 计算元素的内部空间。
 *
 * @param element
 */
dom.outer = function(element) {
  let height = element.clientHeight;
  let width = element.clientWidth;
  let style = getComputedStyle(element);
  return {
    height: height
      + parseInt(style.marginTop) + parseInt(style.borderTop)
      + parseInt(style.marginBottom) + parseInt(style.borderBottom),
    width: width
      + parseInt(style.marginLeft) + parseInt(style.borderLeft)
      + parseInt(style.marginRight) + parseInt(style.borderRight)
  }
};

/*
* 根据父元素和偏移量重新制定元素的高度
*  @param element
* */

dom.height = function(selector, offset, parent) {
  offset = offset || 0;
  if (typeof parent === 'undefined') {
    parent = dom.find('#container');
  }
  parent = parent || document.body;
  let element = null;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  let offsetTop = dom.top(element);
  let computedStyle = getComputedStyle(parent,null);

  let paddingTop = parseInt(computedStyle.getPropertyValue('padding-top'));
  let paddingBottom = parseInt(computedStyle.getPropertyValue('padding-bottom'));
  computedStyle = getComputedStyle(element,null);
  let borderTopWidth = parseInt(computedStyle.getPropertyValue('border-top-width'));
  let borderBottomWidth = parseInt(computedStyle.getPropertyValue('border-bottom-width'));

  element.style.marginBottom = '0px';
  // let ancestor = dom.ancestor(element, 'div', 'full');
  // if (ancestor == null) {
  //   paddingBottom = 0;
  // }
  element.style.height = (parent.clientHeight - offsetTop - offset - paddingBottom) + 'px';
  element.style.overflowY = 'auto';
};

dom.height2 = function(selector, offset, parent) {
  offset = offset || 0;
  if (typeof parent === 'undefined') {
    parent = dom.find('#container');
  }
  parent = parent || document.body;
  let element = null;
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  let offsetTop = dom.top(element);
  let computedStyle = getComputedStyle(parent,null);

  let paddingTop = parseInt(computedStyle.getPropertyValue('padding-top'));
  let paddingBottom = parseInt(computedStyle.getPropertyValue('padding-bottom'));

  computedStyle = getComputedStyle(element,null);
  let borderTopWidth = parseInt(computedStyle.getPropertyValue('border-top-width'));
  let borderBottomWidth = parseInt(computedStyle.getPropertyValue('border-bottom-width'));
  let marginTop = parseInt(computedStyle.getPropertyValue('border-top-width'));
  let marginBottom = parseInt(computedStyle.getPropertyValue('border-bottom-width'));
  element.style.marginBottom = '0px';
  let rect = parent.getBoundingClientRect();
  element.style.height = (rect.height
    - paddingTop - paddingBottom
    - borderTopWidth - borderBottomWidth
    - marginTop - marginBottom
    - offset
  ) + 'px';
  element.style.overflowY = 'auto';
};

dom.autoheight = function (selector, ancestor, customOffset) {
  customOffset = customOffset || 0;
  let el = dom.find(selector);
  if (el == null) return;
  ancestor = ancestor || document.body;
  let rectAncestor = ancestor.getBoundingClientRect();

  let height = rectAncestor.height;
  if (ancestor === document.body) {
    height = window.innerHeight;
  }

  let parent = el.parentElement;
  let rectParent = parent.getBoundingClientRect();
  let rect = el.getBoundingClientRect();
  let parentOffsetTop = parseInt(parent.offsetTop);

  let top = rect.top - rectAncestor.top;
  // 计算底部的高度
  let bottom = 0;
  while (parent !== ancestor) {
    let style = getComputedStyle(parent);
    bottom += parseInt(style.paddingBottom);
    bottom += parseInt(style.marginBottom);
    bottom += parseInt(style.borderBottomWidth);
    parent = parent.parentElement;
  }
  let style = getComputedStyle(el);
  bottom += parseInt(style.borderBottomWidth);

  el.style.height = (height - bottom - customOffset - top) + 'px';
  el.style.overflowY = 'auto';
};

dom.templatize = function(template, model) {
  let tpl = Handlebars.compile(template);
  let html = tpl(model);
  return dom.element(html);
};

/*
* 根据后台返回的对象渲染值进入dom
* selector:父元素节点
* data:需要渲染的数据
* isRadioToMulti:是否将单选框渲染为多选框
* */
dom.render=function (selector,data,isRadioToMulti) {
  let container = null;
  if (typeof selector === 'string') {
    container = document.querySelector(selector);
  } else {
    container = selector;
  }
  /*
   *将单选框的值设置为多选框
   *parentSelector：多选框组的父元素，通过data中的key得到
   *keyValue：需要渲染的值与多选框中的let-id相对应
  */
  function setRadioToCheckBox(parentSelector,keyValue){
    let checkedCheckBox=dom.find('[value=\'' + keyValue + '\']', parentSelector)
    if(checkedCheckBox!=null){
      checkedCheckBox.checked=true
    }
  }
  /*
  *
  * 根据当前元素的类型进行赋值
  *
  * */
  function setElementValue(container, name, val) {
    let el = dom.find('[name=\'' + name + '\']', container);
    if (el == null) return;
    let nodeName= el.nodeName

    //div下的checkbox
    if (nodeName === 'DIV' && isRadioToMulti) {
      if(val){
        setRadioToCheckBox(el,val)
      }
    }
    else if (el.tagName == 'INPUT') {
      if (el.type == 'radio') {
        // TODO
      } else {
        el.value = val;
      }
    }
    else if (el.tagName == 'SPAN') {
      if(val){
        el.innerHTML = val;
      }
    }
    else if (el.tagName == 'SELECT') {
      $('select[name=\'' + name + '\']').val(val).trigger('change');
    }
  }
  for (let key in data) {
    if (typeof data[key] === 'object') {
      for (let innerKey in data[key]) {
        setElementValue(container, key + '.' + innerKey, data[key][innerKey]);
      }
    } else {
      setElementValue(container, key, data[key]);
    }
  }
};

dom.popup = function(container, element) {
  let mask = dom.create('div', 'full-width', 'full-height', 'position-absolute');
  mask.style.background = 'transparent';
  dom.bind(mask, 'click', ev => {
    mask.remove();
    element.remove();
  });
  document.body.appendChild(mask);
  container.appendChild(element);
  return mask;
};

dom.html = function(element) {
  let div = dom.element('<div></div>');
  div.appendChild(element);
  return div.innerHTML;
};

dom.init = function (owner, element) {
  if (!element) return;
  let name = element.getAttribute('name');
  if (!name || name == '') {
    name = element.getAttribute('widget-id');
  }
  if (name && name != '') {
    owner[name] = element;
  }
  // 提示
  let tooltip = element.getAttribute('widget-model-tooltip');
  if (tooltip && tooltip != '') {
    tippy(element, {
      content: tooltip,
    });
  }
  for (let i = 0; i < element.children.length; i++) {
    let child = element.children[i];
    dom.init(owner, child);
  }
};

dom.makeUpload = function (el, fi, params, cb) {
  fi.onchange = ev => {
    if (!fi.files || fi.files.length == 0) return;
    // let img = fi.files[0];
    // let reader = new FileReader();
    // reader.onload = () => {
    //   cb(reader.result);
    // };
    // reader.readAsDataURL(img);
    xhr.upload({
      url: '/api/v3/common/upload',
      params: {
        ...params,
        file: fi.files[0],
      },
      success: res => {
        if (res.data) {
          res = res.data;
        }
        cb(res.webpath);
      },
    })
  };
  el.onclick = ev => {
    fi.click();
  };
};

/**
 * 判断模型数据是否已经存在于载有模型的DOM元素中。
 *
 * @param elements
 *        元素数组
 *
 * @param model
 *        数据模型
 *
 * @param id
 *        标识字段名称
 *
 * @returns {boolean}
 */
dom.exists = (elements, model, id) => {
  for (let i = 0; i < elements.length; i++) {
    let el = elements[i];
    let m = dom.model(el);
    if (m[id] === model[id]) return true;
  }
  return false;
};

dom.getDataFromChildren = (parent, childrenSelector, attrs) => {
  let ret = [];
  let children = parent.querySelectorAll(childrenSelector);
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    if (typeof attrs === 'undefined') {
      ret.push(dom.model(child));
    } else if (Array.isArray(attrs)) {
      let row = {};
      for (let j = 0; j < attrs.length; j++) {
        row[attrs[j]] = child.getAttribute(attrs[j]);
      }
      ret.push(row);
    } else if (typeof attrs === 'string') {
      let row = {};
      row[attrs] = child.getAttribute(attrs);
      ret.push(row);
    }
  }
  return ret;
};