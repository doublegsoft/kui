if (typeof toast === 'undefined') toast = {};

TOAST_HTML = `
  <div class="toast fade b-a-1 text-white" data-autohide="false" 
       style="position: absolute; left: 20%; top: 10px; width: 60%; z-index: -1;">
    <div class="toast-header pt-1">
      <strong class="mr-auto p-2"></strong>
      <button type="button" class="ml-2 mb-1 mr-2 close text-white" data-dismiss="toast">&times;</button>
    </div>
    <div class="toast-body p-2"></div>
  </div>
`;

toast.success = function(selector, message) {
  let container = null;
  if (typeof selector === 'string') {
    container = dom.find(selector);
  } else {
    container = selector;
  }
  let toast = dom.find('.toast', container);
  if (toast == null) {
    toast = dom.element(TOAST_HTML);
    container.appendChild(toast);
  }

  toast.style.zIndex = 11000;
  dom.find('.toast-body', toast).innerHTML = message;
  dom.find('strong', toast).innerText = '成功';
  toast.classList.add('bg-success', 'show', 'in');

  setTimeout(function() {
    toast.remove();
  }, 2000);
};

toast.info = function(selector, message) {
  let container = null;
  if (typeof selector === 'string') {
    container = dom.find(selector);
  } else {
    container = selector;
  }
  let toast = dom.find('.toast', container);
  if (toast == null) {
    toast = dom.element(TOAST_HTML);
    container.appendChild(toast);
  }

  toast.style.zIndex = 11000;
  dom.find('.toast-body', toast).innerHTML = message;
  dom.find('strong', toast).innerText = '成功';
  toast.classList.add('bg-info', 'show', 'in');

  setTimeout(function() {
    toast.remove();
  }, 2000);
};

toast.error = function(selector, message) {
  let container = null;
  if (typeof selector === 'string') {
    container = dom.find(selector);
  } else {
    container = selector;
  }
  let toast = dom.find('.toast', container);
  if (toast == null) {
    toast = dom.element(TOAST_HTML);
    container.appendChild(toast);
  }
  dom.bind(dom.find('button', toast), 'click', event => {
    toast.remove();
  });
  toast.style.zIndex = 11000;
  dom.find('.toast-body', toast).innerHTML = message;
  dom.find('strong', toast).innerText = '错误';
  toast.classList.add('bg-danger', 'show', 'in');
};