var util = {
  render: function (options) {
    var actionsSheet = document.getElementById('action_sheet')
    if (actionsSheet !== null) {
      document.body.removeChild(actionsSheet)
      actionsSheet = null
    }
    this.oldOptions = options
    var pre = util.detectTransition[0]
    var preTF = pre + 'TimingFunction'
    var preDT = pre + 'Duration'
    var obj = {
      textAlign: 'center',
      position: 'absolute',
      width: window.innerWidth + 'px',
      fontSize: '15px',
      backgroundColor: '#fff',
      top: '0px'
    }
    if (util.detectTransform) {
      obj[util.detectTransform] = 'translate3d(0px,' + window.innerHeight + 'px, 0px)'
    } else {
      obj[util.detectTransform] = window.innerHeight + 'px'
    }
    obj[pre] = util.detectTransform || 'top'
    obj[preTF] = options.easing
    obj[preDT] = options.in + 'ms'
    var containerDiv = this.getDom('div', obj)
    containerDiv.id = 'action_sheet'
    var titleDiv = this.getDom('div', {
      color: '#bbb',
      height: '50px',
      lineHeight: '50px'
    })
    titleDiv.innerText = options.title
    containerDiv.appendChild(titleDiv)
    var frag = this.renderLabel(options.labels)
    containerDiv.appendChild(frag)
    document.body.appendChild(containerDiv)
    containerDiv.style[util.detectTransform] = 'translate3d(0px,' + (window.innerHeight - options.labels.length * 51 - 50) + 'px, 0px)'
    // containerDiv.style[util.detectTransform] = 'translate3d(0, 0, 0px)'
    containerDiv.addEventListener('click', function (e) {
      options.fn(parseInt(e.target.dataset.index), e.target.innerText)
    })
  },
  getDom: function (name, styles) {
    var dom = document.createElement(name)
    for (var k in styles) {
      dom.style[k] = styles[k]
    }
    return dom
  },
  renderLabel: function (labels) {
    var frag = document.createDocumentFragment()
    for (var i = 0, length = labels.length; i < length; i++) {
      var d = this.getDom('div', {
        height: '50px',
        lineHeight: '50px',
        color: '#333',
        borderTop: 'solid 1px #e5e5e5'
      })
      d.dataset.index = i
      d.innerText = labels[i]
      frag.appendChild(d)
    }
    return frag
  },
  detectTransition: (function () {
    var t
    var el = document.createElement('surface')
    var transitions = {
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
    var t
    var el = document.createElement('surface')
    var transforms = [
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

var ActionSheet = {}

ActionSheet.show = function (title, fn) {
  var identify = Object.prototype.toString.call(title)
  var callback
  var self = this
  if (identify === '[object Function]') {
    callback = title
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
    var options = title
    var defaultConfig = {
      title: '请选择操作',
      labels: ['取消'],
      fn: function (index, v) {
        alert(index + ',' + v)
      },
      easing: 'ease-in-out',
      in: 1000,
      out: 300
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
        options.fn(index, v)
        self.hide()
      }
    }
    util.render(defaultConfig)
  } else {
    throw new SyntaxError('argument error')
  }
}

ActionSheet.hide = function (fn) {
  var actionsSheet = document.getElementById('action_sheet')
  var transitionEvent = util.detectTransition[1]
  transitionEvent && actionsSheet.addEventListener(transitionEvent, function () {
    document.body.removeChild(actionsSheet)
    if (fn) {
      fn()
    }
    actionsSheet.removeEventListener(transitionEvent, arguments.callee, false) // 销毁事件
  })
  actionsSheet.style.top = window.innerHeight + 'px'
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = ActionSheet
} else {
  window.ActionSheet = ActionSheet
}
