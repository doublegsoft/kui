let util = {
  render: function (options) {
    let actionsSheet = document.getElementById('action_sheet')
    if (actionsSheet !== null) {
      document.body.removeChild(actionsSheet)
      actionsSheet = null
    }
    this.oldOptions = options
    let pre = util.detectTransition[0]
    let preTF = pre + 'TimingFunction'
    let preDT = pre + 'Duration'
    let obj = {
      textAlign: 'center',
      position: 'absolute',
      width: window.innerWidth + 'px',
      fontSize: '24px',
      fontWeight: 'bold',
      'z-index': 999999,
      top: '-20px',
      left: '10px',
      width: (window.innerWidth - 20) + 'px',
      borderTop: 'solid 1px var(--color-white)',
      borderRadius: '15px',
    }
    if (util.detectTransform) {
      obj[util.detectTransform] = 'translate3d(0px,' + (window.innerHeight) + 'px, 0px)'
    } else {
      // obj[util.detectTransform] = (window.innerHeight) + 'px'
      obj[util.detectTransform] = 'translate3d(0px,' + (window.innerHeight) + 'px, 0px)'
    }
    obj[pre] = util.detectTransform || 'top'
    obj[preTF] = options.easing
    obj[preDT] = options.in + 'ms'
    let containerDiv = this.getDom('div', obj)
    containerDiv.style.transform = 'translate3d(0px,' + (window.innerHeight) + 'px, 0px)';
    containerDiv.id = 'action_sheet'
    let titleDiv = this.getDom('div', {
      fontSize: '20px',
      fontWeight: 'bold',
      height: '50px',
      lineHeight: '50px',
      backgroundColor: 'var(--color-white)',
      borderTopLeftRadius: '15px',
      borderTopRightRadius: '15px',
    });
    titleDiv.innerText = options.title;
    containerDiv.appendChild(titleDiv);
    let frag = this.renderLabel(options.labels);
    containerDiv.appendChild(frag);
    document.body.appendChild(containerDiv);
    containerDiv.style.transform = 'translate3d(0px,' + (window.innerHeight - options.labels.length * 51 - 50) + 'px, 0px)';
    containerDiv.style.transition = 'transform 300ms linear 0ms';
    containerDiv.addEventListener('click', function (e) {
      options.fn(parseInt(e.target.dataset.index), e.target.innerText)
    });
    let overlay = document.createElement('div');
    overlay.id = 'action_sheet_overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = window.innerWidth + 'px';
    overlay.style.height = window.innerHeight + 'px';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    overlay.style.zIndex = '9999';
    overlay.onclick = ev => {
      overlay.remove();
      ActionSheet.hide();
    }
    document.body.appendChild(overlay);
  },
  getDom: function (name, styles) {
    let dom = document.createElement(name)
    for (let k in styles) {
      dom.style[k] = styles[k]
    }
    return dom
  },
  renderLabel: function (labels) {
    let frag = document.createDocumentFragment()
    for (let i = 0, length = labels.length; i < length; i++) {
      let d = this.getDom('div', {
        height: '50px',
        lineHeight: '50px',
        color: 'var(--color-info)',
        backgroundColor: 'var(--color-white)',
        fontSize: '20px',
        borderTop: 'solid 1px #e5e5e5',
      })
      if (i == labels.length - 2) {
        d.style.borderTop = 'solid 1px #e5e5e5';
        d.style.borderBottomLeftRadius = '15px';
        d.style.borderBottomRightRadius = '15px';
      }
      if (i == labels.length - 1) {
        d.style.color = 'var(--color-error)';
        d.style.marginTop = '10px';
        d.style.border = 'solid 1px var(--color-white)';
        d.style.borderRadius = '15px';
      }
      d.dataset.index = i
      d.innerText = labels[i]
      frag.appendChild(d)
    }
    return frag
  },
  detectTransition: (function () {
    let t
    let el = document.createElement('surface')
    let transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    }
    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return [t, transitions[t]]
      }
    }
  })(),
  detectTransform: (function () {
    let t
    let el = document.createElement('surface')
    let transforms = [
      'transform',
      'OTransform',
      'MozTransform',
      'WebkitTransform'
    ]
    for (t in transforms) {
      if (el.style[transforms[t]] !== undefined) {
        return transforms[t]
      }
    }
  })()
}

let ActionSheet = {}

ActionSheet.show = function (title, fn) {
  let identify = Object.prototype.toString.call(title);
  let callback;
  let self = this;
  if (identify === '[object Function]') {
    callback = title;
    util.render({
      title: '请选择操作',
      labels: ['确定', '取消'],
      fn: function (index) {
        switch (index) {
          case 0:
            callback('ok')
            self.hide()
            break
          case 1:
            callback('cancel')
            self.hide()
            break
        }
      },
      easing: 'ease-in-out',
      in: 300,
      out: 300
    })
  } else if (identify === '[object String]') {
    callback = fn
    util.render({
      title: title,
      labels: ['确定', '取消'],
      fn: function (index) {
        switch (index) {
          case 0:
            callback('ok')
            self.hide()
            break
          case 1:
            callback('cancel')
            self.hide()
            break
        }
      },
      easing: 'ease-in-out',
      in: 300,
      out: 300
    })
  } else if (identify === '[object Object]') {
    let options = title
    let defaultConfig = {
      title: '请选择操作',
      labels: ['取消'],
      fn: function (index, v) {
        alert(index + ',' + v)
      },
      easing: 'ease-in-out',
      in: 300,
      out: 300,
    }
    defaultConfig.labels = options.labels.concat(defaultConfig.labels)
    options.title && (defaultConfig.title = options.title)
    options.easing && (defaultConfig.easing = options.easing)
    options.in && (defaultConfig.in = options.in)
    options.out && (defaultConfig.out = options.out)
    defaultConfig.fn = function (index, v) {
      if(v === '取消') {
        self.hide(options.fn && options.fn)
      } else {
        options.onSelected(index, v)
        self.hide();
      }
    }
    util.render(defaultConfig)
  } else {
    throw new SyntaxError('argument error')
  }
}

ActionSheet.hide = function (fn) {
  let actionsSheet = document.getElementById('action_sheet');
  let overlay = document.getElementById('action_sheet_overlay');
  if (overlay != null)
    overlay.remove();
  actionsSheet.style.transform = 'translate3d(0px, ' +  window.innerHeight + 'px, 0px)';
  setTimeout(() => {
    actionsSheet.remove();
  }, 300);
  // let transitionEvent = util.detectTransition[1];
  // transitionEvent && actionsSheet.addEventListener(transitionEvent, function () {
  //   document.body.removeChild(actionsSheet);
  //   actionsSheet.remove();
  //   if (fn) {
  //     fn()
  //   }
  //   actionsSheet.removeEventListener(transitionEvent, arguments.callee, false) // 销毁事件
  // });
  // actionsSheet.style.top = window.innerHeight + 'px'
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = ActionSheet
} else {
  window.ActionSheet = ActionSheet
}
