var ajax = {};

/**
 * 保存数据。
 * 
 * @param {string} url - 请求保存路径
 * 
 * @param {object} form - JQuery表单对象
 * 
 * @param {function} callback - 回调函数
 */
ajax.save = function(url, form, callback) {
  var errors = form.validate();
  var errmsg = '';
  for (var i = 0; i < errors.length; i++) {
    errmsg += errors[i].message + '<br>';
  }
  if (errmsg != '') {
    dialog.error(errmsg);
    return;
  }
  var data = form.formdata();
  $.ajax({
    url : url,
    data : data,
    method : 'POST',
    dataType : 'json',
    success : function(resp) {
      if (typeof resp.error !== 'undefined') {
        dialog.error('保存出错！');
        return;
      }
      dialog.success('保存成功！');
      if (typeof callback !== 'undefined') {
        callback(resp);
      }
    }
  });
};

/**
 * 保存数据的另一种形式。
 * 
 * @param {string} url - 请求保存路径
 * 
 * @param {object} form - JQuery表单对象
 * 
 * @param {function} callback - 回调函数
 */
ajax.post = function(url, data, callback) {
  $.ajax({
    url : url,
    data : data,
    method : 'POST',
    dataType : 'json',
    success : function(resp) {
      if (typeof resp.error !== 'undefined') {
        dialog.error('请求出错！');
        return;
      }
      if (typeof callback !== 'undefined') {
        callback(resp);
      }
    }
  });
};

ajax.get = function(url, data, callback) {
  $.ajax({
    url : url,
    data : data,
    dataType : 'json',
    success : function(resp) {
      if (typeof callback !== 'undefined') {
        callback(resp);
      }
    }
  });
};

/**
 * 
 */
ajax.text = function(url, data, callback) {
  $.ajax({
    url : url,
    data : data,
    success : function(resp) {
      if (typeof callback !== 'undefined') {
        callback(resp);
      }
    }
  });
};

ajax.view = function(url, containerId, data, callback) {
  if (typeof data === 'undefined')
    data = {};
  $.ajax({
    url : url,
    data : data,
    success : function(resp) {
      var container = document.getElementById(containerId);
      if (container) {
        utils.append(container, resp);
      }
      if (callback)
        callback(resp);
    }
  });
};

/**
 * Uses handlebars template engine to render a template block after 
 * getting data from backend.
 * 
 * @param {string} url 
 *        the http url to get data
 * 
 * @param {string} containerId
 *        the id of container to append rendered source
 * 
 * @param {string} templateId
 *        the id of template html block
 * 
 * @param {object} data 
 *        the http request data
 * 
 * @param {function} callback
 *        the callback function after rendering
 */
ajax.template = function(url, containerId, templateId, data, callback) {
  $.ajax({
    url : url,
    data : data,
    success : function(resp) {
      if (containerId) {
        var source = document.getElementById(templateId).innerHTML;
        var template = Handlebars.compile(source);
        var html = template(resp);

        var container = document.getElementById(containerId);
        container.innerHTML = html;
      }
      if (callback)
        callback();
    }
  });
};

/**
 * 直接打开页面窗口。
 * 
 * @param {string} title - 标题
 * 
 * @param {string} url - 资源链接
 * 
 * @param {object} data - 请求参数数据
 * 
 * @param {integer} width - 宽度
 * 
 * @param {integer} height - 高度
 */
ajax.dialog = function(title, url, data, width, height, callback) {
  $.ajax({
    url : url,
    data : data,
    async : false,
    success : function(html) {
      layer.open({
        type : 1,
        title : title,
        shadeClose : false,
        skin : 'layui-layer-rim', //加上边框
        area : [ width + 'px', height + 'px' ], //宽高
        content : html,
        end: callback || function () {}
      });
    }
  });
};

/**
 * 直接打开视频窗口。
 * 
 * @param {string} url - 资源链接
 * 
 * @param {object} data - 请求参数数据
 * 
 * @param {integer} width - 宽度
 * 
 * @param {integer} height - 高度
 */
ajax.video = function(url, data, width, height) {
  layer.open({
    type : 2,
    title : false,
    closeBtn : 1, //不显示关闭按钮
    shade : [ 0 ],
    area : [ width + 'px', height + 'px' ],
    offset : 'rb', //右下角弹出
    anim : 2,
    content : [ url, 'no' ]
  //iframe的url，no代表不显示滚动条
  });
};

/**
 * 加载SVG图片利用ajax方法。
 */
ajax.svg = function(url, cntr, data, callback) {
  if (typeof data === 'undefined')
    data = {};
  $.ajax({
    url : url,
    data : data,
    success : function(xml) {
      cntr.empty();
      var html = new XMLSerializer().serializeToString(xml.documentElement);
      cntr.html(html);
      if (callback)
        callback(xml);
    }
  });
};

/**
 * 利用ajax上传文件。
 */
ajax.upload = function(url, data, onSuccess, onProgress, onError) {
  if (typeof data === 'undefined')
    data = {};
  var formdata = new FormData();
  for (var k in data) {
    formdata.append(k, data[k]);
  }
  $.ajax({
    url : url,
    data : formdata,
    method : 'POST',
    cache: false,
    contentType : false,
    processData : false,
    xhr: function() {
      var ret = $.ajaxSettings.xhr();
      if(ret.upload && onProgress){
        ret.upload.addEventListener('progress', function(e) {
          if(e.lengthComputable){
            if (onProgress)
              onProgress(e.total, e.loaded);
          }  
        }, false);
      }
      return ret;
    },
    success: function(resp) {
      if (onSuccess)
        onSuccess(resp);
    },
    error: function(resp) {
      if (onError)
        onError(resp);
    }
  });
};

function Alarm(option) {
    this.iconId = option.iconId;
    this.mp3url = option.mp3url;
}

Alarm.prototype.start = function () {
    this.audio = document.createElement('audio');
    this.audio.setAttribute('autoplay', 'autoplay');
    this.audio.setAttribute('loop', 'loop');
    var source = document.createElement('source');
    source.setAttribute('src', this.mp3url);
    source.setAttribute('type', 'audio/mpeg');
    this.audio.appendChild(source);
    document.body.appendChild(this.audio);

    var icon = document.getElementById(this.iconId);
    icon.className = 'icon-bell bell';
};

Alarm.prototype.stop = function () {
    this.audio.pause();
    var icon = document.getElementById(this.iconId);
    icon.className = 'icon-bell';
    document.body.removeChild(this.audio);
};
/*!
 * Bootstrap v3.3.7 (http://getbootstrap.com)
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under the MIT license
 */
if (typeof jQuery === 'undefined') {
    throw new Error('Bootstrap\'s JavaScript requires jQuery')
}

+
function($) {
    'use strict';
    var version = $.fn.jquery.split(' ')[0].split('.')
    if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
        throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4')
    }
}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.3.7
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap')

        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        }

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                }
            }
        }

        return false // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false
        var $el = this
        $(this).one('bsTransitionEnd', function() {
            called = true
        })
        var callback = function() {
            if (!called) $($el).trigger($.support.transition.end)
        }
        setTimeout(callback, duration)
        return this
    }

    $(function() {
        $.support.transition = transitionEnd()

        if (!$.support.transition) return

        $.event.special.bsTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function(e) {
                if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
            }
        }
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.3.7
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // ALERT CLASS DEFINITION
    // ======================

    var dismiss = '[data-dismiss="alert"]'
    var Alert = function(el) {
        $(el).on('click', dismiss, this.close)
    }

    Alert.VERSION = '3.3.7'

    Alert.TRANSITION_DURATION = 150

    Alert.prototype.close = function(e) {
        var $this = $(this)
        var selector = $this.attr('data-target')

        if (!selector) {
            selector = $this.attr('href')
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
        }

        var $parent = $(selector === '#' ? [] : selector)

        if (e) e.preventDefault()

        if (!$parent.length) {
            $parent = $this.closest('.alert')
        }

        $parent.trigger(e = $.Event('close.bs.alert'))

        if (e.isDefaultPrevented()) return

        $parent.removeClass('in')

        function removeElement() {
            // detach from parent, fire event then clean up data
            $parent.detach().trigger('closed.bs.alert').remove()
        }

        $.support.transition && $parent.hasClass('fade') ?
            $parent
            .one('bsTransitionEnd', removeElement)
            .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
            removeElement()
    }


    // ALERT PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.alert')

            if (!data) $this.data('bs.alert', (data = new Alert(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }

    var old = $.fn.alert

    $.fn.alert = Plugin
    $.fn.alert.Constructor = Alert


    // ALERT NO CONFLICT
    // =================

    $.fn.alert.noConflict = function() {
        $.fn.alert = old
        return this
    }


    // ALERT DATA-API
    // ==============

    $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.3.7
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // BUTTON PUBLIC CLASS DEFINITION
    // ==============================

    var Button = function(element, options) {
        this.$element = $(element)
        this.options = $.extend({}, Button.DEFAULTS, options)
        this.isLoading = false
    }

    Button.VERSION = '3.3.7'

    Button.DEFAULTS = {
        loadingText: 'loading...'
    }

    Button.prototype.setState = function(state) {
        var d = 'disabled'
        var $el = this.$element
        var val = $el.is('input') ? 'val' : 'html'
        var data = $el.data()

        state += 'Text'

        if (data.resetText == null) $el.data('resetText', $el[val]())

        // push to event loop to allow forms to submit
        setTimeout($.proxy(function() {
            $el[val](data[state] == null ? this.options[state] : data[state])

            if (state == 'loadingText') {
                this.isLoading = true
                $el.addClass(d).attr(d, d).prop(d, true)
            } else if (this.isLoading) {
                this.isLoading = false
                $el.removeClass(d).removeAttr(d).prop(d, false)
            }
        }, this), 0)
    }

    Button.prototype.toggle = function() {
        var changed = true
        var $parent = this.$element.closest('[data-toggle="buttons"]')

        if ($parent.length) {
            var $input = this.$element.find('input')
            if ($input.prop('type') == 'radio') {
                if ($input.prop('checked')) changed = false
                $parent.find('.active').removeClass('active')
                this.$element.addClass('active')
            } else if ($input.prop('type') == 'checkbox') {
                if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
                this.$element.toggleClass('active')
            }
            $input.prop('checked', this.$element.hasClass('active'))
            if (changed) $input.trigger('change')
        } else {
            this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
            this.$element.toggleClass('active')
        }
    }


    // BUTTON PLUGIN DEFINITION
    // ========================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.button')
            var options = typeof option == 'object' && option

            if (!data) $this.data('bs.button', (data = new Button(this, options)))

            if (option == 'toggle') data.toggle()
            else if (option) data.setState(option)
        })
    }

    var old = $.fn.button

    $.fn.button = Plugin
    $.fn.button.Constructor = Button


    // BUTTON NO CONFLICT
    // ==================

    $.fn.button.noConflict = function() {
        $.fn.button = old
        return this
    }


    // BUTTON DATA-API
    // ===============

    $(document)
        .on('click.bs.button.data-api', '[data-toggle^="button"]', function(e) {
            var $btn = $(e.target).closest('.btn')
            Plugin.call($btn, 'toggle')
            if (!($(e.target).is('input[type="radio"], input[type="checkbox"]'))) {
                // Prevent double click on radios, and the double selections (so cancellation) on checkboxes
                e.preventDefault()
                // The target component still receive the focus
                if ($btn.is('input,button')) $btn.trigger('focus')
                else $btn.find('input:visible,button:visible').first().trigger('focus')
            }
        })
        .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function(e) {
            $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
        })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.3.7
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function(element, options) {
        this.$element = $(element)
        this.$indicators = this.$element.find('.carousel-indicators')
        this.options = options
        this.paused = null
        this.sliding = null
        this.interval = null
        this.$active = null
        this.$items = null

        this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

        this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
            .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
            .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
    }

    Carousel.VERSION = '3.3.7'

    Carousel.TRANSITION_DURATION = 600

    Carousel.DEFAULTS = {
        interval: 5000,
        pause: 'hover',
        wrap: true,
        keyboard: true
    }

    Carousel.prototype.keydown = function(e) {
        if (/input|textarea/i.test(e.target.tagName)) return
        switch (e.which) {
            case 37:
                this.prev();
                break
            case 39:
                this.next();
                break
            default:
                return
        }

        e.preventDefault()
    }

    Carousel.prototype.cycle = function(e) {
        e || (this.paused = false)

        this.interval && clearInterval(this.interval)

        this.options.interval &&
            !this.paused &&
            (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

        return this
    }

    Carousel.prototype.getItemIndex = function(item) {
        this.$items = item.parent().children('.item')
        return this.$items.index(item || this.$active)
    }

    Carousel.prototype.getItemForDirection = function(direction, active) {
        var activeIndex = this.getItemIndex(active)
        var willWrap = (direction == 'prev' && activeIndex === 0) ||
            (direction == 'next' && activeIndex == (this.$items.length - 1))
        if (willWrap && !this.options.wrap) return active
        var delta = direction == 'prev' ? -1 : 1
        var itemIndex = (activeIndex + delta) % this.$items.length
        return this.$items.eq(itemIndex)
    }

    Carousel.prototype.to = function(pos) {
        var that = this
        var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

        if (pos > (this.$items.length - 1) || pos < 0) return

        if (this.sliding) return this.$element.one('slid.bs.carousel', function() {
            that.to(pos)
        }) // yes, "slid"
        if (activeIndex == pos) return this.pause().cycle()

        return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
    }

    Carousel.prototype.pause = function(e) {
        e || (this.paused = true)

        if (this.$element.find('.next, .prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end)
            this.cycle(true)
        }

        this.interval = clearInterval(this.interval)

        return this
    }

    Carousel.prototype.next = function() {
        if (this.sliding) return
        return this.slide('next')
    }

    Carousel.prototype.prev = function() {
        if (this.sliding) return
        return this.slide('prev')
    }

    Carousel.prototype.slide = function(type, next) {
        var $active = this.$element.find('.item.active')
        var $next = next || this.getItemForDirection(type, $active)
        var isCycling = this.interval
        var direction = type == 'next' ? 'left' : 'right'
        var that = this

        if ($next.hasClass('active')) return (this.sliding = false)

        var relatedTarget = $next[0]
        var slideEvent = $.Event('slide.bs.carousel', {
            relatedTarget: relatedTarget,
            direction: direction
        })
        this.$element.trigger(slideEvent)
        if (slideEvent.isDefaultPrevented()) return

        this.sliding = true

        isCycling && this.pause()

        if (this.$indicators.length) {
            this.$indicators.find('.active').removeClass('active')
            var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
            $nextIndicator && $nextIndicator.addClass('active')
        }

        var slidEvent = $.Event('slid.bs.carousel', {
            relatedTarget: relatedTarget,
            direction: direction
        }) // yes, "slid"
        if ($.support.transition && this.$element.hasClass('slide')) {
            $next.addClass(type)
            $next[0].offsetWidth // force reflow
            $active.addClass(direction)
            $next.addClass(direction)
            $active
                .one('bsTransitionEnd', function() {
                    $next.removeClass([type, direction].join(' ')).addClass('active')
                    $active.removeClass(['active', direction].join(' '))
                    that.sliding = false
                    setTimeout(function() {
                        that.$element.trigger(slidEvent)
                    }, 0)
                })
                .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
        } else {
            $active.removeClass('active')
            $next.addClass('active')
            this.sliding = false
            this.$element.trigger(slidEvent)
        }

        isCycling && this.cycle()

        return this
    }


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.carousel')
            var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
            var action = typeof option == 'string' ? option : options.slide

            if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
            if (typeof option == 'number') data.to(option)
            else if (action) data[action]()
            else if (options.interval) data.pause().cycle()
        })
    }

    var old = $.fn.carousel

    $.fn.carousel = Plugin
    $.fn.carousel.Constructor = Carousel


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.carousel.noConflict = function() {
        $.fn.carousel = old
        return this
    }


    // CAROUSEL DATA-API
    // =================

    var clickHandler = function(e) {
        var href
        var $this = $(this)
        var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
        if (!$target.hasClass('carousel')) return
        var options = $.extend({}, $target.data(), $this.data())
        var slideIndex = $this.attr('data-slide-to')
        if (slideIndex) options.interval = false

        Plugin.call($target, options)

        if (slideIndex) {
            $target.data('bs.carousel').to(slideIndex)
        }

        e.preventDefault()
    }

    $(document)
        .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
        .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

    $(window).on('load', function() {
        $('[data-ride="carousel"]').each(function() {
            var $carousel = $(this)
            Plugin.call($carousel, $carousel.data())
        })
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.3.7
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+
function($) {
    'use strict';

    // COLLAPSE PUBLIC CLASS DEFINITION
    // ================================

    var Collapse = function(element, options) {
        this.$element = $(element)
        this.options = $.extend({}, Collapse.DEFAULTS, options)
        this.$trigger = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
            '[data-toggle="collapse"][data-target="#' + element.id + '"]')
        this.transitioning = null

        if (this.options.parent) {
            this.$parent = this.getParent()
        } else {
            this.addAriaAndCollapsedClass(this.$element, this.$trigger)
        }

        if (this.options.toggle) this.toggle()
    }

    Collapse.VERSION = '3.3.7'

    Collapse.TRANSITION_DURATION = 350

    Collapse.DEFAULTS = {
        toggle: true
    }

    Collapse.prototype.dimension = function() {
        var hasWidth = this.$element.hasClass('width')
        return hasWidth ? 'width' : 'height'
    }

    Collapse.prototype.show = function() {
        if (this.transitioning || this.$element.hasClass('in')) return

        var activesData
        var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

        if (actives && actives.length) {
            activesData = actives.data('bs.collapse')
            if (activesData && activesData.transitioning) return
        }

        var startEvent = $.Event('show.bs.collapse')
        this.$element.trigger(startEvent)
        if (startEvent.isDefaultPrevented()) return

        if (actives && actives.length) {
            Plugin.call(actives, 'hide')
            activesData || actives.data('bs.collapse', null)
        }

        var dimension = this.dimension()

        this.$element
            .removeClass('collapse')
            .addClass('collapsing')[dimension](0)
            .attr('aria-expanded', true)

        this.$trigger
            .removeClass('collapsed')
            .addClass('expanded')
            .attr('aria-expanded', true);

        this.transitioning = 1

        var complete = function() {
            this.$element
                .removeClass('collapsing')
                .addClass('collapse in')[dimension]('')
            this.transitioning = 0
            this.$element
                .trigger('shown.bs.collapse')
        }

        if (!$.support.transition) return complete.call(this)

        var scrollSize = $.camelCase(['scroll', dimension].join('-'))

        this.$element
            .one('bsTransitionEnd', $.proxy(complete, this))
            .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
    }

    Collapse.prototype.hide = function() {
        if (this.transitioning || !this.$element.hasClass('in')) return

        var startEvent = $.Event('hide.bs.collapse')
        this.$element.trigger(startEvent)
        if (startEvent.isDefaultPrevented()) return

        var dimension = this.dimension()

        this.$element[dimension](this.$element[dimension]())[0].offsetHeight

        this.$element
            .addClass('collapsing')
            .removeClass('collapse in')
            .attr('aria-expanded', false)

        this.$trigger
            .removeClass('expanded')
            .addClass('collapsed')
            .attr('aria-expanded', false);

        this.transitioning = 1

        var complete = function() {
            this.transitioning = 0
            this.$element
                .removeClass('collapsing')
                .addClass('collapse')
                .trigger('hidden.bs.collapse')
        }

        if (!$.support.transition) return complete.call(this)

        this.$element[dimension](0)
            .one('bsTransitionEnd', $.proxy(complete, this))
            .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
    }

    Collapse.prototype.toggle = function() {
        this[this.$element.hasClass('in') ? 'hide' : 'show']()
    }

    Collapse.prototype.getParent = function() {
        return $(this.options.parent)
            .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
            .each($.proxy(function(i, element) {
                var $element = $(element)
                this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
            }, this))
            .end()
    }

    Collapse.prototype.addAriaAndCollapsedClass = function($element, $trigger) {
        var isOpen = $element.hasClass('in')

        $element.attr('aria-expanded', isOpen)
        $trigger
            .toggleClass('collapsed', !isOpen)
            .attr('aria-expanded', isOpen)
    }

    function getTargetFromTrigger($trigger) {
        var href
        var target = $trigger.attr('data-target') ||
            (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

        return $(target)
    }


    // COLLAPSE PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.collapse')
            var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

            if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
            if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.collapse

    $.fn.collapse = Plugin
    $.fn.collapse.Constructor = Collapse


    // COLLAPSE NO CONFLICT
    // ====================

    $.fn.collapse.noConflict = function() {
        $.fn.collapse = old
        return this
    }


    // COLLAPSE DATA-API
    // =================

    $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function(e) {
        var $this = $(this)

        if (!$this.attr('data-target')) e.preventDefault()

        var $target = getTargetFromTrigger($this)
        var data = $target.data('bs.collapse')
        var option = data ? 'toggle' : $this.data()

        Plugin.call($target, option)
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.7
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // DROPDOWN CLASS DEFINITION
    // =========================

    var backdrop = '.dropdown-backdrop'
    var toggle = '[data-toggle="dropdown"]'
    var Dropdown = function(element) {
        $(element).on('click.bs.dropdown', this.toggle)
    }

    Dropdown.VERSION = '3.3.7'

    function getParent($this) {
        var selector = $this.attr('data-target')

        if (!selector) {
            selector = $this.attr('href')
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
        }

        var $parent = selector && $(selector)

        return $parent && $parent.length ? $parent : $this.parent()
    }

    function clearMenus(e) {
        if (e && e.which === 3) return
        $(backdrop).remove()
        $(toggle).each(function() {
            var $this = $(this)
            var $parent = getParent($this)
            var relatedTarget = {
                relatedTarget: this
            }

            if (!$parent.hasClass('open')) return

            if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

            $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

            if (e.isDefaultPrevented()) return

            $this.attr('aria-expanded', 'false')
            $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
        })
    }

    Dropdown.prototype.toggle = function(e) {
        var $this = $(this)

        if ($this.is('.disabled, :disabled')) return

        var $parent = getParent($this)
        var isActive = $parent.hasClass('open')

        clearMenus()

        if (!isActive) {
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $(document.createElement('div'))
                    .addClass('dropdown-backdrop')
                    .insertAfter($(this))
                    .on('click', clearMenus)
            }

            var relatedTarget = {
                relatedTarget: this
            }
            $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

            if (e.isDefaultPrevented()) return

            $this
                .trigger('focus')
                .attr('aria-expanded', 'true')

            $parent
                .toggleClass('open')
                .trigger($.Event('shown.bs.dropdown', relatedTarget))
        }

        return false
    }

    Dropdown.prototype.keydown = function(e) {
        if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

        var $this = $(this)

        e.preventDefault()
        e.stopPropagation()

        if ($this.is('.disabled, :disabled')) return

        var $parent = getParent($this)
        var isActive = $parent.hasClass('open')

        if (!isActive && e.which != 27 || isActive && e.which == 27) {
            if (e.which == 27) $parent.find(toggle).trigger('focus')
            return $this.trigger('click')
        }

        var desc = ' li:not(.disabled):visible a'
        var $items = $parent.find('.dropdown-menu' + desc)

        if (!$items.length) return

        var index = $items.index(e.target)

        if (e.which == 38 && index > 0) index-- // up
            if (e.which == 40 && index < $items.length - 1) index++ // down
                if (!~index) index = 0

        $items.eq(index).trigger('focus')
    }


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.dropdown')

            if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }

    var old = $.fn.dropdown

    $.fn.dropdown = Plugin
    $.fn.dropdown.Constructor = Dropdown


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.dropdown.noConflict = function() {
        $.fn.dropdown = old
        return this
    }


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.bs.dropdown.data-api', clearMenus)
        .on('click.bs.dropdown.data-api', '.dropdown form', function(e) {
            e.stopPropagation()
        })
        .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
        .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.3.7
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options
        this.$body = $(document.body)
        this.$element = $(element)
        this.$dialog = this.$element.find('.modal-dialog')
        this.$backdrop = null
        this.isShown = null
        this.originalBodyPad = null
        this.scrollbarWidth = 0
        this.ignoreBackdropClick = false

        if (this.options.remote) {
            this.$element
                .find('.modal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.bs.modal')
                }, this))
        }
    }

    Modal.VERSION = '3.3.7'

    Modal.TRANSITION_DURATION = 300
    Modal.BACKDROP_TRANSITION_DURATION = 150

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    }

    Modal.prototype.toggle = function(_relatedTarget) {
        return this.isShown ? this.hide() : this.show(_relatedTarget)
    }

    Modal.prototype.show = function(_relatedTarget) {
        var that = this
        var e = $.Event('show.bs.modal', {
            relatedTarget: _relatedTarget
        })

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

        this.checkScrollbar()
        this.setScrollbar()
        this.$body.addClass('modal-open')

        this.escape()
        this.resize()

        this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

        this.$dialog.on('mousedown.dismiss.bs.modal', function() {
            that.$element.one('mouseup.dismiss.bs.modal', function(e) {
                if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
            })
        })

        this.backdrop(function() {
            var transition = $.support.transition && that.$element.hasClass('fade')

            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body) // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0)

            that.adjustDialog()

            if (transition) {
                that.$element[0].offsetWidth // force reflow
            }

            that.$element.addClass('in')

            that.enforceFocus()

            var e = $.Event('shown.bs.modal', {
                relatedTarget: _relatedTarget
            })

            transition ?
                that.$dialog // wait for modal to slide in
                .one('bsTransitionEnd', function() {
                    that.$element.trigger('focus').trigger(e)
                })
                .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
                that.$element.trigger('focus').trigger(e)
        })
    }

    Modal.prototype.hide = function(e) {
        if (e) e.preventDefault()

        e = $.Event('hide.bs.modal')

        this.$element.trigger(e)

        if (!this.isShown || e.isDefaultPrevented()) return

        this.isShown = false

        this.escape()
        this.resize()

        $(document).off('focusin.bs.modal')

        this.$element
            .removeClass('in')
            .off('click.dismiss.bs.modal')
            .off('mouseup.dismiss.bs.modal')

        this.$dialog.off('mousedown.dismiss.bs.modal')

        $.support.transition && this.$element.hasClass('fade') ?
            this.$element
            .one('bsTransitionEnd', $.proxy(this.hideModal, this))
            .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
            this.hideModal()
    }

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.bs.modal') // guard against infinite focus loop
            .on('focusin.bs.modal', $.proxy(function(e) {
                if (document !== e.target &&
                    this.$element[0] !== e.target &&
                    !this.$element.has(e.target).length) {
                    this.$element.trigger('focus')
                }
            }, this))
    }

    Modal.prototype.escape = function() {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keydown.dismiss.bs.modal', $.proxy(function(e) {
                e.which == 27 && this.hide()
            }, this))
        } else if (!this.isShown) {
            this.$element.off('keydown.dismiss.bs.modal')
        }
    }

    Modal.prototype.resize = function() {
        if (this.isShown) {
            $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
        } else {
            $(window).off('resize.bs.modal')
        }
    }

    Modal.prototype.hideModal = function() {
        var that = this
        this.$element.hide()
        this.backdrop(function() {
            that.$body.removeClass('modal-open')
            that.resetAdjustments()
            that.resetScrollbar()
            that.$element.trigger('hidden.bs.modal')
        })
    }

    Modal.prototype.removeBackdrop = function() {
        this.$backdrop && this.$backdrop.remove()
        this.$backdrop = null
    }

    Modal.prototype.backdrop = function(callback) {
        var that = this
        var animate = this.$element.hasClass('fade') ? 'fade' : ''

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate

            this.$backdrop = $(document.createElement('div'))
                .addClass('modal-backdrop ' + animate)
                .appendTo(this.$body)

            this.$element.on('click.dismiss.bs.modal', $.proxy(function(e) {
                if (this.ignoreBackdropClick) {
                    this.ignoreBackdropClick = false
                    return
                }
                if (e.target !== e.currentTarget) return
                this.options.backdrop == 'static' ?
                    this.$element[0].focus() :
                    this.hide()
            }, this))

            if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

            this.$backdrop.addClass('in')

            if (!callback) return

            doAnimate ?
                this.$backdrop
                .one('bsTransitionEnd', callback)
                .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                callback()

        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in')

            var callbackRemove = function() {
                that.removeBackdrop()
                callback && callback()
            }
            $.support.transition && this.$element.hasClass('fade') ?
                this.$backdrop
                .one('bsTransitionEnd', callbackRemove)
                .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                callbackRemove()

        } else if (callback) {
            callback()
        }
    }

    // these following methods are used to handle overflowing modals

    Modal.prototype.handleUpdate = function() {
        this.adjustDialog()
    }

    Modal.prototype.adjustDialog = function() {
        var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

        this.$element.css({
            paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
            paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
        })
    }

    Modal.prototype.resetAdjustments = function() {
        this.$element.css({
            paddingLeft: '',
            paddingRight: ''
        })
    }

    Modal.prototype.checkScrollbar = function() {
        var fullWindowWidth = window.innerWidth
        if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
            var documentElementRect = document.documentElement.getBoundingClientRect()
            fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
        }
        this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
        this.scrollbarWidth = this.measureScrollbar()
    }

    Modal.prototype.setScrollbar = function() {
        var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
        this.originalBodyPad = document.body.style.paddingRight || ''
        if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
    }

    Modal.prototype.resetScrollbar = function() {
        this.$body.css('padding-right', this.originalBodyPad)
    }

    Modal.prototype.measureScrollbar = function() { // thx walsh
        var scrollDiv = document.createElement('div')
        scrollDiv.className = 'modal-scrollbar-measure'
        this.$body.append(scrollDiv)
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
        this.$body[0].removeChild(scrollDiv)
        return scrollbarWidth
    }


    // MODAL PLUGIN DEFINITION
    // =======================

    function Plugin(option, _relatedTarget) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.modal')
            var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

            if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
            if (typeof option == 'string') data[option](_relatedTarget)
            else if (options.show) data.show(_relatedTarget)
        })
    }

    var old = $.fn.modal

    $.fn.modal = Plugin
    $.fn.modal.Constructor = Modal


    // MODAL NO CONFLICT
    // =================

    $.fn.modal.noConflict = function() {
        $.fn.modal = old
        return this
    }


    // MODAL DATA-API
    // ==============

    $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function(e) {
        var $this = $(this)
        var href = $this.attr('href')
        var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
        var option = $target.data('bs.modal') ? 'toggle' : $.extend({
            remote: !/#/.test(href) && href
        }, $target.data(), $this.data())

        if ($this.is('a')) e.preventDefault()

        $target.one('show.bs.modal', function(showEvent) {
            if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
            $target.one('hidden.bs.modal', function() {
                $this.is(':visible') && $this.trigger('focus')
            })
        })
        Plugin.call($target, option, this)
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.7
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function(element, options) {
        this.type = null
        this.options = null
        this.enabled = null
        this.timeout = null
        this.hoverState = null
        this.$element = null
        this.inState = null

        this.init('tooltip', element, options)
    }

    Tooltip.VERSION = '3.3.7'

    Tooltip.TRANSITION_DURATION = 150

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false,
        viewport: {
            selector: 'body',
            padding: 0
        }
    }

    Tooltip.prototype.init = function(type, element, options) {
        this.enabled = true
        this.type = type
        this.$element = $(element)
        this.options = this.getOptions(options)
        this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
        this.inState = {
            click: false,
            hover: false,
            focus: false
        }

        if (this.$element[0] instanceof document.constructor && !this.options.selector) {
            throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
        }

        var triggers = this.options.trigger.split(' ')

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i]

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
            } else if (trigger != 'manual') {
                var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin'
                var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

                this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
            }
        }

        this.options.selector ?
            (this._options = $.extend({}, this.options, {
                trigger: 'manual',
                selector: ''
            })) :
            this.fixTitle()
    }

    Tooltip.prototype.getDefaults = function() {
        return Tooltip.DEFAULTS
    }

    Tooltip.prototype.getOptions = function(options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options)

        if (options.delay && typeof options.delay == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay
            }
        }

        return options
    }

    Tooltip.prototype.getDelegateOptions = function() {
        var options = {}
        var defaults = this.getDefaults()

        this._options && $.each(this._options, function(key, value) {
            if (defaults[key] != value) options[key] = value
        })

        return options
    }

    Tooltip.prototype.enter = function(obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).data('bs.' + this.type)

        if (!self) {
            self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
            $(obj.currentTarget).data('bs.' + this.type, self)
        }

        if (obj instanceof $.Event) {
            self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
        }

        if (self.tip().hasClass('in') || self.hoverState == 'in') {
            self.hoverState = 'in'
            return
        }

        clearTimeout(self.timeout)

        self.hoverState = 'in'

        if (!self.options.delay || !self.options.delay.show) return self.show()

        self.timeout = setTimeout(function() {
            if (self.hoverState == 'in') self.show()
        }, self.options.delay.show)
    }

    Tooltip.prototype.isInStateTrue = function() {
        for (var key in this.inState) {
            if (this.inState[key]) return true
        }

        return false
    }

    Tooltip.prototype.leave = function(obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget).data('bs.' + this.type)

        if (!self) {
            self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
            $(obj.currentTarget).data('bs.' + this.type, self)
        }

        if (obj instanceof $.Event) {
            self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
        }

        if (self.isInStateTrue()) return

        clearTimeout(self.timeout)

        self.hoverState = 'out'

        if (!self.options.delay || !self.options.delay.hide) return self.hide()

        self.timeout = setTimeout(function() {
            if (self.hoverState == 'out') self.hide()
        }, self.options.delay.hide)
    }

    Tooltip.prototype.show = function() {
        var e = $.Event('show.bs.' + this.type)

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e)

            var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
            if (e.isDefaultPrevented() || !inDom) return
            var that = this

            var $tip = this.tip()

            var tipId = this.getUID(this.type)

            this.setContent()
            $tip.attr('id', tipId)
            this.$element.attr('aria-describedby', tipId)

            if (this.options.animation) $tip.addClass('fade')

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement

            var autoToken = /\s?auto?\s?/i
            var autoPlace = autoToken.test(placement)
            if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

            $tip
                .detach()
                .css({
                    top: 0,
                    left: 0,
                    display: 'block'
                })
                .addClass(placement)
                .data('bs.' + this.type, this)

            this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
            this.$element.trigger('inserted.bs.' + this.type)

            var pos = this.getPosition()
            var actualWidth = $tip[0].offsetWidth
            var actualHeight = $tip[0].offsetHeight

            if (autoPlace) {
                var orgPlacement = placement
                var viewportDim = this.getPosition(this.$viewport)

                placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top' :
                    placement == 'top' && pos.top - actualHeight < viewportDim.top ? 'bottom' :
                    placement == 'right' && pos.right + actualWidth > viewportDim.width ? 'left' :
                    placement == 'left' && pos.left - actualWidth < viewportDim.left ? 'right' :
                    placement

                $tip
                    .removeClass(orgPlacement)
                    .addClass(placement)
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

            this.applyPlacement(calculatedOffset, placement)

            var complete = function() {
                var prevHoverState = that.hoverState
                that.$element.trigger('shown.bs.' + that.type)
                that.hoverState = null

                if (prevHoverState == 'out') that.leave(that)
            }

            $.support.transition && this.$tip.hasClass('fade') ?
                $tip
                .one('bsTransitionEnd', complete)
                .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
                complete()
        }
    }

    Tooltip.prototype.applyPlacement = function(offset, placement) {
        var $tip = this.tip()
        var width = $tip[0].offsetWidth
        var height = $tip[0].offsetHeight

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10)
        var marginLeft = parseInt($tip.css('margin-left'), 10)

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) marginTop = 0
        if (isNaN(marginLeft)) marginLeft = 0

        offset.top += marginTop
        offset.left += marginLeft

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset($tip[0], $.extend({
            using: function(props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                })
            }
        }, offset), 0)

        $tip.addClass('in')

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth = $tip[0].offsetWidth
        var actualHeight = $tip[0].offsetHeight

        if (placement == 'top' && actualHeight != height) {
            offset.top = offset.top + height - actualHeight
        }

        var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

        if (delta.left) offset.left += delta.left
        else offset.top += delta.top

        var isVertical = /top|bottom/.test(placement)
        var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
        var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

        $tip.offset(offset)
        this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
    }

    Tooltip.prototype.replaceArrow = function(delta, dimension, isVertical) {
        this.arrow()
            .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
            .css(isVertical ? 'top' : 'left', '')
    }

    Tooltip.prototype.setContent = function() {
        var $tip = this.tip()
        var title = this.getTitle()

        $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
        $tip.removeClass('fade in top bottom left right')
    }

    Tooltip.prototype.hide = function(callback) {
        var that = this
        var $tip = $(this.$tip)
        var e = $.Event('hide.bs.' + this.type)

        function complete() {
            if (that.hoverState != 'in') $tip.detach()
            if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
                that.$element
                    .removeAttr('aria-describedby')
                    .trigger('hidden.bs.' + that.type)
            }
            callback && callback()
        }

        this.$element.trigger(e)

        if (e.isDefaultPrevented()) return

        $tip.removeClass('in')

        $.support.transition && $tip.hasClass('fade') ?
            $tip
            .one('bsTransitionEnd', complete)
            .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
            complete()

        this.hoverState = null

        return this
    }

    Tooltip.prototype.fixTitle = function() {
        var $e = this.$element
        if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
        }
    }

    Tooltip.prototype.hasContent = function() {
        return this.getTitle()
    }

    Tooltip.prototype.getPosition = function($element) {
        $element = $element || this.$element

        var el = $element[0]
        var isBody = el.tagName == 'BODY'

        var elRect = el.getBoundingClientRect()
        if (elRect.width == null) {
            // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
            elRect = $.extend({}, elRect, {
                width: elRect.right - elRect.left,
                height: elRect.bottom - elRect.top
            })
        }
        var isSvg = window.SVGElement && el instanceof window.SVGElement
        // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
        // See https://github.com/twbs/bootstrap/issues/20280
        var elOffset = isBody ? {
            top: 0,
            left: 0
        } : (isSvg ? null : $element.offset())
        var scroll = {
            scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop()
        }
        var outerDims = isBody ? {
            width: $(window).width(),
            height: $(window).height()
        } : null

        return $.extend({}, elRect, scroll, outerDims, elOffset)
    }

    Tooltip.prototype.getCalculatedOffset = function(placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? {
                top: pos.top + pos.height,
                left: pos.left + pos.width / 2 - actualWidth / 2
            } :
            placement == 'top' ? {
                top: pos.top - actualHeight,
                left: pos.left + pos.width / 2 - actualWidth / 2
            } :
            placement == 'left' ? {
                top: pos.top + pos.height / 2 - actualHeight / 2,
                left: pos.left - actualWidth
            } :
            /* placement == 'right' */
            {
                top: pos.top + pos.height / 2 - actualHeight / 2,
                left: pos.left + pos.width
            }

    }

    Tooltip.prototype.getViewportAdjustedDelta = function(placement, pos, actualWidth, actualHeight) {
        var delta = {
            top: 0,
            left: 0
        }
        if (!this.$viewport) return delta

        var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
        var viewportDimensions = this.getPosition(this.$viewport)

        if (/right|left/.test(placement)) {
            var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll
            var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
            if (topEdgeOffset < viewportDimensions.top) { // top overflow
                delta.top = viewportDimensions.top - topEdgeOffset
            } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
                delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
            }
        } else {
            var leftEdgeOffset = pos.left - viewportPadding
            var rightEdgeOffset = pos.left + viewportPadding + actualWidth
            if (leftEdgeOffset < viewportDimensions.left) { // left overflow
                delta.left = viewportDimensions.left - leftEdgeOffset
            } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
                delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
            }
        }

        return delta
    }

    Tooltip.prototype.getTitle = function() {
        var title
        var $e = this.$element
        var o = this.options

        title = $e.attr('data-original-title') ||
            (typeof o.title == 'function' ? o.title.call($e[0]) : o.title)

        return title
    }

    Tooltip.prototype.getUID = function(prefix) {
        do prefix += ~~(Math.random() * 1000000)
        while (document.getElementById(prefix))
        return prefix
    }

    Tooltip.prototype.tip = function() {
        if (!this.$tip) {
            this.$tip = $(this.options.template)
            if (this.$tip.length != 1) {
                throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
            }
        }
        return this.$tip
    }

    Tooltip.prototype.arrow = function() {
        return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
    }

    Tooltip.prototype.enable = function() {
        this.enabled = true
    }

    Tooltip.prototype.disable = function() {
        this.enabled = false
    }

    Tooltip.prototype.toggleEnabled = function() {
        this.enabled = !this.enabled
    }

    Tooltip.prototype.toggle = function(e) {
        var self = this
        if (e) {
            self = $(e.currentTarget).data('bs.' + this.type)
            if (!self) {
                self = new this.constructor(e.currentTarget, this.getDelegateOptions())
                $(e.currentTarget).data('bs.' + this.type, self)
            }
        }

        if (e) {
            self.inState.click = !self.inState.click
            if (self.isInStateTrue()) self.enter(self)
            else self.leave(self)
        } else {
            self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
        }
    }

    Tooltip.prototype.destroy = function() {
        var that = this
        clearTimeout(this.timeout)
        this.hide(function() {
            that.$element.off('.' + that.type).removeData('bs.' + that.type)
            if (that.$tip) {
                that.$tip.detach()
            }
            that.$tip = null
            that.$arrow = null
            that.$viewport = null
            that.$element = null
        })
    }


    // TOOLTIP PLUGIN DEFINITION
    // =========================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.tooltip')
            var options = typeof option == 'object' && option

            if (!data && /destroy|hide/.test(option)) return
            if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.tooltip

    $.fn.tooltip = Plugin
    $.fn.tooltip.Constructor = Tooltip


    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.tooltip.noConflict = function() {
        $.fn.tooltip = old
        return this
    }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.3.7
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // POPOVER PUBLIC CLASS DEFINITION
    // ===============================

    var Popover = function(element, options) {
        this.init('popover', element, options)
    }

    if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

    Popover.VERSION = '3.3.7'

    Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
        placement: 'right',
        trigger: 'click',
        content: '',
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    })


    // NOTE: POPOVER EXTENDS tooltip.js
    // ================================

    Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

    Popover.prototype.constructor = Popover

    Popover.prototype.getDefaults = function() {
        return Popover.DEFAULTS
    }

    Popover.prototype.setContent = function() {
        var $tip = this.tip()
        var title = this.getTitle()
        var content = this.getContent()

        $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
        $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
            this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
        ](content)

        $tip.removeClass('fade top bottom left right in')

        // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
        // this manually by checking the contents.
        if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
    }

    Popover.prototype.hasContent = function() {
        return this.getTitle() || this.getContent()
    }

    Popover.prototype.getContent = function() {
        var $e = this.$element
        var o = this.options

        return $e.attr('data-content') ||
            (typeof o.content == 'function' ?
                o.content.call($e[0]) :
                o.content)
    }

    Popover.prototype.arrow = function() {
        return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
    }


    // POPOVER PLUGIN DEFINITION
    // =========================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.popover')
            var options = typeof option == 'object' && option

            if (!data && /destroy|hide/.test(option)) return
            if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.popover

    $.fn.popover = Plugin
    $.fn.popover.Constructor = Popover


    // POPOVER NO CONFLICT
    // ===================

    $.fn.popover.noConflict = function() {
        $.fn.popover = old
        return this
    }

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.7
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // SCROLLSPY CLASS DEFINITION
    // ==========================

    function ScrollSpy(element, options) {
        this.$body = $(document.body)
        this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
        this.options = $.extend({}, ScrollSpy.DEFAULTS, options)
        this.selector = (this.options.target || '') + ' .nav li > a'
        this.offsets = []
        this.targets = []
        this.activeTarget = null
        this.scrollHeight = 0

        this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
        this.refresh()
        this.process()
    }

    ScrollSpy.VERSION = '3.3.7'

    ScrollSpy.DEFAULTS = {
        offset: 10
    }

    ScrollSpy.prototype.getScrollHeight = function() {
        return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
    }

    ScrollSpy.prototype.refresh = function() {
        var that = this
        var offsetMethod = 'offset'
        var offsetBase = 0

        this.offsets = []
        this.targets = []
        this.scrollHeight = this.getScrollHeight()

        if (!$.isWindow(this.$scrollElement[0])) {
            offsetMethod = 'position'
            offsetBase = this.$scrollElement.scrollTop()
        }

        this.$body
            .find(this.selector)
            .map(function() {
                var $el = $(this)
                var href = $el.data('target') || $el.attr('href')
                var $href = /^#./.test(href) && $(href)

                return ($href &&
                    $href.length &&
                    $href.is(':visible') &&
                    [
                        [$href[offsetMethod]().top + offsetBase, href]
                    ]) || null
            })
            .sort(function(a, b) {
                return a[0] - b[0]
            })
            .each(function() {
                that.offsets.push(this[0])
                that.targets.push(this[1])
            })
    }

    ScrollSpy.prototype.process = function() {
        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
        var scrollHeight = this.getScrollHeight()
        var maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height()
        var offsets = this.offsets
        var targets = this.targets
        var activeTarget = this.activeTarget
        var i

        if (this.scrollHeight != scrollHeight) {
            this.refresh()
        }

        if (scrollTop >= maxScroll) {
            return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
        }

        if (activeTarget && scrollTop < offsets[0]) {
            this.activeTarget = null
            return this.clear()
        }

        for (i = offsets.length; i--;) {
            activeTarget != targets[i] &&
                scrollTop >= offsets[i] &&
                (offsets[i + 1] === undefined || scrollTop < offsets[i + 1]) &&
                this.activate(targets[i])
        }
    }

    ScrollSpy.prototype.activate = function(target) {
        this.activeTarget = target

        this.clear()

        var selector = this.selector +
            '[data-target="' + target + '"],' +
            this.selector + '[href="' + target + '"]'

        var active = $(selector)
            .parents('li')
            .addClass('active')

        if (active.parent('.dropdown-menu').length) {
            active = active
                .closest('li.dropdown')
                .addClass('active')
        }

        active.trigger('activate.bs.scrollspy')
    }

    ScrollSpy.prototype.clear = function() {
        $(this.selector)
            .parentsUntil(this.options.target, '.active')
            .removeClass('active')
    }


    // SCROLLSPY PLUGIN DEFINITION
    // ===========================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.scrollspy')
            var options = typeof option == 'object' && option

            if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.scrollspy

    $.fn.scrollspy = Plugin
    $.fn.scrollspy.Constructor = ScrollSpy


    // SCROLLSPY NO CONFLICT
    // =====================

    $.fn.scrollspy.noConflict = function() {
        $.fn.scrollspy = old
        return this
    }


    // SCROLLSPY DATA-API
    // ==================

    $(window).on('load.bs.scrollspy.data-api', function() {
        $('[data-spy="scroll"]').each(function() {
            var $spy = $(this)
            Plugin.call($spy, $spy.data())
        })
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.3.7
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // TAB CLASS DEFINITION
    // ====================

    var Tab = function(element) {
        // jscs:disable requireDollarBeforejQueryAssignment
        this.element = $(element)
        // jscs:enable requireDollarBeforejQueryAssignment
    }

    Tab.VERSION = '3.3.7'

    Tab.TRANSITION_DURATION = 150

    Tab.prototype.show = function() {
        var $this = this.element
        var $ul = $this.closest('ul:not(.dropdown-menu)')
        var selector = $this.data('target')
        
        if (!selector) {
            selector = $this.attr('href')
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
        }

        var $previous = $ul.find('.active:last a')
        var hideEvent = $.Event('hide.bs.tab', {
            relatedTarget: $this[0]
        })
        var showEvent = $.Event('show.bs.tab', {
            relatedTarget: $previous[0]
        })

        $previous.trigger(hideEvent)
        $this.trigger(showEvent)

        if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

        var $target = $(selector)
        var self = this;
        this.activate($this.closest('li'), $ul)
        this.activate($target, $target.parent(), function() {
            $previous.trigger({
                type: 'hidden.bs.tab',
                relatedTarget: $this[0]
            })
            $this.trigger({
                type: 'shown.bs.tab',
                relatedTarget: $previous[0]
            });
            // place it here
            self.lazyview();
        })
    }
    
    /**
     * 懒加载视图，主要用于同一个目的视图。
     */
    Tab.prototype.lazyview = function () {
        var url = $(this.element).attr('data-url');
        var target = $(this.element).attr('data-target');
        if (url === '') return;
        $(target).empty();
        $.ajax({
            url: url,
            success: function(html) {
                $(target).html(html);
            }
        })
    };

    Tab.prototype.activate = function(element, container, callback) {
        var $active = container.find('> .active')
        var transition = callback &&
            $.support.transition &&
            ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

        function next() {
            $active
                .removeClass('active')
                .find('> .dropdown-menu > .active')
                .removeClass('active')
                .end()
                .find('[data-toggle="tab"]')
                .attr('aria-expanded', false)

            element
                .addClass('active')
                .find('[data-toggle="tab"]')
                .attr('aria-expanded', true)

            if (transition) {
                element[0].offsetWidth // reflow for transition
                element.addClass('in')
            } else {
                element.removeClass('fade')
            }

            if (element.parent('.dropdown-menu').length) {
                element
                    .closest('li.dropdown')
                    .addClass('active')
                    .end()
                    .find('[data-toggle="tab"]')
                    .attr('aria-expanded', true)
            }

            callback && callback()
        }

        $active.length && transition ?
            $active
            .one('bsTransitionEnd', next)
            .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
            next()

        $active.removeClass('in');
    }


    // TAB PLUGIN DEFINITION
    // =====================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.tab')

            if (!data) $this.data('bs.tab', (data = new Tab(this)))
            if (typeof option == 'string') data[option]()
        });
    }

    var old = $.fn.tab

    $.fn.tab = Plugin
    $.fn.tab.Constructor = Tab


    // TAB NO CONFLICT
    // ===============

    $.fn.tab.noConflict = function() {
        $.fn.tab = old
        return this
    }


    // TAB DATA-API
    // ============

    var clickHandler = function(e) {
        e.preventDefault()
        Plugin.call($(this), 'show')
    }

    $(document)
        .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
        .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.3.7
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // AFFIX CLASS DEFINITION
    // ======================

    var Affix = function(element, options) {
        this.options = $.extend({}, Affix.DEFAULTS, options)

        this.$target = $(this.options.target)
            .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
            .on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this))

        this.$element = $(element)
        this.affixed = null
        this.unpin = null
        this.pinnedOffset = null

        this.checkPosition()
    }

    Affix.VERSION = '3.3.7'

    Affix.RESET = 'affix affix-top affix-bottom'

    Affix.DEFAULTS = {
        offset: 0,
        target: window
    }

    Affix.prototype.getState = function(scrollHeight, height, offsetTop, offsetBottom) {
        var scrollTop = this.$target.scrollTop()
        var position = this.$element.offset()
        var targetHeight = this.$target.height()

        if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

        if (this.affixed == 'bottom') {
            if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
            return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
        }

        var initializing = this.affixed == null
        var colliderTop = initializing ? scrollTop : position.top
        var colliderHeight = initializing ? targetHeight : height

        if (offsetTop != null && scrollTop <= offsetTop) return 'top'
        if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

        return false
    }

    Affix.prototype.getPinnedOffset = function() {
        if (this.pinnedOffset) return this.pinnedOffset
        this.$element.removeClass(Affix.RESET).addClass('affix')
        var scrollTop = this.$target.scrollTop()
        var position = this.$element.offset()
        return (this.pinnedOffset = position.top - scrollTop)
    }

    Affix.prototype.checkPositionWithEventLoop = function() {
        setTimeout($.proxy(this.checkPosition, this), 1)
    }

    Affix.prototype.checkPosition = function() {
        if (!this.$element.is(':visible')) return

        var height = this.$element.height()
        var offset = this.options.offset
        var offsetTop = offset.top
        var offsetBottom = offset.bottom
        var scrollHeight = Math.max($(document).height(), $(document.body).height())

        if (typeof offset != 'object') offsetBottom = offsetTop = offset
        if (typeof offsetTop == 'function') offsetTop = offset.top(this.$element)
        if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

        var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

        if (this.affixed != affix) {
            if (this.unpin != null) this.$element.css('top', '')

            var affixType = 'affix' + (affix ? '-' + affix : '')
            var e = $.Event(affixType + '.bs.affix')

            this.$element.trigger(e)

            if (e.isDefaultPrevented()) return

            this.affixed = affix
            this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

            this.$element
                .removeClass(Affix.RESET)
                .addClass(affixType)
                .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
        }

        if (affix == 'bottom') {
            this.$element.offset({
                top: scrollHeight - height - offsetBottom
            })
        }
    }


    // AFFIX PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.affix')
            var options = typeof option == 'object' && option

            if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.affix

    $.fn.affix = Plugin
    $.fn.affix.Constructor = Affix


    // AFFIX NO CONFLICT
    // =================

    $.fn.affix.noConflict = function() {
        $.fn.affix = old
        return this
    }


    // AFFIX DATA-API
    // ==============

    $(window).on('load', function() {
        $('[data-spy="affix"]').each(function() {
            var $spy = $(this)
            var data = $spy.data()

            data.offset = data.offset || {}

            if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
            if (data.offsetTop != null) data.offset.top = data.offsetTop

            Plugin.call($spy, data)
        })
    });


}(jQuery);
/*!
 * FullCalendar v1.6.4
 * Docs & License: http://arshaw.com/fullcalendar/
 * (c) 2013 Adam Shaw
 */

/*
 * Use fullcalendar.css for basic styling.
 * For event drag & drop, requires jQuery UI draggable.
 * For event resizing, requires jQuery UI resizable.
 */
 
(function($, undefined) {


  ;;
  
  var defaults = {
  
    // display
    defaultView: 'month',
    aspectRatio: 1.35,
    header: {
      left: 'title',
      center: '',
      right: 'today prev,next'
    },
    weekends: true,
    weekNumbers: false,
    weekNumberCalculation: 'iso',
    weekNumberTitle: 'W',
    
    // editing
    //editable: false,
    //disableDragging: false,
    //disableResizing: false,
    
    allDayDefault: true,
    ignoreTimezone: true,
    
    // event ajax
    lazyFetching: true,
    startParam: 'start',
    endParam: 'end',
    
    // time formats
    titleFormat: {
      month: 'MMMM yyyy',
      week: "MMM d[ yyyy]{ '—'[ MMM] d yyyy}",
      day: 'dddd, MMM d, yyyy'
    },
    columnFormat: {
      month: 'ddd',
      week: 'ddd M/d',
      day: 'dddd M/d'
    },
    timeFormat: { // for event elements
      '': 'h(:mm)t' // default
    },
    
    // locale
    isRTL: false,
    firstDay: 0,
    monthNames: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    monthNamesShort: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
    dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
    buttonText: {
      prev: "<span class='fc-text-arrow'>‹</span>",
      next: "<span class='fc-text-arrow'>›</span>",
      prevYear: "<span class='fc-text-arrow'>«</span>",
      nextYear: "<span class='fc-text-arrow'>»</span>",
      today: '今天',
      month: '月',
      week: '周',
      day: '天'
    },
    
    // jquery-ui theming
    theme: false,
    buttonIcons: {
      prev: 'circle-triangle-w',
      next: 'circle-triangle-e'
    },
    
    //selectable: false,
    unselectAuto: true,
    
    dropAccept: '*',
    
    handleWindowResize: true
    
  };
  
  // right-to-left defaults
  var rtlDefaults = {
    header: {
      left: 'next,prev today',
      center: '',
      right: 'title'
    },
    buttonText: {
      prev: "<span class='fc-text-arrow'>›</span>",
      next: "<span class='fc-text-arrow'>‹</span>",
      prevYear: "<span class='fc-text-arrow'>»</span>",
      nextYear: "<span class='fc-text-arrow'>«</span>"
    },
    buttonIcons: {
      prev: 'circle-triangle-e',
      next: 'circle-triangle-w'
    }
  };
  
  
  
  ;;
  
  var fc = $.fullCalendar = { version: "1.6.4" };
  var fcViews = fc.views = {};
  
  
  $.fn.fullCalendar = function(options) {
  
  
    // method calling
    if (typeof options == 'string') {
      var args = Array.prototype.slice.call(arguments, 1);
      var res;
      this.each(function() {
        var calendar = $.data(this, 'fullCalendar');
        if (calendar && $.isFunction(calendar[options])) {
          var r = calendar[options].apply(calendar, args);
          if (res === undefined) {
            res = r;
          }
          if (options == 'destroy') {
            $.removeData(this, 'fullCalendar');
          }
        }
      });
      if (res !== undefined) {
        return res;
      }
      return this;
    }
  
    options = options || {};
    
    // would like to have this logic in EventManager, but needs to happen before options are recursively extended
    var eventSources = options.eventSources || [];
    delete options.eventSources;
    if (options.events) {
      eventSources.push(options.events);
      delete options.events;
    }
    
  
    options = $.extend(true, {},
      defaults,
      (options.isRTL || options.isRTL===undefined && defaults.isRTL) ? rtlDefaults : {},
      options
    );
    
    
    this.each(function(i, _element) {
      var element = $(_element);
      var calendar = new Calendar(element, options, eventSources);
      element.data('fullCalendar', calendar); // TODO: look into memory leak implications
      calendar.render();
    });
    
    
    return this;
    
  };
  
  
  // function for adding/overriding defaults
  function setDefaults(d) {
    $.extend(true, defaults, d);
  }
  
  
  
  ;;
  
   
  function Calendar(element, options, eventSources) {
    var t = this;
    
    
    // exports
    t.options = options;
    t.render = render;
    t.destroy = destroy;
    t.refetchEvents = refetchEvents;
    t.reportEvents = reportEvents;
    t.reportEventChange = reportEventChange;
    t.rerenderEvents = rerenderEvents;
    t.changeView = changeView;
    t.select = select;
    t.unselect = unselect;
    t.prev = prev;
    t.next = next;
    t.prevYear = prevYear;
    t.nextYear = nextYear;
    t.today = today;
    t.gotoDate = gotoDate;
    t.incrementDate = incrementDate;
    t.formatDate = function(format, date) { return formatDate(format, date, options) };
    t.formatDates = function(format, date1, date2) { return formatDates(format, date1, date2, options) };
    t.getDate = getDate;
    t.getView = getView;
    t.option = option;
    t.trigger = trigger;
    
    
    // imports
    EventManager.call(t, options, eventSources);
    var isFetchNeeded = t.isFetchNeeded;
    var fetchEvents = t.fetchEvents;
    
    
    // locals
    var _element = element[0];
    var header;
    var headerElement;
    var content;
    var tm; // for making theme classes
    var currentView;
    var elementOuterWidth;
    var suggestedViewHeight;
    var resizeUID = 0;
    var ignoreWindowResize = 0;
    var date = new Date();
    var events = [];
    var _dragElement;
    
    
    
    /* Main Rendering
    -----------------------------------------------------------------------------*/
    
    
    setYMD(date, options.year, options.month, options.date);
    
    
    function render(inc) {
      if (!content) {
        initialRender();
      }
      else if (elementVisible()) {
        // mainly for the public API
        calcSize();
        _renderView(inc);
      }
    }
    
    
    function initialRender() {
      tm = options.theme ? 'ui' : 'fc';
      element.addClass('fc');
      if (options.isRTL) {
        element.addClass('fc-rtl');
      }
      else {
        element.addClass('fc-ltr');
      }
      if (options.theme) {
        element.addClass('ui-widget');
      }
  
      content = $("<div class='fc-content' style='position:relative'/>")
        .prependTo(element);
  
      header = new Header(t, options);
      headerElement = header.render();
      if (headerElement) {
        element.prepend(headerElement);
      }
  
      changeView(options.defaultView);
  
      if (options.handleWindowResize) {
        $(window).resize(windowResize);
      }
  
      // needed for IE in a 0x0 iframe, b/c when it is resized, never triggers a windowResize
      if (!bodyVisible()) {
        lateRender();
      }
    }
    
    
    // called when we know the calendar couldn't be rendered when it was initialized,
    // but we think it's ready now
    function lateRender() {
      setTimeout(function() { // IE7 needs this so dimensions are calculated correctly
        if (!currentView.start && bodyVisible()) { // !currentView.start makes sure this never happens more than once
          renderView();
        }
      },0);
    }
    
    
    function destroy() {
  
      if (currentView) {
        trigger('viewDestroy', currentView, currentView, currentView.element);
        currentView.triggerEventDestroy();
      }
  
      $(window).unbind('resize', windowResize);
  
      header.destroy();
      content.remove();
      element.removeClass('fc fc-rtl ui-widget');
    }
    
    
    function elementVisible() {
      return element.is(':visible');
    }
    
    
    function bodyVisible() {
      return $('body').is(':visible');
    }
    
    
    
    /* View Rendering
    -----------------------------------------------------------------------------*/
    
  
    function changeView(newViewName) {
      if (!currentView || newViewName != currentView.name) {
        _changeView(newViewName);
      }
    }
  
  
    function _changeView(newViewName) {
      ignoreWindowResize++;
  
      if (currentView) {
        trigger('viewDestroy', currentView, currentView, currentView.element);
        unselect();
        currentView.triggerEventDestroy(); // trigger 'eventDestroy' for each event
        freezeContentHeight();
        currentView.element.remove();
        header.deactivateButton(currentView.name);
      }
  
      header.activateButton(newViewName);
  
      currentView = new fcViews[newViewName](
        $("<div class='fc-view fc-view-" + newViewName + "' style='position:relative'/>")
          .appendTo(content),
        t // the calendar object
      );
  
      renderView();
      unfreezeContentHeight();
  
      ignoreWindowResize--;
    }
  
  
    function renderView(inc) {
      if (
        !currentView.start || // never rendered before
        inc || date < currentView.start || date >= currentView.end // or new date range
      ) {
        if (elementVisible()) {
          _renderView(inc);
        }
      }
    }
  
  
    function _renderView(inc) { // assumes elementVisible
      ignoreWindowResize++;
  
      if (currentView.start) { // already been rendered?
        trigger('viewDestroy', currentView, currentView, currentView.element);
        unselect();
        clearEvents();
      }
  
      freezeContentHeight();
      currentView.render(date, inc || 0); // the view's render method ONLY renders the skeleton, nothing else
      setSize();
      unfreezeContentHeight();
      (currentView.afterRender || noop)();
  
      updateTitle();
      updateTodayButton();
  
      trigger('viewRender', currentView, currentView, currentView.element);
      currentView.trigger('viewDisplay', _element); // deprecated
  
      ignoreWindowResize--;
  
      getAndRenderEvents();
    }
    
    
  
    /* Resizing
    -----------------------------------------------------------------------------*/
    
    
    function updateSize() {
      if (elementVisible()) {
        unselect();
        clearEvents();
        calcSize();
        setSize();
        renderEvents();
      }
    }
    
    
    function calcSize() { // assumes elementVisible
      if (options.contentHeight) {
        suggestedViewHeight = options.contentHeight;
      }
      else if (options.height) {
        suggestedViewHeight = options.height - (headerElement ? headerElement.height() : 0) - vsides(content);
      }
      else {
        suggestedViewHeight = Math.round(content.width() / Math.max(options.aspectRatio, .5));
      }
    }
    
    
    function setSize() { // assumes elementVisible
  
      if (suggestedViewHeight === undefined) {
        calcSize(); // for first time
          // NOTE: we don't want to recalculate on every renderView because
          // it could result in oscillating heights due to scrollbars.
      }
  
      ignoreWindowResize++;
      currentView.setHeight(suggestedViewHeight);
      currentView.setWidth(content.width());
      ignoreWindowResize--;
  
      elementOuterWidth = element.outerWidth();
    }
    
    
    function windowResize() {
      if (!ignoreWindowResize) {
        if (currentView.start) { // view has already been rendered
          var uid = ++resizeUID;
          setTimeout(function() { // add a delay
            if (uid == resizeUID && !ignoreWindowResize && elementVisible()) {
              if (elementOuterWidth != (elementOuterWidth = element.outerWidth())) {
                ignoreWindowResize++; // in case the windowResize callback changes the height
                updateSize();
                currentView.trigger('windowResize', _element);
                ignoreWindowResize--;
              }
            }
          }, 200);
        }else{
          // calendar must have been initialized in a 0x0 iframe that has just been resized
          lateRender();
        }
      }
    }
    
    
    
    /* Event Fetching/Rendering
    -----------------------------------------------------------------------------*/
    // TODO: going forward, most of this stuff should be directly handled by the view
  
  
    function refetchEvents() { // can be called as an API method
      clearEvents();
      fetchAndRenderEvents();
    }
  
  
    function rerenderEvents(modifiedEventID) { // can be called as an API method
      clearEvents();
      renderEvents(modifiedEventID);
    }
  
  
    function renderEvents(modifiedEventID) { // TODO: remove modifiedEventID hack
      if (elementVisible()) {
        currentView.setEventData(events); // for View.js, TODO: unify with renderEvents
        currentView.renderEvents(events, modifiedEventID); // actually render the DOM elements
        currentView.trigger('eventAfterAllRender');
      }
    }
  
  
    function clearEvents() {
      currentView.triggerEventDestroy(); // trigger 'eventDestroy' for each event
      currentView.clearEvents(); // actually remove the DOM elements
      currentView.clearEventData(); // for View.js, TODO: unify with clearEvents
    }
    
  
    function getAndRenderEvents() {
      if (!options.lazyFetching || isFetchNeeded(currentView.visStart, currentView.visEnd)) {
        fetchAndRenderEvents();
      }
      else {
        renderEvents();
      }
    }
  
  
    function fetchAndRenderEvents() {
      fetchEvents(currentView.visStart, currentView.visEnd);
        // ... will call reportEvents
        // ... which will call renderEvents
    }
  
    
    // called when event data arrives
    function reportEvents(_events) {
      events = _events;
      renderEvents();
    }
  
  
    // called when a single event's data has been changed
    function reportEventChange(eventID) {
      rerenderEvents(eventID);
    }
  
  
  
    /* Header Updating
    -----------------------------------------------------------------------------*/
  
  
    function updateTitle() {
      header.updateTitle(currentView.title);
    }
  
  
    function updateTodayButton() {
      var today = new Date();
      if (today >= currentView.start && today < currentView.end) {
        header.disableButton('today');
      }
      else {
        header.enableButton('today');
      }
    }
    
  
  
    /* Selection
    -----------------------------------------------------------------------------*/
    
  
    function select(start, end, allDay) {
      currentView.select(start, end, allDay===undefined ? true : allDay);
    }
    
  
    function unselect() { // safe to be called before renderView
      if (currentView) {
        currentView.unselect();
      }
    }
    
    
    
    /* Date
    -----------------------------------------------------------------------------*/
    
    
    function prev() {
      renderView(-1);
    }
    
    
    function next() {
      renderView(1);
    }
    
    
    function prevYear() {
      addYears(date, -1);
      renderView();
    }
    
    
    function nextYear() {
      addYears(date, 1);
      renderView();
    }
    
    
    function today() {
      date = new Date();
      renderView();
    }
    
    
    function gotoDate(year, month, dateOfMonth) {
      if (year instanceof Date) {
        date = cloneDate(year); // provided 1 argument, a Date
      }else{
        setYMD(date, year, month, dateOfMonth);
      }
      renderView();
    }
    
    
    function incrementDate(years, months, days) {
      if (years !== undefined) {
        addYears(date, years);
      }
      if (months !== undefined) {
        addMonths(date, months);
      }
      if (days !== undefined) {
        addDays(date, days);
      }
      renderView();
    }
    
    
    function getDate() {
      return cloneDate(date);
    }
  
  
  
    /* Height "Freezing"
    -----------------------------------------------------------------------------*/
  
  
    function freezeContentHeight() {
      content.css({
        width: '100%',
        height: content.height(),
        overflow: 'hidden'
      });
    }
  
  
    function unfreezeContentHeight() {
      content.css({
        width: '',
        height: '',
        overflow: ''
      });
    }
    
    
    
    /* Misc
    -----------------------------------------------------------------------------*/
    
    
    function getView() {
      return currentView;
    }
    
    
    function option(name, value) {
      if (value === undefined) {
        return options[name];
      }
      if (name == 'height' || name == 'contentHeight' || name == 'aspectRatio') {
        options[name] = value;
        updateSize();
      }
    }
    
    
    function trigger(name, thisObj) {
      if (options[name]) {
        return options[name].apply(
          thisObj || _element,
          Array.prototype.slice.call(arguments, 2)
        );
      }
    }
    
    
    
    /* External Dragging
    ------------------------------------------------------------------------*/
    
    if (options.droppable) {
      $(document)
        .bind('dragstart', function(ev, ui) {
          var _e = ev.target;
          var e = $(_e);
          if (!e.parents('.fc').length) { // not already inside a calendar
            var accept = options.dropAccept;
            if ($.isFunction(accept) ? accept.call(_e, e) : e.is(accept)) {
              _dragElement = _e;
              currentView.dragStart(_dragElement, ev, ui);
            }
          }
        })
        .bind('dragstop', function(ev, ui) {
          if (_dragElement) {
            currentView.dragStop(_dragElement, ev, ui);
            _dragElement = null;
          }
        });
    }
    
  
  }
  
  ;;
  
  function Header(calendar, options) {
    var t = this;
    
    
    // exports
    t.render = render;
    t.destroy = destroy;
    t.updateTitle = updateTitle;
    t.activateButton = activateButton;
    t.deactivateButton = deactivateButton;
    t.disableButton = disableButton;
    t.enableButton = enableButton;
    
    
    // locals
    var element = $([]);
    var tm;
    
  
  
    function render() {
      tm = options.theme ? 'ui' : 'fc';
      var sections = options.header;
      if (sections) {
        element = $("<table class='fc-header' style='width:100%'/>")
          .append(
            $("<tr/>")
              .append(renderSection('left'))
              .append(renderSection('center'))
              .append(renderSection('right'))
          );
        return element;
      }
    }
    
    
    function destroy() {
      element.remove();
    }
    
    
    function renderSection(position) {
      var e = $("<td class='fc-header-" + position + "'/>");
      var buttonStr = options.header[position];
      if (buttonStr) {
        $.each(buttonStr.split(' '), function(i) {
          if (i > 0) {
            e.append("<span class='fc-header-space'/>");
          }
          var prevButton;
          $.each(this.split(','), function(j, buttonName) {
            if (buttonName == 'title') {
              e.append("<span class='fc-header-title'><h2> </h2></span>");
              if (prevButton) {
                prevButton.addClass(tm + '-corner-right');
              }
              prevButton = null;
            }else{
              var buttonClick;
              if (calendar[buttonName]) {
                buttonClick = calendar[buttonName]; // calendar method
              }
              else if (fcViews[buttonName]) {
                buttonClick = function() {
                  button.removeClass(tm + '-state-hover'); // forget why
                  calendar.changeView(buttonName);
                };
              }
              if (buttonClick) {
                var icon = options.theme ? smartProperty(options.buttonIcons, buttonName) : null; // why are we using smartProperty here?
                var text = smartProperty(options.buttonText, buttonName); // why are we using smartProperty here?
                var button = $(
                  "<span class='fc-button fc-button-" + buttonName + " " + tm + "-state-default'>" +
                    (icon ?
                      "<span class='fc-icon-wrap'>" +
                        "<span class='ui-icon ui-icon-" + icon + "'/>" +
                      "</span>" :
                      text
                      ) +
                  "</span>"
                  )
                  .click(function() {
                    if (!button.hasClass(tm + '-state-disabled')) {
                      buttonClick();
                    }
                  })
                  .mousedown(function() {
                    button
                      .not('.' + tm + '-state-active')
                      .not('.' + tm + '-state-disabled')
                      .addClass(tm + '-state-down');
                  })
                  .mouseup(function() {
                    button.removeClass(tm + '-state-down');
                  })
                  .hover(
                    function() {
                      button
                        .not('.' + tm + '-state-active')
                        .not('.' + tm + '-state-disabled')
                        .addClass(tm + '-state-hover');
                    },
                    function() {
                      button
                        .removeClass(tm + '-state-hover')
                        .removeClass(tm + '-state-down');
                    }
                  )
                  .appendTo(e);
                disableTextSelection(button);
                if (!prevButton) {
                  button.addClass(tm + '-corner-left');
                }
                prevButton = button;
              }
            }
          });
          if (prevButton) {
            prevButton.addClass(tm + '-corner-right');
          }
        });
      }
      return e;
    }
    
    
    function updateTitle(html) {
      element.find('h2')
        .html(html);
    }
    
    
    function activateButton(buttonName) {
      element.find('span.fc-button-' + buttonName)
        .addClass(tm + '-state-active');
    }
    
    
    function deactivateButton(buttonName) {
      element.find('span.fc-button-' + buttonName)
        .removeClass(tm + '-state-active');
    }
    
    
    function disableButton(buttonName) {
      element.find('span.fc-button-' + buttonName)
        .addClass(tm + '-state-disabled');
    }
    
    
    function enableButton(buttonName) {
      element.find('span.fc-button-' + buttonName)
        .removeClass(tm + '-state-disabled');
    }
  
  
  }
  
  ;;
  
  fc.sourceNormalizers = [];
  fc.sourceFetchers = [];
  
  var ajaxDefaults = {
    dataType: 'json',
    cache: false
  };
  
  var eventGUID = 1;
  
  
  function EventManager(options, _sources) {
    var t = this;
    
    
    // exports
    t.isFetchNeeded = isFetchNeeded;
    t.fetchEvents = fetchEvents;
    t.addEventSource = addEventSource;
    t.removeEventSource = removeEventSource;
    t.updateEvent = updateEvent;
    t.renderEvent = renderEvent;
    t.removeEvents = removeEvents;
    t.clientEvents = clientEvents;
    t.normalizeEvent = normalizeEvent;
    
    
    // imports
    var trigger = t.trigger;
    var getView = t.getView;
    var reportEvents = t.reportEvents;
    
    
    // locals
    var stickySource = { events: [] };
    var sources = [ stickySource ];
    var rangeStart, rangeEnd;
    var currentFetchID = 0;
    var pendingSourceCnt = 0;
    var loadingLevel = 0;
    var cache = [];
    
    
    for (var i=0; i<_sources.length; i++) {
      _addEventSource(_sources[i]);
    }
    
    
    
    /* Fetching
    -----------------------------------------------------------------------------*/
    
    
    function isFetchNeeded(start, end) {
      return !rangeStart || start < rangeStart || end > rangeEnd;
    }
    
    
    function fetchEvents(start, end) {
      rangeStart = start;
      rangeEnd = end;
      cache = [];
      var fetchID = ++currentFetchID;
      var len = sources.length;
      pendingSourceCnt = len;
      for (var i=0; i<len; i++) {
        fetchEventSource(sources[i], fetchID);
      }
    }
    
    
    function fetchEventSource(source, fetchID) {
      _fetchEventSource(source, function(events) {
        if (fetchID == currentFetchID) {
          if (events) {
  
            if (options.eventDataTransform) {
              events = $.map(events, options.eventDataTransform);
            }
            if (source.eventDataTransform) {
              events = $.map(events, source.eventDataTransform);
            }
            // TODO: this technique is not ideal for static array event sources.
            //  For arrays, we'll want to process all events right in the beginning, then never again.
          
            for (var i=0; i<events.length; i++) {
              events[i].source = source;
              normalizeEvent(events[i]);
            }
            cache = cache.concat(events);
          }
          pendingSourceCnt--;
          if (!pendingSourceCnt) {
            reportEvents(cache);
          }
        }
      });
    }
    
    
    function _fetchEventSource(source, callback) {
      var i;
      var fetchers = fc.sourceFetchers;
      var res;
      for (i=0; i<fetchers.length; i++) {
        res = fetchers[i](source, rangeStart, rangeEnd, callback);
        if (res === true) {
          // the fetcher is in charge. made its own async request
          return;
        }
        else if (typeof res == 'object') {
          // the fetcher returned a new source. process it
          _fetchEventSource(res, callback);
          return;
        }
      }
      var events = source.events;
      if (events) {
        if ($.isFunction(events)) {
          pushLoading();
          events(cloneDate(rangeStart), cloneDate(rangeEnd), function(events) {
            callback(events);
            popLoading();
          });
        }
        else if ($.isArray(events)) {
          callback(events);
        }
        else {
          callback();
        }
      }else{
        var url = source.url;
        if (url) {
          var success = source.success;
          var error = source.error;
          var complete = source.complete;
  
          // retrieve any outbound GET/POST $.ajax data from the options
          var customData;
          if ($.isFunction(source.data)) {
            // supplied as a function that returns a key/value object
            customData = source.data();
          }
          else {
            // supplied as a straight key/value object
            customData = source.data;
          }
  
          // use a copy of the custom data so we can modify the parameters
          // and not affect the passed-in object.
          var data = $.extend({}, customData || {});
  
          var startParam = firstDefined(source.startParam, options.startParam);
          var endParam = firstDefined(source.endParam, options.endParam);
          if (startParam) {
            data[startParam] = Math.round(+rangeStart / 1000);
          }
          if (endParam) {
            data[endParam] = Math.round(+rangeEnd / 1000);
          }
  
          pushLoading();
          $.ajax($.extend({}, ajaxDefaults, source, {
            data: data,
            success: function(events) {
              events = events || [];
              var res = applyAll(success, this, arguments);
              if ($.isArray(res)) {
                events = res;
              }
              callback(events);
            },
            error: function() {
              applyAll(error, this, arguments);
              callback();
            },
            complete: function() {
              applyAll(complete, this, arguments);
              popLoading();
            }
          }));
        }else{
          callback();
        }
      }
    }
    
    
    
    /* Sources
    -----------------------------------------------------------------------------*/
    
  
    function addEventSource(source) {
      source = _addEventSource(source);
      if (source) {
        pendingSourceCnt++;
        fetchEventSource(source, currentFetchID); // will eventually call reportEvents
      }
    }
    
    
    function _addEventSource(source) {
      if ($.isFunction(source) || $.isArray(source)) {
        source = { events: source };
      }
      else if (typeof source == 'string') {
        source = { url: source };
      }
      if (typeof source == 'object') {
        normalizeSource(source);
        sources.push(source);
        return source;
      }
    }
    
  
    function removeEventSource(source) {
      sources = $.grep(sources, function(src) {
        return !isSourcesEqual(src, source);
      });
      // remove all client events from that source
      cache = $.grep(cache, function(e) {
        return !isSourcesEqual(e.source, source);
      });
      reportEvents(cache);
    }
    
    
    
    /* Manipulation
    -----------------------------------------------------------------------------*/
    
    
    function updateEvent(event) { // update an existing event
      var i, len = cache.length, e,
        defaultEventEnd = getView().defaultEventEnd, // getView???
        startDelta = event.start - event._start,
        endDelta = event.end ?
          (event.end - (event._end || defaultEventEnd(event))) // event._end would be null if event.end
          : 0;                                                      // was null and event was just resized
      for (i=0; i<len; i++) {
        e = cache[i];
        if (e._id == event._id && e != event) {
          e.start = new Date(+e.start + startDelta);
          if (event.end) {
            if (e.end) {
              e.end = new Date(+e.end + endDelta);
            }else{
              e.end = new Date(+defaultEventEnd(e) + endDelta);
            }
          }else{
            e.end = null;
          }
          e.title = event.title;
          e.url = event.url;
          e.allDay = event.allDay;
          e.className = event.className;
          e.editable = event.editable;
          e.color = event.color;
          e.backgroundColor = event.backgroundColor;
          e.borderColor = event.borderColor;
          e.textColor = event.textColor;
          normalizeEvent(e);
        }
      }
      normalizeEvent(event);
      reportEvents(cache);
    }
    
    
    function renderEvent(event, stick) {
      normalizeEvent(event);
      if (!event.source) {
        if (stick) {
          stickySource.events.push(event);
          event.source = stickySource;
        }
        cache.push(event);
      }
      reportEvents(cache);
    }
    
    
    function removeEvents(filter) {
      if (!filter) { // remove all
        cache = [];
        // clear all array sources
        for (var i=0; i<sources.length; i++) {
          if ($.isArray(sources[i].events)) {
            sources[i].events = [];
          }
        }
      }else{
        if (!$.isFunction(filter)) { // an event ID
          var id = filter + '';
          filter = function(e) {
            return e._id == id;
          };
        }
        cache = $.grep(cache, filter, true);
        // remove events from array sources
        for (var i=0; i<sources.length; i++) {
          if ($.isArray(sources[i].events)) {
            sources[i].events = $.grep(sources[i].events, filter, true);
          }
        }
      }
      reportEvents(cache);
    }
    
    
    function clientEvents(filter) {
      if ($.isFunction(filter)) {
        return $.grep(cache, filter);
      }
      else if (filter) { // an event ID
        filter += '';
        return $.grep(cache, function(e) {
          return e._id == filter;
        });
      }
      return cache; // else, return all
    }
    
    
    
    /* Loading State
    -----------------------------------------------------------------------------*/
    
    
    function pushLoading() {
      if (!loadingLevel++) {
        trigger('loading', null, true, getView());
      }
    }
    
    
    function popLoading() {
      if (!--loadingLevel) {
        trigger('loading', null, false, getView());
      }
    }
    
    
    
    /* Event Normalization
    -----------------------------------------------------------------------------*/
    
    
    function normalizeEvent(event) {
      var source = event.source || {};
      var ignoreTimezone = firstDefined(source.ignoreTimezone, options.ignoreTimezone);
      event._id = event._id || (event.id === undefined ? '_fc' + eventGUID++ : event.id + '');
      if (event.date) {
        if (!event.start) {
          event.start = event.date;
        }
        delete event.date;
      }
      event._start = cloneDate(event.start = parseDate(event.start, ignoreTimezone));
      event.end = parseDate(event.end, ignoreTimezone);
      if (event.end && event.end <= event.start) {
        event.end = null;
      }
      event._end = event.end ? cloneDate(event.end) : null;
      if (event.allDay === undefined) {
        event.allDay = firstDefined(source.allDayDefault, options.allDayDefault);
      }
      if (event.className) {
        if (typeof event.className == 'string') {
          event.className = event.className.split(/\s+/);
        }
      }else{
        event.className = [];
      }
      // TODO: if there is no start date, return false to indicate an invalid event
    }
    
    
    
    /* Utils
    ------------------------------------------------------------------------------*/
    
    
    function normalizeSource(source) {
      if (source.className) {
        // TODO: repeat code, same code for event classNames
        if (typeof source.className == 'string') {
          source.className = source.className.split(/\s+/);
        }
      }else{
        source.className = [];
      }
      var normalizers = fc.sourceNormalizers;
      for (var i=0; i<normalizers.length; i++) {
        normalizers[i](source);
      }
    }
    
    
    function isSourcesEqual(source1, source2) {
      return source1 && source2 && getSourcePrimitive(source1) == getSourcePrimitive(source2);
    }
    
    
    function getSourcePrimitive(source) {
      return ((typeof source == 'object') ? (source.events || source.url) : '') || source;
    }
  
  
  }
  
  ;;
  
  
  fc.addDays = addDays;
  fc.cloneDate = cloneDate;
  fc.parseDate = parseDate;
  fc.parseISO8601 = parseISO8601;
  fc.parseTime = parseTime;
  fc.formatDate = formatDate;
  fc.formatDates = formatDates;
  
  
  
  /* Date Math
  -----------------------------------------------------------------------------*/
  
  var dayIDs = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    DAY_MS = 86400000,
    HOUR_MS = 3600000,
    MINUTE_MS = 60000;
    
  
  function addYears(d, n, keepTime) {
    d.setFullYear(d.getFullYear() + n);
    if (!keepTime) {
      clearTime(d);
    }
    return d;
  }
  
  
  function addMonths(d, n, keepTime) { // prevents day overflow/underflow
    if (+d) { // prevent infinite looping on invalid dates
      var m = d.getMonth() + n,
        check = cloneDate(d);
      check.setDate(1);
      check.setMonth(m);
      d.setMonth(m);
      if (!keepTime) {
        clearTime(d);
      }
      while (d.getMonth() != check.getMonth()) {
        d.setDate(d.getDate() + (d < check ? 1 : -1));
      }
    }
    return d;
  }
  
  
  function addDays(d, n, keepTime) { // deals with daylight savings
    if (+d) {
      var dd = d.getDate() + n,
        check = cloneDate(d);
      check.setHours(9); // set to middle of day
      check.setDate(dd);
      d.setDate(dd);
      if (!keepTime) {
        clearTime(d);
      }
      fixDate(d, check);
    }
    return d;
  }
  
  
  function fixDate(d, check) { // force d to be on check's YMD, for daylight savings purposes
    if (+d) { // prevent infinite looping on invalid dates
      while (d.getDate() != check.getDate()) {
        d.setTime(+d + (d < check ? 1 : -1) * HOUR_MS);
      }
    }
  }
  
  
  function addMinutes(d, n) {
    d.setMinutes(d.getMinutes() + n);
    return d;
  }
  
  
  function clearTime(d) {
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0); 
    d.setMilliseconds(0);
    return d;
  }
  
  
  function cloneDate(d, dontKeepTime) {
    if (dontKeepTime) {
      return clearTime(new Date(+d));
    }
    return new Date(+d);
  }
  
  
  function zeroDate() { // returns a Date with time 00:00:00 and dateOfMonth=1
    var i=0, d;
    do {
      d = new Date(1970, i++, 1);
    } while (d.getHours()); // != 0
    return d;
  }
  
  
  function dayDiff(d1, d2) { // d1 - d2
    return Math.round((cloneDate(d1, true) - cloneDate(d2, true)) / DAY_MS);
  }
  
  
  function setYMD(date, y, m, d) {
    if (y !== undefined && y != date.getFullYear()) {
      date.setDate(1);
      date.setMonth(0);
      date.setFullYear(y);
    }
    if (m !== undefined && m != date.getMonth()) {
      date.setDate(1);
      date.setMonth(m);
    }
    if (d !== undefined) {
      date.setDate(d);
    }
  }
  
  
  
  /* Date Parsing
  -----------------------------------------------------------------------------*/
  
  
  function parseDate(s, ignoreTimezone) { // ignoreTimezone defaults to true
    if (typeof s == 'object') { // already a Date object
      return s;
    }
    if (typeof s == 'number') { // a UNIX timestamp
      return new Date(s * 1000);
    }
    if (typeof s == 'string') {
      if (s.match(/^\d+(\.\d+)?$/)) { // a UNIX timestamp
        return new Date(parseFloat(s) * 1000);
      }
      if (ignoreTimezone === undefined) {
        ignoreTimezone = true;
      }
      return parseISO8601(s, ignoreTimezone) || (s ? new Date(s) : null);
    }
    // TODO: never return invalid dates (like from new Date(<string>)), return null instead
    return null;
  }
  
  
  function parseISO8601(s, ignoreTimezone) { // ignoreTimezone defaults to false
    // derived from http://delete.me.uk/2005/03/iso8601.html
    // TODO: for a know glitch/feature, read tests/issue_206_parseDate_dst.html
    var m = s.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);
    if (!m) {
      return null;
    }
    var date = new Date(m[1], 0, 1);
    if (ignoreTimezone || !m[13]) {
      var check = new Date(m[1], 0, 1, 9, 0);
      if (m[3]) {
        date.setMonth(m[3] - 1);
        check.setMonth(m[3] - 1);
      }
      if (m[5]) {
        date.setDate(m[5]);
        check.setDate(m[5]);
      }
      fixDate(date, check);
      if (m[7]) {
        date.setHours(m[7]);
      }
      if (m[8]) {
        date.setMinutes(m[8]);
      }
      if (m[10]) {
        date.setSeconds(m[10]);
      }
      if (m[12]) {
        date.setMilliseconds(Number("0." + m[12]) * 1000);
      }
      fixDate(date, check);
    }else{
      date.setUTCFullYear(
        m[1],
        m[3] ? m[3] - 1 : 0,
        m[5] || 1
      );
      date.setUTCHours(
        m[7] || 0,
        m[8] || 0,
        m[10] || 0,
        m[12] ? Number("0." + m[12]) * 1000 : 0
      );
      if (m[14]) {
        var offset = Number(m[16]) * 60 + (m[18] ? Number(m[18]) : 0);
        offset *= m[15] == '-' ? 1 : -1;
        date = new Date(+date + (offset * 60 * 1000));
      }
    }
    return date;
  }
  
  
  function parseTime(s) { // returns minutes since start of day
    if (typeof s == 'number') { // an hour
      return s * 60;
    }
    if (typeof s == 'object') { // a Date object
      return s.getHours() * 60 + s.getMinutes();
    }
    var m = s.match(/(\d+)(?::(\d+))?\s*(\w+)?/);
    if (m) {
      var h = parseInt(m[1], 10);
      if (m[3]) {
        h %= 12;
        if (m[3].toLowerCase().charAt(0) == 'p') {
          h += 12;
        }
      }
      return h * 60 + (m[2] ? parseInt(m[2], 10) : 0);
    }
  }
  
  
  
  /* Date Formatting
  -----------------------------------------------------------------------------*/
  // TODO: use same function formatDate(date, [date2], format, [options])
  
  
  function formatDate(date, format, options) {
    return formatDates(date, null, format, options);
  }
  
  
  function formatDates(date1, date2, format, options) {
    options = options || defaults;
    var date = date1,
      otherDate = date2,
      i, len = format.length, c,
      i2, formatter,
      res = '';
    for (i=0; i<len; i++) {
      c = format.charAt(i);
      if (c == "'") {
        for (i2=i+1; i2<len; i2++) {
          if (format.charAt(i2) == "'") {
            if (date) {
              if (i2 == i+1) {
                res += "'";
              }else{
                res += format.substring(i+1, i2);
              }
              i = i2;
            }
            break;
          }
        }
      }
      else if (c == '(') {
        for (i2=i+1; i2<len; i2++) {
          if (format.charAt(i2) == ')') {
            var subres = formatDate(date, format.substring(i+1, i2), options);
            if (parseInt(subres.replace(/\D/, ''), 10)) {
              res += subres;
            }
            i = i2;
            break;
          }
        }
      }
      else if (c == '[') {
        for (i2=i+1; i2<len; i2++) {
          if (format.charAt(i2) == ']') {
            var subformat = format.substring(i+1, i2);
            var subres = formatDate(date, subformat, options);
            if (subres != formatDate(otherDate, subformat, options)) {
              res += subres;
            }
            i = i2;
            break;
          }
        }
      }
      else if (c == '{') {
        date = date2;
        otherDate = date1;
      }
      else if (c == '}') {
        date = date1;
        otherDate = date2;
      }
      else {
        for (i2=len; i2>i; i2--) {
          if (formatter = dateFormatters[format.substring(i, i2)]) {
            if (date) {
              res += formatter(date, options);
            }
            i = i2 - 1;
            break;
          }
        }
        if (i2 == i) {
          if (date) {
            res += c;
          }
        }
      }
    }
    return res;
  };
  
  
  var dateFormatters = {
    s	: function(d)	{ return d.getSeconds() },
    ss	: function(d)	{ return zeroPad(d.getSeconds()) },
    m	: function(d)	{ return d.getMinutes() },
    mm	: function(d)	{ return zeroPad(d.getMinutes()) },
    h	: function(d)	{ return d.getHours() % 12 || 12 },
    hh	: function(d)	{ return zeroPad(d.getHours() % 12 || 12) },
    H	: function(d)	{ return d.getHours() },
    HH	: function(d)	{ return zeroPad(d.getHours()) },
    d	: function(d)	{ return d.getDate() },
    dd	: function(d)	{ return zeroPad(d.getDate()) },
    ddd	: function(d,o)	{ return o.dayNamesShort[d.getDay()] },
    dddd: function(d,o)	{ return o.dayNames[d.getDay()] },
    M	: function(d)	{ return d.getMonth() + 1 },
    MM	: function(d)	{ return zeroPad(d.getMonth() + 1) },
    MMM	: function(d,o)	{ return o.monthNamesShort[d.getMonth()] },
    MMMM: function(d,o)	{ return o.monthNames[d.getMonth()] },
    yy	: function(d)	{ return (d.getFullYear()+'').substring(2) },
    yyyy: function(d)	{ return d.getFullYear() },
    t	: function(d)	{ return d.getHours() < 12 ? 'a' : 'p' },
    tt	: function(d)	{ return d.getHours() < 12 ? 'am' : 'pm' },
    T	: function(d)	{ return d.getHours() < 12 ? 'A' : 'P' },
    TT	: function(d)	{ return d.getHours() < 12 ? 'AM' : 'PM' },
    u	: function(d)	{ return formatDate(d, "yyyy-MM-dd'T'HH:mm:ss'Z'") },
    S	: function(d)	{
      var date = d.getDate();
      if (date > 10 && date < 20) {
        return 'th';
      }
      return ['st', 'nd', 'rd'][date%10-1] || 'th';
    },
    w   : function(d, o) { // local
      return o.weekNumberCalculation(d);
    },
    W   : function(d) { // ISO
      return iso8601Week(d);
    }
  };
  fc.dateFormatters = dateFormatters;
  
  
  /* thanks jQuery UI (https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js)
   * 
   * Set as calculateWeek to determine the week of the year based on the ISO 8601 definition.
   * `date` - the date to get the week for
   * `number` - the number of the week within the year that contains this date
   */
  function iso8601Week(date) {
    var time;
    var checkDate = new Date(date.getTime());
  
    // Find Thursday of this week starting on Monday
    checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
  
    time = checkDate.getTime();
    checkDate.setMonth(0); // Compare with Jan 1
    checkDate.setDate(1);
    return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
  }
  
  
  ;;
  
  fc.applyAll = applyAll;
  
  
  /* Event Date Math
  -----------------------------------------------------------------------------*/
  
  
  function exclEndDay(event) {
    if (event.end) {
      return _exclEndDay(event.end, event.allDay);
    }else{
      return addDays(cloneDate(event.start), 1);
    }
  }
  
  
  function _exclEndDay(end, allDay) {
    end = cloneDate(end);
    return allDay || end.getHours() || end.getMinutes() ? addDays(end, 1) : clearTime(end);
    // why don't we check for seconds/ms too?
  }
  
  
  
  /* Event Element Binding
  -----------------------------------------------------------------------------*/
  
  
  function lazySegBind(container, segs, bindHandlers) {
    container.unbind('mouseover').mouseover(function(ev) {
      var parent=ev.target, e,
        i, seg;
      while (parent != this) {
        e = parent;
        parent = parent.parentNode;
      }
      if ((i = e._fci) !== undefined) {
        e._fci = undefined;
        seg = segs[i];
        bindHandlers(seg.event, seg.element, seg);
        $(ev.target).trigger(ev);
      }
      ev.stopPropagation();
    });
  }
  
  
  
  /* Element Dimensions
  -----------------------------------------------------------------------------*/
  
  
  function setOuterWidth(element, width, includeMargins) {
    for (var i=0, e; i<element.length; i++) {
      e = $(element[i]);
      e.width(Math.max(0, width - hsides(e, includeMargins)));
    }
  }
  
  
  function setOuterHeight(element, height, includeMargins) {
    for (var i=0, e; i<element.length; i++) {
      e = $(element[i]);
      e.height(Math.max(0, height - vsides(e, includeMargins)));
    }
  }
  
  
  function hsides(element, includeMargins) {
    return hpadding(element) + hborders(element) + (includeMargins ? hmargins(element) : 0);
  }
  
  
  function hpadding(element) {
    return (parseFloat($.css(element[0], 'paddingLeft', true)) || 0) +
           (parseFloat($.css(element[0], 'paddingRight', true)) || 0);
  }
  
  
  function hmargins(element) {
    return (parseFloat($.css(element[0], 'marginLeft', true)) || 0) +
           (parseFloat($.css(element[0], 'marginRight', true)) || 0);
  }
  
  
  function hborders(element) {
    return (parseFloat($.css(element[0], 'borderLeftWidth', true)) || 0) +
           (parseFloat($.css(element[0], 'borderRightWidth', true)) || 0);
  }
  
  
  function vsides(element, includeMargins) {
    return vpadding(element) +  vborders(element) + (includeMargins ? vmargins(element) : 0);
  }
  
  
  function vpadding(element) {
    return (parseFloat($.css(element[0], 'paddingTop', true)) || 0) +
           (parseFloat($.css(element[0], 'paddingBottom', true)) || 0);
  }
  
  
  function vmargins(element) {
    return (parseFloat($.css(element[0], 'marginTop', true)) || 0) +
           (parseFloat($.css(element[0], 'marginBottom', true)) || 0);
  }
  
  
  function vborders(element) {
    return (parseFloat($.css(element[0], 'borderTopWidth', true)) || 0) +
           (parseFloat($.css(element[0], 'borderBottomWidth', true)) || 0);
  }
  
  
  
  /* Misc Utils
  -----------------------------------------------------------------------------*/
  
  
  //TODO: arraySlice
  //TODO: isFunction, grep ?
  
  
  function noop() { }
  
  
  function dateCompare(a, b) {
    return a - b;
  }
  
  
  function arrayMax(a) {
    return Math.max.apply(Math, a);
  }
  
  
  function zeroPad(n) {
    return (n < 10 ? '0' : '') + n;
  }
  
  
  function smartProperty(obj, name) { // get a camel-cased/namespaced property of an object
    if (obj[name] !== undefined) {
      return obj[name];
    }
    var parts = name.split(/(?=[A-Z])/),
      i=parts.length-1, res;
    for (; i>=0; i--) {
      res = obj[parts[i].toLowerCase()];
      if (res !== undefined) {
        return res;
      }
    }
    return obj[''];
  }
  
  
  function htmlEscape(s) {
    return s.replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/'/g, '\'')
      .replace(/"/g, '"')
      .replace(/\n/g, '<br />');
  }
  
  
  function disableTextSelection(element) {
    element
      .attr('unselectable', 'on')
      .css('MozUserSelect', 'none')
      .bind('selectstart.ui', function() { return false; });
  }
  
  
  /*
  function enableTextSelection(element) {
    element
      .attr('unselectable', 'off')
      .css('MozUserSelect', '')
      .unbind('selectstart.ui');
  }
  */
  
  
  function markFirstLast(e) {
    e.children()
      .removeClass('fc-first fc-last')
      .filter(':first-child')
        .addClass('fc-first')
      .end()
      .filter(':last-child')
        .addClass('fc-last');
  }
  
  
  function setDayID(cell, date) {
    cell.each(function(i, _cell) {
      _cell.className = _cell.className.replace(/^fc-\w*/, 'fc-' + dayIDs[date.getDay()]);
      // TODO: make a way that doesn't rely on order of classes
    });
  }
  
  
  function getSkinCss(event, opt) {
    var source = event.source || {};
    var eventColor = event.color;
    var sourceColor = source.color;
    var optionColor = opt('eventColor');
    var backgroundColor =
      event.backgroundColor ||
      eventColor ||
      source.backgroundColor ||
      sourceColor ||
      opt('eventBackgroundColor') ||
      optionColor;
    var borderColor =
      event.borderColor ||
      eventColor ||
      source.borderColor ||
      sourceColor ||
      opt('eventBorderColor') ||
      optionColor;
    var textColor =
      event.textColor ||
      source.textColor ||
      opt('eventTextColor');
    var statements = [];
    if (backgroundColor) {
      statements.push('background-color:' + backgroundColor);
    }
    if (borderColor) {
      statements.push('border-color:' + borderColor);
    }
    if (textColor) {
      statements.push('color:' + textColor);
    }
    return statements.join(';');
  }
  
  
  function applyAll(functions, thisObj, args) {
    if ($.isFunction(functions)) {
      functions = [ functions ];
    }
    if (functions) {
      var i;
      var ret;
      for (i=0; i<functions.length; i++) {
        ret = functions[i].apply(thisObj, args) || ret;
      }
      return ret;
    }
  }
  
  
  function firstDefined() {
    for (var i=0; i<arguments.length; i++) {
      if (arguments[i] !== undefined) {
        return arguments[i];
      }
    }
  }
  
  
  ;;
  
  fcViews.month = MonthView;
  
  function MonthView(element, calendar) {
    var t = this;
    
    
    // exports
    t.render = render;
    
    
    // imports
    BasicView.call(t, element, calendar, 'month');
    var opt = t.opt;
    var renderBasic = t.renderBasic;
    var skipHiddenDays = t.skipHiddenDays;
    var getCellsPerWeek = t.getCellsPerWeek;
    var formatDate = calendar.formatDate;
    
    
    function render(date, delta) {
  
      if (delta) {
        addMonths(date, delta);
        date.setDate(1);
      }
  
      var firstDay = opt('firstDay');
  
      var start = cloneDate(date, true);
      start.setDate(1);
  
      var end = addMonths(cloneDate(start), 1);
  
      var visStart = cloneDate(start);
      addDays(visStart, -((visStart.getDay() - firstDay + 7) % 7));
      skipHiddenDays(visStart);
  
      var visEnd = cloneDate(end);
      addDays(visEnd, (7 - visEnd.getDay() + firstDay) % 7);
      skipHiddenDays(visEnd, -1, true);
  
      var colCnt = getCellsPerWeek();
      var rowCnt = Math.round(dayDiff(visEnd, visStart) / 7); // should be no need for Math.round
  
      if (opt('weekMode') == 'fixed') {
        addDays(visEnd, (6 - rowCnt) * 7); // add weeks to make up for it
        rowCnt = 6;
      }
  
      t.title = formatDate(start, opt('titleFormat'));
  
      t.start = start;
      t.end = end;
      t.visStart = visStart;
      t.visEnd = visEnd;
  
      renderBasic(rowCnt, colCnt, true);
    }
    
    
  }
  
  ;;
  
  fcViews.basicWeek = BasicWeekView;
  
  function BasicWeekView(element, calendar) {
    var t = this;
    
    
    // exports
    t.render = render;
    
    
    // imports
    BasicView.call(t, element, calendar, 'basicWeek');
    var opt = t.opt;
    var renderBasic = t.renderBasic;
    var skipHiddenDays = t.skipHiddenDays;
    var getCellsPerWeek = t.getCellsPerWeek;
    var formatDates = calendar.formatDates;
    
    
    function render(date, delta) {
  
      if (delta) {
        addDays(date, delta * 7);
      }
  
      var start = addDays(cloneDate(date), -((date.getDay() - opt('firstDay') + 7) % 7));
      var end = addDays(cloneDate(start), 7);
  
      var visStart = cloneDate(start);
      skipHiddenDays(visStart);
  
      var visEnd = cloneDate(end);
      skipHiddenDays(visEnd, -1, true);
  
      var colCnt = getCellsPerWeek();
  
      t.start = start;
      t.end = end;
      t.visStart = visStart;
      t.visEnd = visEnd;
  
      t.title = formatDates(
        visStart,
        addDays(cloneDate(visEnd), -1),
        opt('titleFormat')
      );
  
      renderBasic(1, colCnt, false);
    }
    
    
  }
  
  ;;
  
  fcViews.basicDay = BasicDayView;
  
  
  function BasicDayView(element, calendar) {
    var t = this;
    
    
    // exports
    t.render = render;
    
    
    // imports
    BasicView.call(t, element, calendar, 'basicDay');
    var opt = t.opt;
    var renderBasic = t.renderBasic;
    var skipHiddenDays = t.skipHiddenDays;
    var formatDate = calendar.formatDate;
    
    
    function render(date, delta) {
  
      if (delta) {
        addDays(date, delta);
      }
      skipHiddenDays(date, delta < 0 ? -1 : 1);
  
      var start = cloneDate(date, true);
      var end = addDays(cloneDate(start), 1);
  
      t.title = formatDate(date, opt('titleFormat'));
  
      t.start = t.visStart = start;
      t.end = t.visEnd = end;
  
      renderBasic(1, 1, false);
    }
    
    
  }
  
  ;;
  
  setDefaults({
    weekMode: 'fixed'
  });
  
  
  function BasicView(element, calendar, viewName) {
    var t = this;
    
    
    // exports
    t.renderBasic = renderBasic;
    t.setHeight = setHeight;
    t.setWidth = setWidth;
    t.renderDayOverlay = renderDayOverlay;
    t.defaultSelectionEnd = defaultSelectionEnd;
    t.renderSelection = renderSelection;
    t.clearSelection = clearSelection;
    t.reportDayClick = reportDayClick; // for selection (kinda hacky)
    t.dragStart = dragStart;
    t.dragStop = dragStop;
    t.defaultEventEnd = defaultEventEnd;
    t.getHoverListener = function() { return hoverListener };
    t.colLeft = colLeft;
    t.colRight = colRight;
    t.colContentLeft = colContentLeft;
    t.colContentRight = colContentRight;
    t.getIsCellAllDay = function() { return true };
    t.allDayRow = allDayRow;
    t.getRowCnt = function() { return rowCnt };
    t.getColCnt = function() { return colCnt };
    t.getColWidth = function() { return colWidth };
    t.getDaySegmentContainer = function() { return daySegmentContainer };
    
    
    // imports
    View.call(t, element, calendar, viewName);
    OverlayManager.call(t);
    SelectionManager.call(t);
    BasicEventRenderer.call(t);
    var opt = t.opt;
    var trigger = t.trigger;
    var renderOverlay = t.renderOverlay;
    var clearOverlays = t.clearOverlays;
    var daySelectionMousedown = t.daySelectionMousedown;
    var cellToDate = t.cellToDate;
    var dateToCell = t.dateToCell;
    var rangeToSegments = t.rangeToSegments;
    var formatDate = calendar.formatDate;
    
    
    // locals
    
    var table;
    var head;
    var headCells;
    var body;
    var bodyRows;
    var bodyCells;
    var bodyFirstCells;
    var firstRowCellInners;
    var firstRowCellContentInners;
    var daySegmentContainer;
    
    var viewWidth;
    var viewHeight;
    var colWidth;
    var weekNumberWidth;
    
    var rowCnt, colCnt;
    var showNumbers;
    var coordinateGrid;
    var hoverListener;
    var colPositions;
    var colContentPositions;
    
    var tm;
    var colFormat;
    var showWeekNumbers;
    var weekNumberTitle;
    var weekNumberFormat;
    
    
    
    /* Rendering
    ------------------------------------------------------------*/
    
    
    disableTextSelection(element.addClass('fc-grid'));
    
    
    function renderBasic(_rowCnt, _colCnt, _showNumbers) {
      rowCnt = _rowCnt;
      colCnt = _colCnt;
      showNumbers = _showNumbers;
      updateOptions();
  
      if (!body) {
        buildEventContainer();
      }
  
      buildTable();
    }
    
    
    function updateOptions() {
      tm = opt('theme') ? 'ui' : 'fc';
      colFormat = opt('columnFormat');
  
      // week # options. (TODO: bad, logic also in other views)
      showWeekNumbers = opt('weekNumbers');
      weekNumberTitle = opt('weekNumberTitle');
      if (opt('weekNumberCalculation') != 'iso') {
        weekNumberFormat = "w";
      }
      else {
        weekNumberFormat = "W";
      }
    }
    
    
    function buildEventContainer() {
      daySegmentContainer =
        $("<div class='fc-event-container' style='position:absolute;z-index:8;top:0;left:0'/>")
          .appendTo(element);
    }
    
    
    function buildTable() {
      var html = buildTableHTML();
  
      if (table) {
        table.remove();
      }
      table = $(html).appendTo(element);
  
      head = table.find('thead');
      headCells = head.find('.fc-day-header');
      body = table.find('tbody');
      bodyRows = body.find('tr');
      bodyCells = body.find('.fc-day');
      bodyFirstCells = bodyRows.find('td:first-child');
  
      firstRowCellInners = bodyRows.eq(0).find('.fc-day > div');
      firstRowCellContentInners = bodyRows.eq(0).find('.fc-day-content > div');
      
      markFirstLast(head.add(head.find('tr'))); // marks first+last tr/th's
      markFirstLast(bodyRows); // marks first+last td's
      bodyRows.eq(0).addClass('fc-first');
      bodyRows.filter(':last').addClass('fc-last');
  
      bodyCells.each(function(i, _cell) {
        var date = cellToDate(
          Math.floor(i / colCnt),
          i % colCnt
        );
        trigger('dayRender', t, date, $(_cell));
      });
  
      dayBind(bodyCells);
    }
  
  
  
    /* HTML Building
    -----------------------------------------------------------*/
  
  
    function buildTableHTML() {
      var html =
        "<table class='fc-border-separate' style='width:100%' cellspacing='0'>" +
        buildHeadHTML() +
        buildBodyHTML() +
        "</table>";
  
      return html;
    }
  
  
    function buildHeadHTML() {
      var headerClass = tm + "-widget-header";
      var html = '';
      var col;
      var date;
  
      html += "<thead><tr>";
  
      if (showWeekNumbers) {
        html +=
          "<th class='fc-week-number " + headerClass + "'>" +
          htmlEscape(weekNumberTitle) +
          "</th>";
      }
  
      for (col=0; col<colCnt; col++) {
        date = cellToDate(0, col);
        html +=
          "<th class='fc-day-header fc-" + dayIDs[date.getDay()] + " " + headerClass + "'>" +
          htmlEscape(formatDate(date, colFormat)) +
          "</th>";
      }
  
      html += "</tr></thead>";
  
      return html;
    }
  
  
    function buildBodyHTML() {
      var contentClass = tm + "-widget-content";
      var html = '';
      var row;
      var col;
      var date;
  
      html += "<tbody>";
  
      for (row=0; row<rowCnt; row++) {
  
        html += "<tr class='fc-week'>";
  
        if (showWeekNumbers) {
          date = cellToDate(row, 0);
          html +=
            "<td class='fc-week-number " + contentClass + "'>" +
            "<div>" +
            htmlEscape(formatDate(date, weekNumberFormat)) +
            "</div>" +
            "</td>";
        }
  
        for (col=0; col<colCnt; col++) {
          date = cellToDate(row, col);
          html += buildCellHTML(date);
        }
  
        html += "</tr>";
      }
  
      html += "</tbody>";
  
      return html;
    }
  
  
    function buildCellHTML(date) {
      var contentClass = tm + "-widget-content";
      var month = t.start.getMonth();
      var today = clearTime(new Date());
      var html = '';
      var classNames = [
        'fc-day',
        'fc-' + dayIDs[date.getDay()],
        contentClass
      ];
  
      if (date.getMonth() != month) {
        classNames.push('fc-other-month');
      }
      if (+date == +today) {
        classNames.push(
          'fc-today',
          tm + '-state-highlight'
        );
      }
      else if (date < today) {
        classNames.push('fc-past');
      }
      else {
        classNames.push('fc-future');
      }
  
      html +=
        "<td" +
        " class='" + classNames.join(' ') + "'" +
        " data-date='" + formatDate(date, 'yyyy-MM-dd') + "'" +
        ">" +
        "<div>";
  
      if (showNumbers) {
        html += "<div class='fc-day-number'>" + date.getDate() + "</div>";
      }
  
      html +=
        "<div class='fc-day-content'>" +
        "<div style='position:relative'> </div>" +
        "</div>" +
        "</div>" +
        "</td>";
  
      return html;
    }
  
  
  
    /* Dimensions
    -----------------------------------------------------------*/
    
    
    function setHeight(height) {
      viewHeight = height;
      
      var bodyHeight = viewHeight - head.height();
      var rowHeight;
      var rowHeightLast;
      var cell;
        
      if (opt('weekMode') == 'variable') {
        rowHeight = rowHeightLast = Math.floor(bodyHeight / (rowCnt==1 ? 2 : 6));
      }else{
        rowHeight = Math.floor(bodyHeight / rowCnt);
        rowHeightLast = bodyHeight - rowHeight * (rowCnt-1);
      }
      
      bodyFirstCells.each(function(i, _cell) {
        if (i < rowCnt) {
          cell = $(_cell);
          cell.find('> div').css(
            'min-height',
            (i==rowCnt-1 ? rowHeightLast : rowHeight) - vsides(cell)
          );
        }
      });
      
    }
    
    
    function setWidth(width) {
      viewWidth = width;
      colPositions.clear();
      colContentPositions.clear();
  
      weekNumberWidth = 0;
      if (showWeekNumbers) {
        weekNumberWidth = head.find('th.fc-week-number').outerWidth();
      }
  
      colWidth = Math.floor((viewWidth - weekNumberWidth) / colCnt);
      setOuterWidth(headCells.slice(0, -1), colWidth);
    }
    
    
    
    /* Day clicking and binding
    -----------------------------------------------------------*/
    
    
    function dayBind(days) {
      days.click(dayClick)
        .mousedown(daySelectionMousedown);
    }
    
    
    function dayClick(ev) {
      if (!opt('selectable')) { // if selectable, SelectionManager will worry about dayClick
        var date = parseISO8601($(this).data('date'));
        trigger('dayClick', this, date, true, ev);
      }
    }
    
    
    
    /* Semi-transparent Overlay Helpers
    ------------------------------------------------------*/
    // TODO: should be consolidated with AgendaView's methods
  
  
    function renderDayOverlay(overlayStart, overlayEnd, refreshCoordinateGrid) { // overlayEnd is exclusive
  
      if (refreshCoordinateGrid) {
        coordinateGrid.build();
      }
  
      var segments = rangeToSegments(overlayStart, overlayEnd);
  
      for (var i=0; i<segments.length; i++) {
        var segment = segments[i];
        dayBind(
          renderCellOverlay(
            segment.row,
            segment.leftCol,
            segment.row,
            segment.rightCol
          )
        );
      }
    }
  
    
    function renderCellOverlay(row0, col0, row1, col1) { // row1,col1 is inclusive
      var rect = coordinateGrid.rect(row0, col0, row1, col1, element);
      return renderOverlay(rect, element);
    }
    
    
    
    /* Selection
    -----------------------------------------------------------------------*/
    
    
    function defaultSelectionEnd(startDate, allDay) {
      return cloneDate(startDate);
    }
    
    
    function renderSelection(startDate, endDate, allDay) {
      renderDayOverlay(startDate, addDays(cloneDate(endDate), 1), true); // rebuild every time???
    }
    
    
    function clearSelection() {
      clearOverlays();
    }
    
    
    function reportDayClick(date, allDay, ev) {
      var cell = dateToCell(date);
      var _element = bodyCells[cell.row*colCnt + cell.col];
      trigger('dayClick', _element, date, allDay, ev);
    }
    
    
    
    /* External Dragging
    -----------------------------------------------------------------------*/
    
    
    function dragStart(_dragElement, ev, ui) {
      hoverListener.start(function(cell) {
        clearOverlays();
        if (cell) {
          renderCellOverlay(cell.row, cell.col, cell.row, cell.col);
        }
      }, ev);
    }
    
    
    function dragStop(_dragElement, ev, ui) {
      var cell = hoverListener.stop();
      clearOverlays();
      if (cell) {
        var d = cellToDate(cell);
        trigger('drop', _dragElement, d, true, ev, ui);
      }
    }
    
    
    
    /* Utilities
    --------------------------------------------------------*/
    
    
    function defaultEventEnd(event) {
      return cloneDate(event.start);
    }
    
    
    coordinateGrid = new CoordinateGrid(function(rows, cols) {
      var e, n, p;
      headCells.each(function(i, _e) {
        e = $(_e);
        n = e.offset().left;
        if (i) {
          p[1] = n;
        }
        p = [n];
        cols[i] = p;
      });
      p[1] = n + e.outerWidth();
      bodyRows.each(function(i, _e) {
        if (i < rowCnt) {
          e = $(_e);
          n = e.offset().top;
          if (i) {
            p[1] = n;
          }
          p = [n];
          rows[i] = p;
        }
      });
      p[1] = n + e.outerHeight();
    });
    
    
    hoverListener = new HoverListener(coordinateGrid);
    
    colPositions = new HorizontalPositionCache(function(col) {
      return firstRowCellInners.eq(col);
    });
  
    colContentPositions = new HorizontalPositionCache(function(col) {
      return firstRowCellContentInners.eq(col);
    });
  
  
    function colLeft(col) {
      return colPositions.left(col);
    }
  
  
    function colRight(col) {
      return colPositions.right(col);
    }
    
    
    function colContentLeft(col) {
      return colContentPositions.left(col);
    }
    
    
    function colContentRight(col) {
      return colContentPositions.right(col);
    }
    
    
    function allDayRow(i) {
      return bodyRows.eq(i);
    }
    
  }
  
  ;;
  
  function BasicEventRenderer() {
    var t = this;
    
    
    // exports
    t.renderEvents = renderEvents;
    t.clearEvents = clearEvents;
    
  
    // imports
    DayEventRenderer.call(t);
  
    
    function renderEvents(events, modifiedEventId) {
      t.renderDayEvents(events, modifiedEventId);
    }
    
    
    function clearEvents() {
      t.getDaySegmentContainer().empty();
    }
  
  
    // TODO: have this class (and AgendaEventRenderer) be responsible for creating the event container div
  
  }
  
  ;;
  
  fcViews.agendaWeek = AgendaWeekView;
  
  function AgendaWeekView(element, calendar) {
    var t = this;
    
    
    // exports
    t.render = render;
    
    
    // imports
    AgendaView.call(t, element, calendar, 'agendaWeek');
    var opt = t.opt;
    var renderAgenda = t.renderAgenda;
    var skipHiddenDays = t.skipHiddenDays;
    var getCellsPerWeek = t.getCellsPerWeek;
    var formatDates = calendar.formatDates;
  
    
    function render(date, delta) {
  
      if (delta) {
        addDays(date, delta * 7);
      }
  
      var start = addDays(cloneDate(date), -((date.getDay() - opt('firstDay') + 7) % 7));
      var end = addDays(cloneDate(start), 7);
  
      var visStart = cloneDate(start);
      skipHiddenDays(visStart);
  
      var visEnd = cloneDate(end);
      skipHiddenDays(visEnd, -1, true);
  
      var colCnt = getCellsPerWeek();
  
      t.title = formatDates(
        visStart,
        addDays(cloneDate(visEnd), -1),
        opt('titleFormat')
      );
  
      t.start = start;
      t.end = end;
      t.visStart = visStart;
      t.visEnd = visEnd;
  
      renderAgenda(colCnt);
    }
  
  }
  
  ;;
  
  fcViews.agendaDay = AgendaDayView;
  
  
  function AgendaDayView(element, calendar) {
    var t = this;
    
    
    // exports
    t.render = render;
    
    
    // imports
    AgendaView.call(t, element, calendar, 'agendaDay');
    var opt = t.opt;
    var renderAgenda = t.renderAgenda;
    var skipHiddenDays = t.skipHiddenDays;
    var formatDate = calendar.formatDate;
    
    
    function render(date, delta) {
  
      if (delta) {
        addDays(date, delta);
      }
      skipHiddenDays(date, delta < 0 ? -1 : 1);
  
      var start = cloneDate(date, true);
      var end = addDays(cloneDate(start), 1);
  
      t.title = formatDate(date, opt('titleFormat'));
  
      t.start = t.visStart = start;
      t.end = t.visEnd = end;
  
      renderAgenda(1);
    }
    
  
  }
  
  ;;
  
  setDefaults({
    allDaySlot: true,
    allDayText: 'all-day',
    firstHour: 6,
    slotMinutes: 30,
    defaultEventMinutes: 120,
    axisFormat: 'h(:mm)tt',
    timeFormat: {
      agenda: 'h:mm{ - h:mm}'
    },
    dragOpacity: {
      agenda: .5
    },
    minTime: 0,
    maxTime: 24,
    slotEventOverlap: true
  });
  
  
  // TODO: make it work in quirks mode (event corners, all-day height)
  // TODO: test liquid width, especially in IE6
  
  
  function AgendaView(element, calendar, viewName) {
    var t = this;
    
    
    // exports
    t.renderAgenda = renderAgenda;
    t.setWidth = setWidth;
    t.setHeight = setHeight;
    t.afterRender = afterRender;
    t.defaultEventEnd = defaultEventEnd;
    t.timePosition = timePosition;
    t.getIsCellAllDay = getIsCellAllDay;
    t.allDayRow = getAllDayRow;
    t.getCoordinateGrid = function() { return coordinateGrid }; // specifically for AgendaEventRenderer
    t.getHoverListener = function() { return hoverListener };
    t.colLeft = colLeft;
    t.colRight = colRight;
    t.colContentLeft = colContentLeft;
    t.colContentRight = colContentRight;
    t.getDaySegmentContainer = function() { return daySegmentContainer };
    t.getSlotSegmentContainer = function() { return slotSegmentContainer };
    t.getMinMinute = function() { return minMinute };
    t.getMaxMinute = function() { return maxMinute };
    t.getSlotContainer = function() { return slotContainer };
    t.getRowCnt = function() { return 1 };
    t.getColCnt = function() { return colCnt };
    t.getColWidth = function() { return colWidth };
    t.getSnapHeight = function() { return snapHeight };
    t.getSnapMinutes = function() { return snapMinutes };
    t.defaultSelectionEnd = defaultSelectionEnd;
    t.renderDayOverlay = renderDayOverlay;
    t.renderSelection = renderSelection;
    t.clearSelection = clearSelection;
    t.reportDayClick = reportDayClick; // selection mousedown hack
    t.dragStart = dragStart;
    t.dragStop = dragStop;
    
    
    // imports
    View.call(t, element, calendar, viewName);
    OverlayManager.call(t);
    SelectionManager.call(t);
    AgendaEventRenderer.call(t);
    var opt = t.opt;
    var trigger = t.trigger;
    var renderOverlay = t.renderOverlay;
    var clearOverlays = t.clearOverlays;
    var reportSelection = t.reportSelection;
    var unselect = t.unselect;
    var daySelectionMousedown = t.daySelectionMousedown;
    var slotSegHtml = t.slotSegHtml;
    var cellToDate = t.cellToDate;
    var dateToCell = t.dateToCell;
    var rangeToSegments = t.rangeToSegments;
    var formatDate = calendar.formatDate;
    
    
    // locals
    
    var dayTable;
    var dayHead;
    var dayHeadCells;
    var dayBody;
    var dayBodyCells;
    var dayBodyCellInners;
    var dayBodyCellContentInners;
    var dayBodyFirstCell;
    var dayBodyFirstCellStretcher;
    var slotLayer;
    var daySegmentContainer;
    var allDayTable;
    var allDayRow;
    var slotScroller;
    var slotContainer;
    var slotSegmentContainer;
    var slotTable;
    var selectionHelper;
    
    var viewWidth;
    var viewHeight;
    var axisWidth;
    var colWidth;
    var gutterWidth;
    var slotHeight; // TODO: what if slotHeight changes? (see issue 650)
  
    var snapMinutes;
    var snapRatio; // ratio of number of "selection" slots to normal slots. (ex: 1, 2, 4)
    var snapHeight; // holds the pixel hight of a "selection" slot
    
    var colCnt;
    var slotCnt;
    var coordinateGrid;
    var hoverListener;
    var colPositions;
    var colContentPositions;
    var slotTopCache = {};
    
    var tm;
    var rtl;
    var minMinute, maxMinute;
    var colFormat;
    var showWeekNumbers;
    var weekNumberTitle;
    var weekNumberFormat;
    
  
    
    /* Rendering
    -----------------------------------------------------------------------------*/
    
    
    disableTextSelection(element.addClass('fc-agenda'));
    
    
    function renderAgenda(c) {
      colCnt = c;
      updateOptions();
  
      if (!dayTable) { // first time rendering?
        buildSkeleton(); // builds day table, slot area, events containers
      }
      else {
        buildDayTable(); // rebuilds day table
      }
    }
    
    
    function updateOptions() {
  
      tm = opt('theme') ? 'ui' : 'fc';
      rtl = opt('isRTL')
      minMinute = parseTime(opt('minTime'));
      maxMinute = parseTime(opt('maxTime'));
      colFormat = opt('columnFormat');
  
      // week # options. (TODO: bad, logic also in other views)
      showWeekNumbers = opt('weekNumbers');
      weekNumberTitle = opt('weekNumberTitle');
      if (opt('weekNumberCalculation') != 'iso') {
        weekNumberFormat = "w";
      }
      else {
        weekNumberFormat = "W";
      }
  
      snapMinutes = opt('snapMinutes') || opt('slotMinutes');
    }
  
  
  
    /* Build DOM
    -----------------------------------------------------------------------*/
  
  
    function buildSkeleton() {
      var headerClass = tm + "-widget-header";
      var contentClass = tm + "-widget-content";
      var s;
      var d;
      var i;
      var maxd;
      var minutes;
      var slotNormal = opt('slotMinutes') % 15 == 0;
      
      buildDayTable();
      
      slotLayer =
        $("<div style='position:absolute;z-index:2;left:0;width:100%'/>")
          .appendTo(element);
          
      if (opt('allDaySlot')) {
      
        daySegmentContainer =
          $("<div class='fc-event-container' style='position:absolute;z-index:8;top:0;left:0'/>")
            .appendTo(slotLayer);
      
        s =
          "<table style='width:100%' class='fc-agenda-allday' cellspacing='0'>" +
          "<tr>" +
          "<th class='" + headerClass + " fc-agenda-axis'>" + opt('allDayText') + "</th>" +
          "<td>" +
          "<div class='fc-day-content'><div style='position:relative'/></div>" +
          "</td>" +
          "<th class='" + headerClass + " fc-agenda-gutter'> </th>" +
          "</tr>" +
          "</table>";
        allDayTable = $(s).appendTo(slotLayer);
        allDayRow = allDayTable.find('tr');
        
        dayBind(allDayRow.find('td'));
        
        slotLayer.append(
          "<div class='fc-agenda-divider " + headerClass + "'>" +
          "<div class='fc-agenda-divider-inner'/>" +
          "</div>"
        );
        
      }else{
      
        daySegmentContainer = $([]); // in jQuery 1.4, we can just do $()
      
      }
      
      slotScroller =
        $("<div style='position:absolute;width:100%;overflow-x:hidden;overflow-y:auto'/>")
          .appendTo(slotLayer);
          
      slotContainer =
        $("<div style='position:relative;width:100%;overflow:hidden'/>")
          .appendTo(slotScroller);
          
      slotSegmentContainer =
        $("<div class='fc-event-container' style='position:absolute;z-index:8;top:0;left:0'/>")
          .appendTo(slotContainer);
      
      s =
        "<table class='fc-agenda-slots' style='width:100%' cellspacing='0'>" +
        "<tbody>";
      d = zeroDate();
      maxd = addMinutes(cloneDate(d), maxMinute);
      addMinutes(d, minMinute);
      slotCnt = 0;
      for (i=0; d < maxd; i++) {
        minutes = d.getMinutes();
        s +=
          "<tr class='fc-slot" + i + ' ' + (!minutes ? '' : 'fc-minor') + "'>" +
          "<th class='fc-agenda-axis " + headerClass + "'>" +
          ((!slotNormal || !minutes) ? formatDate(d, opt('axisFormat')) : ' ') +
          "</th>" +
          "<td class='" + contentClass + "'>" +
          "<div style='position:relative'> </div>" +
          "</td>" +
          "</tr>";
        addMinutes(d, opt('slotMinutes'));
        slotCnt++;
      }
      s +=
        "</tbody>" +
        "</table>";
      slotTable = $(s).appendTo(slotContainer);
      
      slotBind(slotTable.find('td'));
    }
  
  
  
    /* Build Day Table
    -----------------------------------------------------------------------*/
  
  
    function buildDayTable() {
      var html = buildDayTableHTML();
  
      if (dayTable) {
        dayTable.remove();
      }
      dayTable = $(html).appendTo(element);
  
      dayHead = dayTable.find('thead');
      dayHeadCells = dayHead.find('th').slice(1, -1); // exclude gutter
      dayBody = dayTable.find('tbody');
      dayBodyCells = dayBody.find('td').slice(0, -1); // exclude gutter
      dayBodyCellInners = dayBodyCells.find('> div');
      dayBodyCellContentInners = dayBodyCells.find('.fc-day-content > div');
  
      dayBodyFirstCell = dayBodyCells.eq(0);
      dayBodyFirstCellStretcher = dayBodyCellInners.eq(0);
      
      markFirstLast(dayHead.add(dayHead.find('tr')));
      markFirstLast(dayBody.add(dayBody.find('tr')));
  
      // TODO: now that we rebuild the cells every time, we should call dayRender
    }
  
  
    function buildDayTableHTML() {
      var html =
        "<table style='width:100%' class='fc-agenda-days fc-border-separate' cellspacing='0'>" +
        buildDayTableHeadHTML() +
        buildDayTableBodyHTML() +
        "</table>";
  
      return html;
    }
  
  
    function buildDayTableHeadHTML() {
      var headerClass = tm + "-widget-header";
      var date;
      var html = '';
      var weekText;
      var col;
  
      html +=
        "<thead>" +
        "<tr>";
  
      if (showWeekNumbers) {
        date = cellToDate(0, 0);
        weekText = formatDate(date, weekNumberFormat);
        if (rtl) {
          weekText += weekNumberTitle;
        }
        else {
          weekText = weekNumberTitle + weekText;
        }
        html +=
          "<th class='fc-agenda-axis fc-week-number " + headerClass + "'>" +
          htmlEscape(weekText) +
          "</th>";
      }
      else {
        html += "<th class='fc-agenda-axis " + headerClass + "'> </th>";
      }
  
      for (col=0; col<colCnt; col++) {
        date = cellToDate(0, col);
        html +=
          "<th class='fc-" + dayIDs[date.getDay()] + " fc-col" + col + ' ' + headerClass + "'>" +
          htmlEscape(formatDate(date, colFormat)) +
          "</th>";
      }
  
      html +=
        "<th class='fc-agenda-gutter " + headerClass + "'> </th>" +
        "</tr>" +
        "</thead>";
  
      return html;
    }
  
  
    function buildDayTableBodyHTML() {
      var headerClass = tm + "-widget-header"; // TODO: make these when updateOptions() called
      var contentClass = tm + "-widget-content";
      var date;
      var today = clearTime(new Date());
      var col;
      var cellsHTML;
      var cellHTML;
      var classNames;
      var html = '';
  
      html +=
        "<tbody>" +
        "<tr>" +
        "<th class='fc-agenda-axis " + headerClass + "'> </th>";
  
      cellsHTML = '';
  
      for (col=0; col<colCnt; col++) {
  
        date = cellToDate(0, col);
  
        classNames = [
          'fc-col' + col,
          'fc-' + dayIDs[date.getDay()],
          contentClass
        ];
        if (+date == +today) {
          classNames.push(
            tm + '-state-highlight',
            'fc-today'
          );
        }
        else if (date < today) {
          classNames.push('fc-past');
        }
        else {
          classNames.push('fc-future');
        }
  
        cellHTML =
          "<td class='" + classNames.join(' ') + "'>" +
          "<div>" +
          "<div class='fc-day-content'>" +
          "<div style='position:relative'> </div>" +
          "</div>" +
          "</div>" +
          "</td>";
  
        cellsHTML += cellHTML;
      }
  
      html += cellsHTML;
      html +=
        "<td class='fc-agenda-gutter " + contentClass + "'> </td>" +
        "</tr>" +
        "</tbody>";
  
      return html;
    }
  
  
    // TODO: data-date on the cells
  
    
    
    /* Dimensions
    -----------------------------------------------------------------------*/
  
    
    function setHeight(height) {
      if (height === undefined) {
        height = viewHeight;
      }
      viewHeight = height;
      slotTopCache = {};
    
      var headHeight = dayBody.position().top;
      var allDayHeight = slotScroller.position().top; // including divider
      var bodyHeight = Math.min( // total body height, including borders
        height - headHeight,   // when scrollbars
        slotTable.height() + allDayHeight + 1 // when no scrollbars. +1 for bottom border
      );
  
      dayBodyFirstCellStretcher
        .height(bodyHeight - vsides(dayBodyFirstCell));
      
      slotLayer.css('top', headHeight);
      
      slotScroller.height(bodyHeight - allDayHeight - 1);
      
      // the stylesheet guarantees that the first row has no border.
      // this allows .height() to work well cross-browser.
      slotHeight = slotTable.find('tr:first').height() + 1; // +1 for bottom border
  
      snapRatio = opt('slotMinutes') / snapMinutes;
      snapHeight = slotHeight / snapRatio;
    }
    
    
    function setWidth(width) {
      viewWidth = width;
      colPositions.clear();
      colContentPositions.clear();
  
      var axisFirstCells = dayHead.find('th:first');
      if (allDayTable) {
        axisFirstCells = axisFirstCells.add(allDayTable.find('th:first'));
      }
      axisFirstCells = axisFirstCells.add(slotTable.find('th:first'));
      
      axisWidth = 0;
      setOuterWidth(
        axisFirstCells
          .width('')
          .each(function(i, _cell) {
            axisWidth = Math.max(axisWidth, $(_cell).outerWidth());
          }),
        axisWidth
      );
      
      var gutterCells = dayTable.find('.fc-agenda-gutter');
      if (allDayTable) {
        gutterCells = gutterCells.add(allDayTable.find('th.fc-agenda-gutter'));
      }
  
      var slotTableWidth = slotScroller[0].clientWidth; // needs to be done after axisWidth (for IE7)
      
      gutterWidth = slotScroller.width() - slotTableWidth;
      if (gutterWidth) {
        setOuterWidth(gutterCells, gutterWidth);
        gutterCells
          .show()
          .prev()
          .removeClass('fc-last');
      }else{
        gutterCells
          .hide()
          .prev()
          .addClass('fc-last');
      }
      
      colWidth = Math.floor((slotTableWidth - axisWidth) / colCnt);
      setOuterWidth(dayHeadCells.slice(0, -1), colWidth);
    }
    
  
  
    /* Scrolling
    -----------------------------------------------------------------------*/
  
  
    function resetScroll() {
      var d0 = zeroDate();
      var scrollDate = cloneDate(d0);
      scrollDate.setHours(opt('firstHour'));
      var top = timePosition(d0, scrollDate) + 1; // +1 for the border
      function scroll() {
        slotScroller.scrollTop(top);
      }
      scroll();
      setTimeout(scroll, 0); // overrides any previous scroll state made by the browser
    }
  
  
    function afterRender() { // after the view has been freshly rendered and sized
      resetScroll();
    }
    
    
    
    /* Slot/Day clicking and binding
    -----------------------------------------------------------------------*/
    
  
    function dayBind(cells) {
      cells.click(slotClick)
        .mousedown(daySelectionMousedown);
    }
  
  
    function slotBind(cells) {
      cells.click(slotClick)
        .mousedown(slotSelectionMousedown);
    }
    
    
    function slotClick(ev) {
      if (!opt('selectable')) { // if selectable, SelectionManager will worry about dayClick
        var col = Math.min(colCnt-1, Math.floor((ev.pageX - dayTable.offset().left - axisWidth) / colWidth));
        var date = cellToDate(0, col);
        var rowMatch = this.parentNode.className.match(/fc-slot(\d+)/); // TODO: maybe use data
        if (rowMatch) {
          var mins = parseInt(rowMatch[1]) * opt('slotMinutes');
          var hours = Math.floor(mins/60);
          date.setHours(hours);
          date.setMinutes(mins%60 + minMinute);
          trigger('dayClick', dayBodyCells[col], date, false, ev);
        }else{
          trigger('dayClick', dayBodyCells[col], date, true, ev);
        }
      }
    }
    
    
    
    /* Semi-transparent Overlay Helpers
    -----------------------------------------------------*/
    // TODO: should be consolidated with BasicView's methods
  
  
    function renderDayOverlay(overlayStart, overlayEnd, refreshCoordinateGrid) { // overlayEnd is exclusive
  
      if (refreshCoordinateGrid) {
        coordinateGrid.build();
      }
  
      var segments = rangeToSegments(overlayStart, overlayEnd);
  
      for (var i=0; i<segments.length; i++) {
        var segment = segments[i];
        dayBind(
          renderCellOverlay(
            segment.row,
            segment.leftCol,
            segment.row,
            segment.rightCol
          )
        );
      }
    }
    
    
    function renderCellOverlay(row0, col0, row1, col1) { // only for all-day?
      var rect = coordinateGrid.rect(row0, col0, row1, col1, slotLayer);
      return renderOverlay(rect, slotLayer);
    }
    
  
    function renderSlotOverlay(overlayStart, overlayEnd) {
      for (var i=0; i<colCnt; i++) {
        var dayStart = cellToDate(0, i);
        var dayEnd = addDays(cloneDate(dayStart), 1);
        var stretchStart = new Date(Math.max(dayStart, overlayStart));
        var stretchEnd = new Date(Math.min(dayEnd, overlayEnd));
        if (stretchStart < stretchEnd) {
          var rect = coordinateGrid.rect(0, i, 0, i, slotContainer); // only use it for horizontal coords
          var top = timePosition(dayStart, stretchStart);
          var bottom = timePosition(dayStart, stretchEnd);
          rect.top = top;
          rect.height = bottom - top;
          slotBind(
            renderOverlay(rect, slotContainer)
          );
        }
      }
    }
    
    
    
    /* Coordinate Utilities
    -----------------------------------------------------------------------------*/
    
    
    coordinateGrid = new CoordinateGrid(function(rows, cols) {
      var e, n, p;
      dayHeadCells.each(function(i, _e) {
        e = $(_e);
        n = e.offset().left;
        if (i) {
          p[1] = n;
        }
        p = [n];
        cols[i] = p;
      });
      p[1] = n + e.outerWidth();
      if (opt('allDaySlot')) {
        e = allDayRow;
        n = e.offset().top;
        rows[0] = [n, n+e.outerHeight()];
      }
      var slotTableTop = slotContainer.offset().top;
      var slotScrollerTop = slotScroller.offset().top;
      var slotScrollerBottom = slotScrollerTop + slotScroller.outerHeight();
      function constrain(n) {
        return Math.max(slotScrollerTop, Math.min(slotScrollerBottom, n));
      }
      for (var i=0; i<slotCnt*snapRatio; i++) { // adapt slot count to increased/decreased selection slot count
        rows.push([
          constrain(slotTableTop + snapHeight*i),
          constrain(slotTableTop + snapHeight*(i+1))
        ]);
      }
    });
    
    
    hoverListener = new HoverListener(coordinateGrid);
    
    colPositions = new HorizontalPositionCache(function(col) {
      return dayBodyCellInners.eq(col);
    });
    
    colContentPositions = new HorizontalPositionCache(function(col) {
      return dayBodyCellContentInners.eq(col);
    });
    
    
    function colLeft(col) {
      return colPositions.left(col);
    }
  
  
    function colContentLeft(col) {
      return colContentPositions.left(col);
    }
  
  
    function colRight(col) {
      return colPositions.right(col);
    }
    
    
    function colContentRight(col) {
      return colContentPositions.right(col);
    }
  
  
    function getIsCellAllDay(cell) {
      return opt('allDaySlot') && !cell.row;
    }
  
  
    function realCellToDate(cell) { // ugh "real" ... but blame it on our abuse of the "cell" system
      var d = cellToDate(0, cell.col);
      var slotIndex = cell.row;
      if (opt('allDaySlot')) {
        slotIndex--;
      }
      if (slotIndex >= 0) {
        addMinutes(d, minMinute + slotIndex * snapMinutes);
      }
      return d;
    }
    
    
    // get the Y coordinate of the given time on the given day (both Date objects)
    function timePosition(day, time) { // both date objects. day holds 00:00 of current day
      day = cloneDate(day, true);
      if (time < addMinutes(cloneDate(day), minMinute)) {
        return 0;
      }
      if (time >= addMinutes(cloneDate(day), maxMinute)) {
        return slotTable.height();
      }
      var slotMinutes = opt('slotMinutes'),
        minutes = time.getHours()*60 + time.getMinutes() - minMinute,
        slotI = Math.floor(minutes / slotMinutes),
        slotTop = slotTopCache[slotI];
      if (slotTop === undefined) {
        slotTop = slotTopCache[slotI] =
          slotTable.find('tr').eq(slotI).find('td div')[0].offsetTop;
          // .eq() is faster than ":eq()" selector
          // [0].offsetTop is faster than .position().top (do we really need this optimization?)
          // a better optimization would be to cache all these divs
      }
      return Math.max(0, Math.round(
        slotTop - 1 + slotHeight * ((minutes % slotMinutes) / slotMinutes)
      ));
    }
    
    
    function getAllDayRow(index) {
      return allDayRow;
    }
    
    
    function defaultEventEnd(event) {
      var start = cloneDate(event.start);
      if (event.allDay) {
        return start;
      }
      return addMinutes(start, opt('defaultEventMinutes'));
    }
    
    
    
    /* Selection
    ---------------------------------------------------------------------------------*/
    
    
    function defaultSelectionEnd(startDate, allDay) {
      if (allDay) {
        return cloneDate(startDate);
      }
      return addMinutes(cloneDate(startDate), opt('slotMinutes'));
    }
    
    
    function renderSelection(startDate, endDate, allDay) { // only for all-day
      if (allDay) {
        if (opt('allDaySlot')) {
          renderDayOverlay(startDate, addDays(cloneDate(endDate), 1), true);
        }
      }else{
        renderSlotSelection(startDate, endDate);
      }
    }
    
    
    function renderSlotSelection(startDate, endDate) {
      var helperOption = opt('selectHelper');
      coordinateGrid.build();
      if (helperOption) {
        var col = dateToCell(startDate).col;
        if (col >= 0 && col < colCnt) { // only works when times are on same day
          var rect = coordinateGrid.rect(0, col, 0, col, slotContainer); // only for horizontal coords
          var top = timePosition(startDate, startDate);
          var bottom = timePosition(startDate, endDate);
          if (bottom > top) { // protect against selections that are entirely before or after visible range
            rect.top = top;
            rect.height = bottom - top;
            rect.left += 2;
            rect.width -= 5;
            if ($.isFunction(helperOption)) {
              var helperRes = helperOption(startDate, endDate);
              if (helperRes) {
                rect.position = 'absolute';
                selectionHelper = $(helperRes)
                  .css(rect)
                  .appendTo(slotContainer);
              }
            }else{
              rect.isStart = true; // conside rect a "seg" now
              rect.isEnd = true;   //
              selectionHelper = $(slotSegHtml(
                {
                  title: '',
                  start: startDate,
                  end: endDate,
                  className: ['fc-select-helper'],
                  editable: false
                },
                rect
              ));
              selectionHelper.css('opacity', opt('dragOpacity'));
            }
            if (selectionHelper) {
              slotBind(selectionHelper);
              slotContainer.append(selectionHelper);
              setOuterWidth(selectionHelper, rect.width, true); // needs to be after appended
              setOuterHeight(selectionHelper, rect.height, true);
            }
          }
        }
      }else{
        renderSlotOverlay(startDate, endDate);
      }
    }
    
    
    function clearSelection() {
      clearOverlays();
      if (selectionHelper) {
        selectionHelper.remove();
        selectionHelper = null;
      }
    }
    
    
    function slotSelectionMousedown(ev) {
      if (ev.which == 1 && opt('selectable')) { // ev.which==1 means left mouse button
        unselect(ev);
        var dates;
        hoverListener.start(function(cell, origCell) {
          clearSelection();
          if (cell && cell.col == origCell.col && !getIsCellAllDay(cell)) {
            var d1 = realCellToDate(origCell);
            var d2 = realCellToDate(cell);
            dates = [
              d1,
              addMinutes(cloneDate(d1), snapMinutes), // calculate minutes depending on selection slot minutes 
              d2,
              addMinutes(cloneDate(d2), snapMinutes)
            ].sort(dateCompare);
            renderSlotSelection(dates[0], dates[3]);
          }else{
            dates = null;
          }
        }, ev);
        $(document).one('mouseup', function(ev) {
          hoverListener.stop();
          if (dates) {
            if (+dates[0] == +dates[1]) {
              reportDayClick(dates[0], false, ev);
            }
            reportSelection(dates[0], dates[3], false, ev);
          }
        });
      }
    }
  
  
    function reportDayClick(date, allDay, ev) {
      trigger('dayClick', dayBodyCells[dateToCell(date).col], date, allDay, ev);
    }
    
    
    
    /* External Dragging
    --------------------------------------------------------------------------------*/
    
    
    function dragStart(_dragElement, ev, ui) {
      hoverListener.start(function(cell) {
        clearOverlays();
        if (cell) {
          if (getIsCellAllDay(cell)) {
            renderCellOverlay(cell.row, cell.col, cell.row, cell.col);
          }else{
            var d1 = realCellToDate(cell);
            var d2 = addMinutes(cloneDate(d1), opt('defaultEventMinutes'));
            renderSlotOverlay(d1, d2);
          }
        }
      }, ev);
    }
    
    
    function dragStop(_dragElement, ev, ui) {
      var cell = hoverListener.stop();
      clearOverlays();
      if (cell) {
        trigger('drop', _dragElement, realCellToDate(cell), getIsCellAllDay(cell), ev, ui);
      }
    }
    
  
  }
  
  ;;
  
  function AgendaEventRenderer() {
    var t = this;
    
    
    // exports
    t.renderEvents = renderEvents;
    t.clearEvents = clearEvents;
    t.slotSegHtml = slotSegHtml;
    
    
    // imports
    DayEventRenderer.call(t);
    var opt = t.opt;
    var trigger = t.trigger;
    var isEventDraggable = t.isEventDraggable;
    var isEventResizable = t.isEventResizable;
    var eventEnd = t.eventEnd;
    var eventElementHandlers = t.eventElementHandlers;
    var setHeight = t.setHeight;
    var getDaySegmentContainer = t.getDaySegmentContainer;
    var getSlotSegmentContainer = t.getSlotSegmentContainer;
    var getHoverListener = t.getHoverListener;
    var getMaxMinute = t.getMaxMinute;
    var getMinMinute = t.getMinMinute;
    var timePosition = t.timePosition;
    var getIsCellAllDay = t.getIsCellAllDay;
    var colContentLeft = t.colContentLeft;
    var colContentRight = t.colContentRight;
    var cellToDate = t.cellToDate;
    var getColCnt = t.getColCnt;
    var getColWidth = t.getColWidth;
    var getSnapHeight = t.getSnapHeight;
    var getSnapMinutes = t.getSnapMinutes;
    var getSlotContainer = t.getSlotContainer;
    var reportEventElement = t.reportEventElement;
    var showEvents = t.showEvents;
    var hideEvents = t.hideEvents;
    var eventDrop = t.eventDrop;
    var eventResize = t.eventResize;
    var renderDayOverlay = t.renderDayOverlay;
    var clearOverlays = t.clearOverlays;
    var renderDayEvents = t.renderDayEvents;
    var calendar = t.calendar;
    var formatDate = calendar.formatDate;
    var formatDates = calendar.formatDates;
  
  
    // overrides
    t.draggableDayEvent = draggableDayEvent;
  
    
    
    /* Rendering
    ----------------------------------------------------------------------------*/
    
  
    function renderEvents(events, modifiedEventId) {
      var i, len=events.length,
        dayEvents=[],
        slotEvents=[];
      for (i=0; i<len; i++) {
        if (events[i].allDay) {
          dayEvents.push(events[i]);
        }else{
          slotEvents.push(events[i]);
        }
      }
  
      if (opt('allDaySlot')) {
        renderDayEvents(dayEvents, modifiedEventId);
        setHeight(); // no params means set to viewHeight
      }
  
      renderSlotSegs(compileSlotSegs(slotEvents), modifiedEventId);
    }
    
    
    function clearEvents() {
      getDaySegmentContainer().empty();
      getSlotSegmentContainer().empty();
    }
  
    
    function compileSlotSegs(events) {
      var colCnt = getColCnt(),
        minMinute = getMinMinute(),
        maxMinute = getMaxMinute(),
        d,
        visEventEnds = $.map(events, slotEventEnd),
        i,
        j, seg,
        colSegs,
        segs = [];
  
      for (i=0; i<colCnt; i++) {
  
        d = cellToDate(0, i);
        addMinutes(d, minMinute);
  
        colSegs = sliceSegs(
          events,
          visEventEnds,
          d,
          addMinutes(cloneDate(d), maxMinute-minMinute)
        );
  
        colSegs = placeSlotSegs(colSegs); // returns a new order
  
        for (j=0; j<colSegs.length; j++) {
          seg = colSegs[j];
          seg.col = i;
          segs.push(seg);
        }
      }
  
      return segs;
    }
  
  
    function sliceSegs(events, visEventEnds, start, end) {
      var segs = [],
        i, len=events.length, event,
        eventStart, eventEnd,
        segStart, segEnd,
        isStart, isEnd;
      for (i=0; i<len; i++) {
        event = events[i];
        eventStart = event.start;
        eventEnd = visEventEnds[i];
        if (eventEnd > start && eventStart < end) {
          if (eventStart < start) {
            segStart = cloneDate(start);
            isStart = false;
          }else{
            segStart = eventStart;
            isStart = true;
          }
          if (eventEnd > end) {
            segEnd = cloneDate(end);
            isEnd = false;
          }else{
            segEnd = eventEnd;
            isEnd = true;
          }
          segs.push({
            event: event,
            start: segStart,
            end: segEnd,
            isStart: isStart,
            isEnd: isEnd
          });
        }
      }
      return segs.sort(compareSlotSegs);
    }
  
  
    function slotEventEnd(event) {
      if (event.end) {
        return cloneDate(event.end);
      }else{
        return addMinutes(cloneDate(event.start), opt('defaultEventMinutes'));
      }
    }
    
    
    // renders events in the 'time slots' at the bottom
    // TODO: when we refactor this, when user returns `false` eventRender, don't have empty space
    // TODO: refactor will include using pixels to detect collisions instead of dates (handy for seg cmp)
    
    function renderSlotSegs(segs, modifiedEventId) {
    
      var i, segCnt=segs.length, seg,
        event,
        top,
        bottom,
        columnLeft,
        columnRight,
        columnWidth,
        width,
        left,
        right,
        html = '',
        eventElements,
        eventElement,
        triggerRes,
        titleElement,
        height,
        slotSegmentContainer = getSlotSegmentContainer(),
        isRTL = opt('isRTL');
        
      // calculate position/dimensions, create html
      for (i=0; i<segCnt; i++) {
        seg = segs[i];
        event = seg.event;
        top = timePosition(seg.start, seg.start);
        bottom = timePosition(seg.start, seg.end);
        columnLeft = colContentLeft(seg.col);
        columnRight = colContentRight(seg.col);
        columnWidth = columnRight - columnLeft;
  
        // shave off space on right near scrollbars (2.5%)
        // TODO: move this to CSS somehow
        columnRight -= columnWidth * .025;
        columnWidth = columnRight - columnLeft;
  
        width = columnWidth * (seg.forwardCoord - seg.backwardCoord);
  
        if (opt('slotEventOverlap')) {
          // double the width while making sure resize handle is visible
          // (assumed to be 20px wide)
          width = Math.max(
            (width - (20/2)) * 2,
            width // narrow columns will want to make the segment smaller than
              // the natural width. don't allow it
          );
        }
  
        if (isRTL) {
          right = columnRight - seg.backwardCoord * columnWidth;
          left = right - width;
        }
        else {
          left = columnLeft + seg.backwardCoord * columnWidth;
          right = left + width;
        }
  
        // make sure horizontal coordinates are in bounds
        left = Math.max(left, columnLeft);
        right = Math.min(right, columnRight);
        width = right - left;
  
        seg.top = top;
        seg.left = left;
        seg.outerWidth = width;
        seg.outerHeight = bottom - top;
        html += slotSegHtml(event, seg);
      }
  
      slotSegmentContainer[0].innerHTML = html; // faster than html()
      eventElements = slotSegmentContainer.children();
      
      // retrieve elements, run through eventRender callback, bind event handlers
      for (i=0; i<segCnt; i++) {
        seg = segs[i];
        event = seg.event;
        eventElement = $(eventElements[i]); // faster than eq()
        triggerRes = trigger('eventRender', event, event, eventElement);
        if (triggerRes === false) {
          eventElement.remove();
        }else{
          if (triggerRes && triggerRes !== true) {
            eventElement.remove();
            eventElement = $(triggerRes)
              .css({
                position: 'absolute',
                top: seg.top,
                left: seg.left
              })
              .appendTo(slotSegmentContainer);
          }
          seg.element = eventElement;
          if (event._id === modifiedEventId) {
            bindSlotSeg(event, eventElement, seg);
          }else{
            eventElement[0]._fci = i; // for lazySegBind
          }
          reportEventElement(event, eventElement);
        }
      }
      
      lazySegBind(slotSegmentContainer, segs, bindSlotSeg);
      
      // record event sides and title positions
      for (i=0; i<segCnt; i++) {
        seg = segs[i];
        if (eventElement = seg.element) {
          seg.vsides = vsides(eventElement, true);
          seg.hsides = hsides(eventElement, true);
          titleElement = eventElement.find('.fc-event-title');
          if (titleElement.length) {
            seg.contentTop = titleElement[0].offsetTop;
          }
        }
      }
      
      // set all positions/dimensions at once
      for (i=0; i<segCnt; i++) {
        seg = segs[i];
        if (eventElement = seg.element) {
          eventElement[0].style.width = Math.max(0, seg.outerWidth - seg.hsides) + 'px';
          height = Math.max(0, seg.outerHeight - seg.vsides);
          eventElement[0].style.height = height + 'px';
          event = seg.event;
          if (seg.contentTop !== undefined && height - seg.contentTop < 10) {
            // not enough room for title, put it in the time (TODO: maybe make both display:inline instead)
            eventElement.find('div.fc-event-time')
              .text(formatDate(event.start, opt('timeFormat')) + ' - ' + event.title);
            eventElement.find('div.fc-event-title')
              .remove();
          }
          trigger('eventAfterRender', event, event, eventElement);
        }
      }
            
    }
    
    
    function slotSegHtml(event, seg) {
      var html = "<";
      var url = event.url;
      var skinCss = getSkinCss(event, opt);
      var classes = ['fc-event', 'fc-event-vert'];
      if (isEventDraggable(event)) {
        classes.push('fc-event-draggable');
      }
      if (seg.isStart) {
        classes.push('fc-event-start');
      }
      if (seg.isEnd) {
        classes.push('fc-event-end');
      }
      classes = classes.concat(event.className);
      if (event.source) {
        classes = classes.concat(event.source.className || []);
      }
      if (url) {
        html += "a href='" + htmlEscape(event.url) + "'";
      }else{
        html += "div";
      }
      html +=
        " class='" + classes.join(' ') + "'" +
        " style=" +
          "'" +
          "position:absolute;" +
          "top:" + seg.top + "px;" +
          "left:" + seg.left + "px;" +
          skinCss +
          "'" +
        ">" +
        "<div class='fc-event-inner'>" +
        "<div class='fc-event-time'>" +
        htmlEscape(formatDates(event.start, event.end, opt('timeFormat'))) +
        "</div>" +
        "<div class='fc-event-title'>" +
        htmlEscape(event.title || '') +
        "</div>" +
        "</div>" +
        "<div class='fc-event-bg'></div>";
      if (seg.isEnd && isEventResizable(event)) {
        html +=
          "<div class='ui-resizable-handle ui-resizable-s'>=</div>";
      }
      html +=
        "</" + (url ? "a" : "div") + ">";
      return html;
    }
    
    
    function bindSlotSeg(event, eventElement, seg) {
      var timeElement = eventElement.find('div.fc-event-time');
      if (isEventDraggable(event)) {
        draggableSlotEvent(event, eventElement, timeElement);
      }
      if (seg.isEnd && isEventResizable(event)) {
        resizableSlotEvent(event, eventElement, timeElement);
      }
      eventElementHandlers(event, eventElement);
    }
    
    
    
    /* Dragging
    -----------------------------------------------------------------------------------*/
    
    
    // when event starts out FULL-DAY
    // overrides DayEventRenderer's version because it needs to account for dragging elements
    // to and from the slot area.
    
    function draggableDayEvent(event, eventElement, seg) {
      var isStart = seg.isStart;
      var origWidth;
      var revert;
      var allDay = true;
      var dayDelta;
      var hoverListener = getHoverListener();
      var colWidth = getColWidth();
      var snapHeight = getSnapHeight();
      var snapMinutes = getSnapMinutes();
      var minMinute = getMinMinute();
      eventElement.draggable({
        opacity: opt('dragOpacity', 'month'), // use whatever the month view was using
        revertDuration: opt('dragRevertDuration'),
        start: function(ev, ui) {
          trigger('eventDragStart', eventElement, event, ev, ui);
          hideEvents(event, eventElement);
          origWidth = eventElement.width();
          hoverListener.start(function(cell, origCell) {
            clearOverlays();
            if (cell) {
              revert = false;
              var origDate = cellToDate(0, origCell.col);
              var date = cellToDate(0, cell.col);
              dayDelta = dayDiff(date, origDate);
              if (!cell.row) {
                // on full-days
                renderDayOverlay(
                  addDays(cloneDate(event.start), dayDelta),
                  addDays(exclEndDay(event), dayDelta)
                );
                resetElement();
              }else{
                // mouse is over bottom slots
                if (isStart) {
                  if (allDay) {
                    // convert event to temporary slot-event
                    eventElement.width(colWidth - 10); // don't use entire width
                    setOuterHeight(
                      eventElement,
                      snapHeight * Math.round(
                        (event.end ? ((event.end - event.start) / MINUTE_MS) : opt('defaultEventMinutes')) /
                          snapMinutes
                      )
                    );
                    eventElement.draggable('option', 'grid', [colWidth, 1]);
                    allDay = false;
                  }
                }else{
                  revert = true;
                }
              }
              revert = revert || (allDay && !dayDelta);
            }else{
              resetElement();
              revert = true;
            }
            eventElement.draggable('option', 'revert', revert);
          }, ev, 'drag');
        },
        stop: function(ev, ui) {
          hoverListener.stop();
          clearOverlays();
          trigger('eventDragStop', eventElement, event, ev, ui);
          if (revert) {
            // hasn't moved or is out of bounds (draggable has already reverted)
            resetElement();
            eventElement.css('filter', ''); // clear IE opacity side-effects
            showEvents(event, eventElement);
          }else{
            // changed!
            var minuteDelta = 0;
            if (!allDay) {
              minuteDelta = Math.round((eventElement.offset().top - getSlotContainer().offset().top) / snapHeight)
                * snapMinutes
                + minMinute
                - (event.start.getHours() * 60 + event.start.getMinutes());
            }
            eventDrop(this, event, dayDelta, minuteDelta, allDay, ev, ui);
          }
        }
      });
      function resetElement() {
        if (!allDay) {
          eventElement
            .width(origWidth)
            .height('')
            .draggable('option', 'grid', null);
          allDay = true;
        }
      }
    }
    
    
    // when event starts out IN TIMESLOTS
    
    function draggableSlotEvent(event, eventElement, timeElement) {
      var coordinateGrid = t.getCoordinateGrid();
      var colCnt = getColCnt();
      var colWidth = getColWidth();
      var snapHeight = getSnapHeight();
      var snapMinutes = getSnapMinutes();
  
      // states
      var origPosition; // original position of the element, not the mouse
      var origCell;
      var isInBounds, prevIsInBounds;
      var isAllDay, prevIsAllDay;
      var colDelta, prevColDelta;
      var dayDelta; // derived from colDelta
      var minuteDelta, prevMinuteDelta;
  
      eventElement.draggable({
        scroll: false,
        grid: [ colWidth, snapHeight ],
        axis: colCnt==1 ? 'y' : false,
        opacity: opt('dragOpacity'),
        revertDuration: opt('dragRevertDuration'),
        start: function(ev, ui) {
  
          trigger('eventDragStart', eventElement, event, ev, ui);
          hideEvents(event, eventElement);
  
          coordinateGrid.build();
  
          // initialize states
          origPosition = eventElement.position();
          origCell = coordinateGrid.cell(ev.pageX, ev.pageY);
          isInBounds = prevIsInBounds = true;
          isAllDay = prevIsAllDay = getIsCellAllDay(origCell);
          colDelta = prevColDelta = 0;
          dayDelta = 0;
          minuteDelta = prevMinuteDelta = 0;
  
        },
        drag: function(ev, ui) {
  
          // NOTE: this `cell` value is only useful for determining in-bounds and all-day.
          // Bad for anything else due to the discrepancy between the mouse position and the
          // element position while snapping. (problem revealed in PR #55)
          //
          // PS- the problem exists for draggableDayEvent() when dragging an all-day event to a slot event.
          // We should overhaul the dragging system and stop relying on jQuery UI.
          var cell = coordinateGrid.cell(ev.pageX, ev.pageY);
  
          // update states
          isInBounds = !!cell;
          if (isInBounds) {
            isAllDay = getIsCellAllDay(cell);
  
            // calculate column delta
            colDelta = Math.round((ui.position.left - origPosition.left) / colWidth);
            if (colDelta != prevColDelta) {
              // calculate the day delta based off of the original clicked column and the column delta
              var origDate = cellToDate(0, origCell.col);
              var col = origCell.col + colDelta;
              col = Math.max(0, col);
              col = Math.min(colCnt-1, col);
              var date = cellToDate(0, col);
              dayDelta = dayDiff(date, origDate);
            }
  
            // calculate minute delta (only if over slots)
            if (!isAllDay) {
              minuteDelta = Math.round((ui.position.top - origPosition.top) / snapHeight) * snapMinutes;
            }
          }
  
          // any state changes?
          if (
            isInBounds != prevIsInBounds ||
            isAllDay != prevIsAllDay ||
            colDelta != prevColDelta ||
            minuteDelta != prevMinuteDelta
          ) {
  
            updateUI();
  
            // update previous states for next time
            prevIsInBounds = isInBounds;
            prevIsAllDay = isAllDay;
            prevColDelta = colDelta;
            prevMinuteDelta = minuteDelta;
          }
  
          // if out-of-bounds, revert when done, and vice versa.
          eventElement.draggable('option', 'revert', !isInBounds);
  
        },
        stop: function(ev, ui) {
  
          clearOverlays();
          trigger('eventDragStop', eventElement, event, ev, ui);
  
          if (isInBounds && (isAllDay || dayDelta || minuteDelta)) { // changed!
            eventDrop(this, event, dayDelta, isAllDay ? 0 : minuteDelta, isAllDay, ev, ui);
          }
          else { // either no change or out-of-bounds (draggable has already reverted)
  
            // reset states for next time, and for updateUI()
            isInBounds = true;
            isAllDay = false;
            colDelta = 0;
            dayDelta = 0;
            minuteDelta = 0;
  
            updateUI();
            eventElement.css('filter', ''); // clear IE opacity side-effects
  
            // sometimes fast drags make event revert to wrong position, so reset.
            // also, if we dragged the element out of the area because of snapping,
            // but the *mouse* is still in bounds, we need to reset the position.
            eventElement.css(origPosition);
  
            showEvents(event, eventElement);
          }
        }
      });
  
      function updateUI() {
        clearOverlays();
        if (isInBounds) {
          if (isAllDay) {
            timeElement.hide();
            eventElement.draggable('option', 'grid', null); // disable grid snapping
            renderDayOverlay(
              addDays(cloneDate(event.start), dayDelta),
              addDays(exclEndDay(event), dayDelta)
            );
          }
          else {
            updateTimeText(minuteDelta);
            timeElement.css('display', ''); // show() was causing display=inline
            eventElement.draggable('option', 'grid', [colWidth, snapHeight]); // re-enable grid snapping
          }
        }
      }
  
      function updateTimeText(minuteDelta) {
        var newStart = addMinutes(cloneDate(event.start), minuteDelta);
        var newEnd;
        if (event.end) {
          newEnd = addMinutes(cloneDate(event.end), minuteDelta);
        }
        timeElement.text(formatDates(newStart, newEnd, opt('timeFormat')));
      }
  
    }
    
    
    
    /* Resizing
    --------------------------------------------------------------------------------------*/
    
    
    function resizableSlotEvent(event, eventElement, timeElement) {
      var snapDelta, prevSnapDelta;
      var snapHeight = getSnapHeight();
      var snapMinutes = getSnapMinutes();
      eventElement.resizable({
        handles: {
          s: '.ui-resizable-handle'
        },
        grid: snapHeight,
        start: function(ev, ui) {
          snapDelta = prevSnapDelta = 0;
          hideEvents(event, eventElement);
          trigger('eventResizeStart', this, event, ev, ui);
        },
        resize: function(ev, ui) {
          // don't rely on ui.size.height, doesn't take grid into account
          snapDelta = Math.round((Math.max(snapHeight, eventElement.height()) - ui.originalSize.height) / snapHeight);
          if (snapDelta != prevSnapDelta) {
            timeElement.text(
              formatDates(
                event.start,
                (!snapDelta && !event.end) ? null : // no change, so don't display time range
                  addMinutes(eventEnd(event), snapMinutes*snapDelta),
                opt('timeFormat')
              )
            );
            prevSnapDelta = snapDelta;
          }
        },
        stop: function(ev, ui) {
          trigger('eventResizeStop', this, event, ev, ui);
          if (snapDelta) {
            eventResize(this, event, 0, snapMinutes*snapDelta, ev, ui);
          }else{
            showEvents(event, eventElement);
            // BUG: if event was really short, need to put title back in span
          }
        }
      });
    }
    
  
  }
  
  
  
  /* Agenda Event Segment Utilities
  -----------------------------------------------------------------------------*/
  
  
  // Sets the seg.backwardCoord and seg.forwardCoord on each segment and returns a new
  // list in the order they should be placed into the DOM (an implicit z-index).
  function placeSlotSegs(segs) {
    var levels = buildSlotSegLevels(segs);
    var level0 = levels[0];
    var i;
  
    computeForwardSlotSegs(levels);
  
    if (level0) {
  
      for (i=0; i<level0.length; i++) {
        computeSlotSegPressures(level0[i]);
      }
  
      for (i=0; i<level0.length; i++) {
        computeSlotSegCoords(level0[i], 0, 0);
      }
    }
  
    return flattenSlotSegLevels(levels);
  }
  
  
  // Builds an array of segments "levels". The first level will be the leftmost tier of segments
  // if the calendar is left-to-right, or the rightmost if the calendar is right-to-left.
  function buildSlotSegLevels(segs) {
    var levels = [];
    var i, seg;
    var j;
  
    for (i=0; i<segs.length; i++) {
      seg = segs[i];
  
      // go through all the levels and stop on the first level where there are no collisions
      for (j=0; j<levels.length; j++) {
        if (!computeSlotSegCollisions(seg, levels[j]).length) {
          break;
        }
      }
  
      (levels[j] || (levels[j] = [])).push(seg);
    }
  
    return levels;
  }
  
  
  // For every segment, figure out the other segments that are in subsequent
  // levels that also occupy the same vertical space. Accumulate in seg.forwardSegs
  function computeForwardSlotSegs(levels) {
    var i, level;
    var j, seg;
    var k;
  
    for (i=0; i<levels.length; i++) {
      level = levels[i];
  
      for (j=0; j<level.length; j++) {
        seg = level[j];
  
        seg.forwardSegs = [];
        for (k=i+1; k<levels.length; k++) {
          computeSlotSegCollisions(seg, levels[k], seg.forwardSegs);
        }
      }
    }
  }
  
  
  // Figure out which path forward (via seg.forwardSegs) results in the longest path until
  // the furthest edge is reached. The number of segments in this path will be seg.forwardPressure
  function computeSlotSegPressures(seg) {
    var forwardSegs = seg.forwardSegs;
    var forwardPressure = 0;
    var i, forwardSeg;
  
    if (seg.forwardPressure === undefined) { // not already computed
  
      for (i=0; i<forwardSegs.length; i++) {
        forwardSeg = forwardSegs[i];
  
        // figure out the child's maximum forward path
        computeSlotSegPressures(forwardSeg);
  
        // either use the existing maximum, or use the child's forward pressure
        // plus one (for the forwardSeg itself)
        forwardPressure = Math.max(
          forwardPressure,
          1 + forwardSeg.forwardPressure
        );
      }
  
      seg.forwardPressure = forwardPressure;
    }
  }
  
  
  // Calculate seg.forwardCoord and seg.backwardCoord for the segment, where both values range
  // from 0 to 1. If the calendar is left-to-right, the seg.backwardCoord maps to "left" and
  // seg.forwardCoord maps to "right" (via percentage). Vice-versa if the calendar is right-to-left.
  //
  // The segment might be part of a "series", which means consecutive segments with the same pressure
  // who's width is unknown until an edge has been hit. `seriesBackwardPressure` is the number of
  // segments behind this one in the current series, and `seriesBackwardCoord` is the starting
  // coordinate of the first segment in the series.
  function computeSlotSegCoords(seg, seriesBackwardPressure, seriesBackwardCoord) {
    var forwardSegs = seg.forwardSegs;
    var i;
  
    if (seg.forwardCoord === undefined) { // not already computed
  
      if (!forwardSegs.length) {
  
        // if there are no forward segments, this segment should butt up against the edge
        seg.forwardCoord = 1;
      }
      else {
  
        // sort highest pressure first
        forwardSegs.sort(compareForwardSlotSegs);
  
        // this segment's forwardCoord will be calculated from the backwardCoord of the
        // highest-pressure forward segment.
        computeSlotSegCoords(forwardSegs[0], seriesBackwardPressure + 1, seriesBackwardCoord);
        seg.forwardCoord = forwardSegs[0].backwardCoord;
      }
  
      // calculate the backwardCoord from the forwardCoord. consider the series
      seg.backwardCoord = seg.forwardCoord -
        (seg.forwardCoord - seriesBackwardCoord) / // available width for series
        (seriesBackwardPressure + 1); // # of segments in the series
  
      // use this segment's coordinates to computed the coordinates of the less-pressurized
      // forward segments
      for (i=0; i<forwardSegs.length; i++) {
        computeSlotSegCoords(forwardSegs[i], 0, seg.forwardCoord);
      }
    }
  }
  
  
  // Outputs a flat array of segments, from lowest to highest level
  function flattenSlotSegLevels(levels) {
    var segs = [];
    var i, level;
    var j;
  
    for (i=0; i<levels.length; i++) {
      level = levels[i];
  
      for (j=0; j<level.length; j++) {
        segs.push(level[j]);
      }
    }
  
    return segs;
  }
  
  
  // Find all the segments in `otherSegs` that vertically collide with `seg`.
  // Append into an optionally-supplied `results` array and return.
  function computeSlotSegCollisions(seg, otherSegs, results) {
    results = results || [];
  
    for (var i=0; i<otherSegs.length; i++) {
      if (isSlotSegCollision(seg, otherSegs[i])) {
        results.push(otherSegs[i]);
      }
    }
  
    return results;
  }
  
  
  // Do these segments occupy the same vertical space?
  function isSlotSegCollision(seg1, seg2) {
    return seg1.end > seg2.start && seg1.start < seg2.end;
  }
  
  
  // A cmp function for determining which forward segment to rely on more when computing coordinates.
  function compareForwardSlotSegs(seg1, seg2) {
    // put higher-pressure first
    return seg2.forwardPressure - seg1.forwardPressure ||
      // put segments that are closer to initial edge first (and favor ones with no coords yet)
      (seg1.backwardCoord || 0) - (seg2.backwardCoord || 0) ||
      // do normal sorting...
      compareSlotSegs(seg1, seg2);
  }
  
  
  // A cmp function for determining which segment should be closer to the initial edge
  // (the left edge on a left-to-right calendar).
  function compareSlotSegs(seg1, seg2) {
    return seg1.start - seg2.start || // earlier start time goes first
      (seg2.end - seg2.start) - (seg1.end - seg1.start) || // tie? longer-duration goes first
      (seg1.event.title || '').localeCompare(seg2.event.title); // tie? alphabetically by title
  }
  
  
  ;;
  
  
  function View(element, calendar, viewName) {
    var t = this;
    
    
    // exports
    t.element = element;
    t.calendar = calendar;
    t.name = viewName;
    t.opt = opt;
    t.trigger = trigger;
    t.isEventDraggable = isEventDraggable;
    t.isEventResizable = isEventResizable;
    t.setEventData = setEventData;
    t.clearEventData = clearEventData;
    t.eventEnd = eventEnd;
    t.reportEventElement = reportEventElement;
    t.triggerEventDestroy = triggerEventDestroy;
    t.eventElementHandlers = eventElementHandlers;
    t.showEvents = showEvents;
    t.hideEvents = hideEvents;
    t.eventDrop = eventDrop;
    t.eventResize = eventResize;
    // t.title
    // t.start, t.end
    // t.visStart, t.visEnd
    
    
    // imports
    var defaultEventEnd = t.defaultEventEnd;
    var normalizeEvent = calendar.normalizeEvent; // in EventManager
    var reportEventChange = calendar.reportEventChange;
    
    
    // locals
    var eventsByID = {}; // eventID mapped to array of events (there can be multiple b/c of repeating events)
    var eventElementsByID = {}; // eventID mapped to array of jQuery elements
    var eventElementCouples = []; // array of objects, { event, element } // TODO: unify with segment system
    var options = calendar.options;
    
    
    
    function opt(name, viewNameOverride) {
      var v = options[name];
      if ($.isPlainObject(v)) {
        return smartProperty(v, viewNameOverride || viewName);
      }
      return v;
    }
  
    
    function trigger(name, thisObj) {
      return calendar.trigger.apply(
        calendar,
        [name, thisObj || t].concat(Array.prototype.slice.call(arguments, 2), [t])
      );
    }
    
  
  
    /* Event Editable Boolean Calculations
    ------------------------------------------------------------------------------*/
  
    
    function isEventDraggable(event) {
      var source = event.source || {};
      return firstDefined(
          event.startEditable,
          source.startEditable,
          opt('eventStartEditable'),
          event.editable,
          source.editable,
          opt('editable')
        )
        && !opt('disableDragging'); // deprecated
    }
    
    
    function isEventResizable(event) { // but also need to make sure the seg.isEnd == true
      var source = event.source || {};
      return firstDefined(
          event.durationEditable,
          source.durationEditable,
          opt('eventDurationEditable'),
          event.editable,
          source.editable,
          opt('editable')
        )
        && !opt('disableResizing'); // deprecated
    }
    
    
    
    /* Event Data
    ------------------------------------------------------------------------------*/
    
    
    function setEventData(events) { // events are already normalized at this point
      eventsByID = {};
      var i, len=events.length, event;
      for (i=0; i<len; i++) {
        event = events[i];
        if (eventsByID[event._id]) {
          eventsByID[event._id].push(event);
        }else{
          eventsByID[event._id] = [event];
        }
      }
    }
  
  
    function clearEventData() {
      eventsByID = {};
      eventElementsByID = {};
      eventElementCouples = [];
    }
    
    
    // returns a Date object for an event's end
    function eventEnd(event) {
      return event.end ? cloneDate(event.end) : defaultEventEnd(event);
    }
    
    
    
    /* Event Elements
    ------------------------------------------------------------------------------*/
    
    
    // report when view creates an element for an event
    function reportEventElement(event, element) {
      eventElementCouples.push({ event: event, element: element });
      if (eventElementsByID[event._id]) {
        eventElementsByID[event._id].push(element);
      }else{
        eventElementsByID[event._id] = [element];
      }
    }
  
  
    function triggerEventDestroy() {
      $.each(eventElementCouples, function(i, couple) {
        t.trigger('eventDestroy', couple.event, couple.event, couple.element);
      });
    }
    
    
    // attaches eventClick, eventMouseover, eventMouseout
    function eventElementHandlers(event, eventElement) {
      eventElement
        .click(function(ev) {
          if (!eventElement.hasClass('ui-draggable-dragging') &&
            !eventElement.hasClass('ui-resizable-resizing')) {
              return trigger('eventClick', this, event, ev);
            }
        })
        .hover(
          function(ev) {
            trigger('eventMouseover', this, event, ev);
          },
          function(ev) {
            trigger('eventMouseout', this, event, ev);
          }
        );
      // TODO: don't fire eventMouseover/eventMouseout *while* dragging is occuring (on subject element)
      // TODO: same for resizing
    }
    
    
    function showEvents(event, exceptElement) {
      eachEventElement(event, exceptElement, 'show');
    }
    
    
    function hideEvents(event, exceptElement) {
      eachEventElement(event, exceptElement, 'hide');
    }
    
    
    function eachEventElement(event, exceptElement, funcName) {
      // NOTE: there may be multiple events per ID (repeating events)
      // and multiple segments per event
      var elements = eventElementsByID[event._id],
        i, len = elements.length;
      for (i=0; i<len; i++) {
        if (!exceptElement || elements[i][0] != exceptElement[0]) {
          elements[i][funcName]();
        }
      }
    }
    
    
    
    /* Event Modification Reporting
    ---------------------------------------------------------------------------------*/
    
    
    function eventDrop(e, event, dayDelta, minuteDelta, allDay, ev, ui) {
      var oldAllDay = event.allDay;
      var eventId = event._id;
      moveEvents(eventsByID[eventId], dayDelta, minuteDelta, allDay);
      trigger(
        'eventDrop',
        e,
        event,
        dayDelta,
        minuteDelta,
        allDay,
        function() {
          // TODO: investigate cases where this inverse technique might not work
          moveEvents(eventsByID[eventId], -dayDelta, -minuteDelta, oldAllDay);
          reportEventChange(eventId);
        },
        ev,
        ui
      );
      reportEventChange(eventId);
    }
    
    
    function eventResize(e, event, dayDelta, minuteDelta, ev, ui) {
      var eventId = event._id;
      elongateEvents(eventsByID[eventId], dayDelta, minuteDelta);
      trigger(
        'eventResize',
        e,
        event,
        dayDelta,
        minuteDelta,
        function() {
          // TODO: investigate cases where this inverse technique might not work
          elongateEvents(eventsByID[eventId], -dayDelta, -minuteDelta);
          reportEventChange(eventId);
        },
        ev,
        ui
      );
      reportEventChange(eventId);
    }
    
    
    
    /* Event Modification Math
    ---------------------------------------------------------------------------------*/
    
    
    function moveEvents(events, dayDelta, minuteDelta, allDay) {
      minuteDelta = minuteDelta || 0;
      for (var e, len=events.length, i=0; i<len; i++) {
        e = events[i];
        if (allDay !== undefined) {
          e.allDay = allDay;
        }
        addMinutes(addDays(e.start, dayDelta, true), minuteDelta);
        if (e.end) {
          e.end = addMinutes(addDays(e.end, dayDelta, true), minuteDelta);
        }
        normalizeEvent(e, options);
      }
    }
    
    
    function elongateEvents(events, dayDelta, minuteDelta) {
      minuteDelta = minuteDelta || 0;
      for (var e, len=events.length, i=0; i<len; i++) {
        e = events[i];
        e.end = addMinutes(addDays(eventEnd(e), dayDelta, true), minuteDelta);
        normalizeEvent(e, options);
      }
    }
  
  
  
    // ====================================================================================================
    // Utilities for day "cells"
    // ====================================================================================================
    // The "basic" views are completely made up of day cells.
    // The "agenda" views have day cells at the top "all day" slot.
    // This was the obvious common place to put these utilities, but they should be abstracted out into
    // a more meaningful class (like DayEventRenderer).
    // ====================================================================================================
  
  
    // For determining how a given "cell" translates into a "date":
    //
    // 1. Convert the "cell" (row and column) into a "cell offset" (the # of the cell, cronologically from the first).
    //    Keep in mind that column indices are inverted with isRTL. This is taken into account.
    //
    // 2. Convert the "cell offset" to a "day offset" (the # of days since the first visible day in the view).
    //
    // 3. Convert the "day offset" into a "date" (a JavaScript Date object).
    //
    // The reverse transformation happens when transforming a date into a cell.
  
  
    // exports
    t.isHiddenDay = isHiddenDay;
    t.skipHiddenDays = skipHiddenDays;
    t.getCellsPerWeek = getCellsPerWeek;
    t.dateToCell = dateToCell;
    t.dateToDayOffset = dateToDayOffset;
    t.dayOffsetToCellOffset = dayOffsetToCellOffset;
    t.cellOffsetToCell = cellOffsetToCell;
    t.cellToDate = cellToDate;
    t.cellToCellOffset = cellToCellOffset;
    t.cellOffsetToDayOffset = cellOffsetToDayOffset;
    t.dayOffsetToDate = dayOffsetToDate;
    t.rangeToSegments = rangeToSegments;
  
  
    // internals
    var hiddenDays = opt('hiddenDays') || []; // array of day-of-week indices that are hidden
    var isHiddenDayHash = []; // is the day-of-week hidden? (hash with day-of-week-index -> bool)
    var cellsPerWeek;
    var dayToCellMap = []; // hash from dayIndex -> cellIndex, for one week
    var cellToDayMap = []; // hash from cellIndex -> dayIndex, for one week
    var isRTL = opt('isRTL');
  
  
    // initialize important internal variables
    (function() {
  
      if (opt('weekends') === false) {
        hiddenDays.push(0, 6); // 0=sunday, 6=saturday
      }
  
      // Loop through a hypothetical week and determine which
      // days-of-week are hidden. Record in both hashes (one is the reverse of the other).
      for (var dayIndex=0, cellIndex=0; dayIndex<7; dayIndex++) {
        dayToCellMap[dayIndex] = cellIndex;
        isHiddenDayHash[dayIndex] = $.inArray(dayIndex, hiddenDays) != -1;
        if (!isHiddenDayHash[dayIndex]) {
          cellToDayMap[cellIndex] = dayIndex;
          cellIndex++;
        }
      }
  
      cellsPerWeek = cellIndex;
      if (!cellsPerWeek) {
        throw 'invalid hiddenDays'; // all days were hidden? bad.
      }
  
    })();
  
  
    // Is the current day hidden?
    // `day` is a day-of-week index (0-6), or a Date object
    function isHiddenDay(day) {
      if (typeof day == 'object') {
        day = day.getDay();
      }
      return isHiddenDayHash[day];
    }
  
  
    function getCellsPerWeek() {
      return cellsPerWeek;
    }
  
  
    // Keep incrementing the current day until it is no longer a hidden day.
    // If the initial value of `date` is not a hidden day, don't do anything.
    // Pass `isExclusive` as `true` if you are dealing with an end date.
    // `inc` defaults to `1` (increment one day forward each time)
    function skipHiddenDays(date, inc, isExclusive) {
      inc = inc || 1;
      while (
        isHiddenDayHash[ ( date.getDay() + (isExclusive ? inc : 0) + 7 ) % 7 ]
      ) {
        addDays(date, inc);
      }
    }
  
  
    //
    // TRANSFORMATIONS: cell -> cell offset -> day offset -> date
    //
  
    // cell -> date (combines all transformations)
    // Possible arguments:
    // - row, col
    // - { row:#, col: # }
    function cellToDate() {
      var cellOffset = cellToCellOffset.apply(null, arguments);
      var dayOffset = cellOffsetToDayOffset(cellOffset);
      var date = dayOffsetToDate(dayOffset);
      return date;
    }
  
    // cell -> cell offset
    // Possible arguments:
    // - row, col
    // - { row:#, col:# }
    function cellToCellOffset(row, col) {
      var colCnt = t.getColCnt();
  
      // rtl variables. wish we could pre-populate these. but where?
      var dis = isRTL ? -1 : 1;
      var dit = isRTL ? colCnt - 1 : 0;
  
      if (typeof row == 'object') {
        col = row.col;
        row = row.row;
      }
      var cellOffset = row * colCnt + (col * dis + dit); // column, adjusted for RTL (dis & dit)
  
      return cellOffset;
    }
  
    // cell offset -> day offset
    function cellOffsetToDayOffset(cellOffset) {
      var day0 = t.visStart.getDay(); // first date's day of week
      cellOffset += dayToCellMap[day0]; // normlize cellOffset to beginning-of-week
      return Math.floor(cellOffset / cellsPerWeek) * 7 // # of days from full weeks
        + cellToDayMap[ // # of days from partial last week
          (cellOffset % cellsPerWeek + cellsPerWeek) % cellsPerWeek // crazy math to handle negative cellOffsets
        ]
        - day0; // adjustment for beginning-of-week normalization
    }
  
    // day offset -> date (JavaScript Date object)
    function dayOffsetToDate(dayOffset) {
      var date = cloneDate(t.visStart);
      addDays(date, dayOffset);
      return date;
    }
  
  
    //
    // TRANSFORMATIONS: date -> day offset -> cell offset -> cell
    //
  
    // date -> cell (combines all transformations)
    function dateToCell(date) {
      var dayOffset = dateToDayOffset(date);
      var cellOffset = dayOffsetToCellOffset(dayOffset);
      var cell = cellOffsetToCell(cellOffset);
      return cell;
    }
  
    // date -> day offset
    function dateToDayOffset(date) {
      return dayDiff(date, t.visStart);
    }
  
    // day offset -> cell offset
    function dayOffsetToCellOffset(dayOffset) {
      var day0 = t.visStart.getDay(); // first date's day of week
      dayOffset += day0; // normalize dayOffset to beginning-of-week
      return Math.floor(dayOffset / 7) * cellsPerWeek // # of cells from full weeks
        + dayToCellMap[ // # of cells from partial last week
          (dayOffset % 7 + 7) % 7 // crazy math to handle negative dayOffsets
        ]
        - dayToCellMap[day0]; // adjustment for beginning-of-week normalization
    }
  
    // cell offset -> cell (object with row & col keys)
    function cellOffsetToCell(cellOffset) {
      var colCnt = t.getColCnt();
  
      // rtl variables. wish we could pre-populate these. but where?
      var dis = isRTL ? -1 : 1;
      var dit = isRTL ? colCnt - 1 : 0;
  
      var row = Math.floor(cellOffset / colCnt);
      var col = ((cellOffset % colCnt + colCnt) % colCnt) * dis + dit; // column, adjusted for RTL (dis & dit)
      return {
        row: row,
        col: col
      };
    }
  
  
    //
    // Converts a date range into an array of segment objects.
    // "Segments" are horizontal stretches of time, sliced up by row.
    // A segment object has the following properties:
    // - row
    // - cols
    // - isStart
    // - isEnd
    //
    function rangeToSegments(startDate, endDate) {
      var rowCnt = t.getRowCnt();
      var colCnt = t.getColCnt();
      var segments = []; // array of segments to return
  
      // day offset for given date range
      var rangeDayOffsetStart = dateToDayOffset(startDate);
      var rangeDayOffsetEnd = dateToDayOffset(endDate); // exclusive
  
      // first and last cell offset for the given date range
      // "last" implies inclusivity
      var rangeCellOffsetFirst = dayOffsetToCellOffset(rangeDayOffsetStart);
      var rangeCellOffsetLast = dayOffsetToCellOffset(rangeDayOffsetEnd) - 1;
  
      // loop through all the rows in the view
      for (var row=0; row<rowCnt; row++) {
  
        // first and last cell offset for the row
        var rowCellOffsetFirst = row * colCnt;
        var rowCellOffsetLast = rowCellOffsetFirst + colCnt - 1;
  
        // get the segment's cell offsets by constraining the range's cell offsets to the bounds of the row
        var segmentCellOffsetFirst = Math.max(rangeCellOffsetFirst, rowCellOffsetFirst);
        var segmentCellOffsetLast = Math.min(rangeCellOffsetLast, rowCellOffsetLast);
  
        // make sure segment's offsets are valid and in view
        if (segmentCellOffsetFirst <= segmentCellOffsetLast) {
  
          // translate to cells
          var segmentCellFirst = cellOffsetToCell(segmentCellOffsetFirst);
          var segmentCellLast = cellOffsetToCell(segmentCellOffsetLast);
  
          // view might be RTL, so order by leftmost column
          var cols = [ segmentCellFirst.col, segmentCellLast.col ].sort();
  
          // Determine if segment's first/last cell is the beginning/end of the date range.
          // We need to compare "day offset" because "cell offsets" are often ambiguous and
          // can translate to multiple days, and an edge case reveals itself when we the
          // range's first cell is hidden (we don't want isStart to be true).
          var isStart = cellOffsetToDayOffset(segmentCellOffsetFirst) == rangeDayOffsetStart;
          var isEnd = cellOffsetToDayOffset(segmentCellOffsetLast) + 1 == rangeDayOffsetEnd; // +1 for comparing exclusively
  
          segments.push({
            row: row,
            leftCol: cols[0],
            rightCol: cols[1],
            isStart: isStart,
            isEnd: isEnd
          });
        }
      }
  
      return segments;
    }
    
  
  }
  
  ;;
  
  function DayEventRenderer() {
    var t = this;
  
    
    // exports
    t.renderDayEvents = renderDayEvents;
    t.draggableDayEvent = draggableDayEvent; // made public so that subclasses can override
    t.resizableDayEvent = resizableDayEvent; // "
    
    
    // imports
    var opt = t.opt;
    var trigger = t.trigger;
    var isEventDraggable = t.isEventDraggable;
    var isEventResizable = t.isEventResizable;
    var eventEnd = t.eventEnd;
    var reportEventElement = t.reportEventElement;
    var eventElementHandlers = t.eventElementHandlers;
    var showEvents = t.showEvents;
    var hideEvents = t.hideEvents;
    var eventDrop = t.eventDrop;
    var eventResize = t.eventResize;
    var getRowCnt = t.getRowCnt;
    var getColCnt = t.getColCnt;
    var getColWidth = t.getColWidth;
    var allDayRow = t.allDayRow; // TODO: rename
    var colLeft = t.colLeft;
    var colRight = t.colRight;
    var colContentLeft = t.colContentLeft;
    var colContentRight = t.colContentRight;
    var dateToCell = t.dateToCell;
    var getDaySegmentContainer = t.getDaySegmentContainer;
    var formatDates = t.calendar.formatDates;
    var renderDayOverlay = t.renderDayOverlay;
    var clearOverlays = t.clearOverlays;
    var clearSelection = t.clearSelection;
    var getHoverListener = t.getHoverListener;
    var rangeToSegments = t.rangeToSegments;
    var cellToDate = t.cellToDate;
    var cellToCellOffset = t.cellToCellOffset;
    var cellOffsetToDayOffset = t.cellOffsetToDayOffset;
    var dateToDayOffset = t.dateToDayOffset;
    var dayOffsetToCellOffset = t.dayOffsetToCellOffset;
  
  
    // Render `events` onto the calendar, attach mouse event handlers, and call the `eventAfterRender` callback for each.
    // Mouse event will be lazily applied, except if the event has an ID of `modifiedEventId`.
    // Can only be called when the event container is empty (because it wipes out all innerHTML).
    function renderDayEvents(events, modifiedEventId) {
  
      // do the actual rendering. Receive the intermediate "segment" data structures.
      var segments = _renderDayEvents(
        events,
        false, // don't append event elements
        true // set the heights of the rows
      );
  
      // report the elements to the View, for general drag/resize utilities
      segmentElementEach(segments, function(segment, element) {
        reportEventElement(segment.event, element);
      });
  
      // attach mouse handlers
      attachHandlers(segments, modifiedEventId);
  
      // call `eventAfterRender` callback for each event
      segmentElementEach(segments, function(segment, element) {
        trigger('eventAfterRender', segment.event, segment.event, element);
      });
    }
  
  
    // Render an event on the calendar, but don't report them anywhere, and don't attach mouse handlers.
    // Append this event element to the event container, which might already be populated with events.
    // If an event's segment will have row equal to `adjustRow`, then explicitly set its top coordinate to `adjustTop`.
    // This hack is used to maintain continuity when user is manually resizing an event.
    // Returns an array of DOM elements for the event.
    function renderTempDayEvent(event, adjustRow, adjustTop) {
  
      // actually render the event. `true` for appending element to container.
      // Recieve the intermediate "segment" data structures.
      var segments = _renderDayEvents(
        [ event ],
        true, // append event elements
        false // don't set the heights of the rows
      );
  
      var elements = [];
  
      // Adjust certain elements' top coordinates
      segmentElementEach(segments, function(segment, element) {
        if (segment.row === adjustRow) {
          element.css('top', adjustTop);
        }
        elements.push(element[0]); // accumulate DOM nodes
      });
  
      return elements;
    }
  
  
    // Render events onto the calendar. Only responsible for the VISUAL aspect.
    // Not responsible for attaching handlers or calling callbacks.
    // Set `doAppend` to `true` for rendering elements without clearing the existing container.
    // Set `doRowHeights` to allow setting the height of each row, to compensate for vertical event overflow.
    function _renderDayEvents(events, doAppend, doRowHeights) {
  
      // where the DOM nodes will eventually end up
      var finalContainer = getDaySegmentContainer();
  
      // the container where the initial HTML will be rendered.
      // If `doAppend`==true, uses a temporary container.
      var renderContainer = doAppend ? $("<div/>") : finalContainer;
  
      var segments = buildSegments(events);
      var html;
      var elements;
  
      // calculate the desired `left` and `width` properties on each segment object
      calculateHorizontals(segments);
  
      // build the HTML string. relies on `left` property
      html = buildHTML(segments);
  
      // render the HTML. innerHTML is considerably faster than jQuery's .html()
      renderContainer[0].innerHTML = html;
  
      // retrieve the individual elements
      elements = renderContainer.children();
  
      // if we were appending, and thus using a temporary container,
      // re-attach elements to the real container.
      if (doAppend) {
        finalContainer.append(elements);
      }
  
      // assigns each element to `segment.event`, after filtering them through user callbacks
      resolveElements(segments, elements);
  
      // Calculate the left and right padding+margin for each element.
      // We need this for setting each element's desired outer width, because of the W3C box model.
      // It's important we do this in a separate pass from acually setting the width on the DOM elements
      // because alternating reading/writing dimensions causes reflow for every iteration.
      segmentElementEach(segments, function(segment, element) {
        segment.hsides = hsides(element, true); // include margins = `true`
      });
  
      // Set the width of each element
      segmentElementEach(segments, function(segment, element) {
        element.width(
          Math.max(0, segment.outerWidth - segment.hsides)
        );
      });
  
      // Grab each element's outerHeight (setVerticals uses this).
      // To get an accurate reading, it's important to have each element's width explicitly set already.
      segmentElementEach(segments, function(segment, element) {
        segment.outerHeight = element.outerHeight(true); // include margins = `true`
      });
  
      // Set the top coordinate on each element (requires segment.outerHeight)
      setVerticals(segments, doRowHeights);
  
      return segments;
    }
  
  
    // Generate an array of "segments" for all events.
    function buildSegments(events) {
      var segments = [];
      for (var i=0; i<events.length; i++) {
        var eventSegments = buildSegmentsForEvent(events[i]);
        segments.push.apply(segments, eventSegments); // append an array to an array
      }
      return segments;
    }
  
  
    // Generate an array of segments for a single event.
    // A "segment" is the same data structure that View.rangeToSegments produces,
    // with the addition of the `event` property being set to reference the original event.
    function buildSegmentsForEvent(event) {
      var startDate = event.start;
      var endDate = exclEndDay(event);
      var segments = rangeToSegments(startDate, endDate);
      for (var i=0; i<segments.length; i++) {
        segments[i].event = event;
      }
      return segments;
    }
  
  
    // Sets the `left` and `outerWidth` property of each segment.
    // These values are the desired dimensions for the eventual DOM elements.
    function calculateHorizontals(segments) {
      var isRTL = opt('isRTL');
      for (var i=0; i<segments.length; i++) {
        var segment = segments[i];
  
        // Determine functions used for calulating the elements left/right coordinates,
        // depending on whether the view is RTL or not.
        // NOTE:
        // colLeft/colRight returns the coordinate butting up the edge of the cell.
        // colContentLeft/colContentRight is indented a little bit from the edge.
        var leftFunc = (isRTL ? segment.isEnd : segment.isStart) ? colContentLeft : colLeft;
        var rightFunc = (isRTL ? segment.isStart : segment.isEnd) ? colContentRight : colRight;
  
        var left = leftFunc(segment.leftCol);
        var right = rightFunc(segment.rightCol);
        segment.left = left;
        segment.outerWidth = right - left;
      }
    }
  
  
    // Build a concatenated HTML string for an array of segments
    function buildHTML(segments) {
      var html = '';
      for (var i=0; i<segments.length; i++) {
        html += buildHTMLForSegment(segments[i]);
      }
      return html;
    }
  
  
    // Build an HTML string for a single segment.
    // Relies on the following properties:
    // - `segment.event` (from `buildSegmentsForEvent`)
    // - `segment.left` (from `calculateHorizontals`)
    function buildHTMLForSegment(segment) {
      var html = '';
      var isRTL = opt('isRTL');
      var event = segment.event;
      var url = event.url;
  
      // generate the list of CSS classNames
      var classNames = [ 'fc-event', 'fc-event-hori' ];
      if (isEventDraggable(event)) {
        classNames.push('fc-event-draggable');
      }
      if (segment.isStart) {
        classNames.push('fc-event-start');
      }
      if (segment.isEnd) {
        classNames.push('fc-event-end');
      }
      // use the event's configured classNames
      // guaranteed to be an array via `normalizeEvent`
      classNames = classNames.concat(event.className);
      if (event.source) {
        // use the event's source's classNames, if specified
        classNames = classNames.concat(event.source.className || []);
      }
  
      // generate a semicolon delimited CSS string for any of the "skin" properties
      // of the event object (`backgroundColor`, `borderColor` and such)
      var skinCss = getSkinCss(event, opt);
  
      if (url) {
        html += "<a href='" + htmlEscape(url) + "'";
      }else{
        html += "<div";
      }
      html +=
        " class='" + classNames.join(' ') + "'" +
        " style=" +
          "'" +
          "position:absolute;" +
          "left:" + segment.left + "px;" +
          skinCss +
          "'" +
        ">" +
        "<div class='fc-event-inner'>";
      if (!event.allDay && segment.isStart) {
        html +=
          "<span class='fc-event-time'>" +
          htmlEscape(
            formatDates(event.start, event.end, opt('timeFormat'))
          ) +
          "</span>";
      }
      html +=
        "<span class='fc-event-title'>" +
        htmlEscape(event.title || '') +
        "</span>" +
        "</div>";
      if (segment.isEnd && isEventResizable(event)) {
        html +=
          "<div class='ui-resizable-handle ui-resizable-" + (isRTL ? 'w' : 'e') + "'>" +
          "   " + // makes hit area a lot better for IE6/7
          "</div>";
      }
      html += "</" + (url ? "a" : "div") + ">";
  
      // TODO:
      // When these elements are initially rendered, they will be briefly visibile on the screen,
      // even though their widths/heights are not set.
      // SOLUTION: initially set them as visibility:hidden ?
  
      return html;
    }
  
  
    // Associate each segment (an object) with an element (a jQuery object),
    // by setting each `segment.element`.
    // Run each element through the `eventRender` filter, which allows developers to
    // modify an existing element, supply a new one, or cancel rendering.
    function resolveElements(segments, elements) {
      for (var i=0; i<segments.length; i++) {
        var segment = segments[i];
        var event = segment.event;
        var element = elements.eq(i);
  
        // call the trigger with the original element
        var triggerRes = trigger('eventRender', event, event, element);
  
        if (triggerRes === false) {
          // if `false`, remove the event from the DOM and don't assign it to `segment.event`
          element.remove();
        }
        else {
          if (triggerRes && triggerRes !== true) {
            // the trigger returned a new element, but not `true` (which means keep the existing element)
  
            // re-assign the important CSS dimension properties that were already assigned in `buildHTMLForSegment`
            triggerRes = $(triggerRes)
              .css({
                position: 'absolute',
                left: segment.left
              });
  
            element.replaceWith(triggerRes);
            element = triggerRes;
          }
  
          segment.element = element;
        }
      }
    }
  
  
  
    /* Top-coordinate Methods
    -------------------------------------------------------------------------------------------------*/
  
  
    // Sets the "top" CSS property for each element.
    // If `doRowHeights` is `true`, also sets each row's first cell to an explicit height,
    // so that if elements vertically overflow, the cell expands vertically to compensate.
    function setVerticals(segments, doRowHeights) {
      var rowContentHeights = calculateVerticals(segments); // also sets segment.top
      var rowContentElements = getRowContentElements(); // returns 1 inner div per row
      var rowContentTops = [];
  
      // Set each row's height by setting height of first inner div
      if (doRowHeights) {
        for (var i=0; i<rowContentElements.length; i++) {
          rowContentElements[i].height(rowContentHeights[i]);
        }
      }
  
      // Get each row's top, relative to the views's origin.
      // Important to do this after setting each row's height.
      for (var i=0; i<rowContentElements.length; i++) {
        rowContentTops.push(
          rowContentElements[i].position().top
        );
      }
  
      // Set each segment element's CSS "top" property.
      // Each segment object has a "top" property, which is relative to the row's top, but...
      segmentElementEach(segments, function(segment, element) {
        element.css(
          'top',
          rowContentTops[segment.row] + segment.top // ...now, relative to views's origin
        );
      });
    }
  
  
    // Calculate the "top" coordinate for each segment, relative to the "top" of the row.
    // Also, return an array that contains the "content" height for each row
    // (the height displaced by the vertically stacked events in the row).
    // Requires segments to have their `outerHeight` property already set.
    function calculateVerticals(segments) {
      var rowCnt = getRowCnt();
      var colCnt = getColCnt();
      var rowContentHeights = []; // content height for each row
      var segmentRows = buildSegmentRows(segments); // an array of segment arrays, one for each row
  
      for (var rowI=0; rowI<rowCnt; rowI++) {
        var segmentRow = segmentRows[rowI];
  
        // an array of running total heights for each column.
        // initialize with all zeros.
        var colHeights = [];
        for (var colI=0; colI<colCnt; colI++) {
          colHeights.push(0);
        }
  
        // loop through every segment
        for (var segmentI=0; segmentI<segmentRow.length; segmentI++) {
          var segment = segmentRow[segmentI];
  
          // find the segment's top coordinate by looking at the max height
          // of all the columns the segment will be in.
          segment.top = arrayMax(
            colHeights.slice(
              segment.leftCol,
              segment.rightCol + 1 // make exclusive for slice
            )
          );
  
          // adjust the columns to account for the segment's height
          for (var colI=segment.leftCol; colI<=segment.rightCol; colI++) {
            colHeights[colI] = segment.top + segment.outerHeight;
          }
        }
  
        // the tallest column in the row should be the "content height"
        rowContentHeights.push(arrayMax(colHeights));
      }
  
      return rowContentHeights;
    }
  
  
    // Build an array of segment arrays, each representing the segments that will
    // be in a row of the grid, sorted by which event should be closest to the top.
    function buildSegmentRows(segments) {
      var rowCnt = getRowCnt();
      var segmentRows = [];
      var segmentI;
      var segment;
      var rowI;
  
      // group segments by row
      for (segmentI=0; segmentI<segments.length; segmentI++) {
        segment = segments[segmentI];
        rowI = segment.row;
        if (segment.element) { // was rendered?
          if (segmentRows[rowI]) {
            // already other segments. append to array
            segmentRows[rowI].push(segment);
          }
          else {
            // first segment in row. create new array
            segmentRows[rowI] = [ segment ];
          }
        }
      }
  
      // sort each row
      for (rowI=0; rowI<rowCnt; rowI++) {
        segmentRows[rowI] = sortSegmentRow(
          segmentRows[rowI] || [] // guarantee an array, even if no segments
        );
      }
  
      return segmentRows;
    }
  
  
    // Sort an array of segments according to which segment should appear closest to the top
    function sortSegmentRow(segments) {
      var sortedSegments = [];
  
      // build the subrow array
      var subrows = buildSegmentSubrows(segments);
  
      // flatten it
      for (var i=0; i<subrows.length; i++) {
        sortedSegments.push.apply(sortedSegments, subrows[i]); // append an array to an array
      }
  
      return sortedSegments;
    }
  
  
    // Take an array of segments, which are all assumed to be in the same row,
    // and sort into subrows.
    function buildSegmentSubrows(segments) {
  
      // Give preference to elements with certain criteria, so they have
      // a chance to be closer to the top.
      segments.sort(compareDaySegments);
  
      var subrows = [];
      for (var i=0; i<segments.length; i++) {
        var segment = segments[i];
  
        // loop through subrows, starting with the topmost, until the segment
        // doesn't collide with other segments.
        for (var j=0; j<subrows.length; j++) {
          if (!isDaySegmentCollision(segment, subrows[j])) {
            break;
          }
        }
        // `j` now holds the desired subrow index
        if (subrows[j]) {
          subrows[j].push(segment);
        }
        else {
          subrows[j] = [ segment ];
        }
      }
  
      return subrows;
    }
  
  
    // Return an array of jQuery objects for the placeholder content containers of each row.
    // The content containers don't actually contain anything, but their dimensions should match
    // the events that are overlaid on top.
    function getRowContentElements() {
      var i;
      var rowCnt = getRowCnt();
      var rowDivs = [];
      for (i=0; i<rowCnt; i++) {
        rowDivs[i] = allDayRow(i)
          .find('div.fc-day-content > div');
      }
      return rowDivs;
    }
  
  
  
    /* Mouse Handlers
    ---------------------------------------------------------------------------------------------------*/
    // TODO: better documentation!
  
  
    function attachHandlers(segments, modifiedEventId) {
      var segmentContainer = getDaySegmentContainer();
  
      segmentElementEach(segments, function(segment, element, i) {
        var event = segment.event;
        if (event._id === modifiedEventId) {
          bindDaySeg(event, element, segment);
        }else{
          element[0]._fci = i; // for lazySegBind
        }
      });
  
      lazySegBind(segmentContainer, segments, bindDaySeg);
    }
  
  
    function bindDaySeg(event, eventElement, segment) {
  
      if (isEventDraggable(event)) {
        t.draggableDayEvent(event, eventElement, segment); // use `t` so subclasses can override
      }
  
      if (
        segment.isEnd && // only allow resizing on the final segment for an event
        isEventResizable(event)
      ) {
        t.resizableDayEvent(event, eventElement, segment); // use `t` so subclasses can override
      }
  
      // attach all other handlers.
      // needs to be after, because resizableDayEvent might stopImmediatePropagation on click
      eventElementHandlers(event, eventElement);
    }
  
    
    function draggableDayEvent(event, eventElement) {
      var hoverListener = getHoverListener();
      var dayDelta;
      eventElement.draggable({
        delay: 50,
        opacity: opt('dragOpacity'),
        revertDuration: opt('dragRevertDuration'),
        start: function(ev, ui) {
          trigger('eventDragStart', eventElement, event, ev, ui);
          hideEvents(event, eventElement);
          hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
            eventElement.draggable('option', 'revert', !cell || !rowDelta && !colDelta);
            clearOverlays();
            if (cell) {
              var origDate = cellToDate(origCell);
              var date = cellToDate(cell);
              dayDelta = dayDiff(date, origDate);
              renderDayOverlay(
                addDays(cloneDate(event.start), dayDelta),
                addDays(exclEndDay(event), dayDelta)
              );
            }else{
              dayDelta = 0;
            }
          }, ev, 'drag');
        },
        stop: function(ev, ui) {
          hoverListener.stop();
          clearOverlays();
          trigger('eventDragStop', eventElement, event, ev, ui);
          if (dayDelta) {
            eventDrop(this, event, dayDelta, 0, event.allDay, ev, ui);
          }else{
            eventElement.css('filter', ''); // clear IE opacity side-effects
            showEvents(event, eventElement);
          }
        }
      });
    }
  
    
    function resizableDayEvent(event, element, segment) {
      var isRTL = opt('isRTL');
      var direction = isRTL ? 'w' : 'e';
      var handle = element.find('.ui-resizable-' + direction); // TODO: stop using this class because we aren't using jqui for this
      var isResizing = false;
      
      // TODO: look into using jquery-ui mouse widget for this stuff
      disableTextSelection(element); // prevent native <a> selection for IE
      element
        .mousedown(function(ev) { // prevent native <a> selection for others
          ev.preventDefault();
        })
        .click(function(ev) {
          if (isResizing) {
            ev.preventDefault(); // prevent link from being visited (only method that worked in IE6)
            ev.stopImmediatePropagation(); // prevent fullcalendar eventClick handler from being called
                                           // (eventElementHandlers needs to be bound after resizableDayEvent)
          }
        });
      
      handle.mousedown(function(ev) {
        if (ev.which != 1) {
          return; // needs to be left mouse button
        }
        isResizing = true;
        var hoverListener = getHoverListener();
        var rowCnt = getRowCnt();
        var colCnt = getColCnt();
        var elementTop = element.css('top');
        var dayDelta;
        var helpers;
        var eventCopy = $.extend({}, event);
        var minCellOffset = dayOffsetToCellOffset( dateToDayOffset(event.start) );
        clearSelection();
        $('body')
          .css('cursor', direction + '-resize')
          .one('mouseup', mouseup);
        trigger('eventResizeStart', this, event, ev);
        hoverListener.start(function(cell, origCell) {
          if (cell) {
  
            var origCellOffset = cellToCellOffset(origCell);
            var cellOffset = cellToCellOffset(cell);
  
            // don't let resizing move earlier than start date cell
            cellOffset = Math.max(cellOffset, minCellOffset);
  
            dayDelta =
              cellOffsetToDayOffset(cellOffset) -
              cellOffsetToDayOffset(origCellOffset);
  
            if (dayDelta) {
              eventCopy.end = addDays(eventEnd(event), dayDelta, true);
              var oldHelpers = helpers;
  
              helpers = renderTempDayEvent(eventCopy, segment.row, elementTop);
              helpers = $(helpers); // turn array into a jQuery object
  
              helpers.find('*').css('cursor', direction + '-resize');
              if (oldHelpers) {
                oldHelpers.remove();
              }
  
              hideEvents(event);
            }
            else {
              if (helpers) {
                showEvents(event);
                helpers.remove();
                helpers = null;
              }
            }
            clearOverlays();
            renderDayOverlay( // coordinate grid already rebuilt with hoverListener.start()
              event.start,
              addDays( exclEndDay(event), dayDelta )
              // TODO: instead of calling renderDayOverlay() with dates,
              // call _renderDayOverlay (or whatever) with cell offsets.
            );
          }
        }, ev);
        
        function mouseup(ev) {
          trigger('eventResizeStop', this, event, ev);
          $('body').css('cursor', '');
          hoverListener.stop();
          clearOverlays();
          if (dayDelta) {
            eventResize(this, event, dayDelta, 0, ev);
            // event redraw will clear helpers
          }
          // otherwise, the drag handler already restored the old events
          
          setTimeout(function() { // make this happen after the element's click event
            isResizing = false;
          },0);
        }
      });
    }
    
  
  }
  
  
  
  /* Generalized Segment Utilities
  -------------------------------------------------------------------------------------------------*/
  
  
  function isDaySegmentCollision(segment, otherSegments) {
    for (var i=0; i<otherSegments.length; i++) {
      var otherSegment = otherSegments[i];
      if (
        otherSegment.leftCol <= segment.rightCol &&
        otherSegment.rightCol >= segment.leftCol
      ) {
        return true;
      }
    }
    return false;
  }
  
  
  function segmentElementEach(segments, callback) { // TODO: use in AgendaView?
    for (var i=0; i<segments.length; i++) {
      var segment = segments[i];
      var element = segment.element;
      if (element) {
        callback(segment, element, i);
      }
    }
  }
  
  
  // A cmp function for determining which segments should appear higher up
  function compareDaySegments(a, b) {
    return (b.rightCol - b.leftCol) - (a.rightCol - a.leftCol) || // put wider events first
      b.event.allDay - a.event.allDay || // if tie, put all-day events first (booleans cast to 0/1)
      a.event.start - b.event.start || // if a tie, sort by event start date
      (a.event.title || '').localeCompare(b.event.title) // if a tie, sort by event title
  }
  
  
  ;;
  
  //BUG: unselect needs to be triggered when events are dragged+dropped
  
  function SelectionManager() {
    var t = this;
    
    
    // exports
    t.select = select;
    t.unselect = unselect;
    t.reportSelection = reportSelection;
    t.daySelectionMousedown = daySelectionMousedown;
    
    
    // imports
    var opt = t.opt;
    var trigger = t.trigger;
    var defaultSelectionEnd = t.defaultSelectionEnd;
    var renderSelection = t.renderSelection;
    var clearSelection = t.clearSelection;
    
    
    // locals
    var selected = false;
  
  
  
    // unselectAuto
    if (opt('selectable') && opt('unselectAuto')) {
      $(document).mousedown(function(ev) {
        var ignore = opt('unselectCancel');
        if (ignore) {
          if ($(ev.target).parents(ignore).length) { // could be optimized to stop after first match
            return;
          }
        }
        unselect(ev);
      });
    }
    
  
    function select(startDate, endDate, allDay) {
      unselect();
      if (!endDate) {
        endDate = defaultSelectionEnd(startDate, allDay);
      }
      renderSelection(startDate, endDate, allDay);
      reportSelection(startDate, endDate, allDay);
    }
    
    
    function unselect(ev) {
      if (selected) {
        selected = false;
        clearSelection();
        trigger('unselect', null, ev);
      }
    }
    
    
    function reportSelection(startDate, endDate, allDay, ev) {
      selected = true;
      trigger('select', null, startDate, endDate, allDay, ev);
    }
    
    
    function daySelectionMousedown(ev) { // not really a generic manager method, oh well
      var cellToDate = t.cellToDate;
      var getIsCellAllDay = t.getIsCellAllDay;
      var hoverListener = t.getHoverListener();
      var reportDayClick = t.reportDayClick; // this is hacky and sort of weird
      if (ev.which == 1 && opt('selectable')) { // which==1 means left mouse button
        unselect(ev);
        var _mousedownElement = this;
        var dates;
        hoverListener.start(function(cell, origCell) { // TODO: maybe put cellToDate/getIsCellAllDay info in cell
          clearSelection();
          if (cell && getIsCellAllDay(cell)) {
            dates = [ cellToDate(origCell), cellToDate(cell) ].sort(dateCompare);
            renderSelection(dates[0], dates[1], true);
          }else{
            dates = null;
          }
        }, ev);
        $(document).one('mouseup', function(ev) {
          hoverListener.stop();
          if (dates) {
            if (+dates[0] == +dates[1]) {
              reportDayClick(dates[0], true, ev);
            }
            reportSelection(dates[0], dates[1], true, ev);
          }
        });
      }
    }
  
  
  }
  
  ;;
   
  function OverlayManager() {
    var t = this;
    
    
    // exports
    t.renderOverlay = renderOverlay;
    t.clearOverlays = clearOverlays;
    
    
    // locals
    var usedOverlays = [];
    var unusedOverlays = [];
    
    
    function renderOverlay(rect, parent) {
      var e = unusedOverlays.shift();
      if (!e) {
        e = $("<div class='fc-cell-overlay' style='position:absolute;z-index:3'/>");
      }
      if (e[0].parentNode != parent[0]) {
        e.appendTo(parent);
      }
      usedOverlays.push(e.css(rect).show());
      return e;
    }
    
  
    function clearOverlays() {
      var e;
      while (e = usedOverlays.shift()) {
        unusedOverlays.push(e.hide().unbind());
      }
    }
  
  
  }
  
  ;;
  
  function CoordinateGrid(buildFunc) {
  
    var t = this;
    var rows;
    var cols;
    
    
    t.build = function() {
      rows = [];
      cols = [];
      buildFunc(rows, cols);
    };
    
    
    t.cell = function(x, y) {
      var rowCnt = rows.length;
      var colCnt = cols.length;
      var i, r=-1, c=-1;
      for (i=0; i<rowCnt; i++) {
        if (y >= rows[i][0] && y < rows[i][1]) {
          r = i;
          break;
        }
      }
      for (i=0; i<colCnt; i++) {
        if (x >= cols[i][0] && x < cols[i][1]) {
          c = i;
          break;
        }
      }
      return (r>=0 && c>=0) ? { row:r, col:c } : null;
    };
    
    
    t.rect = function(row0, col0, row1, col1, originElement) { // row1,col1 is inclusive
      var origin = originElement.offset();
      return {
        top: rows[row0][0] - origin.top,
        left: cols[col0][0] - origin.left,
        width: cols[col1][1] - cols[col0][0],
        height: rows[row1][1] - rows[row0][0]
      };
    };
  
  }
  
  ;;
  
  function HoverListener(coordinateGrid) {
  
  
    var t = this;
    var bindType;
    var change;
    var firstCell;
    var cell;
    
    
    t.start = function(_change, ev, _bindType) {
      change = _change;
      firstCell = cell = null;
      coordinateGrid.build();
      mouse(ev);
      bindType = _bindType || 'mousemove';
      $(document).bind(bindType, mouse);
    };
    
    
    function mouse(ev) {
      _fixUIEvent(ev); // see below
      var newCell = coordinateGrid.cell(ev.pageX, ev.pageY);
      if (!newCell != !cell || newCell && (newCell.row != cell.row || newCell.col != cell.col)) {
        if (newCell) {
          if (!firstCell) {
            firstCell = newCell;
          }
          change(newCell, firstCell, newCell.row-firstCell.row, newCell.col-firstCell.col);
        }else{
          change(newCell, firstCell);
        }
        cell = newCell;
      }
    }
    
    
    t.stop = function() {
      $(document).unbind(bindType, mouse);
      return cell;
    };
    
    
  }
  
  
  
  // this fix was only necessary for jQuery UI 1.8.16 (and jQuery 1.7 or 1.7.1)
  // upgrading to jQuery UI 1.8.17 (and using either jQuery 1.7 or 1.7.1) fixed the problem
  // but keep this in here for 1.8.16 users
  // and maybe remove it down the line
  
  function _fixUIEvent(event) { // for issue 1168
    if (event.pageX === undefined) {
      event.pageX = event.originalEvent.pageX;
      event.pageY = event.originalEvent.pageY;
    }
  }
  ;;
  
  function HorizontalPositionCache(getElement) {
  
    var t = this,
      elements = {},
      lefts = {},
      rights = {};
      
    function e(i) {
      return elements[i] = elements[i] || getElement(i);
    }
    
    t.left = function(i) {
      return lefts[i] = lefts[i] === undefined ? e(i).position().left : lefts[i];
    };
    
    t.right = function(i) {
      return rights[i] = rights[i] === undefined ? t.left(i) + e(i).width() : rights[i];
    };
    
    t.clear = function() {
      elements = {};
      lefts = {};
      rights = {};
    };
    
  }
  
  ;;
  
  })(jQuery);
/**
 *
 */
function CalendarTable(option) {
    var now = moment();
    this.year = option.year || now.year();
    this.month = option.month || now.month();
    // the moment object
    this.date = moment().year(this.year).month(this.month);
    
    this.columns = option.columns || [];
}

CalendarTable.prototype = new PaginationTable({});

CalendarTable.prototype.nextMonth = function () {
    this.date.add(1, 'months');
};

CalendarTable.prototype.prevMonth = function () {
    this.date.subtract(1, 'months');
};

CalendarTable.prototype.render = function (containerId) {
    this.containerId = containerId;
    var rowHeaders = [];
    var rowTailers = [];
    for (var i = 0; i < this.columns.length; i++) {
        var col = this.columns[i];
        if (col.rowHeader) rowHeaders.push(col);
        else rowTailers.push(col);
    }
    var days = this.date.daysInMonth();
    
    this.table = $("<table></table>");
    if (typeof this.width !== 'undefined') this.table.css('width', this.width);
    if (typeof this.height !== 'undefined') ret.css('height', this.height);
    // if (!this.frozenHeader) this.table.addClass('table');
    // this.table.addClass("table table-bordered table-striped");
    this.table.addClass("table table-responsive-sm table-hover table-outline mb-0");
    
    var self = this;
    var thead = $('<thead class="thead-light"></thead>');
    var tr = $('<tr>');
    thead.append(tr);
    for (var i = 0; i < rowHeaders.length; i++) {
        var th = $('<th>');
        th.text(rowHeaders[i].title);
        tr.append(th);
    }
    for (var i = 0; i < days; i++) {
        var th = $('<th>');
        th.text(i + 1);
        tr.append(th);
    }
    for (var i = 0; i < rowTailers.length; i++) {
        var th = $('<th>');
        th.text(rowTailers[i].title);
        tr.append(th);
    }
    this.table.append(thead);
    
    $('#' + this.containerId).empty();
    $('#' + this.containerId).append(this.table);
};
if (typeof dialog === 'undefined') dialog = {};

dialog.alert = function (message) {
    layer.open({
        type: 0,
        icon: 0,
        offset: '300px',
        shade: 0,
        shadeClose: true,
        title: '警告',
        content: message,
    }); 
};

dialog.error = function (message) {
    layer.open({
        type: 0,
        icon: 2,
        offset: '300px',
        shade: 0,
        shadeClose: true,
        title: '错误',
        content: message,
    }); 
};

dialog.success = function (message) {
    layer.open({
        type: 0,
        icon: 1,
        offset: '300px',
        shade: 0,
        shadeClose: true,
        title: '成功',
        content: message
    }); 
};

dialog.confirm = function (message, callback) {
    layer.confirm(message, {
        btn: ['确定', '取消'] //按钮
    }, function(index){
        layer.close(index);
        callback();
    }, function(){
        
    });
};
/*!
 * 行政区数据
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define('ChineseDistricts', [], factory);
    } else {
        // Browser globals.
        factory();
    }
})(function () {

    var ChineseDistricts = {
            86: {
                'A-G': [
                    {code: '340000', address: '安徽省'},
                    {code: '110000', address: '北京市'},
                    {code: '500000', address: '重庆市'},
                    {code: '350000', address: '福建省'},
                    {code: '620000', address: '甘肃省'},
                    {code: '440000', address: '广东省'},
                    {code: '450000', address: '广西壮族自治区'},
                    {code: '520000', address: '贵州省'}],
                'H-K': [
                    {code: '460000', address: '海南省'},
                    {code: '130000', address: '河北省'},
                    {code: '230000', address: '黑龙江省'},
                    {code: '410000', address: '河南省'},
                    {code: '420000', address: '湖北省'},
                    {code: '430000', address: '湖南省'},
                    {code: '320000', address: '江苏省'},
                    {code: '360000', address: '江西省'},
                    {code: '220000', address: '吉林省'}],
                'L-S': [
                    {code: '210000', address: '辽宁省'},
                    {code: '150000', address: '内蒙古自治区'},
                    {code: '640000', address: '宁夏回族自治区'},
                    {code: '630000', address: '青海省'},
                    {code: '370000', address: '山东省'},
                    {code: '310000', address: '上海市'},
                    {code: '140000', address: '山西省'},
                    {code: '610000', address: '陕西省'},
                    {code: '510000', address: '四川省'}],
                'T-Z': [
                    {code: '120000', address: '天津市'},
                    {code: '650000', address: '新疆维吾尔自治区'},
                    {code: '540000', address: '西藏自治区'},
                    {code: '530000', address: '云南省'},
                    {code: '330000', address: '浙江省'}]
            },
            110000: {
                110100: '北京市',
            },
            110100: {
                110101: '东城区',
                110102: '西城区',
                110105: '朝阳区',
                110106: '丰台区',
                110107: '石景山区',
                110108: '海淀区',
                110109: '门头沟区',
                110111: '房山区',
                110112: '通州区',
                110113: '顺义区',
                110114: '昌平区',
                110115: '大兴区',
                110116: '怀柔区',
                110117: '平谷区',
                110228: '密云县',
                110229: '延庆县'
            },
            120000: {
                120100: '天津市'
            },
            120100: {
                120101: '和平区',
                120102: '河东区',
                120103: '河西区',
                120104: '南开区',
                120105: '河北区',
                120106: '红桥区',
                120110: '东丽区',
                120111: '西青区',
                120112: '津南区',
                120113: '北辰区',
                120114: '武清区',
                120115: '宝坻区',
                120116: '滨海新区',
                120221: '宁河县',
                120223: '静海县',
                120225: '蓟县'
            },
            130000: {
                130100: '石家庄市',
                130200: '唐山市',
                130300: '秦皇岛市',
                130400: '邯郸市',
                130500: '邢台市',
                130600: '保定市',
                130700: '张家口市',
                130800: '承德市',
                130900: '沧州市',
                131000: '廊坊市',
                131100: '衡水市'
            },
            130100: {
                130102: '长安区',
                130104: '桥西区',
                130105: '新华区',
                130107: '井陉矿区',
                130108: '裕华区',
                130109: '藁城区',
                130110: '鹿泉区',
                130111: '栾城区',
                130121: '井陉县',
                130123: '正定县',
                130125: '行唐县',
                130126: '灵寿县',
                130127: '高邑县',
                130128: '深泽县',
                130129: '赞皇县',
                130130: '无极县',
                130131: '平山县',
                130132: '元氏县',
                130133: '赵县',
                130181: '辛集市',
                130183: '晋州市',
                130184: '新乐市'
            },
            130200: {
                130202: '路南区',
                130203: '路北区',
                130204: '古冶区',
                130205: '开平区',
                130207: '丰南区',
                130208: '丰润区',
                130209: '曹妃甸区',
                130223: '滦县',
                130224: '滦南县',
                130225: '乐亭县',
                130227: '迁西县',
                130229: '玉田县',
                130281: '遵化市',
                130283: '迁安市'
            },
            130300: {
                130302: '海港区',
                130303: '山海关区',
                130304: '北戴河区',
                130321: '青龙满族自治县',
                130322: '昌黎县',
                130323: '抚宁县',
                130324: '卢龙县'
            },
            130400: {
                130402: '邯山区',
                130403: '丛台区',
                130404: '复兴区',
                130406: '峰峰矿区',
                130421: '邯郸县',
                130423: '临漳县',
                130424: '成安县',
                130425: '大名县',
                130426: '涉县',
                130427: '磁县',
                130428: '肥乡县',
                130429: '永年县',
                130430: '邱县',
                130431: '鸡泽县',
                130432: '广平县',
                130433: '馆陶县',
                130434: '魏县',
                130435: '曲周县',
                130481: '武安市'
            },
            130500: {
                130502: '桥东区',
                130503: '桥西区',
                130521: '邢台县',
                130522: '临城县',
                130523: '内丘县',
                130524: '柏乡县',
                130525: '隆尧县',
                130526: '任县',
                130527: '南和县',
                130528: '宁晋县',
                130529: '巨鹿县',
                130530: '新河县',
                130531: '广宗县',
                130532: '平乡县',
                130533: '威县',
                130534: '清河县',
                130535: '临西县',
                130581: '南宫市',
                130582: '沙河市'
            },
            130600: {
                130602: '竞秀区',
                130603: '莲池区',
                130621: '满城区',
                130622: '清苑区',
                130623: '涞水县',
                130624: '阜平县',
                130625: '徐水区',
                130626: '定兴县',
                130627: '唐县',
                130628: '高阳县',
                130629: '容城县',
                130630: '涞源县',
                130631: '望都县',
                130632: '安新县',
                130633: '易县',
                130634: '曲阳县',
                130635: '蠡县',
                130636: '顺平县',
                130637: '博野县',
                130638: '雄县',
                130681: '涿州市',
                130682: '定州市',
                130683: '安国市',
                130684: '高碑店市'
            },
            130700: {
                130702: '桥东区',
                130703: '桥西区',
                130705: '宣化区',
                130706: '下花园区',
                130721: '宣化县',
                130722: '张北县',
                130723: '康保县',
                130724: '沽源县',
                130725: '尚义县',
                130726: '蔚县',
                130727: '阳原县',
                130728: '怀安县',
                130729: '万全县',
                130730: '怀来县',
                130731: '涿鹿县',
                130732: '赤城县',
                130733: '崇礼县'
            },
            130800: {
                130802: '双桥区',
                130803: '双滦区',
                130804: '鹰手营子矿区',
                130821: '承德县',
                130822: '兴隆县',
                130823: '平泉县',
                130824: '滦平县',
                130825: '隆化县',
                130826: '丰宁满族自治县',
                130827: '宽城满族自治县',
                130828: '围场满族蒙古族自治县'
            },
            130900: {
                130902: '新华区',
                130903: '运河区',
                130921: '沧县',
                130922: '青县',
                130923: '东光县',
                130924: '海兴县',
                130925: '盐山县',
                130926: '肃宁县',
                130927: '南皮县',
                130928: '吴桥县',
                130929: '献县',
                130930: '孟村回族自治县',
                130981: '泊头市',
                130982: '任丘市',
                130983: '黄骅市',
                130984: '河间市'
            },
            131000: {
                131002: '安次区',
                131003: '广阳区',
                131022: '固安县',
                131023: '永清县',
                131024: '香河县',
                131025: '大城县',
                131026: '文安县',
                131028: '大厂回族自治县',
                131081: '霸州市',
                131082: '三河市'
            },
            131100: {
                131102: '桃城区',
                131121: '枣强县',
                131122: '武邑县',
                131123: '武强县',
                131124: '饶阳县',
                131125: '安平县',
                131126: '故城县',
                131127: '景县',
                131128: '阜城县',
                131181: '冀州市',
                131182: '深州市'
            },
            140000: {
                140100: '太原市',
                140200: '大同市',
                140300: '阳泉市',
                140400: '长治市',
                140500: '晋城市',
                140600: '朔州市',
                140700: '晋中市',
                140800: '运城市',
                140900: '忻州市',
                141000: '临汾市',
                141100: '吕梁市'
            },
            140100: {
                140105: '小店区',
                140106: '迎泽区',
                140107: '杏花岭区',
                140108: '尖草坪区',
                140109: '万柏林区',
                140110: '晋源区',
                140121: '清徐县',
                140122: '阳曲县',
                140123: '娄烦县',
                140181: '古交市'
            },
            140200: {
                140202: '城区',
                140203: '矿区',
                140211: '南郊区',
                140212: '新荣区',
                140221: '阳高县',
                140222: '天镇县',
                140223: '广灵县',
                140224: '灵丘县',
                140225: '浑源县',
                140226: '左云县',
                140227: '大同县'
            },
            140300: {
                140302: '城区',
                140303: '矿区',
                140311: '郊区',
                140321: '平定县',
                140322: '盂县'
            },
            140400: {
                140402: '城区',
                140411: '郊区',
                140421: '长治县',
                140423: '襄垣县',
                140424: '屯留县',
                140425: '平顺县',
                140426: '黎城县',
                140427: '壶关县',
                140428: '长子县',
                140429: '武乡县',
                140430: '沁县',
                140431: '沁源县',
                140481: '潞城市'
            },
            140500: {
                140502: '城区',
                140521: '沁水县',
                140522: '阳城县',
                140524: '陵川县',
                140525: '泽州县',
                140581: '高平市'
            },
            140600: {
                140602: '朔城区',
                140603: '平鲁区',
                140621: '山阴县',
                140622: '应县',
                140623: '右玉县',
                140624: '怀仁县'
            },
            140700: {
                140702: '榆次区',
                140721: '榆社县',
                140722: '左权县',
                140723: '和顺县',
                140724: '昔阳县',
                140725: '寿阳县',
                140726: '太谷县',
                140727: '祁县',
                140728: '平遥县',
                140729: '灵石县',
                140781: '介休市'
            },
            140800: {
                140802: '盐湖区',
                140821: '临猗县',
                140822: '万荣县',
                140823: '闻喜县',
                140824: '稷山县',
                140825: '新绛县',
                140826: '绛县',
                140827: '垣曲县',
                140828: '夏县',
                140829: '平陆县',
                140830: '芮城县',
                140881: '永济市',
                140882: '河津市'
            },
            140900: {
                140902: '忻府区',
                140921: '定襄县',
                140922: '五台县',
                140923: '代县',
                140924: '繁峙县',
                140925: '宁武县',
                140926: '静乐县',
                140927: '神池县',
                140928: '五寨县',
                140929: '岢岚县',
                140930: '河曲县',
                140931: '保德县',
                140932: '偏关县',
                140981: '原平市'
            },
            141000: {
                141002: '尧都区',
                141021: '曲沃县',
                141022: '翼城县',
                141023: '襄汾县',
                141024: '洪洞县',
                141025: '古县',
                141026: '安泽县',
                141027: '浮山县',
                141028: '吉县',
                141029: '乡宁县',
                141030: '大宁县',
                141031: '隰县',
                141032: '永和县',
                141033: '蒲县',
                141034: '汾西县',
                141081: '侯马市',
                141082: '霍州市'
            },
            141100: {
                141102: '离石区',
                141121: '文水县',
                141122: '交城县',
                141123: '兴县',
                141124: '临县',
                141125: '柳林县',
                141126: '石楼县',
                141127: '岚县',
                141128: '方山县',
                141129: '中阳县',
                141130: '交口县',
                141181: '孝义市',
                141182: '汾阳市'
            },
            150000: {
                150100: '呼和浩特市',
                150200: '包头市',
                150300: '乌海市',
                150400: '赤峰市',
                150500: '通辽市',
                150600: '鄂尔多斯市',
                150700: '呼伦贝尔市',
                150800: '巴彦淖尔市',
                150900: '乌兰察布市',
                152200: '兴安盟',
                152500: '锡林郭勒盟',
                152900: '阿拉善盟'
            },
            150100: {
                150102: '新城区',
                150103: '回民区',
                150104: '玉泉区',
                150105: '赛罕区',
                150121: '土默特左旗',
                150122: '托克托县',
                150123: '和林格尔县',
                150124: '清水河县',
                150125: '武川县'
            },
            150200: {
                150202: '东河区',
                150203: '昆都仑区',
                150204: '青山区',
                150205: '石拐区',
                150206: '白云鄂博矿区',
                150207: '九原区',
                150221: '土默特右旗',
                150222: '固阳县',
                150223: '达尔罕茂明安联合旗'
            },
            150300: {
                150302: '海勃湾区',
                150303: '海南区',
                150304: '乌达区'
            },
            150400: {
                150402: '红山区',
                150403: '元宝山区',
                150404: '松山区',
                150421: '阿鲁科尔沁旗',
                150422: '巴林左旗',
                150423: '巴林右旗',
                150424: '林西县',
                150425: '克什克腾旗',
                150426: '翁牛特旗',
                150428: '喀喇沁旗',
                150429: '宁城县',
                150430: '敖汉旗'
            },
            150500: {
                150502: '科尔沁区',
                150521: '科尔沁左翼中旗',
                150522: '科尔沁左翼后旗',
                150523: '开鲁县',
                150524: '库伦旗',
                150525: '奈曼旗',
                150526: '扎鲁特旗',
                150581: '霍林郭勒市'
            },
            150600: {
                150602: '东胜区',
                150621: '达拉特旗',
                150622: '准格尔旗',
                150623: '鄂托克前旗',
                150624: '鄂托克旗',
                150625: '杭锦旗',
                150626: '乌审旗',
                150627: '伊金霍洛旗'
            },
            150700: {
                150702: '海拉尔区',
                150703: '扎赉诺尔区',
                150721: '阿荣旗',
                150722: '莫力达瓦达斡尔族自治旗',
                150723: '鄂伦春自治旗',
                150724: '鄂温克族自治旗',
                150725: '陈巴尔虎旗',
                150726: '新巴尔虎左旗',
                150727: '新巴尔虎右旗',
                150781: '满洲里市',
                150782: '牙克石市',
                150783: '扎兰屯市',
                150784: '额尔古纳市',
                150785: '根河市'
            },
            150800: {
                150802: '临河区',
                150821: '五原县',
                150822: '磴口县',
                150823: '乌拉特前旗',
                150824: '乌拉特中旗',
                150825: '乌拉特后旗',
                150826: '杭锦后旗'
            },
            150900: {
                150902: '集宁区',
                150921: '卓资县',
                150922: '化德县',
                150923: '商都县',
                150924: '兴和县',
                150925: '凉城县',
                150926: '察哈尔右翼前旗',
                150927: '察哈尔右翼中旗',
                150928: '察哈尔右翼后旗',
                150929: '四子王旗',
                150981: '丰镇市'
            },
            152200: {
                152201: '乌兰浩特市',
                152202: '阿尔山市',
                152221: '科尔沁右翼前旗',
                152222: '科尔沁右翼中旗',
                152223: '扎赉特旗',
                152224: '突泉县'
            },
            152500: {
                152501: '二连浩特市',
                152502: '锡林浩特市',
                152522: '阿巴嘎旗',
                152523: '苏尼特左旗',
                152524: '苏尼特右旗',
                152525: '东乌珠穆沁旗',
                152526: '西乌珠穆沁旗',
                152527: '太仆寺旗',
                152528: '镶黄旗',
                152529: '正镶白旗',
                152530: '正蓝旗',
                152531: '多伦县'
            },
            152900: {
                152921: '阿拉善左旗',
                152922: '阿拉善右旗',
                152923: '额济纳旗'
            },
            210000: {
                210100: '沈阳市',
                210200: '大连市',
                210300: '鞍山市',
                210400: '抚顺市',
                210500: '本溪市',
                210600: '丹东市',
                210700: '锦州市',
                210800: '营口市',
                210900: '阜新市',
                211000: '辽阳市',
                211100: '盘锦市',
                211200: '铁岭市',
                211300: '朝阳市',
                211400: '葫芦岛市'
            },
            210100: {
                210102: '和平区',
                210103: '沈河区',
                210104: '大东区',
                210105: '皇姑区',
                210106: '铁西区',
                210111: '苏家屯区',
                210112: '浑南区',
                210113: '沈北新区',
                210114: '于洪区',
                210122: '辽中县',
                210123: '康平县',
                210124: '法库县',
                210181: '新民市'
            },
            210200: {
                210202: '中山区',
                210203: '西岗区',
                210204: '沙河口区',
                210211: '甘井子区',
                210212: '旅顺口区',
                210213: '金州区',
                210224: '长海县',
                210281: '瓦房店市',
                210282: '普兰店市',
                210283: '庄河市'
            },
            210300: {
                210302: '铁东区',
                210303: '铁西区',
                210304: '立山区',
                210311: '千山区',
                210321: '台安县',
                210323: '岫岩满族自治县',
                210381: '海城市'
            },
            210400: {
                210402: '新抚区',
                210403: '东洲区',
                210404: '望花区',
                210411: '顺城区',
                210421: '抚顺县',
                210422: '新宾满族自治县',
                210423: '清原满族自治县'
            },
            210500: {
                210502: '平山区',
                210503: '溪湖区',
                210504: '明山区',
                210505: '南芬区',
                210521: '本溪满族自治县',
                210522: '桓仁满族自治县'
            },
            210600: {
                210602: '元宝区',
                210603: '振兴区',
                210604: '振安区',
                210624: '宽甸满族自治县',
                210681: '东港市',
                210682: '凤城市'
            },
            210700: {
                210702: '古塔区',
                210703: '凌河区',
                210711: '太和区',
                210726: '黑山县',
                210727: '义县',
                210781: '凌海市',
                210782: '北镇市'
            },
            210800: {
                210802: '站前区',
                210803: '西市区',
                210804: '鲅鱼圈区',
                210811: '老边区',
                210881: '盖州市',
                210882: '大石桥市'
            },
            210900: {
                210902: '海州区',
                210903: '新邱区',
                210904: '太平区',
                210905: '清河门区',
                210911: '细河区',
                210921: '阜新蒙古族自治县',
                210922: '彰武县'
            },
            211000: {
                211002: '白塔区',
                211003: '文圣区',
                211004: '宏伟区',
                211005: '弓长岭区',
                211011: '太子河区',
                211021: '辽阳县',
                211081: '灯塔市'
            },
            211100: {
                211102: '双台子区',
                211103: '兴隆台区',
                211121: '大洼县',
                211122: '盘山县'
            },
            211200: {
                211202: '银州区',
                211204: '清河区',
                211221: '铁岭县',
                211223: '西丰县',
                211224: '昌图县',
                211281: '调兵山市',
                211282: '开原市'
            },
            211300: {
                211302: '双塔区',
                211303: '龙城区',
                211321: '朝阳县',
                211322: '建平县',
                211324: '喀喇沁左翼蒙古族自治县',
                211381: '北票市',
                211382: '凌源市'
            },
            211400: {
                211402: '连山区',
                211403: '龙港区',
                211404: '南票区',
                211421: '绥中县',
                211422: '建昌县',
                211481: '兴城市'
            },
            220000: {
                220100: '长春市',
                220200: '吉林市',
                220300: '四平市',
                220400: '辽源市',
                220500: '通化市',
                220600: '白山市',
                220700: '松原市',
                220800: '白城市',
                222400: '延边朝鲜族自治州'
            },
            220100: {
                220102: '南关区',
                220103: '宽城区',
                220104: '朝阳区',
                220105: '二道区',
                220106: '绿园区',
                220112: '双阳区',
                220113: '九台区',
                220122: '农安县',
                220182: '榆树市',
                220183: '德惠市'
            },
            220200: {
                220202: '昌邑区',
                220203: '龙潭区',
                220204: '船营区',
                220211: '丰满区',
                220221: '永吉县',
                220281: '蛟河市',
                220282: '桦甸市',
                220283: '舒兰市',
                220284: '磐石市'
            },
            220300: {
                220302: '铁西区',
                220303: '铁东区',
                220322: '梨树县',
                220323: '伊通满族自治县',
                220381: '公主岭市',
                220382: '双辽市'
            },
            220400: {
                220402: '龙山区',
                220403: '西安区',
                220421: '东丰县',
                220422: '东辽县'
            },
            220500: {
                220502: '东昌区',
                220503: '二道江区',
                220521: '通化县',
                220523: '辉南县',
                220524: '柳河县',
                220581: '梅河口市',
                220582: '集安市'
            },
            220600: {
                220602: '浑江区',
                220605: '江源区',
                220621: '抚松县',
                220622: '靖宇县',
                220623: '长白朝鲜族自治县',
                220681: '临江市'
            },
            220700: {
                220702: '宁江区',
                220721: '前郭尔罗斯蒙古族自治县',
                220722: '长岭县',
                220723: '乾安县',
                220781: '扶余市'
            },
            220800: {
                220802: '洮北区',
                220821: '镇赉县',
                220822: '通榆县',
                220881: '洮南市',
                220882: '大安市'
            },
            222400: {
                222401: '延吉市',
                222402: '图们市',
                222403: '敦化市',
                222404: '珲春市',
                222405: '龙井市',
                222406: '和龙市',
                222424: '汪清县',
                222426: '安图县'
            },
            230000: {
                230100: '哈尔滨市',
                230200: '齐齐哈尔市',
                230300: '鸡西市',
                230400: '鹤岗市',
                230500: '双鸭山市',
                230600: '大庆市',
                230700: '伊春市',
                230800: '佳木斯市',
                230900: '七台河市',
                231000: '牡丹江市',
                231100: '黑河市',
                231200: '绥化市',
                232700: '大兴安岭地区'
            },
            230100: {
                230102: '道里区',
                230103: '南岗区',
                230104: '道外区',
                230108: '平房区',
                230109: '松北区',
                230110: '香坊区',
                230111: '呼兰区',
                230112: '阿城区',
                230113: '双城区',
                230123: '依兰县',
                230124: '方正县',
                230125: '宾县',
                230126: '巴彦县',
                230127: '木兰县',
                230128: '通河县',
                230129: '延寿县',
                230183: '尚志市',
                230184: '五常市'
            },
            230200: {
                230202: '龙沙区',
                230203: '建华区',
                230204: '铁锋区',
                230205: '昂昂溪区',
                230206: '富拉尔基区',
                230207: '碾子山区',
                230208: '梅里斯达斡尔族区',
                230221: '龙江县',
                230223: '依安县',
                230224: '泰来县',
                230225: '甘南县',
                230227: '富裕县',
                230229: '克山县',
                230230: '克东县',
                230231: '拜泉县',
                230281: '讷河市'
            },
            230300: {
                230302: '鸡冠区',
                230303: '恒山区',
                230304: '滴道区',
                230305: '梨树区',
                230306: '城子河区',
                230307: '麻山区',
                230321: '鸡东县',
                230381: '虎林市',
                230382: '密山市'
            },
            230400: {
                230402: '向阳区',
                230403: '工农区',
                230404: '南山区',
                230405: '兴安区',
                230406: '东山区',
                230407: '兴山区',
                230421: '萝北县',
                230422: '绥滨县'
            },
            230500: {
                230502: '尖山区',
                230503: '岭东区',
                230505: '四方台区',
                230506: '宝山区',
                230521: '集贤县',
                230522: '友谊县',
                230523: '宝清县',
                230524: '饶河县'
            },
            230600: {
                230602: '萨尔图区',
                230603: '龙凤区',
                230604: '让胡路区',
                230605: '红岗区',
                230606: '大同区',
                230621: '肇州县',
                230622: '肇源县',
                230623: '林甸县',
                230624: '杜尔伯特蒙古族自治县'
            },
            230700: {
                230702: '伊春区',
                230703: '南岔区',
                230704: '友好区',
                230705: '西林区',
                230706: '翠峦区',
                230707: '新青区',
                230708: '美溪区',
                230709: '金山屯区',
                230710: '五营区',
                230711: '乌马河区',
                230712: '汤旺河区',
                230713: '带岭区',
                230714: '乌伊岭区',
                230715: '红星区',
                230716: '上甘岭区',
                230722: '嘉荫县',
                230781: '铁力市'
            },
            230800: {
                230803: '向阳区',
                230804: '前进区',
                230805: '东风区',
                230811: '郊区',
                230822: '桦南县',
                230826: '桦川县',
                230828: '汤原县',
                230833: '抚远县',
                230881: '同江市',
                230882: '富锦市'
            },
            230900: {
                230902: '新兴区',
                230903: '桃山区',
                230904: '茄子河区',
                230921: '勃利县'
            },
            231000: {
                231002: '东安区',
                231003: '阳明区',
                231004: '爱民区',
                231005: '西安区',
                231024: '东宁县',
                231025: '林口县',
                231081: '绥芬河市',
                231083: '海林市',
                231084: '宁安市',
                231085: '穆棱市'
            },
            231100: {
                231102: '爱辉区',
                231121: '嫩江县',
                231123: '逊克县',
                231124: '孙吴县',
                231181: '北安市',
                231182: '五大连池市'
            },
            231200: {
                231202: '北林区',
                231221: '望奎县',
                231222: '兰西县',
                231223: '青冈县',
                231224: '庆安县',
                231225: '明水县',
                231226: '绥棱县',
                231281: '安达市',
                231282: '肇东市',
                231283: '海伦市'
            },
            232700: {
                232701: '加格达奇区',
                232721: '呼玛县',
                232722: '塔河县',
                232723: '漠河县'
            },
            310000: {
                310100: '上海市',
            },
            310100: {
                310101: '黄浦区',
                310104: '徐汇区',
                310105: '长宁区',
                310106: '静安区',
                310107: '普陀区',
                310108: '闸北区',
                310109: '虹口区',
                310110: '杨浦区',
                310112: '闵行区',
                310113: '宝山区',
                310114: '嘉定区',
                310115: '浦东新区',
                310116: '金山区',
                310117: '松江区',
                310118: '青浦区',
                310120: '奉贤区',
                310230: '崇明县'
            },
            320000: {
                320100: '南京市',
                320200: '无锡市',
                320300: '徐州市',
                320400: '常州市',
                320500: '苏州市',
                320600: '南通市',
                320700: '连云港市',
                320800: '淮安市',
                320900: '盐城市',
                321000: '扬州市',
                321100: '镇江市',
                321200: '泰州市',
                321300: '宿迁市'
            },
            320100: {
                320102: '玄武区',
                320104: '秦淮区',
                320105: '建邺区',
                320106: '鼓楼区',
                320111: '浦口区',
                320113: '栖霞区',
                320114: '雨花台区',
                320115: '江宁区',
                320116: '六合区',
                320117: '溧水区',
                320118: '高淳区'
            },
            320200: {
                320202: '崇安区',
                320203: '南长区',
                320204: '北塘区',
                320205: '锡山区',
                320206: '惠山区',
                320211: '滨湖区',
                320281: '江阴市',
                320282: '宜兴市'
            },
            320300: {
                320302: '鼓楼区',
                320303: '云龙区',
                320305: '贾汪区',
                320311: '泉山区',
                320312: '铜山区',
                320321: '丰县',
                320322: '沛县',
                320324: '睢宁县',
                320381: '新沂市',
                320382: '邳州市'
            },
            320400: {
                320402: '天宁区',
                320404: '钟楼区',
                320411: '新北区',
                320412: '武进区',
                320481: '溧阳市',
                320482: '金坛区'
            },
            320500: {
                320505: '虎丘区',
                320506: '吴中区',
                320507: '相城区',
                320508: '姑苏区',
                320509: '吴江区',
                320581: '常熟市',
                320582: '张家港市',
                320583: '昆山市',
                320585: '太仓市'
            },
            320600: {
                320602: '崇川区',
                320611: '港闸区',
                320612: '通州区',
                320621: '海安县',
                320623: '如东县',
                320681: '启东市',
                320682: '如皋市',
                320684: '海门市'
            },
            320700: {
                320703: '连云区',
                320706: '海州区',
                320707: '赣榆区',
                320722: '东海县',
                320723: '灌云县',
                320724: '灌南县'
            },
            320800: {
                320802: '清河区',
                320803: '淮安区',
                320804: '淮阴区',
                320811: '清浦区',
                320826: '涟水县',
                320829: '洪泽县',
                320830: '盱眙县',
                320831: '金湖县'
            },
            320900: {
                320902: '亭湖区',
                320903: '盐都区',
                320921: '响水县',
                320922: '滨海县',
                320923: '阜宁县',
                320924: '射阳县',
                320925: '建湖县',
                320981: '东台市',
                320982: '大丰市'
            },
            321000: {
                321002: '广陵区',
                321003: '邗江区',
                321012: '江都区',
                321023: '宝应县',
                321081: '仪征市',
                321084: '高邮市'
            },
            321100: {
                321102: '京口区',
                321111: '润州区',
                321112: '丹徒区',
                321181: '丹阳市',
                321182: '扬中市',
                321183: '句容市'
            },
            321200: {
                321202: '海陵区',
                321203: '高港区',
                321204: '姜堰区',
                321281: '兴化市',
                321282: '靖江市',
                321283: '泰兴市'
            },
            321300: {
                321302: '宿城区',
                321311: '宿豫区',
                321322: '沭阳县',
                321323: '泗阳县',
                321324: '泗洪县'
            },
            330000: {
                330100: '杭州市',
                330200: '宁波市',
                330300: '温州市',
                330400: '嘉兴市',
                330500: '湖州市',
                330600: '绍兴市',
                330700: '金华市',
                330800: '衢州市',
                330900: '舟山市',
                331000: '台州市',
                331100: '丽水市'
            },
            330100: {
                330102: '上城区',
                330103: '下城区',
                330104: '江干区',
                330105: '拱墅区',
                330106: '西湖区',
                330108: '滨江区',
                330109: '萧山区',
                330110: '余杭区',
                330111: '富阳区',
                330122: '桐庐县',
                330127: '淳安县',
                330182: '建德市',
                330185: '临安市'
            },
            330200: {
                330203: '海曙区',
                330204: '江东区',
                330205: '江北区',
                330206: '北仑区',
                330211: '镇海区',
                330212: '鄞州区',
                330225: '象山县',
                330226: '宁海县',
                330281: '余姚市',
                330282: '慈溪市',
                330283: '奉化市'
            },
            330300: {
                330302: '鹿城区',
                330303: '龙湾区',
                330304: '瓯海区',
                330322: '洞头县',
                330324: '永嘉县',
                330326: '平阳县',
                330327: '苍南县',
                330328: '文成县',
                330329: '泰顺县',
                330381: '瑞安市',
                330382: '乐清市'
            },
            330400: {
                330402: '南湖区',
                330411: '秀洲区',
                330421: '嘉善县',
                330424: '海盐县',
                330481: '海宁市',
                330482: '平湖市',
                330483: '桐乡市'
            },
            330500: {
                330502: '吴兴区',
                330503: '南浔区',
                330521: '德清县',
                330522: '长兴县',
                330523: '安吉县'
            },
            330600: {
                330602: '越城区',
                330603: '柯桥区',
                330604: '上虞区',
                330624: '新昌县',
                330681: '诸暨市',
                330683: '嵊州市'
            },
            330700: {
                330702: '婺城区',
                330703: '金东区',
                330723: '武义县',
                330726: '浦江县',
                330727: '磐安县',
                330781: '兰溪市',
                330782: '义乌市',
                330783: '东阳市',
                330784: '永康市'
            },
            330800: {
                330802: '柯城区',
                330803: '衢江区',
                330822: '常山县',
                330824: '开化县',
                330825: '龙游县',
                330881: '江山市'
            },
            330900: {
                330902: '定海区',
                330903: '普陀区',
                330921: '岱山县',
                330922: '嵊泗县'
            },
            331000: {
                331002: '椒江区',
                331003: '黄岩区',
                331004: '路桥区',
                331021: '玉环县',
                331022: '三门县',
                331023: '天台县',
                331024: '仙居县',
                331081: '温岭市',
                331082: '临海市'
            },
            331100: {
                331102: '莲都区',
                331121: '青田县',
                331122: '缙云县',
                331123: '遂昌县',
                331124: '松阳县',
                331125: '云和县',
                331126: '庆元县',
                331127: '景宁畲族自治县',
                331181: '龙泉市'
            },
            340000: {
                340100: '合肥市',
                340200: '芜湖市',
                340300: '蚌埠市',
                340400: '淮南市',
                340500: '马鞍山市',
                340600: '淮北市',
                340700: '铜陵市',
                340800: '安庆市',
                341000: '黄山市',
                341100: '滁州市',
                341200: '阜阳市',
                341300: '宿州市',
                341500: '六安市',
                341600: '亳州市',
                341700: '池州市',
                341800: '宣城市'
            },
            340100: {
                340102: '瑶海区',
                340103: '庐阳区',
                340104: '蜀山区',
                340111: '包河区',
                340121: '长丰县',
                340122: '肥东县',
                340123: '肥西县',
                340124: '庐江县',
                340181: '巢湖市'
            },
            340200: {
                340202: '镜湖区',
                340203: '弋江区',
                340207: '鸠江区',
                340208: '三山区',
                340221: '芜湖县',
                340222: '繁昌县',
                340223: '南陵县',
                340225: '无为县'
            },
            340300: {
                340302: '龙子湖区',
                340303: '蚌山区',
                340304: '禹会区',
                340311: '淮上区',
                340321: '怀远县',
                340322: '五河县',
                340323: '固镇县'
            },
            340400: {
                340402: '大通区',
                340403: '田家庵区',
                340404: '谢家集区',
                340405: '八公山区',
                340406: '潘集区',
                340421: '凤台县'
            },
            340500: {
                340503: '花山区',
                340504: '雨山区',
                340506: '博望区',
                340521: '当涂县',
                340522: '含山县',
                340523: '和县'
            },
            340600: {
                340602: '杜集区',
                340603: '相山区',
                340604: '烈山区',
                340621: '濉溪县'
            },
            340700: {
                340702: '铜官山区',
                340703: '狮子山区',
                340711: '郊区',
                340721: '铜陵县'
            },
            340800: {
                340802: '迎江区',
                340803: '大观区',
                340811: '宜秀区',
                340822: '怀宁县',
                340823: '枞阳县',
                340824: '潜山县',
                340825: '太湖县',
                340826: '宿松县',
                340827: '望江县',
                340828: '岳西县',
                340881: '桐城市'
            },
            341000: {
                341002: '屯溪区',
                341003: '黄山区',
                341004: '徽州区',
                341021: '歙县',
                341022: '休宁县',
                341023: '黟县',
                341024: '祁门县'
            },
            341100: {
                341102: '琅琊区',
                341103: '南谯区',
                341122: '来安县',
                341124: '全椒县',
                341125: '定远县',
                341126: '凤阳县',
                341181: '天长市',
                341182: '明光市'
            },
            341200: {
                341202: '颍州区',
                341203: '颍东区',
                341204: '颍泉区',
                341221: '临泉县',
                341222: '太和县',
                341225: '阜南县',
                341226: '颍上县',
                341282: '界首市'
            },
            341300: {
                341302: '埇桥区',
                341321: '砀山县',
                341322: '萧县',
                341323: '灵璧县',
                341324: '泗县'
            },
            341500: {
                341502: '金安区',
                341503: '裕安区',
                341521: '寿县',
                341522: '霍邱县',
                341523: '舒城县',
                341524: '金寨县',
                341525: '霍山县'
            },
            341600: {
                341602: '谯城区',
                341621: '涡阳县',
                341622: '蒙城县',
                341623: '利辛县'
            },
            341700: {
                341702: '贵池区',
                341721: '东至县',
                341722: '石台县',
                341723: '青阳县'
            },
            341800: {
                341802: '宣州区',
                341821: '郎溪县',
                341822: '广德县',
                341823: '泾县',
                341824: '绩溪县',
                341825: '旌德县',
                341881: '宁国市'
            },
            350000: {
                350100: '福州市',
                350200: '厦门市',
                350300: '莆田市',
                350400: '三明市',
                350500: '泉州市',
                350600: '漳州市',
                350700: '南平市',
                350800: '龙岩市',
                350900: '宁德市'
            },
            350100: {
                350102: '鼓楼区',
                350103: '台江区',
                350104: '仓山区',
                350105: '马尾区',
                350111: '晋安区',
                350121: '闽侯县',
                350122: '连江县',
                350123: '罗源县',
                350124: '闽清县',
                350125: '永泰县',
                350128: '平潭县',
                350181: '福清市',
                350182: '长乐市'
            },
            350200: {
                350203: '思明区',
                350205: '海沧区',
                350206: '湖里区',
                350211: '集美区',
                350212: '同安区',
                350213: '翔安区'
            },
            350300: {
                350302: '城厢区',
                350303: '涵江区',
                350304: '荔城区',
                350305: '秀屿区',
                350322: '仙游县'
            },
            350400: {
                350402: '梅列区',
                350403: '三元区',
                350421: '明溪县',
                350423: '清流县',
                350424: '宁化县',
                350425: '大田县',
                350426: '尤溪县',
                350427: '沙县',
                350428: '将乐县',
                350429: '泰宁县',
                350430: '建宁县',
                350481: '永安市'
            },
            350500: {
                350502: '鲤城区',
                350503: '丰泽区',
                350504: '洛江区',
                350505: '泉港区',
                350521: '惠安县',
                350524: '安溪县',
                350525: '永春县',
                350526: '德化县',
                350527: '金门县',
                350581: '石狮市',
                350582: '晋江市',
                350583: '南安市'
            },
            350600: {
                350602: '芗城区',
                350603: '龙文区',
                350622: '云霄县',
                350623: '漳浦县',
                350624: '诏安县',
                350625: '长泰县',
                350626: '东山县',
                350627: '南靖县',
                350628: '平和县',
                350629: '华安县',
                350681: '龙海市'
            },
            350700: {
                350702: '延平区',
                350703: '建阳区',
                350721: '顺昌县',
                350722: '浦城县',
                350723: '光泽县',
                350724: '松溪县',
                350725: '政和县',
                350781: '邵武市',
                350782: '武夷山市',
                350783: '建瓯市'
            },
            350800: {
                350802: '新罗区',
                350803: '永定区',
                350821: '长汀县',
                350823: '上杭县',
                350824: '武平县',
                350825: '连城县',
                350881: '漳平市'
            },
            350900: {
                350902: '蕉城区',
                350921: '霞浦县',
                350922: '古田县',
                350923: '屏南县',
                350924: '寿宁县',
                350925: '周宁县',
                350926: '柘荣县',
                350981: '福安市',
                350982: '福鼎市'
            },
            360000: {
                360100: '南昌市',
                360200: '景德镇市',
                360300: '萍乡市',
                360400: '九江市',
                360500: '新余市',
                360600: '鹰潭市',
                360700: '赣州市',
                360800: '吉安市',
                360900: '宜春市',
                361000: '抚州市',
                361100: '上饶市'
            },
            360100: {
                360102: '东湖区',
                360103: '西湖区',
                360104: '青云谱区',
                360105: '湾里区',
                360111: '青山湖区',
                360121: '南昌县',
                360122: '新建县',
                360123: '安义县',
                360124: '进贤县'
            },
            360200: {
                360202: '昌江区',
                360203: '珠山区',
                360222: '浮梁县',
                360281: '乐平市'
            },
            360300: {
                360302: '安源区',
                360313: '湘东区',
                360321: '莲花县',
                360322: '上栗县',
                360323: '芦溪县'
            },
            360400: {
                360402: '庐山区',
                360403: '浔阳区',
                360421: '九江县',
                360423: '武宁县',
                360424: '修水县',
                360425: '永修县',
                360426: '德安县',
                360427: '星子县',
                360428: '都昌县',
                360429: '湖口县',
                360430: '彭泽县',
                360481: '瑞昌市',
                360482: '共青城市'
            },
            360500: {
                360502: '渝水区',
                360521: '分宜县'
            },
            360600: {
                360602: '月湖区',
                360622: '余江县',
                360681: '贵溪市'
            },
            360700: {
                360702: '章贡区',
                360703: '南康区',
                360721: '赣县',
                360722: '信丰县',
                360723: '大余县',
                360724: '上犹县',
                360725: '崇义县',
                360726: '安远县',
                360727: '龙南县',
                360728: '定南县',
                360729: '全南县',
                360730: '宁都县',
                360731: '于都县',
                360732: '兴国县',
                360733: '会昌县',
                360734: '寻乌县',
                360735: '石城县',
                360781: '瑞金市'
            },
            360800: {
                360802: '吉州区',
                360803: '青原区',
                360821: '吉安县',
                360822: '吉水县',
                360823: '峡江县',
                360824: '新干县',
                360825: '永丰县',
                360826: '泰和县',
                360827: '遂川县',
                360828: '万安县',
                360829: '安福县',
                360830: '永新县',
                360881: '井冈山市'
            },
            360900: {
                360902: '袁州区',
                360921: '奉新县',
                360922: '万载县',
                360923: '上高县',
                360924: '宜丰县',
                360925: '靖安县',
                360926: '铜鼓县',
                360981: '丰城市',
                360982: '樟树市',
                360983: '高安市'
            },
            361000: {
                361002: '临川区',
                361021: '南城县',
                361022: '黎川县',
                361023: '南丰县',
                361024: '崇仁县',
                361025: '乐安县',
                361026: '宜黄县',
                361027: '金溪县',
                361028: '资溪县',
                361029: '东乡县',
                361030: '广昌县'
            },
            361100: {
                361102: '信州区',
                361103: '广丰区',
                361121: '上饶县',
                361123: '玉山县',
                361124: '铅山县',
                361125: '横峰县',
                361126: '弋阳县',
                361127: '余干县',
                361128: '鄱阳县',
                361129: '万年县',
                361130: '婺源县',
                361181: '德兴市'
            },
            370000: {
                370100: '济南市',
                370200: '青岛市',
                370300: '淄博市',
                370400: '枣庄市',
                370500: '东营市',
                370600: '烟台市',
                370700: '潍坊市',
                370800: '济宁市',
                370900: '泰安市',
                371000: '威海市',
                371100: '日照市',
                371200: '莱芜市',
                371300: '临沂市',
                371400: '德州市',
                371500: '聊城市',
                371600: '滨州市',
                371700: '菏泽市'
            },
            370100: {
                370102: '历下区',
                370103: '市中区',
                370104: '槐荫区',
                370105: '天桥区',
                370112: '历城区',
                370113: '长清区',
                370124: '平阴县',
                370125: '济阳县',
                370126: '商河县',
                370181: '章丘市'
            },
            370200: {
                370202: '市南区',
                370203: '市北区',
                370211: '黄岛区',
                370212: '崂山区',
                370213: '李沧区',
                370214: '城阳区',
                370281: '胶州市',
                370282: '即墨市',
                370283: '平度市',
                370285: '莱西市'
            },
            370300: {
                370302: '淄川区',
                370303: '张店区',
                370304: '博山区',
                370305: '临淄区',
                370306: '周村区',
                370321: '桓台县',
                370322: '高青县',
                370323: '沂源县'
            },
            370400: {
                370402: '市中区',
                370403: '薛城区',
                370404: '峄城区',
                370405: '台儿庄区',
                370406: '山亭区',
                370481: '滕州市'
            },
            370500: {
                370502: '东营区',
                370503: '河口区',
                370521: '垦利县',
                370522: '利津县',
                370523: '广饶县'
            },
            370600: {
                370602: '芝罘区',
                370611: '福山区',
                370612: '牟平区',
                370613: '莱山区',
                370634: '长岛县',
                370681: '龙口市',
                370682: '莱阳市',
                370683: '莱州市',
                370684: '蓬莱市',
                370685: '招远市',
                370686: '栖霞市',
                370687: '海阳市'
            },
            370700: {
                370702: '潍城区',
                370703: '寒亭区',
                370704: '坊子区',
                370705: '奎文区',
                370724: '临朐县',
                370725: '昌乐县',
                370781: '青州市',
                370782: '诸城市',
                370783: '寿光市',
                370784: '安丘市',
                370785: '高密市',
                370786: '昌邑市'
            },
            370800: {
                370811: '任城区',
                370812: '兖州区',
                370826: '微山县',
                370827: '鱼台县',
                370828: '金乡县',
                370829: '嘉祥县',
                370830: '汶上县',
                370831: '泗水县',
                370832: '梁山县',
                370881: '曲阜市',
                370883: '邹城市'
            },
            370900: {
                370902: '泰山区',
                370911: '岱岳区',
                370921: '宁阳县',
                370923: '东平县',
                370982: '新泰市',
                370983: '肥城市'
            },
            371000: {
                371002: '环翠区',
                371003: '文登区',
                371082: '荣成市',
                371083: '乳山市'
            },
            371100: {
                371102: '东港区',
                371103: '岚山区',
                371121: '五莲县',
                371122: '莒县'
            },
            371200: {
                371202: '莱城区',
                371203: '钢城区'
            },
            371300: {
                371302: '兰山区',
                371311: '罗庄区',
                371312: '河东区',
                371321: '沂南县',
                371322: '郯城县',
                371323: '沂水县',
                371324: '兰陵县',
                371325: '费县',
                371326: '平邑县',
                371327: '莒南县',
                371328: '蒙阴县',
                371329: '临沭县'
            },
            371400: {
                371402: '德城区',
                371403: '陵城区',
                371422: '宁津县',
                371423: '庆云县',
                371424: '临邑县',
                371425: '齐河县',
                371426: '平原县',
                371427: '夏津县',
                371428: '武城县',
                371481: '乐陵市',
                371482: '禹城市'
            },
            371500: {
                371502: '东昌府区',
                371521: '阳谷县',
                371522: '莘县',
                371523: '茌平县',
                371524: '东阿县',
                371525: '冠县',
                371526: '高唐县',
                371581: '临清市'
            },
            371600: {
                371602: '滨城区',
                371603: '沾化区',
                371621: '惠民县',
                371622: '阳信县',
                371623: '无棣县',
                371625: '博兴县',
                371626: '邹平县'
            },
            371700: {
                371702: '牡丹区',
                371721: '曹县',
                371722: '单县',
                371723: '成武县',
                371724: '巨野县',
                371725: '郓城县',
                371726: '鄄城县',
                371727: '定陶县',
                371728: '东明县'
            },
            410000: {
                410100: '郑州市',
                410200: '开封市',
                410300: '洛阳市',
                410400: '平顶山市',
                410500: '安阳市',
                410600: '鹤壁市',
                410700: '新乡市',
                410800: '焦作市',
                410900: '濮阳市',
                411000: '许昌市',
                411100: '漯河市',
                411200: '三门峡市',
                411300: '南阳市',
                411400: '商丘市',
                411500: '信阳市',
                411600: '周口市',
                411700: '驻马店市',
                419001: '济源市'
            },
            410100: {
                410102: '中原区',
                410103: '二七区',
                410104: '管城回族区',
                410105: '金水区',
                410106: '上街区',
                410108: '惠济区',
                410122: '中牟县',
                410181: '巩义市',
                410182: '荥阳市',
                410183: '新密市',
                410184: '新郑市',
                410185: '登封市'
            },
            410200: {
                410202: '龙亭区',
                410203: '顺河回族区',
                410204: '鼓楼区',
                410205: '禹王台区',
                410212: '祥符区',
                410221: '杞县',
                410222: '通许县',
                410223: '尉氏县',
                410225: '兰考县'
            },
            410300: {
                410302: '老城区',
                410303: '西工区',
                410304: '瀍河回族区',
                410305: '涧西区',
                410306: '吉利区',
                410311: '洛龙区',
                410322: '孟津县',
                410323: '新安县',
                410324: '栾川县',
                410325: '嵩县',
                410326: '汝阳县',
                410327: '宜阳县',
                410328: '洛宁县',
                410329: '伊川县',
                410381: '偃师市'
            },
            410400: {
                410402: '新华区',
                410403: '卫东区',
                410404: '石龙区',
                410411: '湛河区',
                410421: '宝丰县',
                410422: '叶县',
                410423: '鲁山县',
                410425: '郏县',
                410481: '舞钢市',
                410482: '汝州市'
            },
            410500: {
                410502: '文峰区',
                410503: '北关区',
                410505: '殷都区',
                410506: '龙安区',
                410522: '安阳县',
                410523: '汤阴县',
                410526: '滑县',
                410527: '内黄县',
                410581: '林州市'
            },
            410600: {
                410602: '鹤山区',
                410603: '山城区',
                410611: '淇滨区',
                410621: '浚县',
                410622: '淇县'
            },
            410700: {
                410702: '红旗区',
                410703: '卫滨区',
                410704: '凤泉区',
                410711: '牧野区',
                410721: '新乡县',
                410724: '获嘉县',
                410725: '原阳县',
                410726: '延津县',
                410727: '封丘县',
                410728: '长垣县',
                410781: '卫辉市',
                410782: '辉县市'
            },
            410800: {
                410802: '解放区',
                410803: '中站区',
                410804: '马村区',
                410811: '山阳区',
                410821: '修武县',
                410822: '博爱县',
                410823: '武陟县',
                410825: '温县',
                410882: '沁阳市',
                410883: '孟州市'
            },
            410900: {
                410902: '华龙区',
                410922: '清丰县',
                410923: '南乐县',
                410926: '范县',
                410927: '台前县',
                410928: '濮阳县'
            },
            411000: {
                411002: '魏都区',
                411023: '许昌县',
                411024: '鄢陵县',
                411025: '襄城县',
                411081: '禹州市',
                411082: '长葛市'
            },
            411100: {
                411102: '源汇区',
                411103: '郾城区',
                411104: '召陵区',
                411121: '舞阳县',
                411122: '临颍县'
            },
            411200: {
                411202: '湖滨区',
                411203: '陕州区',
                411221: '渑池县',
                411224: '卢氏县',
                411281: '义马市',
                411282: '灵宝市'
            },
            411300: {
                411302: '宛城区',
                411303: '卧龙区',
                411321: '南召县',
                411322: '方城县',
                411323: '西峡县',
                411324: '镇平县',
                411325: '内乡县',
                411326: '淅川县',
                411327: '社旗县',
                411328: '唐河县',
                411329: '新野县',
                411330: '桐柏县',
                411381: '邓州市'
            },
            411400: {
                411402: '梁园区',
                411403: '睢阳区',
                411421: '民权县',
                411422: '睢县',
                411423: '宁陵县',
                411424: '柘城县',
                411425: '虞城县',
                411426: '夏邑县',
                411481: '永城市'
            },
            411500: {
                411502: '浉河区',
                411503: '平桥区',
                411521: '罗山县',
                411522: '光山县',
                411523: '新县',
                411524: '商城县',
                411525: '固始县',
                411526: '潢川县',
                411527: '淮滨县',
                411528: '息县'
            },
            411600: {
                411602: '川汇区',
                411621: '扶沟县',
                411622: '西华县',
                411623: '商水县',
                411624: '沈丘县',
                411625: '郸城县',
                411626: '淮阳县',
                411627: '太康县',
                411628: '鹿邑县',
                411681: '项城市'
            },
            411700: {
                411702: '驿城区',
                411721: '西平县',
                411722: '上蔡县',
                411723: '平舆县',
                411724: '正阳县',
                411725: '确山县',
                411726: '泌阳县',
                411727: '汝南县',
                411728: '遂平县',
                411729: '新蔡县'
            },
            420000: {
                420100: '武汉市',
                420200: '黄石市',
                420300: '十堰市',
                420500: '宜昌市',
                420600: '襄阳市',
                420700: '鄂州市',
                420800: '荆门市',
                420900: '孝感市',
                421000: '荆州市',
                421100: '黄冈市',
                421200: '咸宁市',
                421300: '随州市',
                422800: '恩施土家族苗族自治州',
                429004: '仙桃市',
                429005: '潜江市',
                429006: '天门市',
                429021: '神农架林区'
            },
            420100: {
                420102: '江岸区',
                420103: '江汉区',
                420104: '硚口区',
                420105: '汉阳区',
                420106: '武昌区',
                420107: '青山区',
                420111: '洪山区',
                420112: '东西湖区',
                420113: '汉南区',
                420114: '蔡甸区',
                420115: '江夏区',
                420116: '黄陂区',
                420117: '新洲区'
            },
            420200: {
                420202: '黄石港区',
                420203: '西塞山区',
                420204: '下陆区',
                420205: '铁山区',
                420222: '阳新县',
                420281: '大冶市'
            },
            420300: {
                420302: '茅箭区',
                420303: '张湾区',
                420304: '郧阳区',
                420322: '郧西县',
                420323: '竹山县',
                420324: '竹溪县',
                420325: '房县',
                420381: '丹江口市'
            },
            420500: {
                420502: '西陵区',
                420503: '伍家岗区',
                420504: '点军区',
                420505: '猇亭区',
                420506: '夷陵区',
                420525: '远安县',
                420526: '兴山县',
                420527: '秭归县',
                420528: '长阳土家族自治县',
                420529: '五峰土家族自治县',
                420581: '宜都市',
                420582: '当阳市',
                420583: '枝江市'
            },
            420600: {
                420602: '襄城区',
                420606: '樊城区',
                420607: '襄州区',
                420624: '南漳县',
                420625: '谷城县',
                420626: '保康县',
                420682: '老河口市',
                420683: '枣阳市',
                420684: '宜城市'
            },
            420700: {
                420702: '梁子湖区',
                420703: '华容区',
                420704: '鄂城区'
            },
            420800: {
                420802: '东宝区',
                420804: '掇刀区',
                420821: '京山县',
                420822: '沙洋县',
                420881: '钟祥市'
            },
            420900: {
                420902: '孝南区',
                420921: '孝昌县',
                420922: '大悟县',
                420923: '云梦县',
                420981: '应城市',
                420982: '安陆市',
                420984: '汉川市'
            },
            421000: {
                421002: '沙市区',
                421003: '荆州区',
                421022: '公安县',
                421023: '监利县',
                421024: '江陵县',
                421081: '石首市',
                421083: '洪湖市',
                421087: '松滋市'
            },
            421100: {
                421102: '黄州区',
                421121: '团风县',
                421122: '红安县',
                421123: '罗田县',
                421124: '英山县',
                421125: '浠水县',
                421126: '蕲春县',
                421127: '黄梅县',
                421181: '麻城市',
                421182: '武穴市'
            },
            421200: {
                421202: '咸安区',
                421221: '嘉鱼县',
                421222: '通城县',
                421223: '崇阳县',
                421224: '通山县',
                421281: '赤壁市'
            },
            421300: {
                421303: '曾都区',
                421321: '随县',
                421381: '广水市'
            },
            422800: {
                422801: '恩施市',
                422802: '利川市',
                422822: '建始县',
                422823: '巴东县',
                422825: '宣恩县',
                422826: '咸丰县',
                422827: '来凤县',
                422828: '鹤峰县'
            },
            430000: {
                430100: '长沙市',
                430200: '株洲市',
                430300: '湘潭市',
                430400: '衡阳市',
                430500: '邵阳市',
                430600: '岳阳市',
                430700: '常德市',
                430800: '张家界市',
                430900: '益阳市',
                431000: '郴州市',
                431100: '永州市',
                431200: '怀化市',
                431300: '娄底市',
                433100: '湘西土家族苗族自治州'
            },
            430100: {
                430102: '芙蓉区',
                430103: '天心区',
                430104: '岳麓区',
                430105: '开福区',
                430111: '雨花区',
                430112: '望城区',
                430121: '长沙县',
                430124: '宁乡县',
                430181: '浏阳市'
            },
            430200: {
                430202: '荷塘区',
                430203: '芦淞区',
                430204: '石峰区',
                430211: '天元区',
                430221: '株洲县',
                430223: '攸县',
                430224: '茶陵县',
                430225: '炎陵县',
                430281: '醴陵市'
            },
            430300: {
                430302: '雨湖区',
                430304: '岳塘区',
                430321: '湘潭县',
                430381: '湘乡市',
                430382: '韶山市'
            },
            430400: {
                430405: '珠晖区',
                430406: '雁峰区',
                430407: '石鼓区',
                430408: '蒸湘区',
                430412: '南岳区',
                430421: '衡阳县',
                430422: '衡南县',
                430423: '衡山县',
                430424: '衡东县',
                430426: '祁东县',
                430481: '耒阳市',
                430482: '常宁市'
            },
            430500: {
                430502: '双清区',
                430503: '大祥区',
                430511: '北塔区',
                430521: '邵东县',
                430522: '新邵县',
                430523: '邵阳县',
                430524: '隆回县',
                430525: '洞口县',
                430527: '绥宁县',
                430528: '新宁县',
                430529: '城步苗族自治县',
                430581: '武冈市'
            },
            430600: {
                430602: '岳阳楼区',
                430603: '云溪区',
                430611: '君山区',
                430621: '岳阳县',
                430623: '华容县',
                430624: '湘阴县',
                430626: '平江县',
                430681: '汨罗市',
                430682: '临湘市'
            },
            430700: {
                430702: '武陵区',
                430703: '鼎城区',
                430721: '安乡县',
                430722: '汉寿县',
                430723: '澧县',
                430724: '临澧县',
                430725: '桃源县',
                430726: '石门县',
                430781: '津市市'
            },
            430800: {
                430802: '永定区',
                430811: '武陵源区',
                430821: '慈利县',
                430822: '桑植县'
            },
            430900: {
                430902: '资阳区',
                430903: '赫山区',
                430921: '南县',
                430922: '桃江县',
                430923: '安化县',
                430981: '沅江市'
            },
            431000: {
                431002: '北湖区',
                431003: '苏仙区',
                431021: '桂阳县',
                431022: '宜章县',
                431023: '永兴县',
                431024: '嘉禾县',
                431025: '临武县',
                431026: '汝城县',
                431027: '桂东县',
                431028: '安仁县',
                431081: '资兴市'
            },
            431100: {
                431102: '零陵区',
                431103: '冷水滩区',
                431121: '祁阳县',
                431122: '东安县',
                431123: '双牌县',
                431124: '道县',
                431125: '江永县',
                431126: '宁远县',
                431127: '蓝山县',
                431128: '新田县',
                431129: '江华瑶族自治县'
            },
            431200: {
                431202: '鹤城区',
                431221: '中方县',
                431222: '沅陵县',
                431223: '辰溪县',
                431224: '溆浦县',
                431225: '会同县',
                431226: '麻阳苗族自治县',
                431227: '新晃侗族自治县',
                431228: '芷江侗族自治县',
                431229: '靖州苗族侗族自治县',
                431230: '通道侗族自治县',
                431281: '洪江市'
            },
            431300: {
                431302: '娄星区',
                431321: '双峰县',
                431322: '新化县',
                431381: '冷水江市',
                431382: '涟源市'
            },
            433100: {
                433101: '吉首市',
                433122: '泸溪县',
                433123: '凤凰县',
                433124: '花垣县',
                433125: '保靖县',
                433126: '古丈县',
                433127: '永顺县',
                433130: '龙山县'
            },
            440000: {
                440100: '广州市',
                440200: '韶关市',
                440300: '深圳市',
                440400: '珠海市',
                440500: '汕头市',
                440600: '佛山市',
                440700: '江门市',
                440800: '湛江市',
                440900: '茂名市',
                441200: '肇庆市',
                441300: '惠州市',
                441400: '梅州市',
                441500: '汕尾市',
                441600: '河源市',
                441700: '阳江市',
                441800: '清远市',
                441900: '东莞市',
                442000: '中山市',
                445100: '潮州市',
                445200: '揭阳市',
                445300: '云浮市'
            },
            440100: {
                440103: '荔湾区',
                440104: '越秀区',
                440105: '海珠区',
                440106: '天河区',
                440111: '白云区',
                440112: '黄埔区',
                440113: '番禺区',
                440114: '花都区',
                440115: '南沙区',
                440117: '从化区',
                440118: '增城区'
            },
            440200: {
                440203: '武江区',
                440204: '浈江区',
                440205: '曲江区',
                440222: '始兴县',
                440224: '仁化县',
                440229: '翁源县',
                440232: '乳源瑶族自治县',
                440233: '新丰县',
                440281: '乐昌市',
                440282: '南雄市'
            },
            440300: {
                440303: '罗湖区',
                440304: '福田区',
                440305: '南山区',
                440306: '宝安区',
                440307: '龙岗区',
                440308: '盐田区'
            },
            440400: {
                440402: '香洲区',
                440403: '斗门区',
                440404: '金湾区'
            },
            440500: {
                440507: '龙湖区',
                440511: '金平区',
                440512: '濠江区',
                440513: '潮阳区',
                440514: '潮南区',
                440515: '澄海区',
                440523: '南澳县'
            },
            440600: {
                440604: '禅城区',
                440605: '南海区',
                440606: '顺德区',
                440607: '三水区',
                440608: '高明区'
            },
            440700: {
                440703: '蓬江区',
                440704: '江海区',
                440705: '新会区',
                440781: '台山市',
                440783: '开平市',
                440784: '鹤山市',
                440785: '恩平市'
            },
            440800: {
                440802: '赤坎区',
                440803: '霞山区',
                440804: '坡头区',
                440811: '麻章区',
                440823: '遂溪县',
                440825: '徐闻县',
                440881: '廉江市',
                440882: '雷州市',
                440883: '吴川市'
            },
            440900: {
                440902: '茂南区',
                440904: '电白区',
                440981: '高州市',
                440982: '化州市',
                440983: '信宜市'
            },
            441200: {
                441202: '端州区',
                441203: '鼎湖区',
                441223: '广宁县',
                441224: '怀集县',
                441225: '封开县',
                441226: '德庆县',
                441283: '高要区',
                441284: '四会市'
            },
            441300: {
                441302: '惠城区',
                441303: '惠阳区',
                441322: '博罗县',
                441323: '惠东县',
                441324: '龙门县'
            },
            441400: {
                441402: '梅江区',
                441403: '梅县区',
                441422: '大埔县',
                441423: '丰顺县',
                441424: '五华县',
                441426: '平远县',
                441427: '蕉岭县',
                441481: '兴宁市'
            },
            441500: {
                441502: '城区',
                441521: '海丰县',
                441523: '陆河县',
                441581: '陆丰市'
            },
            441600: {
                441602: '源城区',
                441621: '紫金县',
                441622: '龙川县',
                441623: '连平县',
                441624: '和平县',
                441625: '东源县'
            },
            441700: {
                441702: '江城区',
                441704: '阳东区',
                441721: '阳西县',
                441781: '阳春市'
            },
            441800: {
                441802: '清城区',
                441803: '清新区',
                441821: '佛冈县',
                441823: '阳山县',
                441825: '连山壮族瑶族自治县',
                441826: '连南瑶族自治县',
                441881: '英德市',
                441882: '连州市'
            },
            441900: {
                441900: '三元里'
            },
            442000: {
                442000: '湖滨北路'
            },
            445100: {
                445102: '湘桥区',
                445103: '潮安区',
                445122: '饶平县'
            },
            445200: {
                445202: '榕城区',
                445203: '揭东区',
                445222: '揭西县',
                445224: '惠来县',
                445281: '普宁市'
            },
            445300: {
                445302: '云城区',
                445303: '云安区',
                445321: '新兴县',
                445322: '郁南县',
                445381: '罗定市'
            },
            450000: {
                450100: '南宁市',
                450200: '柳州市',
                450300: '桂林市',
                450400: '梧州市',
                450500: '北海市',
                450600: '防城港市',
                450700: '钦州市',
                450800: '贵港市',
                450900: '玉林市',
                451000: '百色市',
                451100: '贺州市',
                451200: '河池市',
                451300: '来宾市',
                451400: '崇左市'
            },
            450100: {
                450102: '兴宁区',
                450103: '青秀区',
                450105: '江南区',
                450107: '西乡塘区',
                450108: '良庆区',
                450109: '邕宁区',
                450110: '武鸣区',
                450123: '隆安县',
                450124: '马山县',
                450125: '上林县',
                450126: '宾阳县',
                450127: '横县'
            },
            450200: {
                450202: '城中区',
                450203: '鱼峰区',
                450204: '柳南区',
                450205: '柳北区',
                450221: '柳江县',
                450222: '柳城县',
                450223: '鹿寨县',
                450224: '融安县',
                450225: '融水苗族自治县',
                450226: '三江侗族自治县'
            },
            450300: {
                450302: '秀峰区',
                450303: '叠彩区',
                450304: '象山区',
                450305: '七星区',
                450311: '雁山区',
                450312: '临桂区',
                450321: '阳朔县',
                450323: '灵川县',
                450324: '全州县',
                450325: '兴安县',
                450326: '永福县',
                450327: '灌阳县',
                450328: '龙胜各族自治县',
                450329: '资源县',
                450330: '平乐县',
                450331: '荔浦县',
                450332: '恭城瑶族自治县'
            },
            450400: {
                450403: '万秀区',
                450405: '长洲区',
                450406: '龙圩区',
                450421: '苍梧县',
                450422: '藤县',
                450423: '蒙山县',
                450481: '岑溪市'
            },
            450500: {
                450502: '海城区',
                450503: '银海区',
                450512: '铁山港区',
                450521: '合浦县'
            },
            450600: {
                450602: '港口区',
                450603: '防城区',
                450621: '上思县',
                450681: '东兴市'
            },
            450700: {
                450702: '钦南区',
                450703: '钦北区',
                450721: '灵山县',
                450722: '浦北县'
            },
            450800: {
                450802: '港北区',
                450803: '港南区',
                450804: '覃塘区',
                450821: '平南县',
                450881: '桂平市'
            },
            450900: {
                450902: '玉州区',
                450903: '福绵区',
                450921: '容县',
                450922: '陆川县',
                450923: '博白县',
                450924: '兴业县',
                450981: '北流市'
            },
            451000: {
                451002: '右江区',
                451021: '田阳县',
                451022: '田东县',
                451023: '平果县',
                451024: '德保县',
                451025: '靖西县',
                451026: '那坡县',
                451027: '凌云县',
                451028: '乐业县',
                451029: '田林县',
                451030: '西林县',
                451031: '隆林各族自治县'
            },
            451100: {
                451102: '八步区',
                451121: '昭平县',
                451122: '钟山县',
                451123: '富川瑶族自治县'
            },
            451200: {
                451202: '金城江区',
                451221: '南丹县',
                451222: '天峨县',
                451223: '凤山县',
                451224: '东兰县',
                451225: '罗城仫佬族自治县',
                451226: '环江毛南族自治县',
                451227: '巴马瑶族自治县',
                451228: '都安瑶族自治县',
                451229: '大化瑶族自治县',
                451281: '宜州市'
            },
            451300: {
                451302: '兴宾区',
                451321: '忻城县',
                451322: '象州县',
                451323: '武宣县',
                451324: '金秀瑶族自治县',
                451381: '合山市'
            },
            451400: {
                451402: '江州区',
                451421: '扶绥县',
                451422: '宁明县',
                451423: '龙州县',
                451424: '大新县',
                451425: '天等县',
                451481: '凭祥市'
            },
            460000: {
                460100: '海口市',
                460200: '三亚市',
                460300: '三沙市',
                460400: '儋州市',
                469001: '五指山市',
                469002: '琼海市',
                469005: '文昌市',
                469006: '万宁市',
                469007: '东方市',
                469021: '定安县',
                469022: '屯昌县',
                469023: '澄迈县',
                469024: '临高县',
                469025: '白沙黎族自治县',
                469026: '昌江黎族自治县',
                469027: '乐东黎族自治县',
                469028: '陵水黎族自治县',
                469029: '保亭黎族苗族自治县',
                469030: '琼中黎族苗族自治县'
            },
            460100: {
                460105: '秀英区',
                460106: '龙华区',
                460107: '琼山区',
                460108: '美兰区'
            },
            460200: {
                460200: '三亚湾',
                460202: '海棠区',
                460203: '吉阳区',
                460204: '天涯区',
                460205: '崖州区'
            },
            460300: {
                460321: '西沙群岛',
                460322: '南沙群岛',
                460323: '中沙群岛的岛礁及其海域'
            },
            500000: {
                500100: '重庆市',
            },
            500100: {
                500101: '万州区',
                500102: '涪陵区',
                500103: '渝中区',
                500104: '大渡口区',
                500105: '江北区',
                500106: '沙坪坝区',
                500107: '九龙坡区',
                500108: '南岸区',
                500109: '北碚区',
                500110: '綦江区',
                500111: '大足区',
                500112: '渝北区',
                500113: '巴南区',
                500114: '黔江区',
                500115: '长寿区',
                500116: '江津区',
                500117: '合川区',
                500118: '永川区',
                500119: '南川区',
                500120: '璧山区',
                500151: '铜梁区',
                500223: '潼南区',
                500226: '荣昌区',
                500228: '梁平县',
                500229: '城口县',
                500230: '丰都县',
                500231: '垫江县',
                500232: '武隆县',
                500233: '忠县',
                500234: '开县',
                500235: '云阳县',
                500236: '奉节县',
                500237: '巫山县',
                500238: '巫溪县',
                500240: '石柱土家族自治县',
                500241: '秀山土家族苗族自治县',
                500242: '酉阳土家族苗族自治县',
                500243: '彭水苗族土家族自治县'
            },
            510000: {
                510100: '成都市',
                510300: '自贡市',
                510400: '攀枝花市',
                510500: '泸州市',
                510600: '德阳市',
                510700: '绵阳市',
                510800: '广元市',
                510900: '遂宁市',
                511000: '内江市',
                511100: '乐山市',
                511300: '南充市',
                511400: '眉山市',
                511500: '宜宾市',
                511600: '广安市',
                511700: '达州市',
                511800: '雅安市',
                511900: '巴中市',
                512000: '资阳市',
                513200: '阿坝藏族羌族自治州',
                513300: '甘孜藏族自治州',
                513400: '凉山彝族自治州'
            },
            510100: {
                510104: '锦江区',
                510105: '青羊区',
                510106: '金牛区',
                510107: '武侯区',
                510108: '成华区',
                510112: '龙泉驿区',
                510113: '青白江区',
                510114: '新都区',
                510115: '温江区',
                510121: '金堂县',
                510122: '双流县',
                510124: '郫县',
                510129: '大邑县',
                510131: '蒲江县',
                510132: '新津县',
                510181: '都江堰市',
                510182: '彭州市',
                510183: '邛崃市',
                510184: '崇州市'
            },
            510300: {
                510302: '自流井区',
                510303: '贡井区',
                510304: '大安区',
                510311: '沿滩区',
                510321: '荣县',
                510322: '富顺县'
            },
            510400: {
                510402: '东区',
                510403: '西区',
                510411: '仁和区',
                510421: '米易县',
                510422: '盐边县'
            },
            510500: {
                510502: '江阳区',
                510503: '纳溪区',
                510504: '龙马潭区',
                510521: '泸县',
                510522: '合江县',
                510524: '叙永县',
                510525: '古蔺县'
            },
            510600: {
                510603: '旌阳区',
                510623: '中江县',
                510626: '罗江县',
                510681: '广汉市',
                510682: '什邡市',
                510683: '绵竹市'
            },
            510700: {
                510703: '涪城区',
                510704: '游仙区',
                510722: '三台县',
                510723: '盐亭县',
                510724: '安县',
                510725: '梓潼县',
                510726: '北川羌族自治县',
                510727: '平武县',
                510781: '江油市'
            },
            510800: {
                510802: '利州区',
                510811: '昭化区',
                510812: '朝天区',
                510821: '旺苍县',
                510822: '青川县',
                510823: '剑阁县',
                510824: '苍溪县'
            },
            510900: {
                510903: '船山区',
                510904: '安居区',
                510921: '蓬溪县',
                510922: '射洪县',
                510923: '大英县'
            },
            511000: {
                511002: '市中区',
                511011: '东兴区',
                511024: '威远县',
                511025: '资中县',
                511028: '隆昌县'
            },
            511100: {
                511102: '市中区',
                511111: '沙湾区',
                511112: '五通桥区',
                511113: '金口河区',
                511123: '犍为县',
                511124: '井研县',
                511126: '夹江县',
                511129: '沐川县',
                511132: '峨边彝族自治县',
                511133: '马边彝族自治县',
                511181: '峨眉山市'
            },
            511300: {
                511302: '顺庆区',
                511303: '高坪区',
                511304: '嘉陵区',
                511321: '南部县',
                511322: '营山县',
                511323: '蓬安县',
                511324: '仪陇县',
                511325: '西充县',
                511381: '阆中市'
            },
            511400: {
                511402: '东坡区',
                511403: '彭山区',
                511421: '仁寿县',
                511423: '洪雅县',
                511424: '丹棱县',
                511425: '青神县'
            },
            511500: {
                511502: '翠屏区',
                511503: '南溪区',
                511521: '宜宾县',
                511523: '江安县',
                511524: '长宁县',
                511525: '高县',
                511526: '珙县',
                511527: '筠连县',
                511528: '兴文县',
                511529: '屏山县'
            },
            511600: {
                511602: '广安区',
                511603: '前锋区',
                511621: '岳池县',
                511622: '武胜县',
                511623: '邻水县',
                511681: '华蓥市'
            },
            511700: {
                511702: '通川区',
                511703: '达川区',
                511722: '宣汉县',
                511723: '开江县',
                511724: '大竹县',
                511725: '渠县',
                511781: '万源市'
            },
            511800: {
                511802: '雨城区',
                511803: '名山区',
                511822: '荥经县',
                511823: '汉源县',
                511824: '石棉县',
                511825: '天全县',
                511826: '芦山县',
                511827: '宝兴县'
            },
            511900: {
                511902: '巴州区',
                511903: '恩阳区',
                511921: '通江县',
                511922: '南江县',
                511923: '平昌县'
            },
            512000: {
                512002: '雁江区',
                512021: '安岳县',
                512022: '乐至县',
                512081: '简阳市'
            },
            513200: {
                513221: '汶川县',
                513222: '理县',
                513223: '茂县',
                513224: '松潘县',
                513225: '九寨沟县',
                513226: '金川县',
                513227: '小金县',
                513228: '黑水县',
                513229: '马尔康县',
                513230: '壤塘县',
                513231: '阿坝县',
                513232: '若尔盖县',
                513233: '红原县'
            },
            513300: {
                513301: '康定市',
                513322: '泸定县',
                513323: '丹巴县',
                513324: '九龙县',
                513325: '雅江县',
                513326: '道孚县',
                513327: '炉霍县',
                513328: '甘孜县',
                513329: '新龙县',
                513330: '德格县',
                513331: '白玉县',
                513332: '石渠县',
                513333: '色达县',
                513334: '理塘县',
                513335: '巴塘县',
                513336: '乡城县',
                513337: '稻城县',
                513338: '得荣县'
            },
            513400: {
                513401: '西昌市',
                513422: '木里藏族自治县',
                513423: '盐源县',
                513424: '德昌县',
                513425: '会理县',
                513426: '会东县',
                513427: '宁南县',
                513428: '普格县',
                513429: '布拖县',
                513430: '金阳县',
                513431: '昭觉县',
                513432: '喜德县',
                513433: '冕宁县',
                513434: '越西县',
                513435: '甘洛县',
                513436: '美姑县',
                513437: '雷波县'
            },
            520000: {
                520100: '贵阳市',
                520200: '六盘水市',
                520300: '遵义市',
                520400: '安顺市',
                520500: '毕节市',
                520600: '铜仁市',
                522300: '黔西南布依族苗族自治州',
                522600: '黔东南苗族侗族自治州',
                522700: '黔南布依族苗族自治州'
            },
            520100: {
                520102: '南明区',
                520103: '云岩区',
                520111: '花溪区',
                520112: '乌当区',
                520113: '白云区',
                520115: '观山湖区',
                520121: '开阳县',
                520122: '息烽县',
                520123: '修文县',
                520181: '清镇市'
            },
            520200: {
                520201: '钟山区',
                520203: '六枝特区',
                520221: '水城县',
                520222: '盘县'
            },
            520300: {
                520302: '红花岗区',
                520303: '汇川区',
                520321: '遵义县',
                520322: '桐梓县',
                520323: '绥阳县',
                520324: '正安县',
                520325: '道真仡佬族苗族自治县',
                520326: '务川仡佬族苗族自治县',
                520327: '凤冈县',
                520328: '湄潭县',
                520329: '余庆县',
                520330: '习水县',
                520381: '赤水市',
                520382: '仁怀市'
            },
            520400: {
                520402: '西秀区',
                520403: '平坝区',
                520422: '普定县',
                520423: '镇宁布依族苗族自治县',
                520424: '关岭布依族苗族自治县',
                520425: '紫云苗族布依族自治县'
            },
            520500: {
                520502: '七星关区',
                520521: '大方县',
                520522: '黔西县',
                520523: '金沙县',
                520524: '织金县',
                520525: '纳雍县',
                520526: '威宁彝族回族苗族自治县',
                520527: '赫章县'
            },
            520600: {
                520602: '碧江区',
                520603: '万山区',
                520621: '江口县',
                520622: '玉屏侗族自治县',
                520623: '石阡县',
                520624: '思南县',
                520625: '印江土家族苗族自治县',
                520626: '德江县',
                520627: '沿河土家族自治县',
                520628: '松桃苗族自治县'
            },
            522300: {
                522301: '兴义市',
                522322: '兴仁县',
                522323: '普安县',
                522324: '晴隆县',
                522325: '贞丰县',
                522326: '望谟县',
                522327: '册亨县',
                522328: '安龙县'
            },
            522600: {
                522601: '凯里市',
                522622: '黄平县',
                522623: '施秉县',
                522624: '三穗县',
                522625: '镇远县',
                522626: '岑巩县',
                522627: '天柱县',
                522628: '锦屏县',
                522629: '剑河县',
                522630: '台江县',
                522631: '黎平县',
                522632: '榕江县',
                522633: '从江县',
                522634: '雷山县',
                522635: '麻江县',
                522636: '丹寨县'
            },
            522700: {
                522701: '都匀市',
                522702: '福泉市',
                522722: '荔波县',
                522723: '贵定县',
                522725: '瓮安县',
                522726: '独山县',
                522727: '平塘县',
                522728: '罗甸县',
                522729: '长顺县',
                522730: '龙里县',
                522731: '惠水县',
                522732: '三都水族自治县'
            },
            530000: {
                530100: '昆明市',
                530300: '曲靖市',
                530400: '玉溪市',
                530500: '保山市',
                530600: '昭通市',
                530700: '丽江市',
                530800: '普洱市',
                530900: '临沧市',
                532300: '楚雄彝族自治州',
                532500: '红河哈尼族彝族自治州',
                532600: '文山壮族苗族自治州',
                532800: '西双版纳傣族自治州',
                532900: '大理白族自治州',
                533100: '德宏傣族景颇族自治州',
                533300: '怒江傈僳族自治州',
                533400: '迪庆藏族自治州'
            },
            530100: {
                530102: '五华区',
                530103: '盘龙区',
                530111: '官渡区',
                530112: '西山区',
                530113: '东川区',
                530114: '呈贡区',
                530122: '晋宁县',
                530124: '富民县',
                530125: '宜良县',
                530126: '石林彝族自治县',
                530127: '嵩明县',
                530128: '禄劝彝族苗族自治县',
                530129: '寻甸回族彝族自治县',
                530181: '安宁市'
            },
            530300: {
                530302: '麒麟区',
                530321: '马龙县',
                530322: '陆良县',
                530323: '师宗县',
                530324: '罗平县',
                530325: '富源县',
                530326: '会泽县',
                530328: '沾益县',
                530381: '宣威市'
            },
            530400: {
                530402: '红塔区',
                530421: '江川县',
                530422: '澄江县',
                530423: '通海县',
                530424: '华宁县',
                530425: '易门县',
                530426: '峨山彝族自治县',
                530427: '新平彝族傣族自治县',
                530428: '元江哈尼族彝族傣族自治县'
            },
            530500: {
                530502: '隆阳区',
                530521: '施甸县',
                530522: '腾冲县',
                530523: '龙陵县',
                530524: '昌宁县'
            },
            530600: {
                530602: '昭阳区',
                530621: '鲁甸县',
                530622: '巧家县',
                530623: '盐津县',
                530624: '大关县',
                530625: '永善县',
                530626: '绥江县',
                530627: '镇雄县',
                530628: '彝良县',
                530629: '威信县',
                530630: '水富县'
            },
            530700: {
                530702: '古城区',
                530721: '玉龙纳西族自治县',
                530722: '永胜县',
                530723: '华坪县',
                530724: '宁蒗彝族自治县'
            },
            530800: {
                530802: '思茅区',
                530821: '宁洱哈尼族彝族自治县',
                530822: '墨江哈尼族自治县',
                530823: '景东彝族自治县',
                530824: '景谷傣族彝族自治县',
                530825: '镇沅彝族哈尼族拉祜族自治县',
                530826: '江城哈尼族彝族自治县',
                530827: '孟连傣族拉祜族佤族自治县',
                530828: '澜沧拉祜族自治县',
                530829: '西盟佤族自治县'
            },
            530900: {
                530902: '临翔区',
                530921: '凤庆县',
                530922: '云县',
                530923: '永德县',
                530924: '镇康县',
                530925: '双江拉祜族佤族布朗族傣族自治县',
                530926: '耿马傣族佤族自治县',
                530927: '沧源佤族自治县'
            },
            532300: {
                532301: '楚雄市',
                532322: '双柏县',
                532323: '牟定县',
                532324: '南华县',
                532325: '姚安县',
                532326: '大姚县',
                532327: '永仁县',
                532328: '元谋县',
                532329: '武定县',
                532331: '禄丰县'
            },
            532500: {
                532501: '个旧市',
                532502: '开远市',
                532503: '蒙自市',
                532504: '弥勒市',
                532523: '屏边苗族自治县',
                532524: '建水县',
                532525: '石屏县',
                532527: '泸西县',
                532528: '元阳县',
                532529: '红河县',
                532530: '金平苗族瑶族傣族自治县',
                532531: '绿春县',
                532532: '河口瑶族自治县'
            },
            532600: {
                532601: '文山市',
                532622: '砚山县',
                532623: '西畴县',
                532624: '麻栗坡县',
                532625: '马关县',
                532626: '丘北县',
                532627: '广南县',
                532628: '富宁县'
            },
            532800: {
                532801: '景洪市',
                532822: '勐海县',
                532823: '勐腊县'
            },
            532900: {
                532901: '大理市',
                532922: '漾濞彝族自治县',
                532923: '祥云县',
                532924: '宾川县',
                532925: '弥渡县',
                532926: '南涧彝族自治县',
                532927: '巍山彝族回族自治县',
                532928: '永平县',
                532929: '云龙县',
                532930: '洱源县',
                532931: '剑川县',
                532932: '鹤庆县'
            },
            533100: {
                533102: '瑞丽市',
                533103: '芒市',
                533122: '梁河县',
                533123: '盈江县',
                533124: '陇川县'
            },
            533300: {
                533321: '泸水县',
                533323: '福贡县',
                533324: '贡山独龙族怒族自治县',
                533325: '兰坪白族普米族自治县'
            },
            533400: {
                533401: '香格里拉市',
                533422: '德钦县',
                533423: '维西傈僳族自治县'
            },
            540000: {
                540100: '拉萨市',
                540200: '日喀则市',
                540300: '昌都市',
                542200: '山南地区',
                542400: '那曲地区',
                542500: '阿里地区',
                542600: '林芝市'
            },
            540100: {
                540102: '城关区',
                540121: '林周县',
                540122: '当雄县',
                540123: '尼木县',
                540124: '曲水县',
                540125: '堆龙德庆县',
                540126: '达孜县',
                540127: '墨竹工卡县'
            },
            540200: {
                540202: '桑珠孜区',
                540221: '南木林县',
                540222: '江孜县',
                540223: '定日县',
                540224: '萨迦县',
                540225: '拉孜县',
                540226: '昂仁县',
                540227: '谢通门县',
                540228: '白朗县',
                540229: '仁布县',
                540230: '康马县',
                540231: '定结县',
                540232: '仲巴县',
                540233: '亚东县',
                540234: '吉隆县',
                540235: '聂拉木县',
                540236: '萨嘎县',
                540237: '岗巴县'
            },
            540300: {
                540302: '卡若区',
                540321: '江达县',
                540322: '贡觉县',
                540323: '类乌齐县',
                540324: '丁青县',
                540325: '察雅县',
                540326: '八宿县',
                540327: '左贡县',
                540328: '芒康县',
                540329: '洛隆县',
                540330: '边坝县'
            },
            542200: {
                542221: '乃东县',
                542222: '扎囊县',
                542223: '贡嘎县',
                542224: '桑日县',
                542225: '琼结县',
                542226: '曲松县',
                542227: '措美县',
                542228: '洛扎县',
                542229: '加查县',
                542231: '隆子县',
                542232: '错那县',
                542233: '浪卡子县'
            },
            542400: {
                542421: '那曲县',
                542422: '嘉黎县',
                542423: '比如县',
                542424: '聂荣县',
                542425: '安多县',
                542426: '申扎县',
                542427: '索县',
                542428: '班戈县',
                542429: '巴青县',
                542430: '尼玛县',
                542431: '双湖县'
            },
            542500: {
                542521: '普兰县',
                542522: '札达县',
                542523: '噶尔县',
                542524: '日土县',
                542525: '革吉县',
                542526: '改则县',
                542527: '措勤县'
            },
            542600: {
                542621: '巴宜区',
                542622: '工布江达县',
                542623: '米林县',
                542624: '墨脱县',
                542625: '波密县',
                542626: '察隅县',
                542627: '朗县'
            },
            610000: {
                610100: '西安市',
                610200: '铜川市',
                610300: '宝鸡市',
                610400: '咸阳市',
                610500: '渭南市',
                610600: '延安市',
                610700: '汉中市',
                610800: '榆林市',
                610900: '安康市',
                611000: '商洛市'
            },
            610100: {
                610102: '新城区',
                610103: '碑林区',
                610104: '莲湖区',
                610111: '灞桥区',
                610112: '未央区',
                610113: '雁塔区',
                610114: '阎良区',
                610115: '临潼区',
                610116: '长安区',
                610117: '高陵区',
                610122: '蓝田县',
                610124: '周至县',
                610125: '户县'
            },
            610200: {
                610202: '王益区',
                610203: '印台区',
                610204: '耀州区',
                610222: '宜君县'
            },
            610300: {
                610302: '渭滨区',
                610303: '金台区',
                610304: '陈仓区',
                610322: '凤翔县',
                610323: '岐山县',
                610324: '扶风县',
                610326: '眉县',
                610327: '陇县',
                610328: '千阳县',
                610329: '麟游县',
                610330: '凤县',
                610331: '太白县'
            },
            610400: {
                610402: '秦都区',
                610403: '杨陵区',
                610404: '渭城区',
                610422: '三原县',
                610423: '泾阳县',
                610424: '乾县',
                610425: '礼泉县',
                610426: '永寿县',
                610427: '彬县',
                610428: '长武县',
                610429: '旬邑县',
                610430: '淳化县',
                610431: '武功县',
                610481: '兴平市'
            },
            610500: {
                610502: '临渭区',
                610521: '华县',
                610522: '潼关县',
                610523: '大荔县',
                610524: '合阳县',
                610525: '澄城县',
                610526: '蒲城县',
                610527: '白水县',
                610528: '富平县',
                610581: '韩城市',
                610582: '华阴市'
            },
            610600: {
                610602: '宝塔区',
                610621: '延长县',
                610622: '延川县',
                610623: '子长县',
                610624: '安塞县',
                610625: '志丹县',
                610626: '吴起县',
                610627: '甘泉县',
                610628: '富县',
                610629: '洛川县',
                610630: '宜川县',
                610631: '黄龙县',
                610632: '黄陵县'
            },
            610700: {
                610702: '汉台区',
                610721: '南郑县',
                610722: '城固县',
                610723: '洋县',
                610724: '西乡县',
                610725: '勉县',
                610726: '宁强县',
                610727: '略阳县',
                610728: '镇巴县',
                610729: '留坝县',
                610730: '佛坪县'
            },
            610800: {
                610802: '榆阳区',
                610821: '神木县',
                610822: '府谷县',
                610823: '横山县',
                610824: '靖边县',
                610825: '定边县',
                610826: '绥德县',
                610827: '米脂县',
                610828: '佳县',
                610829: '吴堡县',
                610830: '清涧县',
                610831: '子洲县'
            },
            610900: {
                610902: '汉滨区',
                610921: '汉阴县',
                610922: '石泉县',
                610923: '宁陕县',
                610924: '紫阳县',
                610925: '岚皋县',
                610926: '平利县',
                610927: '镇坪县',
                610928: '旬阳县',
                610929: '白河县'
            },
            611000: {
                611002: '商州区',
                611021: '洛南县',
                611022: '丹凤县',
                611023: '商南县',
                611024: '山阳县',
                611025: '镇安县',
                611026: '柞水县'
            },
            620000: {
                620100: '兰州市',
                620200: '嘉峪关市',
                620300: '金昌市',
                620400: '白银市',
                620500: '天水市',
                620600: '武威市',
                620700: '张掖市',
                620800: '平凉市',
                620900: '酒泉市',
                621000: '庆阳市',
                621100: '定西市',
                621200: '陇南市',
                622900: '临夏回族自治州',
                623000: '甘南藏族自治州'
            },
            620100: {
                620102: '城关区',
                620103: '七里河区',
                620104: '西固区',
                620105: '安宁区',
                620111: '红古区',
                620121: '永登县',
                620122: '皋兰县',
                620123: '榆中县'
            },
            620300: {
                620302: '金川区',
                620321: '永昌县'
            },
            620400: {
                620402: '白银区',
                620403: '平川区',
                620421: '靖远县',
                620422: '会宁县',
                620423: '景泰县'
            },
            620500: {
                620502: '秦州区',
                620503: '麦积区',
                620521: '清水县',
                620522: '秦安县',
                620523: '甘谷县',
                620524: '武山县',
                620525: '张家川回族自治县'
            },
            620600: {
                620602: '凉州区',
                620621: '民勤县',
                620622: '古浪县',
                620623: '天祝藏族自治县'
            },
            620700: {
                620702: '甘州区',
                620721: '肃南裕固族自治县',
                620722: '民乐县',
                620723: '临泽县',
                620724: '高台县',
                620725: '山丹县'
            },
            620800: {
                620802: '崆峒区',
                620821: '泾川县',
                620822: '灵台县',
                620823: '崇信县',
                620824: '华亭县',
                620825: '庄浪县',
                620826: '静宁县'
            },
            620900: {
                620902: '肃州区',
                620921: '金塔县',
                620922: '瓜州县',
                620923: '肃北蒙古族自治县',
                620924: '阿克塞哈萨克族自治县',
                620981: '玉门市',
                620982: '敦煌市'
            },
            621000: {
                621002: '西峰区',
                621021: '庆城县',
                621022: '环县',
                621023: '华池县',
                621024: '合水县',
                621025: '正宁县',
                621026: '宁县',
                621027: '镇原县'
            },
            621100: {
                621102: '安定区',
                621121: '通渭县',
                621122: '陇西县',
                621123: '渭源县',
                621124: '临洮县',
                621125: '漳县',
                621126: '岷县'
            },
            621200: {
                621202: '武都区',
                621221: '成县',
                621222: '文县',
                621223: '宕昌县',
                621224: '康县',
                621225: '西和县',
                621226: '礼县',
                621227: '徽县',
                621228: '两当县'
            },
            622900: {
                622901: '临夏市',
                622921: '临夏县',
                622922: '康乐县',
                622923: '永靖县',
                622924: '广河县',
                622925: '和政县',
                622926: '东乡族自治县',
                622927: '积石山保安族东乡族撒拉族自治县'
            },
            623000: {
                623001: '合作市',
                623021: '临潭县',
                623022: '卓尼县',
                623023: '舟曲县',
                623024: '迭部县',
                623025: '玛曲县',
                623026: '碌曲县',
                623027: '夏河县'
            },
            630000: {
                630100: '西宁市',
                630200: '海东市',
                632200: '海北藏族自治州',
                632300: '黄南藏族自治州',
                632500: '海南藏族自治州',
                632600: '果洛藏族自治州',
                632700: '玉树藏族自治州',
                632800: '海西蒙古族藏族自治州'
            },
            630100: {
                630102: '城东区',
                630103: '城中区',
                630104: '城西区',
                630105: '城北区',
                630121: '大通回族土族自治县',
                630122: '湟中县',
                630123: '湟源县'
            },
            630200: {
                630202: '乐都区',
                630203: '平安区',
                630222: '民和回族土族自治县',
                630223: '互助土族自治县',
                630224: '化隆回族自治县',
                630225: '循化撒拉族自治县'
            },
            632200: {
                632221: '门源回族自治县',
                632222: '祁连县',
                632223: '海晏县',
                632224: '刚察县'
            },
            632300: {
                632321: '同仁县',
                632322: '尖扎县',
                632323: '泽库县',
                632324: '河南蒙古族自治县'
            },
            632500: {
                632521: '共和县',
                632522: '同德县',
                632523: '贵德县',
                632524: '兴海县',
                632525: '贵南县'
            },
            632600: {
                632621: '玛沁县',
                632622: '班玛县',
                632623: '甘德县',
                632624: '达日县',
                632625: '久治县',
                632626: '玛多县'
            },
            632700: {
                632701: '玉树市',
                632722: '杂多县',
                632723: '称多县',
                632724: '治多县',
                632725: '囊谦县',
                632726: '曲麻莱县'
            },
            632800: {
                632801: '格尔木市',
                632802: '德令哈市',
                632821: '乌兰县',
                632822: '都兰县',
                632823: '天峻县',
                632825: '海西蒙古族藏族自治州直辖'
            },
            640000: {
                640100: '银川市',
                640200: '石嘴山市',
                640300: '吴忠市',
                640400: '固原市',
                640500: '中卫市'
            },
            640100: {
                640104: '兴庆区',
                640105: '西夏区',
                640106: '金凤区',
                640121: '永宁县',
                640122: '贺兰县',
                640181: '灵武市'
            },
            640200: {
                640202: '大武口区',
                640205: '惠农区',
                640221: '平罗县'
            },
            640300: {
                640302: '利通区',
                640303: '红寺堡区',
                640323: '盐池县',
                640324: '同心县',
                640381: '青铜峡市'
            },
            640400: {
                640402: '原州区',
                640422: '西吉县',
                640423: '隆德县',
                640424: '泾源县',
                640425: '彭阳县'
            },
            640500: {
                640502: '沙坡头区',
                640521: '中宁县',
                640522: '海原县'
            },
            650000: {
                650100: '乌鲁木齐市',
                650200: '克拉玛依市',
                652100: '吐鲁番市',
                652200: '哈密地区',
                652300: '昌吉回族自治州',
                652700: '博尔塔拉蒙古自治州',
                652800: '巴音郭楞蒙古自治州',
                652900: '阿克苏地区',
                653000: '克孜勒苏柯尔克孜自治州',
                653100: '喀什地区',
                653200: '和田地区',
                654000: '伊犁哈萨克自治州',
                654200: '塔城地区',
                654300: '阿勒泰地区',
                659001: '石河子市',
                659002: '阿拉尔市',
                659003: '图木舒克市',
                659004: '五家渠市',
                659005: '北屯市',
                659006: '铁门关市',
                659007: '双河市',
                659008: '可克达拉市'
            },
            650100: {
                650102: '天山区',
                650103: '沙依巴克区',
                650104: '新市区',
                650105: '水磨沟区',
                650106: '头屯河区',
                650107: '达坂城区',
                650109: '米东区',
                650121: '乌鲁木齐县'
            },
            650200: {
                650202: '独山子区',
                650203: '克拉玛依区',
                650204: '白碱滩区',
                650205: '乌尔禾区'
            },
            652100: {
                652101: '高昌区',
                652122: '鄯善县',
                652123: '托克逊县'
            },
            652200: {
                652201: '哈密市',
                652222: '巴里坤哈萨克自治县',
                652223: '伊吾县'
            },
            652300: {
                652301: '昌吉市',
                652302: '阜康市',
                652323: '呼图壁县',
                652324: '玛纳斯县',
                652325: '奇台县',
                652327: '吉木萨尔县',
                652328: '木垒哈萨克自治县'
            },
            652700: {
                652701: '博乐市',
                652702: '阿拉山口市',
                652722: '精河县',
                652723: '温泉县'
            },
            652800: {
                652801: '库尔勒市',
                652822: '轮台县',
                652823: '尉犁县',
                652824: '若羌县',
                652825: '且末县',
                652826: '焉耆回族自治县',
                652827: '和静县',
                652828: '和硕县',
                652829: '博湖县'
            },
            652900: {
                652901: '阿克苏市',
                652922: '温宿县',
                652923: '库车县',
                652924: '沙雅县',
                652925: '新和县',
                652926: '拜城县',
                652927: '乌什县',
                652928: '阿瓦提县',
                652929: '柯坪县'
            },
            653000: {
                653001: '阿图什市',
                653022: '阿克陶县',
                653023: '阿合奇县',
                653024: '乌恰县'
            },
            653100: {
                653101: '喀什市',
                653121: '疏附县',
                653122: '疏勒县',
                653123: '英吉沙县',
                653124: '泽普县',
                653125: '莎车县',
                653126: '叶城县',
                653127: '麦盖提县',
                653128: '岳普湖县',
                653129: '伽师县',
                653130: '巴楚县',
                653131: '塔什库尔干塔吉克自治县'
            },
            653200: {
                653201: '和田市',
                653221: '和田县',
                653222: '墨玉县',
                653223: '皮山县',
                653224: '洛浦县',
                653225: '策勒县',
                653226: '于田县',
                653227: '民丰县'
            },
            654000: {
                654002: '伊宁市',
                654003: '奎屯市',
                654004: '霍尔果斯市',
                654021: '伊宁县',
                654022: '察布查尔锡伯自治县',
                654023: '霍城县',
                654024: '巩留县',
                654025: '新源县',
                654026: '昭苏县',
                654027: '特克斯县',
                654028: '尼勒克县'
            },
            654200: {
                654201: '塔城市',
                654202: '乌苏市',
                654221: '额敏县',
                654223: '沙湾县',
                654224: '托里县',
                654225: '裕民县',
                654226: '和布克赛尔蒙古自治县'
            },
            654300: {
                654301: '阿勒泰市',
                654321: '布尔津县',
                654322: '富蕴县',
                654323: '福海县',
                654324: '哈巴河县',
                654325: '青河县',
                654326: '吉木乃县'
            },
            810000: {
                810001: '中西區',
                810002: '灣仔區',
                810003: '東區',
                810004: '南區',
                810005: '油尖旺區',
                810006: '深水埗區',
                810007: '九龍城區',
                810008: '黃大仙區',
                810009: '觀塘區',
                810010: '荃灣區',
                810011: '屯門區',
                810012: '元朗區',
                810013: '北區',
                810014: '大埔區',
                810015: '西貢區',
                810016: '沙田區',
                810017: '葵青區',
                810018: '離島區'
            },
            820000: {
                820001: '花地瑪堂區',
                820002: '花王堂區',
                820003: '望德堂區',
                820004: '大堂區',
                820005: '風順堂區',
                820006: '嘉模堂區',
                820007: '路氹填海區',
                820008: '聖方濟各堂區'
            }
        }
        ;

    if (typeof window !== 'undefined') {
        window.ChineseDistricts = ChineseDistricts;
    }

    return ChineseDistricts;

});

/**
 * 行政区选择器。
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery', 'ChineseDistricts'], factory);
    } else if (typeof exports === 'object') {
        // Node / CommonJS
        factory(require('jquery'), require('ChineseDistricts'));
    } else {
        // Browser globals.
        factory(jQuery, ChineseDistricts);
    }
})(function ($, ChineseDistricts) {
    'use strict';
    if (typeof ChineseDistricts === 'undefined') {
        throw new Error('The file "district-picker.data.js" must be included first!');
    }

    var NAMESPACE = 'districtpicker';
    var EVENT_CHANGE = 'change.' + NAMESPACE;
    var PROVINCE = 'province';
    var CITY = 'city';
    var DISTRICT = 'district';

    function DistrictPicker(element, options) {
        this.$element = $(element);
        this.$dropdown = null;
        this.options = $.extend({}, DistrictPicker.DEFAULTS, $.isPlainObject(options) && options);
        this.active = false;
        this.dems = [];
        this.needBlur = false;
        this.init();
    }

    DistrictPicker.prototype = {
        constructor: DistrictPicker,
        init: function () {
            this.defineDems();
            this.render();
            this.bind();
            this.active = true;
        },

        render: function () {
            var p = this.getPosition(),
                placeholder = this.$element.attr('placeholder') || this.options.placeholder,
                textspan = '<span class="district-picker-span" style="' +
                    this.getWidthStyle(p.width) + 'height:' +
                    p.height + 'px;line-height:' + (p.height - 1) + 'px;">' +
                    (placeholder ? '<span class="placeholder">' + placeholder + '</span>' : '') +
                    '<span class="title"></span><div class="arrow"></div>' + '</span>',

                dropdown = '<div class="district-picker-dropdown" style="left:0px;top:100%;' +
                    this.getWidthStyle(p.width, true) + '">' +
                    '<div class="district-select-wrap">' +
                    '<div class="district-select-tab">' +
                    '<a class="active" data-count="province">省份</a>' +
                    (this.includeDem('city') ? '<a data-count="city">城市</a>' : '') +
                    (this.includeDem('district') ? '<a data-count="district">区县</a>' : '') + '</div>' +
                    '<div class="district-select-content">' +
                    '<div class="district-select province" data-count="province"></div>' +
                    (this.includeDem('city') ? '<div class="district-select city" data-count="city"></div>' : '') +
                    (this.includeDem('district') ? '<div class="district-select district" data-count="district"></div>' : '') +
                    '</div></div>';

            this.$element.addClass('district-picker-input');
            this.$textspan = $(textspan).insertAfter(this.$element);
            this.$dropdown = $(dropdown).insertAfter(this.$textspan);
            var $select = this.$dropdown.find('.district-select');

            // setup this.$province, this.$city and/or this.$district object
            $.each(this.dems, $.proxy(function (i, type) {
                this['$' + type] = $select.filter('.' + type + '');
            }, this));

            this.refresh();
        },

        refresh: function (force) {
            // clean the data-item for each $select
            var $select = this.$dropdown.find('.district-select');
            $select.data('item', null);
            // parse value from value of the target $element
            var val = this.$element.val() || '';
            val = val.split('/');
            $.each(this.dems, $.proxy(function (i, type) {
                if (val[i] && i < val.length) {
                    this.options[type] = val[i];
                } else if (force) {
                    this.options[type] = '';
                }
                this.output(type);
            }, this));
            this.tab(PROVINCE);
            this.feedText();
            this.feedVal();
        },

        defineDems: function () {
            var stop = false;
            $.each([PROVINCE, CITY, DISTRICT], $.proxy(function (i, type) {
                if (!stop) {
                    this.dems.push(type);
                }
                if (type === this.options.level) {
                    stop = true;
                }
            }, this));
        },

        includeDem: function (type) {
            return $.inArray(type, this.dems) !== -1;
        },

        getPosition: function () {
            var p, h, w, s, pw;
            p = this.$element.position();
            s = this.getSize(this.$element);
            h = s.height;
            w = s.width;
            if (this.options.responsive) {
                pw = this.$element.offsetParent().width();
                if (pw) {
                    w = w / pw;
                    if (w > 0.99) {
                        w = 1;
                    }
                    w = w * 100 + '%';
                }
            }

            return {
                top: p.top || 0,
                left: p.left || 0,
                height: h,
                width: w
            };
        },

        getSize: function ($dom) {
            var $wrap, $clone, sizes;
            if (!$dom.is(':visible')) {
                $wrap = $("<div />").appendTo($("body"));
                $wrap.css({
                    "position": "absolute !important",
                    "visibility": "hidden !important",
                    "display": "block !important"
                });

                $clone = $dom.clone().appendTo($wrap);

                sizes = {
                    width: $clone.outerWidth(),
                    height: $clone.outerHeight()
                };

                $wrap.remove();
            } else {
                sizes = {
                    width: $dom.outerWidth(),
                    height: $dom.outerHeight()
                };
            }

            return sizes;
        },

        getWidthStyle: function (w, dropdown) {
            if (this.options.responsive && !$.isNumeric(w)) {
                return 'width:' + w + ';';
            } else {
                return 'width:' + (dropdown ? Math.max(320, w) : w) + 'px;';
            }
        },

        bind: function () {
            var $this = this;

            $(document).on('click', (this._mouteclick = function (e) {
                var $target = $(e.target);
                var $dropdown, $span, $input;
                if ($target.is('.district-picker-span')) {
                    $span = $target;
                } else if ($target.is('.district-picker-span *')) {
                    $span = $target.parents('.district-picker-span');
                }
                if ($target.is('.district-picker-input')) {
                    $input = $target;
                }
                if ($target.is('.district-picker-dropdown')) {
                    $dropdown = $target;
                } else if ($target.is('.district-picker-dropdown *')) {
                    $dropdown = $target.parents('.district-picker-dropdown');
                }
                if ((!$input && !$span && !$dropdown) ||
                    ($span && $span.get(0) !== $this.$textspan.get(0)) ||
                    ($input && $input.get(0) !== $this.$element.get(0)) ||
                    ($dropdown && $dropdown.get(0) !== $this.$dropdown.get(0))) {
                    $this.close(true);
                }

            }));

            this.$element.on('change', (this._changeElement = $.proxy(function () {
                this.close(true);
                this.refresh(true);
            }, this))).on('focus', (this._focusElement = $.proxy(function () {
                this.needBlur = true;
                this.open();
            }, this))).on('blur', (this._blurElement = $.proxy(function () {
                if (this.needBlur) {
                    this.needBlur = false;
                    this.close(true);
                }
            }, this)));

            this.$textspan.on('click', function (e) {
                var $target = $(e.target), type;
                $this.needBlur = false;
                if ($target.is('.select-item')) {
                    type = $target.data('count');
                    $this.open(type);
                } else {
                    if ($this.$dropdown.is(':visible')) {
                        $this.close();
                    } else {
                        $this.open();
                    }
                }
            }).on('mousedown', function () {
                $this.needBlur = false;
            });

            this.$dropdown.on('click', '.district-select a', function () {
                var $select = $(this).parents('.district-select');
                var $active = $select.find('a.active');
                var last = $select.next().length === 0;
                $active.removeClass('active');
                $(this).addClass('active');
                if ($active.data('code') !== $(this).data('code')) {
                    $select.data('item', {
                        address: $(this).attr('title'), code: $(this).data('code')
                    });
                    $(this).trigger(EVENT_CHANGE);
                    $this.feedText();
                    $this.feedVal(true);
                    if (last) {
                        $this.close();
                    }
                }
            }).on('click', '.district-select-tab a', function () {
                if (!$(this).hasClass('active')) {
                    var type = $(this).data('count');
                    $this.tab(type);
                }
            }).on('mousedown', function () {
                $this.needBlur = false;
            });

            if (this.$province) {
                this.$province.on(EVENT_CHANGE, (this._changeProvince = $.proxy(function () {
                    this.output(CITY);
                    this.output(DISTRICT);
                    this.tab(CITY);
                }, this)));
            }

            if (this.$city) {
                this.$city.on(EVENT_CHANGE, (this._changeCity = $.proxy(function () {
                    this.output(DISTRICT);
                    this.tab(DISTRICT);
                }, this)));
            }
        },

        open: function (type) {
            type = type || PROVINCE;
            this.$dropdown.show();
            this.$textspan.addClass('open').addClass('focus');
            this.tab(type);
        },

        close: function (blur) {
            this.$dropdown.hide();
            this.$textspan.removeClass('open');
            if (blur) {
                this.$textspan.removeClass('focus');
            }
        },

        unbind: function () {

            $(document).off('click', this._mouteclick);

            this.$element.off('change', this._changeElement);
            this.$element.off('focus', this._focusElement);
            this.$element.off('blur', this._blurElement);

            this.$textspan.off('click');
            this.$textspan.off('mousedown');

            this.$dropdown.off('click');
            this.$dropdown.off('mousedown');

            if (this.$province) {
                this.$province.off(EVENT_CHANGE, this._changeProvince);
            }

            if (this.$city) {
                this.$city.off(EVENT_CHANGE, this._changeCity);
            }
        },

        getText: function () {
            var text = '';
            this.$dropdown.find('.district-select')
                .each(function () {
                    var item = $(this).data('item'),
                        type = $(this).data('count');
                    if (item) {
                        text += ($(this).hasClass('province') ? '' : '/') + '<span class="select-item" data-count="' +
                            type + '" data-code="' + item.code + '">' + item.address + '</span>';
                    }
                });
            return text;
        },

        getPlaceHolder: function () {
            return this.$element.attr('placeholder') || this.options.placeholder;
        },

        feedText: function () {
            var text = this.getText();
            if (text) {
                this.$textspan.find('>.placeholder').hide();
                this.$textspan.find('>.title').html(this.getText()).show();
            } else {
                this.$textspan.find('>.placeholder').text(this.getPlaceHolder()).show();
                this.$textspan.find('>.title').html('').hide();
            }
        },

        getCode: function (count) {
            var obj = {}, arr = [];
            this.$textspan.find('.select-item')
                .each(function () {
                    var code = $(this).data('code');
                    var count = $(this).data('count');
                    obj[count] = code;
                    arr.push(code);
                });
            return count ? obj[count] : arr.join('/');
        },

        getVal: function () {
            var text = '';
            this.$dropdown.find('.district-select')
                .each(function () {
                    var item = $(this).data('item');
                    if (item) {
                        text += ($(this).hasClass('province') ? '' : '/') + item.address;
                    }
                });
            return text;
        },

        feedVal: function (trigger) {
            this.$element.val(this.getVal());
            if(trigger) {
                this.$element.trigger('cp:updated');
            }
        },

        output: function (type) {
            var options = this.options;
            //var placeholders = this.placeholders;
            var $select = this['$' + type];
            var data = type === PROVINCE ? {} : [];
            var item;
            var districts;
            var code;
            var matched = null;
            var value;

            if (!$select || !$select.length) {
                return;
            }

            item = $select.data('item');

            value = (item ? item.address : null) || options[type];

            code = (
                type === PROVINCE ? 86 :
                    type === CITY ? this.$province && this.$province.find('.active').data('code') :
                        type === DISTRICT ? this.$city && this.$city.find('.active').data('code') : code
            );

            districts = $.isNumeric(code) ? ChineseDistricts[code] : null;

            if ($.isPlainObject(districts)) {
                $.each(districts, function (code, address) {
                    var provs;
                    if (type === PROVINCE) {
                        provs = [];
                        for (var i = 0; i < address.length; i++) {
                            if (address[i].address === value) {
                                matched = {
                                    code: address[i].code,
                                    address: address[i].address
                                };
                            }
                            provs.push({
                                code: address[i].code,
                                address: address[i].address,
                                selected: address[i].address === value
                            });
                        }
                        data[code] = provs;
                    } else {
                        if (address === value) {
                            matched = {
                                code: code,
                                address: address
                            };
                        }
                        data.push({
                            code: code,
                            address: address,
                            selected: address === value
                        });
                    }
                });
            }

            $select.html(type === PROVINCE ? this.getProvinceList(data) :
                this.getList(data, type));
            $select.data('item', matched);
        },

        getProvinceList: function (data) {
            var list = [],
                $this = this,
                simple = this.options.simple;

            $.each(data, function (i, n) {
                list.push('<dl class="clearfix">');
                list.push('<dt>' + i + '</dt><dd>');
                $.each(n, function (j, m) {
                    list.push(
                        '<a' +
                        ' title="' + (m.address || '') + '"' +
                        ' data-code="' + (m.code || '') + '"' +
                        ' class="' +
                        (m.selected ? ' active' : '') +
                        '">' +
                        ( simple ? $this.simplize(m.address, PROVINCE) : m.address) +
                        '</a>');
                });
                list.push('</dd></dl>');
            });

            return list.join('');
        },

        getList: function (data, type) {
            var list = [],
                $this = this,
                simple = this.options.simple;
            list.push('<dl class="clearfix"><dd>');

            $.each(data, function (i, n) {
                list.push(
                    '<a' +
                    ' title="' + (n.address || '') + '"' +
                    ' data-code="' + (n.code || '') + '"' +
                    ' class="' +
                    (n.selected ? ' active' : '') +
                    '">' +
                    ( simple ? $this.simplize(n.address, type) : n.address) +
                    '</a>');
            });
            list.push('</dd></dl>');

            return list.join('');
        },

        simplize: function (address, type) {
            address = address || '';
            if (type === PROVINCE) {
                return address.replace(/[省,市,自治区,壮族,回族,维吾尔]/g, '');
            } else if (type === CITY) {
                return address.replace(/[市,地区,回族,蒙古,苗族,白族,傣族,景颇族,藏族,彝族,壮族,傈僳族,布依族,侗族]/g, '')
                    .replace('哈萨克', '').replace('自治州', '').replace(/自治县/, '');
            } else if (type === DISTRICT) {
                return address.length > 2 ? address.replace(/[市,区,县,旗]/g, '') : address;
            }
        },

        tab: function (type) {
            var $selects = this.$dropdown.find('.district-select');
            var $tabs = this.$dropdown.find('.district-select-tab > a');
            var $select = this['$' + type];
            var $tab = this.$dropdown.find('.district-select-tab > a[data-count="' + type + '"]');
            if ($select) {
                $selects.hide();
                $select.show();
                $tabs.removeClass('active');
                $tab.addClass('active');
            }
        },

        reset: function () {
            this.$element.val(null).trigger('change');
        },

        destroy: function () {
            this.unbind();
            this.$element.removeData(NAMESPACE).removeClass('district-picker-input');
            this.$textspan.remove();
            this.$dropdown.remove();
        }
    };

    DistrictPicker.DEFAULTS = {
        simple: false,
        responsive: false,
        placeholder: '请选择省/市/区',
        level: 'district',
        province: '',
        city: '',
        district: ''
    };

    DistrictPicker.setDefaults = function (options) {
        $.extend(DistrictPicker.DEFAULTS, options);
    };

    // Save the other districtpicker
    DistrictPicker.other = $.fn.districtpicker;

    // Register as jQuery plugin
    $.fn.districtpicker = function (option) {
        var args = [].slice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this);
            var data = $this.data(NAMESPACE);
            var options;
            var fn;

            if (!data) {
                if (/destroy/.test(option)) {
                    return;
                }

                options = $.extend({}, $this.data(), $.isPlainObject(option) && option);
                $this.data(NAMESPACE, (data = new DistrictPicker(this, options)));
            }

            if (typeof option === 'string' && $.isFunction(fn = data[option])) {
                fn.apply(data, args);
            }
        });
    };

    $.fn.districtpicker.Constructor = DistrictPicker;
    $.fn.districtpicker.setDefaults = DistrictPicker.setDefaults;

    // No conflict
    $.fn.districtpicker.noConflict = function () {
        $.fn.districtpicker = DistrictPicker.other;
        return this;
    };

    $(function () {
        $('[data-toggle="district-picker"]').districtpicker();
    });
});
function FileUpload(opts) {
  this.contextPath = opts.contextPath;
  this.directoryKey = opts.directoryKey;
  this.label = opts.label || '附件';
  this.template = 
    '<label class="col-md-3 col-form-label" for="text-input">' + this.label + '</label>' +
    '  <div class="col-md-9">' +
    '    <div class="float-right">' +
    '      <label class="file-upload btn btn-sm btn-info" style="color: white; cursor: pointer">上传文档' +
    '        <input name="fileupload_doc" id="fileupload_doc" type="file">' +
    '      </label>' +
    '    </div>' +
    '  </div>' +
    '  <div class="progress mb-3" style="height: 3px; width: 95%; margin-left: 15px;">' +
    '    <div id="progress-upload" class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>' +
    '  </div>' +
    '  <div class="col-md-12">' +
    '    <ul id="fileupload_doc_list" class="icons-list">' +
    '    </ul>' +
    '  </div>';
  
  this.itemTemplate = 
    '      <li flcd="{{flcd}}">' +
    '        <i class="fa fa-file-text-o bg-info"></i>' +
    '        <div class="desc">' +
    '          <div class="title">{{flnm}}</div>' +
    '        </div>' +
    '        <div class="actions">' +
    '          <button flcd="{{flcd}}" type="button" class="btn btn-link text-muted text-red" style="font-size: 18px; text-decoration: none">' +
    '            <i class="fa fa-remove"></i>' +
    '          </button>' +
    '        </div>' +
    '        <input name="flcds[]" type="hidden" value="{{flcd}}">' + 
    '      </li>';
};

FileUpload.prototype.render = function(containerId, params) {
  var self = this;
  var source = this.template;
  var template = Handlebars.compile(source);
  var html = template({});
  $('#' + containerId).append(html);
  
  this.initialize(params);
  if (params.relcd == '') return;
  ajax.get(this.contextPath + '/data/km/doc/find.do', params, function(resp) {
    if (resp.errorMessage) return;
    for (var i = 0; i < resp.data.length; i++) {
      var doc = resp.data[i];
      self.addFileItem(doc.fl); 
    }
  })
};

FileUpload.prototype.initialize = function(params) {
  var self = this;
  var httpParams = {
    directoryKey: this.directoryKey
  };
  for (var k in params) {
    httpParams[k] = params[k];
  }
  $('#fileupload_doc').on('change', function() {
    // $('#btn_save').prop('disabled', true);
    var uploadingFile = $(this)[0].files[0];
    httpParams.file = uploadingFile;
    ajax.upload(self.contextPath + '/data/fs/file/upload.do', httpParams, function(resp) {
      if (resp.errmsg) {
        dialog.error("文件上传出现错误！");
        return;
      }
      // 列表显示上传文件
      self.addFileItem(resp);
      // $('#btn_save').prop('disabled', false);
    }, function(total, loaded) {
      var percentage = (loaded * 100) / total;
      $('#progress-upload').css('width', percentage + '%');
      $('#progress-upload').attr('aria-valuenow', percentage);

      if (percentage >= 100) {
        $('#progress-upload').css('width', '100%');
        $('#progress-upload').attr('aria-valuenow', '100');
      }
    });
  });
};

FileUpload.prototype.addFileItem = function(fl) {
  var self = this;
  var source = this.itemTemplate;
  var template = Handlebars.compile(source);
  var html = template(fl);
  $('#fileupload_doc_list').append(html);
  
  $('#fileupload_doc_list button.btn-link').on('click', function() {
    var flcd = $(this).attr('flcd');
    $(this).parent().parent().remove();
  });
};

function FlowChart(opts) {
  this.containerId = opts.containerId;
  this.code = opts.code;
  
  this.defaultOptions = {
    'line-width': 1,
    'maxWidth': 1,//ensures the flowcharts fits within a certian width
    'line-length': 10,
    'text-margin': 5,
    'font-size': 12,
    'font': 'normal',
    'font-family': 'Microsoft SimHei',
    'font-weight': 'normal',
    'font-color': 'black',
    'line-color': 'black',
    'element-color': 'black',
    'fill': 'white',
    'yes-text': '是',
    'no-text': '否',
    'arrow-end': 'block',
    'scale': 1,
    'symbols': {
      'start': {
        'font-color': 'black',
        'element-color': 'green',
        'fill': 'white'
      },
      'end':{
        'class': 'end-element'
      }
    },
    'flowstate' : {
      'past' : { 'fill' : '#21ba45', 'font-weight' : 'bold'},
      'current' : {'fill' : '#fbbd08', 'font-weight' : 'bold'},
      'future' : { 'fill' : 'white', 'font-color': 'black', 'font-weight' : 'bold'}
    }
  };
}

FlowChart.prototype.render = function() {
  var fc = flowchart.parse(this.code);
  fc.drawSVG(this.containerId, this.defaultOptions)
};
/**
 * Gets the form data under a container element.
 * 
 * @param {object} initial - the initial object, it could be json string.
 * 
 * @return json string or javascript object
 */
$.fn.formdata = function(initial) {
  if (typeof initial !== "undefined") {
    var obj;
    if (typeof initial === "string") {
      obj = $.parseJSON(initial);
    } else {
      obj = initial;
    }
    var params = obj;
    for ( var key in params) {
      var elemtNodeName;
      this.find('[name=' + key + ']').each(function() {
        elemtNodeName = $(this)[0].nodeName;
        if (elemtNodeName == "INPUT" && ($(this).attr("type") == "radio" || $(this).attr("type") == "checkbox")) {
          if (params[key].constructor == Array) {
            var arr = params[key];
            for (var i = 0; i < arr.length; i++) {
              if ($(this).val() == arr[i]) {
                $(this).prop("checked", true);
              }
            }
          } else {
            if ($(this).val() == params[key]) {
              $(this).prop("checked", true);
            }
          }
        } else if (elemtNodeName == "INPUT" && ($(this).attr("type") == "file" || $(this).attr("type") == "button")) {
          // 无需回显
        } else {
          $(this).val(params[key]);
        }
      });
    }
    return;
  }
  var ret = {};
  this.find('input[type!=checkbox][type!=radio][type!=button]').each(function(idx, el) {
    var name = $(el).attr('name');
    var value = $(el).val();
    if (name.indexOf('[]') != -1) {
      if (typeof ret[name] === 'undefined') ret[name] = []; 
      ret[name].push(value);
    } else {
      ret[name] = value;
    }
  });

  this.find('input[type=checkbox]').each(function(idx, el) {
    if ($(el).prop('checked')) {
      var existingVals = ret[$(el).attr('name')];
      if (typeof existingVals != 'undefined') {
        if (typeof ret[$(el).attr('name')] === "string") {
          var val = ret[$(el).attr('name')];
          ret[$(el).attr('name')] = [];
          ret[$(el).attr('name')].push(val);
        }
        ret[$(el).attr('name')].push($(el).val());
      } else {
        ret[$(el).attr('name')] = $(el).val();
      }
    }
  });
  this.find('input[type=checkbox]').each(function(idx, el) {
    var name = $(el).attr('name');
    if (typeof ret[name] === "undefined") {
      ret[name] = '';
    }
  });
  this.find('input[type=radio]').each(function(idx, el) {
    if ($(el).prop('checked')) {
      ret[$(el).attr('name')] = $(el).val();
    }
  });
  this.find('input[type=radio]').each(function(idx, el) {
    var name = $(el).attr('name');
    if (typeof ret[name] === "undefined") {
      ret[name] = '';
    }
  });
  this.find('select').each(function(idx, el) {
    if ($(el).val() != '' && $(el).val() != '-1' && $(el).val() != null) {//&& $(el).val() != '0'
      if (typeof $(el).val() === 'object') {
        ret[$(el).attr('name')] = $(el).val().join(',');
      } else {
        ret[$(el).attr('name')] = $(el).val();
      }
    } else if ($(el).val() == '-1') {
      ret[$(el).attr('name')] = '';
    } else {
      ret[$(el).attr('name')] = '';
    }
  });
  this.find('textarea').each(function(idx, el) {
    if ($(el).val() != '') {
      ret[$(el).attr('name')] = $(el).val();
    } else {
      ret[$(el).attr('name')] = '';
    }
  });
  return ret;
};

/**
 * @description 回显html元素数据，标准html元素，数据字段与页面元素一一对应，radio，checkbox除外。
 * @param  json json数据
 * @buffer  目前只考虑到input textArea  select.
 * */
$.fn.reviewFormdata = function(data) {
  var _this = this;
  $.each(data, function(key, value) {
    var ctrl = $(_this).find('[name=' + key.toLowerCase() + ']').first();
    switch (ctrl.prop("type")) {
    case "radio":
    case "checkbox":
      ctrl.each(function() {
        if ($(this).attr('value') == value)
          $(this).attr("checked", value);
      });
      break;

    default:
      ctrl.val(value);
    }
  });
}

/**
 * 
 */
var FrozenColumnsTable = function(opts) {
	// 远程数据源
    this.url = opts.url;
    // 本地数据源，未封装的数据源
    this.local = opts.local;
    if (typeof opts.local !== "undefined") {
    	this.local = {};
    	this.local.total = opts.local.length;
    	this.local.data = opts.local;
    }
    this.limit = opts.limit || 25;
    this.cache = opts.cache || "server";
    this.style = opts.style || "full";
    
    // 高度和宽度，用来固定表头和列的参数
    this.width = opts.width;
    this.height = opts.height;
    this.tbodyHeight = opts.tbodyHeight;
    
    // 冻结的列数量，基于零开始冻结
    this.frozenColumnCount = opts.frozenColumnCount || 0;
    this.frozenHeader = opts.frozenHeader || false;
    this.columnHeight = opts.columnHeight || '32px';
    
    this.boundedQuery = opts.boundedQuery || null;
    //是否只显示获取的数据长度对应的表格行数
    this.showDataRowLength = opts.showDataRowLength || false;
    this.containerId = opts.containerId;

    if (typeof opts.useCookie === "undefined") {
        this.useCookie = false;
    } else {
        this.useCookie = opts.useCookie;
    }
    this.afterLoad = opts.afterLoad || function(obj) {
    };
    /**
     * [{ title: "", children: [], template: "<a href='${where}'>${displayName}</a>", params: {where: "", displayName:
     * "default"} rowspan: 1 }]
     */
    this.columns = opts.columns || []; //所有一级列数量
    this.allcolumns = 0; //所有的列数量（包含了嵌套列)）
    this.columnMatrix = [];
    var max = 0;
    for (var i = 0; i < this.columns.length; ++i) {
        var col = this.columns[i];
        max = Math.max(max, (col.rowspan || 1));
        if(typeof col.colspan != "undefined"){
            this.allcolumns += col.colspan;
        }else{
            this.allcolumns++;
        }
    }
    this.mappingColumns = [];
    this.filters = {};
    this.headRowCount = max;
    this.start = 0;
    this.rollbackStart = 0;
    this.total = 0;
    this.table = null;
    this.result = null;
    for (var i = 0; i < max; ++i) {
        this.columnMatrix.push([]);
    }
    this.buildMatrix(this.columns, 0);
    this.buildMappingColumns(this.columns);

    this.rotateconfig = {
        len: 25, //图像每次旋转的角度
        brushtm: 70, //旋转的间隙时间
        maxptnum: 10, //提示文字后面.的最长数量
        textcololor: "#629BA0"
    }
};

/**
 * Turns to the previous page.
 */
FrozenColumnsTable.prototype.prev = function() {
    if (this.start <= 0)
        return;
    this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
FrozenColumnsTable.prototype.next = function() {
    if (this.start + this.limit >= this.total)
        return;
    this.go((this.start + this.limit) / this.limit + 1);
};

/**
 * Goes to the given page.
 * 
 * @param {integer}
 *            page - the page number
 */
FrozenColumnsTable.prototype.go = function(page, criteria) {
    if (page <= 0 || page > this.lastPageNumber())
        return;
    this.rollbackStart = this.start;
    this.start = this.limit * (page - 1);
    // this.disablePaging();
    this.request(criteria);
};

/**
 * Renders the table in the web brower.
 * 
 * @param {string}
 *            containerId - the container id in the dom.
 */
FrozenColumnsTable.prototype.render = function(containerId, params) {
    if (typeof this.contaienrId === 'undefined') this.containerId = containerId;
    var cntr = $('#' + this.containerId);
    cntr.empty();
    cntr.append(this.root(params)).append(this.pagination());
    if (typeof params === "undefined" || params == '' || params == '{}') {
	    // this.beforeRequest();
	    this.go(1);
	    this.afterRequest();
    } else if (typeof params === 'object') {
        for (k in params) {
            this.addFilter(k, params[k]);
        }
        this.request({});
    } else {
    	var ps = $.parseJSON(params);
    	// this.beforeRequest(ps);
    	this.request(ps);
    	this.afterRequest();
    }
};

FrozenColumnsTable.prototype.beforeRequest = function (initParams) {
    var _this = this;

    //var loadding = $("<h6> 正在加载数据，请稍候....</h6>");
    var loaddingct = $("<div></div>");
    loaddingct.attr("class","loaddingct");
    var loadding = $("<img/>");
    var loaddingtext= $("<h6>数据正在加载，请稍候</h6>");
    loaddingtext.css("color",_this.rotateconfig.textcololor);
    loaddingct.append(loaddingtext);
    var len = 0,ptnum=0;
    
    window.setInterval(function(){
        len += _this.rotateconfig.len;
        $("#"+loadding.attr("id")).css({
            '-webkit-transform' : "rotate(" + len +"deg)",
            '-moz-transform'    : "rotate(" + len +"deg)",
            '-ms-transform'     : "rotate(" + len +"deg)",
            '-o-transform'      : "rotate(" + len +"deg)",
            'transform'         : "rotate(" + len +"deg)",
        });

        if(ptnum++ < _this.rotateconfig.maxptnum )
            loaddingtext.html(loaddingtext.html()+".");
        else{
            ptnum = 0;
            loaddingtext.html("数据正在加载，请稍候");
        }
    }, _this.rotateconfig.brushtm);
    
    $(this.table.find('tbody')).append($("<tr></tr>").append($("<td></td>").attr("colspan",this.allcolumns).append(loaddingct)));
};

FrozenColumnsTable.prototype.afterRequest = function () {
	
};

FrozenColumnsTable.prototype.requestError = function () {
    this.table.find("div.loaddingct").html('<h6 style="color:red">数据加载出错，请联系管理员解决...</h6>');
};
/**
 * Gets the html source for this pagination table object.
 *
 * @return {object} the jquery table
 */
FrozenColumnsTable.prototype.root = function(initParams) {
	if (typeof initParams === "undefined") {
		initParams = {};
	}
    var tableClass = 'table table-responsive-sm table-hover table-outline mb-0';
	var ret = $('<div class="fixed-table-container"></div>');
	// ret.css('overflow-y', 'hidden');
    this.table = $('<table class="' + tableClass + '"></table>');
    
    // 参考http://issues.wenzhixin.net.cn/bootstrap-table/#extensions/fixed-columns.html
    // 的实现，需要添加若干元素
    this.frozenHeaderColumnsContainer = $('<div class="fixed-table-header-columns" style="display: block; z-index: 9999"></div>');
    this.frozenHeaderColumnsTable = $('<table class="' + tableClass + '"></table>');
    this.frozenHeaderColumnsTable.append('<thead class="thead-light"><tr></tr></thead>').append('<tbody></tbody>');
    this.frozenHeaderColumnsContainer.append(this.frozenHeaderColumnsTable);
    ret.append(this.frozenHeaderColumnsContainer);
    
    this.headerContainer = $('<div class="fixed-table-header"></div>');
    this.headerTable = $('<table class="' + tableClass + '" style="position: relative"></table>');
    this.headerTable.append('<thead class="thead-light"><tr></tr></thead>').append('<tbody></tbody>');
    this.headerContainer.append(this.headerTable);
    ret.append(this.headerContainer);
    
    this.frozenBodyColumnsContainer = $('<div class="fixed-table-body-columns" style="display: block; top: 46px;"></div>');
    this.frozenBodyColumnsTable = $('<table class="' + tableClass + '"></table>');
    this.frozenBodyColumnsTable.append('<thead class="thead-light"><tr></tr></thead>').append('<tbody></tbody>');
    this.frozenBodyColumnsContainer.append(this.frozenBodyColumnsTable);
    ret.append(this.frozenBodyColumnsContainer);
    
    this.bodyContainer = $('<div class="fixed-table-body"></div>');
    this.bodyTable = $('<table class="' + tableClass + '" style="margin-top: -51px;"></table>');
    this.bodyTable.append('<thead class="thead-light"><tr></tr></thead>').append('<tbody></tbody>');
    this.bodyContainer.append(this.bodyTable);
    ret.append(this.bodyContainer);
    
    if (typeof this.width !== 'undefined') this.table.css('width', this.width);
    if (typeof this.height !== 'undefined') ret.css('height', this.height);
    // if (!this.frozenHeader) this.table.addClass('table');
    // this.table.addClass("table table-bordered table-striped");
    this.table.addClass(tableClass);
    
    var frozenColumnsWidth = 0;
    var self = this;
    var thead = $('<thead class="thead-light"></thead>');
    for (var i = 0; i < this.columnMatrix.length; ++i) {
        var tr = $("<tr></tr>");
        for (var j = 0; j < this.columnMatrix[i].length; ++j) {
        	var col = this.columnMatrix[i][j];
            var th = $('<th style="text-align: center"></th>');
            var span = $("<span class='pull-right fa fa-arrows-v'></span>");
            span.css("opacity", "0.3");
            span.css('margin-top', '2px');
            span.addClass('fa');
            span.on("click", function(evt) {
            	var sorting = "asc";
            	var span = $(evt.target);
            	if (span.hasClass("fa-arrows-v")) {
            		span.removeClass("fa-arrows-v");
            		span.addClass("fa-sort-amount-asc");
            		span.css("opacity", "0.6");
            		sorting = "asc";
            	} else if (span.hasClass("fa-sort-amount-asc")) {
            		span.removeClass("fa-sort-amount-asc");
            		span.addClass("fa-sort-amount-desc");
            		sorting = "desc";
            	} else if (span.hasClass("fa-sort-amount-desc")) {
            		span.removeClass("fa-sort-amount-desc");
            		span.addClass("fa-sort-amount-asc");
            		sorting = "asc";
            	}
            	// 其余的重置
            	if (!span.hasClass("fa-arrows-v")) {
            		self.table.find("th span").each(function (idx, elm) {
            			if (span.attr("data-order") == $(elm).attr("data-order")) return;
            			$(elm).removeClass("fa-sort-amount-asc");
            			$(elm).removeClass("fa-sort-amount-desc");
            			$(elm).addClass("fa-arrows-v");
            			$(elm).css("opacity", "0.3");
            		});
            	}
            	// 请求数据
            	self.filters["orderBy"] = span.attr("data-order");
            	self.filters["sorting"] = sorting;
            	self.request();
            });
            th.attr('rowspan', col.rowspan || 1);
            th.attr('colspan', col.colspan || 1);
            // style
            th.attr('style', col.style || "");
            // 如果设置了列宽
            if (typeof col.width !== 'undefined') {
                th.css('width', col.width);
                if (j < this.frozenColumnCount)
                    frozenColumnsWidth += parseInt(col.width);
            }
            // 当需要冻结表头
            if (this.frozenHeader == true) {
                thead.css('float', 'left');
                th.css('float', 'left');
            }
            // 默认居中
            th.css('text-align', 'center');
            if (typeof col.headerClick === "undefined") {
            	//th.text(col.title);
            	th.append(col.title);
            } else {
                var a = $('<a>');
                a.on('click', col.headerClick);
                th.append(a);
                a.css("cursor", "default");
                a.text(col.title);
            }
            // 如果定义了data-order属性，则添加
            if (typeof col.order !== "undefined") {
            	span.attr("data-order", col.order);
            	// 根据初始化的过滤条件中，显示图标
            	if (col.order === initParams["orderBy"]) {
            		span.removeClass("fa sort");
            		if (initParams["sorting"] === "asc") {
            			// span.addClass("glyphicon-sort-by-attributes");
                        span.addClass('fa fa-sort-amount-asc')
            		} else {
            			// span.addClass("glyphicon-sort-by-attributes-alt");
                        span.addClass('fa fa-sort-amount-desc')
            		}
            	}
            	th.append(span);
            }
            th.css('overflow', 'hidden');
            tr.append(th);
            // 冻结列的设置
            if (j < this.frozenColumnCount) {
                this.frozenHeaderColumnsTable.find('thead tr:eq(0)').append(th.clone());
            }
            this.headerTable.find('thead tr:eq(0)').append(th.clone());
            this.bodyTable.find('thead tr:eq(0)').append(th.clone());
        }
        thead.append(tr);
    }
    this.table.append(thead);
    // 添加个空的表体
    this.table.append('<tbody></tbody>');
    // ret.append(this.table);
    
    if (this.width) {
        this.headerTable.css('width', this.width);
        this.bodyTable.css('width', this.width);
    }
    if (this.height) {
        // ret.css('height', this.height);
        // this.headerTable.css('height', this.height);
        this.frozenBodyColumnsContainer.css('height', (parseInt(this.height) - 19) + 'px');
    }
    this.frozenHeaderColumnsContainer.css('width', frozenColumnsWidth + 5 + 'px');
    this.frozenBodyColumnsContainer.css('width', frozenColumnsWidth + 5 + 'px');
    
    var self = this;
    this.bodyContainer.on('scroll', function () {
        self.frozenBodyColumnsContainer.find('table').css('top', -$(this).scrollTop());
        self.headerContainer.find('table').css('left', -$(this).scrollLeft());
    });
    
    return ret;
};


/**
 * Builds pagination bar for table.
 * 
 * @return {object} a pagination bar, the jquery div.
 */
FrozenColumnsTable.prototype.pagination = function() {
	if (this.limit <= 0) {
		return;
	}
    var self = this;
    var div = $('<div></div>');
    div.css('float', 'right');
    if (this.frozenColumnCount > 0) {
        div.css('margin', '52px');
    } else {
        div.css('margin', '8px');
    }
    var ul = $('<ul></ul>');
    ul.addClass('pagination');
    this.firstPage = $('<li></li>');
    var a = $('<a></a>');
    a.attr('href', 'javascript:void(0)');
    a.text('首页');
    a.on('click', function() {
        self.go(1);
    });
    this.firstPage.append(a);

    if (this.style === 'full') {
        ul.append(this.firstPage);
    }

    this.prevPage = $('<li></li>');
    a = $('<a></a>');
    a.attr('href', 'javascript:void(0)');
    a.text('上一页');
    a.on('click', function() {
        self.prev();
    });
    this.prevPage.append(a);
    ul.append(this.prevPage);

    li = $('<li></li>');
    li.addClass('disabled');
    this.pagebar = $('<a></a>');
    this.pagebar.attr('href', 'javascript:void(0)');
    this.pagebar.attr('style', 'cursor: default');
    this.pagebar.text("0/0");
    li.append(this.pagebar);
    ul.append(li);

    this.nextPage = $('<li></li>');
    a = $('<a></a>');
    a.attr('href', 'javascript:void(0)');
    a.text('下一页');
    a.on('click', function() {
        self.next();
    });
    this.nextPage.append(a);
    ul.append(this.nextPage);

    this.lastPage = $('<li></li>');
    a = $('<a></a>');
    a.attr('href', 'javascript:void(0)');
    a.text('末页');
    a.on('click', function() {
        self.go(self.lastPageNumber());
    });
    this.lastPage.append(a);
    if (this.style === 'full') {
        ul.append(this.lastPage);
    }

    li = $('<li class=disabled></li>');
    a = $('<a></a>');
    a.attr('style', 'cursor: default');

    this.pagenum = $('<input/>');
    this.pagenum.attr('size', 1);
    this.pagenum.attr('style', 'font-size: 11px; text-align: right; width: 25px; height: 20px;');
    if (this.style === 'full') {
        a.append(this.pagenum);
        li.append(a);
        ul.append(li);
    }

    li = $('<li></li>');
    a = $('<a></a>');
    a.attr('href', 'javascript:void(0)');
    a.text('跳转');
    a.on('click', function() {
        var str = self.pagenum.val();
        if (typeof str === 'undefined' || str === '')
            return;
        // remove whitespace
        str = str.replace(/^\s+|\s+$/g, '');
        if (str === '')
            return;
        if (isNaN(self.pagenum.val()))
            return;
        var pn = parseInt(self.pagenum.val());
        if (pn < 0 || pn > self.lastPageNumber())
            return;
        self.go(pn);
    });

    if (this.style === 'full') {
        li.append(a);
        ul.append(li);
    }

    if (this.style === 'none') {
        return;
    }
    div.append(ul);
    return div;
};

/**
 * Shows the page number in the page bar and controls each link status.
 * 
 * @private
 */
FrozenColumnsTable.prototype.showPageNumber = function() {
    var pagenum = this.start / this.limit + 1;
    var lastpagenum = this.lastPageNumber() , total = this.total;
    lastpagenum = lastpagenum ? lastpagenum : 0,total = total ? total : 0;
    if (this.limit <= 0) {
		return;
	}
    this.pagebar.html(pagenum + "/" + lastpagenum + "&nbsp;&nbsp;共" + total + "条记录");
    this.firstPage.removeClass();
    this.prevPage.removeClass();
    this.nextPage.removeClass();
    this.lastPage.removeClass();
    if (pagenum == 1) {
        this.firstPage.addClass('disabled');
        this.prevPage.addClass('disabled');
    }
    if (pagenum == this.lastPageNumber()) {
        this.nextPage.addClass('disabled');
        this.lastPage.addClass('disabled');
    }
};

FrozenColumnsTable.prototype.disablePaging = function() {
	if (this.limit <= 0) {
		return;
	}
    this.firstPage.removeClass();
    this.prevPage.removeClass();
    this.nextPage.removeClass();
    this.lastPage.removeClass();
    this.firstPage.addClass('disabled');
    this.prevPage.addClass('disabled');
    this.nextPage.addClass('disabled');
    this.lastPage.addClass('disabled');
};

/**
 * Gets the last page number.
 * 
 * @return the last page number
 */
FrozenColumnsTable.prototype.lastPageNumber = function() {
    if (this.total == 0 || this.limit == -1) {
        return 1;
    }
    var residue = this.total % this.limit;
    if (residue == 0) {
        return parseInt(this.total / this.limit);
    } else {
        return parseInt(this.total / this.limit + 1);
    }
};

/**
 * Gets the max col span for the given column.
 * 
 * @param {object}
 *            column - the column object
 * 
 * @private
 */
FrozenColumnsTable.prototype.maxColSpan = function(column) {
    var ret = 1;
    var max = 0;
    for (var i = 0; column.children && i < column.children.length; ++i) {
        max = Math.max(max, this.maxColSpan(column.children[i]));
    }
    ret += max;
    return ret;
};

/**
 * Clears all data rows.
 * 
 * @private
 */
FrozenColumnsTable.prototype.clear = function() {
    // this.table.find("thead").remove(); // 如果手动添加了表格头部
    $(this.table.find('tbody')).empty();
};

/**
 * Builds the direct columns which are used to map values with result.
 * 
 * @param {array}
 *            columns - the columns
 * 
 * @private
 */
FrozenColumnsTable.prototype.buildMappingColumns = function(columns) {
    for (var i = 0; i < columns.length; i++) {
        var col = columns[i];
        if (!col.children || col.children.length == 0) {
            this.mappingColumns.push(col);
        } else {
            this.buildMappingColumns(col.children);
        }
    }
};

/**
 * Builds column matrix.
 * 
 * @param {object}
 *            parent - the parent column
 * 
 * @param {integer}
 *            index - the matrix row index
 * 
 * @private
 */
FrozenColumnsTable.prototype.buildMatrix = function(columns, index) {
    if (!columns)
        return;
    var currentIndex = index;

    // add column children
    for (var i = 0; i < columns.length; ++i) {
        var col = columns[i];
        if (col.children && col.children.length > 0) {
            col.colspan = col.colspan || 1;
            this.buildMatrix(col.children, index + 1);
        }
        this.columnMatrix[currentIndex].push(col);
    }
};

/**
 * 
 */
FrozenColumnsTable.prototype.request = function(others) {
    var self = this;
    var params = {};
    if (self.boundedQuery != null) {
    	var ft = self.boundedQuery.formdata();
    	for (var k in ft) {
            this.filters[k] = ft[k];
        }
    }
    if (typeof others !== "undefined") {
    	for (var k in others) {
    		if (k == "start") {
        		this.start = parseInt(others[k])
        	} else if (k == "limit") {
        		this.limit = parseInt(others[k]);
        	} else {
        		this.filters[k] = others[k];
        	}
    	}
    }
    for ( var k in this.filters) {
        params[k] = this.filters[k];
    }
    params['start'] = this.start;
    params['limit'] = this.limit;
    for (var k in this.filters) {
    	params[k] = this.filters[k];
    }
    // params['criteria'] = JSON.stringify(this.filters);
    // this.setCookie();
    if (typeof this.url !== "undefined") {
	    $.ajax({
	        url: this.url,
	        type: 'POST',
	        data: params,
	        success: function(resp) {
	        	var result;
	        	if (typeof resp === "string") {
	        		result = $.parseJSON(resp);
	        	} else {
	        		result = resp;
	        	}
	            self.total = result.total;
	            self.fill(result);
	            self.showPageNumber();
	            self.afterLoad(result);
	        },
	        error: function(resp) {
	            self.start = self.rollbackStart;
	            self.showPageNumber();
	            self.requestError();
	        }
	    });
    	return;
    }
    this.loadLocal();
};

/**
 * 加载本地数据分页显示。
 */
FrozenColumnsTable.prototype.loadLocal = function () {
	this.total = this.local.total;
	var result = {};
	result.total = this.local.total;
	result.data = [];
	for (var i = this.start; i < (this.start + this.limit); i++) {
		result.data.push(this.local.data[i] == null ? "&nbsp;" : this.local.data[i]);
	}
	this.fill(result);
	this.showPageNumber();
    this.afterLoad(result);
};

FrozenColumnsTable.prototype.addFilter = function(name, value) {
    this.filters[name] = value;
};

FrozenColumnsTable.prototype.clearFilters = function() {
    this.filters = {};
};

FrozenColumnsTable.prototype.replace = function(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
};

/**
 * Fills the table with the result.
 * 
 * @param the result from the server side
 */
FrozenColumnsTable.prototype.fill = function(result) {
    var self = this;
    this.clear();
    var mappingColumns = this.mappingColumns;
    if(result.data && result.data[0]) {
    	var limit = this.limit;
    	limit = limit < 0 ? result.data.length : limit;
    	var tbody = $(this.table.find('tbody'));
    	if (typeof this.tbodyHeight !== 'undefined') {
    	    tbody.css('height', this.tbodyHeight);
    	    tbody.css('overflow-y', 'auto');
    	}
	    for (var i = 0; i < limit; ++i) {
	        var tr = $("<tr></tr>");
	        tr.css('height', this.columnHeight)
	        if (i < result.data.length) {
	            var row = result.data[i];
	            for (var j = 0; j < mappingColumns.length; ++j) {
	                var col = mappingColumns[j];
	                var td = $("<td></td>");
	                // 冻结列
	                // if (j < this.frozenColumnCount) td.addClass('fixed-table-column');
	                if (col.style) {
	                    td.attr("style", col.style);
	                }else{
                        td.attr("style", "text-align: center; vertical-align:middle");
                    }
	                if (typeof col.width !== 'undefined') td.css('width', col.width);
	                if (this.frozenHeader == true) {
	                    tbody.css('float', 'left');
	                    td.css('float', 'left');
	                }
	                if (col.template) {
	                    var html = col.template.toString();
	                    for (k in row) {
                            row[k] = row[k] == null ? "" : row[k];
	                        html = this.replace(html, "\\{" + k + "\\}", row[k]);
	                    }
	                    if (html.indexOf('{') == 0 && html.indexOf('}') != -1) {
	                        html = '';
	                    }
	                    td.html(html);
	                }
	                if (col.displayFunction) {
	                    col.displayFunction(row, td, j);
	                }
	                tr.append(td);
	            }
	        } else {
	            if (this.limit <= 0) {
	                break;
	            }
	            for (var j = 0; j < mappingColumns.length; ++j) {
	                var td = $("<td>&nbsp;</td>");
	                tr.append(td);
	            }
	        }
	        tbody.append(tr);
            var trFrozen = $('<tr>');
            this.frozenBodyColumnsTable.append(trFrozen);
            tr.find('td').each(function(idx, td) {
                if (idx < self.frozenColumnCount) {
                    trFrozen.append($(td).clone());
                }
            });
            this.bodyTable.find('tbody').append(tr.clone());
	    }
    }

};

const DEFAULT_MAP_STYLE = [{
    'featureType': 'point',
    'elementType': 'all',
    'stylers': {
        'color': '#909e84',
        'hue': '#000000',
        'weight': '1',
        'visibility': 'off'
    }
}, {
    'featureType': 'building',
    'elementType': 'all',
    'stylers': {
        'color': '#909e84',
        'hue': '#000000',
        'weight': '1',
        'visibility': 'off'
    }
}, {
    'featureType': 'water',
    'elementType': 'all',
    'stylers': {
        'color': '#a3cdff',
        'weight': '1',
        'lightness': 1,
        'saturation': 1,
        'visibility': 'on'
    }
}, {
    'featureType': 'land',
    'elementType': 'all',
    'stylers': {
        'color': '#f2f1ed',
        'weight': '1',
        'lightness': 100,
        'saturation': 1,
        'visibility': 'on'
    }
}, {
    'featureType': 'manmade',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}, {
    'featureType': 'boundary',
    'elementType': 'all',
    'stylers': {
        'color': '#6dabfe',
        'weight': '1',
        'visibility': 'on'
    }
}, {
    'featureType': 'green',
    'elementType': 'all',
    'stylers': {
        'color': '#c1db9a',
        'saturation': -4
    }
},
{
    'featureType': 'arterial',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}, {
    'featureType': 'highway',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}, {
    'featureType': 'local',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}, {
    'featureType': 'railway',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}, {
    'featureType': 'subway',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}, {
    'featureType': 'road',
    'elementType': 'all',
    'stylers': {
        'visibility': 'off'
    }
}];

if (typeof gis === 'undefined') gis = {};

/**
 * @constructor
 *
 * 百度地图构造函数。
 * 
 * @param {string} containerId - 容器标识 
 * 
 * @param {object} centerCoordinate - 中心点坐标
 */
gis.Baidu = function (containerId, centerCoordinate, zoom) {
	this.centerCoordinate = centerCoordinate;
    this.zoom = zoom || 10;
	
	this.map = new BMap.Map(containerId);
	// this.map.setMapType(BMAP_SATELLITE_MAP);
    this.map.setMapStyle({
        styleJson: DEFAULT_MAP_STYLE
    });
    // this.map.setMapStyle({style: 'midnight'});
	this.map.disableScrollWheelZoom(); 
	this.map.centerAndZoom(new BMap.Point(centerCoordinate.lng, centerCoordinate.lat), this.zoom);
	this.overlays = {};
};

/**
 * @public
 * 
 * 在地图上标记一个点坐标。
 * 
 * @param {object} data - 普通标记对象
 *
 * @param {object} coordinate - 含有经纬度的坐标点，维度：lat，精度：lng
 *
 * @param {object} triggers - 事件方法的封装对象，包括click, mouseover, mouseout这些基本事件
 */
gis.Baidu.prototype.mark = function (data, coordinate, triggers) {
    var markerPoint = new BMap.Point(coordinate.lng, coordinate.lat);
	var markerIcon = new BMap.Icon(data.icon, new BMap.Size(24, 24));
	var marker = new BMap.Marker(markerPoint, {icon: markerIcon});
	this.map.addOverlay(marker);      
    
    marker.data = data;
    if (typeof triggers === 'undefined') return;
    if (typeof triggers.click !== 'undefined') {
        marker.addEventListener('click', function() {
            triggers.click(this.data);
        });
    }
};

/**
 * @public
 * 
 * 在地图上标记一个数字点坐标。
 * 
 * @param {object} data - 数字标记对象
 *
 * @param {object} coordinate - 含有经纬度的坐标点，维度：lat，精度：lng
 *
 * @param {object} triggers - 事件方法的封装对象，包括click, mouseover, mouseout这些基本事件
 */
gis.Baidu.prototype.number = function (data, coordinate, triggers) {
    var overlay = new gis.Baidu.NumberOverlay(this.map, data, coordinate, triggers);
    this.map.addOverlay(overlay);
};

/**
 * @public
 * 
 * 在地图上标记一条折线，通常用于绘制线路或者河流。
 * 
 * @param {object} data - 折线标记对象
 *
 * @param {array} coordinates - 含有经纬度的坐标点集合，维度：lat，精度：lng
 *
 * @param {object} triggers - 事件方法的封装对象，包括click, mouseover, mouseout这些基本事件
 */
gis.Baidu.prototype.polyline = function (data, coordinates, triggers) {
    var points = [];
    for (var i = 0; i < coordinates.length; i++) {
        var coord = coordinates[i];
        points.push(new BMap.Point(coord.lng, coord.lat));
    }
    var polyline = new BMap.Polyline(points, {
        strokeColor: data.color || '#2eadd3'
    });
    this.map.addOverlay(polyline);
    
    polyline.data = data;
    if (typeof triggers === 'undefined') return;
    if (typeof triggers.click !== 'undefined') {
        polyline.addEventListener('click', function() {
            triggers.click(this.data);
        });
    }
};

/**
 * @public
 * 
 * 在地图上画出边界。
 */
gis.Baidu.prototype.boundary = function (addv, custom) {
    var bdary = new BMap.Boundary();
    var self = this;
    bdary.get(addv, function(rs) {       //获取行政区域
        // this.map.clearOverlays();        //清除地图覆盖物       
        var count = rs.boundaries.length; //行政区域的点有多少个
        if (count === 0) {
            alert('未能获取当前输入行政区域');
            return ;
        }
        var pointArray = [];
        for (var i = 0; i < count; i++) {
            var ply = new BMap.Polygon(rs.boundaries[i], {strokeWeight: 2, strokeColor: '#ff0000'}); //建立多边形覆盖物
            self.map.addOverlay(ply);  //添加覆盖物
            pointArray = pointArray.concat(ply.getPath());
        }
        // self.map.setViewport(pointArray);    //调整视野     
        self.map.setZoom(this.zoom);
    });   
};

/**
 * @public
 *
 * 清除所有绘制的标记。
 */
gis.Baidu.prototype.restore = function() {
    this.map.clearOverlays();
    this.map.centerAndZoom(new BMap.Point(this.centerCoordinate.lng, this.centerCoordinate.lat), this.zoom);
};

gis.Baidu.prototype.clear = function() {
    this.map.clearOverlays();
};

gis.Baidu.prototype.getMap = function() {
    return this.map;  
};

/**
 * 地图上显示工具栏，工具栏通常加载一些搜索框、监测按钮等。
 *
 * @param {object} data - 工具栏对象
 *
 * @param {array} coordinates - 含有经纬度的坐标点集合，维度：lat，精度：lng
 *
 * @param {object} triggers - 事件方法的封装对象，包括click, mouseover, mouseout这些基本事件
 *
 * @public
 */
gis.Baidu.prototype.toolbar = function (option) {
    var bar = new gis.Baidu.Toolbar(option);
    bar.setAnchor(BMAP_ANCHOR_BOTTOM_RIGHT);
    bar.setOffset(new BMap.Size(10, 10));
    this.map.addControl(bar);
};

/**
 * 设置地图的东部面板（右侧面板）悬浮在地图上，可伸缩。
 * 
 * @param {object} east - 实例化东部面板的对象
 *
 * @public
 */
gis.Baidu.prototype.east = function(east) {
    if (east.onLoad) {
        this.map.addEventListener("addcontrol", function() {
            setTimeout(east.onLoad(), 3000);
        });
    }
    east.id = '__map_east_pane';
    var pane = new gis.Baidu.PaneControl(east);
    pane.setAnchor(BMAP_ANCHOR_TOP_RIGHT);
    pane.setOffset(new BMap.Size(10, 10));
    this.map.addControl(pane);
};

/**
 * 设置地图的西部面板（左侧面板）悬浮在地图上，可伸缩。
 * 
 * @param {object} west - 实例化西部面板的对象
 *
 * @public
 */
gis.Baidu.prototype.west = function(west) {
    if (west.onLoad) {
        this.map.addEventListener("addcontrol", function() {
            setTimeout(west.onLoad(), 3000);
        });
    }
    west.id = '__map_west_pane';
    var pane = new gis.Baidu.PaneControl(west);
    pane.setAnchor(BMAP_ANCHOR_TOP_LEFT);
    pane.setOffset(new BMap.Size(10, 10));
    this.map.addControl(pane);
};

/**
 * 显示数字的自定义地图覆盖物，通常用于显示统计数字，可钻取。
 *
 * @constructor
 */
gis.Baidu.NumberOverlay = function (map, data, coordinate, triggers) {
    this.data = data;
    this.coordinate = coordinate;
    this.map = map;
    this.triggers = triggers || {};
};

gis.Baidu.NumberOverlay.prototype = new BMap.Overlay();

/**
 * 继承实现百度地图覆盖物的初始化方法。
 *
 * @private
 */
gis.Baidu.NumberOverlay.prototype.initialize = function(map) {
    var div = this.div = document.createElement('div');
    div.value = this.data;
    var self = this;
    
    var self = this;
    if (this.triggers.click) {
        div.addEventListener('click', function() {
            self.triggers.click(this.value);
        });
    }
    div.style.zIndex = BMap.Overlay.getZIndex(this.coordinate.lat);
    div.className = 'bmap-num rounded-circle';
    var span = document.createElement('span');
    div.appendChild(span);
    span.appendChild(document.createTextNode(this.data.text)); 
    map.getPanes().labelPane.appendChild(div);
    return div;
};

/**
 * 继承实现百度地图覆盖物的绘制方法。
 *
 * @private
 */
gis.Baidu.NumberOverlay.prototype.draw = function() {
    var pixel = this.map.pointToOverlayPixel(new BMap.Point(this.coordinate.lng, this.coordinate.lat));
    this.div.style.left = pixel.x - parseInt(0) + 'px';
    this.div.style.top  = pixel.y + 'px';
};

/**
 * 构造地图自定义控件，用于东南西北面板构造。
 *
 * @constructor
 *
 * @private
 */
gis.Baidu.PaneControl = function(options) {
    // id
    this.id = options.id;
    // 在地图上显示的文本
    this.title = options.title || '';
    // 在地图上显示的位置，单位pixel
    this.top = options.top;
    this.left = options.left;
    this.height = options.height;
    this.width = options.width;

    this.contentHtml = options.contentHtml;
    this.onLoad = options.onLoad;
    
    // 是否直接显示
    this.display = options.display || false;
};

gis.Baidu.PaneControl.prototype = new BMap.Control();

gis.Baidu.PaneControl.prototype.initialize = function(map) {
    var ret = document.getElementById(this.id);
    var existing = true;
    if (ret == null) {
        // 创建一个DOM元素
        ret = document.createElement('div');
        ret.setAttribute('id', this.id);
        existing = false;
    }
    ret.innerHTML = '';
    
    ret.style.overflow = 'hidden';

    // 标题
    var titlebar = document.createElement('div');

    var text = document.createElement('div');
    text.appendChild(document.createTextNode(this.title));
    text.className = 'bmap-title';
    
    var icon = document.createElement('div');
    icon.className = 'bmap-icon icon-size-actual';

    titlebar.appendChild(icon);
    titlebar.appendChild(text);

    titlebar.className ='row col-12 bmap-titlebar';
    ret.appendChild(titlebar);

    // 定位
    ret.style.border = '1px solid gray';
    ret.style.backgroundColor = 'white';
    ret.style.width = this.width;
    ret.style.height = this.height;

    var content = document.createElement('div');
    content.style.width = '100%';
    content.style.overflowY = 'auto';
    // this.height could be number + 'px'
    content.style.height = parseInt(this.height) - 32 + 'px';
    content.innerHTML = this.contentHtml;
    // custom scroll bar
    PerfectScrollbar.initialize(content);
    
    ret.appendChild(content);
    
    if (!this.display) {
        ret.style.height = '32px';
        ret.style.width = '32px';
        content.style.display = 'none';
        text.style.display = 'none';
        icon.className = 'bmap-icon icon-size-fullscreen';
    }

    var self = this;
    icon.onclick = function(event) {
        if (ret.style.height == self.height) {
            ret.style.height = '32px';
            ret.style.width = '32px';
            
            content.style.display = 'none';
            text.style.display = 'none';
            icon.className = 'bmap-icon icon-size-fullscreen';
        } else {
            ret.style.height = self.height;
            ret.style.width = self.width;

            content.style.display = '';
            text.style.display = '';
            icon.className = 'bmap-icon icon-size-actual';
        }
    };
    
    if (!existing) {
        map.getContainer().appendChild(ret);
        return ret;
    }
    
    return ret;
};

/**
 * 构建工具栏，工具栏自带搜索框，可以API控制显示隐藏。
 *
 * @param {object} option - 工具栏配置项
 *
 * @constructor
 *
 * @private
 */
gis.Baidu.Toolbar = function(option) {
    this.actions = option.actions || [];
    this.searchUrl = option.searchUrl;
    this.direction = option.direction;
    this.onRestore = option.onRestore;
};

/**
 * 继承于百度地图Control。
 */
gis.Baidu.Toolbar.prototype = new BMap.Control();

/**
 * 初始化工具栏，渲染工具栏显示内容。
 *
 * @param {object} map - 地图实例
 *
 * @returns {Element|*} 根容器对象
 */
gis.Baidu.Toolbar.prototype.initialize = function (map) {
    var ret = document.createElement('div');
    ret.innerHTML = '';

    var searchbar = '' +
    '<div class="input-group">' +
    '    <button class="btn btn-success">全屏</button>' +
    '    <button class="btn btn-success">还原</button>' +
    '    <input type="text" class="form-control" style="width: 200px">' +
    '    <span class="input-group-btn">' +
    '       <button class="btn btn-info" type="button">' +
    '           <i class="fa fa-search"></i>' +
    '       </button>' +
    '    </span>' +
    '</div>';
    ret.innerHTML = searchbar;

    for (var i = 0; i < this.actions.length; i++) {
        var action = this.actions[i];
        var btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.innerText = action.text;
        ret.children[0].appendChild(btn);
    }

    // bind events
    if (this.onRestore) {
        var btnRestore = ret.children[0].children[1];
        btnRestore.addEventListener('click', this.onRestore);
    }
    $(ret.children[0].children[2]).searchbox({
        url: this.searchUrl,
        direction: this.direction
    });


    map.getContainer().appendChild(ret);
    return ret;
};

/**
 * 层级选择器。
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery', 'ChineseDistricts'], factory);
    } else if (typeof exports === 'object') {
        // Node / CommonJS
        factory(require('jquery'), require('ChineseDistricts'));
    } else {
        // Browser globals.
        factory(jQuery, ChineseDistricts);
    }
})(function ($) {
    'use strict';
    
    var NAMESPACE = 'LevelledPicker';
    var EVENT_CHANGE = 'change.' + NAMESPACE;
    
    // 层级
    var hierarchy = [];
    
    var PROVINCE = 'province';
    var CITY = 'city';
    var DISTRICT = 'district';

    function LevelPicker(element, options) {
        this.$element = $(element);
        var json = $.ajax({
            url: options.url,
            data: options.params,
            dataType: 'json',
            success: function(obj) {
                this.options = $.extend({}, LevelPicker.DEFAULTS, $.isPlainObject(options) && options);
                this.active = false;
                this.dems = [];
                for (var k in obj) {
                    
                }
                this.needBlur = false;
                // 可供几级选择
                this.levelCount = options.levelCount || 1;
                
                this.init();
            }
        });
        
    }

    LevelPicker.prototype = {
        constructor: LevelPicker,
        
        init: function () {
            this.defineDems();
            this.render();
            this.bind();
            this.active = true;
        },

        render: function () {
            var p = this.getPosition(),
                placeholder = this.$element.attr('placeholder') || this.options.placeholder,
                textspan = '<span class="district-picker-span" style="' +
                    this.getWidthStyle(p.width) + 'height:' +
                    p.height + 'px;line-height:' + (p.height - 1) + 'px;">' +
                    (placeholder ? '<span class="placeholder">' + placeholder + '</span>' : '') +
                    '<span class="title"></span><div class="arrow"></div>' + '</span>',

                dropdown = '<div class="district-picker-dropdown" style="left:0px;top:100%;' +
                    this.getWidthStyle(p.width, true) + '">' +
                    '<div class="district-select-wrap">' +
                    '<div class="district-select-tab">' +
                    '<a class="active" data-count="province">省份</a>' +
                    (this.includeDem('city') ? '<a data-count="city">城市</a>' : '') +
                    (this.includeDem('district') ? '<a data-count="district">区县</a>' : '') + '</div>' +
                    '<div class="district-select-content">' +
                    '<div class="district-select province" data-count="province"></div>' +
                    (this.includeDem('city') ? '<div class="district-select city" data-count="city"></div>' : '') +
                    (this.includeDem('district') ? '<div class="district-select district" data-count="district"></div>' : '') +
                    '</div></div>';

            this.$element.addClass('district-picker-input');
            this.$textspan = $(textspan).insertAfter(this.$element);
            this.$dropdown = $(dropdown).insertAfter(this.$textspan);
            var $select = this.$dropdown.find('.district-select');

            // setup this.$province, this.$city and/or this.$district object
            $.each(this.dems, $.proxy(function (i, type) {
                this['$' + type] = $select.filter('.' + type + '');
            }, this));

            this.refresh();
        },

        refresh: function (force) {
            // clean the data-item for each $select
            var $select = this.$dropdown.find('.district-select');
            $select.data('item', null);
            // parse value from value of the target $element
            var val = this.$element.val() || '';
            val = val.split('/');
            $.each(this.dems, $.proxy(function (i, type) {
                if (val[i] && i < val.length) {
                    this.options[type] = val[i];
                } else if (force) {
                    this.options[type] = '';
                }
                this.output(type);
            }, this));
            this.tab(PROVINCE);
            this.feedText();
            this.feedVal();
        },

        defineDems: function () {
            var stop = false;
            $.each([PROVINCE, CITY, DISTRICT], $.proxy(function (i, type) {
                if (!stop) {
                    this.dems.push(type);
                }
                if (type === this.options.level) {
                    stop = true;
                }
            }, this));
        },

        includeDem: function (type) {
            return $.inArray(type, this.dems) !== -1;
        },

        getPosition: function () {
            var p, h, w, s, pw;
            p = this.$element.position();
            s = this.getSize(this.$element);
            h = s.height;
            w = s.width;
            if (this.options.responsive) {
                pw = this.$element.offsetParent().width();
                if (pw) {
                    w = w / pw;
                    if (w > 0.99) {
                        w = 1;
                    }
                    w = w * 100 + '%';
                }
            }

            return {
                top: p.top || 0,
                left: p.left || 0,
                height: h,
                width: w
            };
        },

        getSize: function ($dom) {
            var $wrap, $clone, sizes;
            if (!$dom.is(':visible')) {
                $wrap = $("<div />").appendTo($("body"));
                $wrap.css({
                    "position": "absolute !important",
                    "visibility": "hidden !important",
                    "display": "block !important"
                });

                $clone = $dom.clone().appendTo($wrap);

                sizes = {
                    width: $clone.outerWidth(),
                    height: $clone.outerHeight()
                };

                $wrap.remove();
            } else {
                sizes = {
                    width: $dom.outerWidth(),
                    height: $dom.outerHeight()
                };
            }

            return sizes;
        },

        getWidthStyle: function (w, dropdown) {
            if (this.options.responsive && !$.isNumeric(w)) {
                return 'width:' + w + ';';
            } else {
                return 'width:' + (dropdown ? Math.max(320, w) : w) + 'px;';
            }
        },

        bind: function () {
            var $this = this;

            $(document).on('click', (this._mouteclick = function (e) {
                var $target = $(e.target);
                var $dropdown, $span, $input;
                if ($target.is('.district-picker-span')) {
                    $span = $target;
                } else if ($target.is('.district-picker-span *')) {
                    $span = $target.parents('.district-picker-span');
                }
                if ($target.is('.district-picker-input')) {
                    $input = $target;
                }
                if ($target.is('.district-picker-dropdown')) {
                    $dropdown = $target;
                } else if ($target.is('.district-picker-dropdown *')) {
                    $dropdown = $target.parents('.district-picker-dropdown');
                }
                if ((!$input && !$span && !$dropdown) ||
                    ($span && $span.get(0) !== $this.$textspan.get(0)) ||
                    ($input && $input.get(0) !== $this.$element.get(0)) ||
                    ($dropdown && $dropdown.get(0) !== $this.$dropdown.get(0))) {
                    $this.close(true);
                }

            }));

            this.$element.on('change', (this._changeElement = $.proxy(function () {
                this.close(true);
                this.refresh(true);
            }, this))).on('focus', (this._focusElement = $.proxy(function () {
                this.needBlur = true;
                this.open();
            }, this))).on('blur', (this._blurElement = $.proxy(function () {
                if (this.needBlur) {
                    this.needBlur = false;
                    this.close(true);
                }
            }, this)));

            this.$textspan.on('click', function (e) {
                var $target = $(e.target), type;
                $this.needBlur = false;
                if ($target.is('.select-item')) {
                    type = $target.data('count');
                    $this.open(type);
                } else {
                    if ($this.$dropdown.is(':visible')) {
                        $this.close();
                    } else {
                        $this.open();
                    }
                }
            }).on('mousedown', function () {
                $this.needBlur = false;
            });

            this.$dropdown.on('click', '.district-select a', function () {
                var $select = $(this).parents('.district-select');
                var $active = $select.find('a.active');
                var last = $select.next().length === 0;
                $active.removeClass('active');
                $(this).addClass('active');
                if ($active.data('code') !== $(this).data('code')) {
                    $select.data('item', {
                        address: $(this).attr('title'), code: $(this).data('code')
                    });
                    $(this).trigger(EVENT_CHANGE);
                    $this.feedText();
                    $this.feedVal(true);
                    if (last) {
                        $this.close();
                    }
                }
            }).on('click', '.district-select-tab a', function () {
                if (!$(this).hasClass('active')) {
                    var type = $(this).data('count');
                    $this.tab(type);
                }
            }).on('mousedown', function () {
                $this.needBlur = false;
            });

            if (this.$province) {
                this.$province.on(EVENT_CHANGE, (this._changeProvince = $.proxy(function () {
                    this.output(CITY);
                    this.output(DISTRICT);
                    this.tab(CITY);
                }, this)));
            }

            if (this.$city) {
                this.$city.on(EVENT_CHANGE, (this._changeCity = $.proxy(function () {
                    this.output(DISTRICT);
                    this.tab(DISTRICT);
                }, this)));
            }
        },

        open: function (type) {
            type = type || PROVINCE;
            this.$dropdown.show();
            this.$textspan.addClass('open').addClass('focus');
            this.tab(type);
        },

        close: function (blur) {
            this.$dropdown.hide();
            this.$textspan.removeClass('open');
            if (blur) {
                this.$textspan.removeClass('focus');
            }
        },

        unbind: function () {

            $(document).off('click', this._mouteclick);

            this.$element.off('change', this._changeElement);
            this.$element.off('focus', this._focusElement);
            this.$element.off('blur', this._blurElement);

            this.$textspan.off('click');
            this.$textspan.off('mousedown');

            this.$dropdown.off('click');
            this.$dropdown.off('mousedown');

            if (this.$province) {
                this.$province.off(EVENT_CHANGE, this._changeProvince);
            }

            if (this.$city) {
                this.$city.off(EVENT_CHANGE, this._changeCity);
            }
        },

        getText: function () {
            var text = '';
            this.$dropdown.find('.district-select')
                .each(function () {
                    var item = $(this).data('item'),
                        type = $(this).data('count');
                    if (item) {
                        text += ($(this).hasClass('province') ? '' : '/') + '<span class="select-item" data-count="' +
                            type + '" data-code="' + item.code + '">' + item.address + '</span>';
                    }
                });
            return text;
        },

        getPlaceHolder: function () {
            return this.$element.attr('placeholder') || this.options.placeholder;
        },

        feedText: function () {
            var text = this.getText();
            if (text) {
                this.$textspan.find('>.placeholder').hide();
                this.$textspan.find('>.title').html(this.getText()).show();
            } else {
                this.$textspan.find('>.placeholder').text(this.getPlaceHolder()).show();
                this.$textspan.find('>.title').html('').hide();
            }
        },

        getCode: function (count) {
            var obj = {}, arr = [];
            this.$textspan.find('.select-item')
                .each(function () {
                    var code = $(this).data('code');
                    var count = $(this).data('count');
                    obj[count] = code;
                    arr.push(code);
                });
            return count ? obj[count] : arr.join('/');
        },

        getVal: function () {
            var text = '';
            this.$dropdown.find('.district-select')
                .each(function () {
                    var item = $(this).data('item');
                    if (item) {
                        text += ($(this).hasClass('province') ? '' : '/') + item.address;
                    }
                });
            return text;
        },

        feedVal: function (trigger) {
            this.$element.val(this.getVal());
            if(trigger) {
                this.$element.trigger('cp:updated');
            }
        },

        output: function (type) {
            var options = this.options;
            //var placeholders = this.placeholders;
            var $select = this['$' + type];
            var data = type === PROVINCE ? {} : [];
            var item;
            var districts;
            var code;
            var matched = null;
            var value;

            if (!$select || !$select.length) {
                return;
            }

            item = $select.data('item');

            value = (item ? item.address : null) || options[type];

            code = (
                type === PROVINCE ? 86 :
                    type === CITY ? this.$province && this.$province.find('.active').data('code') :
                        type === DISTRICT ? this.$city && this.$city.find('.active').data('code') : code
            );

            districts = $.isNumeric(code) ? ChineseDistricts[code] : null;

            if ($.isPlainObject(districts)) {
                $.each(districts, function (code, address) {
                    var provs;
                    if (type === PROVINCE) {
                        provs = [];
                        for (var i = 0; i < address.length; i++) {
                            if (address[i].address === value) {
                                matched = {
                                    code: address[i].code,
                                    address: address[i].address
                                };
                            }
                            provs.push({
                                code: address[i].code,
                                address: address[i].address,
                                selected: address[i].address === value
                            });
                        }
                        data[code] = provs;
                    } else {
                        if (address === value) {
                            matched = {
                                code: code,
                                address: address
                            };
                        }
                        data.push({
                            code: code,
                            address: address,
                            selected: address === value
                        });
                    }
                });
            }

            $select.html(type === PROVINCE ? this.getProvinceList(data) :
                this.getList(data, type));
            $select.data('item', matched);
        },

        getProvinceList: function (data) {
            var list = [],
                $this = this,
                simple = this.options.simple;

            $.each(data, function (i, n) {
                list.push('<dl class="clearfix">');
                list.push('<dt>' + i + '</dt><dd>');
                $.each(n, function (j, m) {
                    list.push(
                        '<a' +
                        ' title="' + (m.address || '') + '"' +
                        ' data-code="' + (m.code || '') + '"' +
                        ' class="' +
                        (m.selected ? ' active' : '') +
                        '">' +
                        ( simple ? $this.simplize(m.address, PROVINCE) : m.address) +
                        '</a>');
                });
                list.push('</dd></dl>');
            });

            return list.join('');
        },

        getList: function (data, type) {
            var list = [],
                $this = this,
                simple = this.options.simple;
            list.push('<dl class="clearfix"><dd>');

            $.each(data, function (i, n) {
                list.push(
                    '<a' +
                    ' title="' + (n.address || '') + '"' +
                    ' data-code="' + (n.code || '') + '"' +
                    ' class="' +
                    (n.selected ? ' active' : '') +
                    '">' +
                    ( simple ? $this.simplize(n.address, type) : n.address) +
                    '</a>');
            });
            list.push('</dd></dl>');

            return list.join('');
        },

        simplize: function (address, type) {
            address = address || '';
            if (type === PROVINCE) {
                return address.replace(/[省,市,自治区,壮族,回族,维吾尔]/g, '');
            } else if (type === CITY) {
                return address.replace(/[市,地区,回族,蒙古,苗族,白族,傣族,景颇族,藏族,彝族,壮族,傈僳族,布依族,侗族]/g, '')
                    .replace('哈萨克', '').replace('自治州', '').replace(/自治县/, '');
            } else if (type === DISTRICT) {
                return address.length > 2 ? address.replace(/[市,区,县,旗]/g, '') : address;
            }
        },

        tab: function (type) {
            var $selects = this.$dropdown.find('.district-select');
            var $tabs = this.$dropdown.find('.district-select-tab > a');
            var $select = this['$' + type];
            var $tab = this.$dropdown.find('.district-select-tab > a[data-count="' + type + '"]');
            if ($select) {
                $selects.hide();
                $select.show();
                $tabs.removeClass('active');
                $tab.addClass('active');
            }
        },

        reset: function () {
            this.$element.val(null).trigger('change');
        },

        destroy: function () {
            this.unbind();
            this.$element.removeData(NAMESPACE).removeClass('district-picker-input');
            this.$textspan.remove();
            this.$dropdown.remove();
        }
    };

    LevelPicker.DEFAULTS = {
        simple: false,
        responsive: false,
        placeholder: '请选择',
        level: 'district',
        province: '',
        city: '',
        district: ''
    };

    LevelPicker.setDefaults = function (options) {
        $.extend(LevelPicker.DEFAULTS, options);
    };

    // Save the other LevelPicker
    LevelPicker.other = $.fn.LevelPicker;

    // Register as jQuery plugin
    $.fn.LevelPicker = function (option) {
        var args = [].slice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this);
            var data = $this.data(NAMESPACE);
            var options;
            var fn;

            if (!data) {
                if (/destroy/.test(option)) {
                    return;
                }

                options = $.extend({}, $this.data(), $.isPlainObject(option) && option);
                $this.data(NAMESPACE, (data = new LevelPicker(this, options)));
            }

            if (typeof option === 'string' && $.isFunction(fn = data[option])) {
                fn.apply(data, args);
            }
        });
    };

    $.fn.LevelPicker.Constructor = LevelPicker;
    $.fn.LevelPicker.setDefaults = LevelPicker.setDefaults;

    // No conflict
    $.fn.LevelPicker.noConflict = function () {
        $.fn.LevelPicker = LevelPicker.other;
        return this;
    };

    $(function () {
        $('[data-toggle="district-picker"]').LevelPicker();
    });
});
/**
 * 
 */
var ListView = function (opts) {
  // 远程数据源
  this.url = opts.url;

  this.limit = opts.limit || 10;
  this.boundedQuery = opts.boundedQuery || null;
  // 修饰列模型数据
  this.decorateFunction = opts.decorateFunction;
  this.containerId = opts.containerId;
  this.templateId = opts.templateId;

  this.afterLoad = opts.afterLoad || function (obj) {};
  
  this.filters = {};
  this.start = 0;

  this.total = 0;
  this.list = null;
  this.result = null;

};

/**
 * Turns to the previous page.
 */
ListView.prototype.prev = function () {
  if (this.start <= 0)
    return;
  this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
ListView.prototype.next = function () {
  if (this.start + this.limit >= this.total)
    return;
  this.go((this.start + this.limit) / this.limit + 1);
};

/**
 * Goes to the given page.
 * 
 * @param {integer}
 *            page - the page number
 */
ListView.prototype.go = function (page, criteria) {
  if (page <= 0 || page > this.lastPageNumber())
    return;
  this.rollbackStart = this.start;
  this.start = this.limit * (page - 1);
  // this.disablePaging();
  this.request(criteria);
};

/**
 * Renders the table in the web brower.
 * 
 * @param {string}
 *            containerId - the container id in the dom.
 */
ListView.prototype.render = function (containerId, params) {
  if (typeof this.contaienrId === 'undefined') this.containerId = containerId;
  var cntr = $('#' + this.containerId);
  cntr.empty();
  cntr.append(this.root(params)).append(this.pagination());
  if (typeof params === "undefined" || params == '' || params == '{}') {
    this.go(1);
  } else if (typeof params === 'object') {
    for (k in params) {
      this.addFilter(k, params[k]);
    }
    this.request({});
  } else {
    var ps = $.parseJSON(params);
    this.request(ps);
  }
};

/**
 * Gets the html source for this pagination table object.
 *
 * @return {object} the jquery table
 */
ListView.prototype.root = function (initParams) {
  if (typeof initParams === "undefined") {
    initParams = {};
  }
  var ret = $('<div>');
  ret.css('overflow-y', 'auto');
  this.list = $('<div></div>');
  if (typeof this.width !== 'undefined') this.list.css('width', this.width);
  if (typeof this.height !== 'undefined') ret.css('height', this.height);

  this.list.addClass("list-group");  
  ret.append(this.list);
  return ret;
};


/**
 * Builds pagination bar for table.
 * 
 * @return {object} a pagination bar, the jquery div.
 */
ListView.prototype.pagination = function () {
  if (this.limit <= 0) {
    return;
  }
  var self = this;
  var div = $('<div></div>');
  div.css('float', 'right');
  div.css('margin', '8px');
  var ul = $('<ul></ul>');
  ul.addClass('pagination');
  this.firstPage = $('<li></li>');
  var a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('首页');
  a.on('click', function () {
    self.go(1);
  });
  this.firstPage.append(a);

  if (this.style === 'full') {
    ul.append(this.firstPage);
  }

  this.prevPage = $('<li></li>');
  a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('上一页');
  a.on('click', function () {
    self.prev();
  });
  this.prevPage.append(a);
  ul.append(this.prevPage);

  li = $('<li></li>');
  li.addClass('disabled');
  this.pagebar = $('<a></a>');
  this.pagebar.attr('href', 'javascript:void(0)');
  this.pagebar.attr('style', 'cursor: default');
  this.pagebar.text("0/0");
  li.append(this.pagebar);
  ul.append(li);

  this.nextPage = $('<li></li>');
  a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('下一页');
  a.on('click', function () {
    self.next();
  });
  this.nextPage.append(a);
  ul.append(this.nextPage);

  this.lastPage = $('<li></li>');
  a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('末页');
  a.on('click', function () {
    self.go(self.lastPageNumber());
  });
  this.lastPage.append(a);
  if (this.style === 'full') {
    ul.append(this.lastPage);
  }

  li = $('<li class=disabled></li>');
  a = $('<a></a>');
  a.attr('style', 'cursor: default');

  this.pagenum = $('<input/>');
  this.pagenum.attr('size', 1);
  this.pagenum.attr('style', 'font-size: 11px; text-align: right; width: 25px; height: 20px;');
  if (this.style === 'full') {
    a.append(this.pagenum);
    li.append(a);
    ul.append(li);
  }

  li = $('<li></li>');
  a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('跳转');
  a.on('click', function () {
    var str = self.pagenum.val();
    if (typeof str === 'undefined' || str === '')
      return;
    // remove whitespace
    str = str.replace(/^\s+|\s+$/g, '');
    if (str === '')
      return;
    if (isNaN(self.pagenum.val()))
      return;
    var pn = parseInt(self.pagenum.val());
    if (pn < 0 || pn > self.lastPageNumber())
      return;
    self.go(pn);
  });

  if (this.style === 'full') {
    li.append(a);
    ul.append(li);
  }

  if (this.style === 'none') {
    return;
  }
  div.append(ul);
  return div;
};

/**
 * Shows the page number in the page bar and controls each link status.
 * 
 * @private
 */
ListView.prototype.showPageNumber = function () {
  var pagenum = this.start / this.limit + 1;
  var lastpagenum = this.lastPageNumber(),
    total = this.total;
  lastpagenum = lastpagenum ? lastpagenum : 0, total = total ? total : 0;
  if (this.limit <= 0) {
    return;
  }
  this.pagebar.html(pagenum + "/" + lastpagenum + "&nbsp;&nbsp;共" + total + "条记录");
  this.firstPage.removeClass();
  this.prevPage.removeClass();
  this.nextPage.removeClass();
  this.lastPage.removeClass();
  if (pagenum == 1) {
    this.firstPage.addClass('disabled');
    this.prevPage.addClass('disabled');
  }
  if (pagenum == this.lastPageNumber()) {
    this.nextPage.addClass('disabled');
    this.lastPage.addClass('disabled');
  }
};

ListView.prototype.disablePaging = function () {
  if (this.limit <= 0) {
    return;
  }
  this.firstPage.removeClass();
  this.prevPage.removeClass();
  this.nextPage.removeClass();
  this.lastPage.removeClass();
  this.firstPage.addClass('disabled');
  this.prevPage.addClass('disabled');
  this.nextPage.addClass('disabled');
  this.lastPage.addClass('disabled');
};

/**
 * Gets the last page number.
 * 
 * @return the last page number
 */
ListView.prototype.lastPageNumber = function () {
  if (this.total == 0 || this.limit == -1) {
    return 1;
  }
  var residue = this.total % this.limit;
  if (residue == 0) {
    return parseInt(this.total / this.limit);
  } else {
    return parseInt(this.total / this.limit + 1);
  }
};

/**
 * Gets the max col span for the given column.
 * 
 * @param {object}
 *            column - the column object
 * 
 * @private
 */
ListView.prototype.maxColSpan = function (column) {
  var ret = 1;
  var max = 0;
  for (var i = 0; column.children && i < column.children.length; ++i) {
    max = Math.max(max, this.maxColSpan(column.children[i]));
  }
  ret += max;
  return ret;
};

/**
 * Clears all data rows.
 * 
 * @private
 */
ListView.prototype.clear = function () {
  this.list.empty();
};

/**
 * 
 */
ListView.prototype.request = function (others) {
  var self = this;
  var params = {};
  if (self.boundedQuery != null) {
    var ft = self.boundedQuery.formdata();
    for (var k in ft) {
      this.filters[k] = ft[k];
    }
  }
  if (typeof others !== "undefined") {
    for (var k in others) {
      if (k == "start") {
        this.start = parseInt(others[k])
      } else if (k == "limit") {
        this.limit = parseInt(others[k]);
      } else {
        this.filters[k] = others[k];
      }
    }
  }
  for (var k in this.filters) {
    params[k] = this.filters[k];
  }
  params['start'] = this.start;
  params['limit'] = this.limit;
  for (var k in this.filters) {
    params[k] = this.filters[k];
  }
  // params['criteria'] = JSON.stringify(this.filters);
  // this.setCookie();
  if (typeof this.url !== "undefined") {
    $.ajax({
      url: this.url,
      type: 'POST',
      data: params,
      success: function (resp) {
        var result;
        if (typeof resp === "string") {
          result = $.parseJSON(resp);
        } else {
          result = resp;
        }
        self.total = result.total;
        self.fill(result);
        self.showPageNumber();
        self.afterLoad(result);
      },
      error: function (resp) {
        self.start = self.rollbackStart;
        self.showPageNumber();
        self.requestError();
      }
    });
    return;
  }
  this.loadLocal();
};

ListView.prototype.addFilter = function (name, value) {
  this.filters[name] = value;
};

ListView.prototype.clearFilters = function () {
  this.filters = {};
};

ListView.prototype.replace = function (str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
};

/**
 * Fills the table with the result.
 * 
 * @param the result from the server side
 */
ListView.prototype.fill = function (result) {
  this.clear();
  var mappingColumns = this.mappingColumns;
  if (result.data && result.data[0]) {
    var limit = this.limit;
    limit = limit < 0 ? result.data.length : limit;
    var tbody = $(this.list.find('tbody'));
    if (typeof this.tbodyHeight !== 'undefined') {
      tbody.css('height', this.tbodyHeight);
      tbody.css('overflow-y', 'auto');
    }
    for (var i = 0; i < limit; ++i) {
      var a = $('<a href="#" class="list-group-item list-group-item-action"></a>')
      var item = $('<div class="d-flex w-100 justify-content-between"></div>');
      a.append(item);
      if (i < result.data.length) {
        var row = result.data[i];
        this.decorateFunction(row);
        var source = document.getElementById(this.templateId).innerHTML;
        var template = Handlebars.compile(source);
        var html = template(row);
        item.html(html);
        this.list.append(a);
      }
    }
  }
};
/*****
 * CONFIGURATION
 */
//Main navigation
$.navigation = $('nav > ul.nav');

$.panelIconOpened = 'icon-arrow-up';
$.panelIconClosed = 'icon-arrow-down';

//Default colours
$.brandPrimary = '#20a8d8';
$.brandSuccess = '#4dbd74';
$.brandInfo = '#63c2de';
$.brandWarning = '#f8cb00';
$.brandDanger = '#f86c6b';

$.grayDark = '#2a2c36';
$.gray = '#55595c';
$.grayLight = '#818a91';
$.grayLighter = '#d1d4d7';
$.grayLightest = '#f8f9fa';

'use strict';

/****
 * MAIN NAVIGATION
 */

$(document).ready(function ($) {

  // Add class .active to current link
  $.navigation.find('a').each(function () {

    var cUrl = String(window.location).split('?')[0];

    if (cUrl.substr(cUrl.length - 1) == '#') {
      cUrl = cUrl.slice(0, -1);
    }

    if ($($(this))[0].href == cUrl) {
      $(this).addClass('active');

      $(this).parents('ul').add(this).each(function () {
        $(this).parent().addClass('open');
      });
    }
  });

  // Dropdown Menu
  $.navigation.on('click', 'a', function (e) {

    if ($.ajaxLoad) {
      e.preventDefault();
    }

    if ($(this).hasClass('nav-dropdown-toggle')) {
      $(this).parent().toggleClass('open');
      resizeBroadcast();
    }

  });

  function resizeBroadcast() {

    var timesRun = 0;
    var interval = setInterval(function () {
      timesRun += 1;
      if (timesRun === 5) {
        clearInterval(interval);
      }
      window.dispatchEvent(new Event('resize'));
    }, 62.5);
  }

  /* ---------- Main Menu Open/Close, Min/Full ---------- */
  $('.sidebar-toggler').click(function () {
    $('body').toggleClass('sidebar-hidden');
    resizeBroadcast();
  });

  $('.sidebar-minimizer').click(function () {
    $('body').toggleClass('sidebar-minimized');
    resizeBroadcast();
  });

  $('.brand-minimizer').click(function () {
    $('body').toggleClass('brand-minimized');
  });

  $('.aside-menu-toggler').click(function () {
    $('body').toggleClass('aside-menu-hidden');
    resizeBroadcast();
  });

  $('.mobile-sidebar-toggler').click(function () {
    $('body').toggleClass('sidebar-mobile-show');
    resizeBroadcast();
  });

  $('.sidebar-close').click(function () {
    $('body').toggleClass('sidebar-opened').parent().toggleClass('sidebar-opened');
  });

  /* ---------- Disable moving to top ---------- */
  $('a[href="#"][data-top!=true]').click(function (e) {
    e.preventDefault();
  });

});

/****
 * CARDS ACTIONS
 */

$(document).on('click', '.card-actions a', function (e) {
  e.preventDefault();

  if ($(this).hasClass('btn-close')) {
    $(this).parent().parent().parent().fadeOut();
  } else if ($(this).hasClass('btn-minimize')) {
    var $target = $(this).parent().parent().next('.card-block');
    if (!$(this).hasClass('collapsed')) {
      $('i', $(this)).removeClass($.panelIconOpened).addClass($.panelIconClosed);
    } else {
      $('i', $(this)).removeClass($.panelIconClosed).addClass($.panelIconOpened);
    }

  } else if ($(this).hasClass('btn-setting')) {
    $('#myModal').modal('show');
  }

});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function init(url) {

  /* ---------- Tooltip ---------- */
  $('[rel="tooltip"],[data-rel="tooltip"]').tooltip({
    "placement": "bottom",
    delay: {
      show: 400,
      hide: 200
    }
  });

  /* ---------- Popover ---------- */
  $('[rel="popover"],[data-rel="popover"],[data-toggle="popover"]').popover();

}

function gotoPage(url, text) {
  ajax.view(url, $('#container'), {}, function () {
    var navi = $('#navigator');
    navi.html('<li class="breadcrumb-item">' + text + '</li>')
  });
}

function gotoView(url, containerId) {
  ajax.view(url, $('#' + containerId));
}
function MultiSelect(opts) {
  this.contextPath = opts.contextPath || '';
  this.sqlId = opts.sqlId;
  this.groupIdKey = opts.groupIdKey;
  this.groupTextKey = opts.groupTextKey;
  this.idKey = opts.idKey;
  this.textKey = opts.textKey;
  this.fieldName = opts.fieldName;
  this.template = 
    '<div id="any-selector-container" class="list-group">' + 
    '  {{#each data}}' + 
    '  <div class="list-group-item"><b>{{text}}</b></div>' +
    '    {{#each children}}' +
    '    <a class="list-group-item list-group-item-action" cd={{id}} text="{{text}}" href="#">' +
    '      <input type="checkbox" class="form-checkbox" style="font-size: 16px; margin-right: 12px;">' +
    '      <label style="cursor: pointer">{{text}}</label>' +
    '    </a>' +
    '    {{/each}}' +
    '  {{/each}}' +
    '</div>';
}

MultiSelect.prototype.render = function(containerId, params) {
  var self = this;
  var httpParams = {};
  for (var k in params) {
    httpParams[k] = params[k];
  }
  
  httpParams.sqlId = this.sqlId;
  httpParams.groupIdKey = this.groupIdKey;
  httpParams.groupTextKey = this.groupTextKey;
  httpParams.idKey = this.idKey;
  httpParams.textKey = this.textKey;
  
  var button = $('<button class="btn btn-link float-right" style="text-decoration: none"><i class="icon-plus icons font-2xl"></i></button>');
  button.on('click', function(e) {
    e.preventDefault();
    ajax.get(self.contextPath + '/data/common/group.do', httpParams, function(resp) {
      var source = self.template;
      var template = Handlebars.compile(source);
      var html = template(resp);
      
      layer.open({
        type : 1,
        title : '',
        shadeClose : true,
        skin : 'layui-layer-rim', //加上边框
        area : [ 400 + 'px', 600 + 'px' ], //宽高
        content : html,
        success: function() {
          
          var selected = [];
          $('#' + containerId).find('span').each(function(idx, elm) {
            if ($(elm).attr('cd') != '') 
              selected.push($(elm).attr('cd'));
          });
          
          $('#any-selector-container').find('a').each(function(idx, elm) {
            for (var i = 0; i < selected.length; i++) {
              if (selected[i] == $(elm).attr('cd')) {
                $(elm).find('input').prop('checked', true);
              }
            }
            $(elm).on('click', function() {
              var checkbox = $(elm).find('input');
              if (checkbox.prop('checked')) {
                checkbox.prop('checked', false);
              } else {
                checkbox.prop('checked', true);
              }
              
              var cd = $(this).attr('cd');
              var text = $(this).attr('text');
              
              if (checkbox.prop('checked')) {
                var badge = $('<span cd="' + cd + '" class="badge badge-info badge-pill">' + text + '</span>');
                var remove = $('<button class="btn btn-sm btn-link"><i class="fa fa-remove"></i></button>');
                var hidden = $('<input type="hidden" name="' + self.fieldName + '" value="' + cd + '">');
                remove.on('click', function(e) {
                  e.preventDefault();
                  $(this).parent().remove();
                });
                badge.append(remove);
                badge.append(hidden);
                badge.insertBefore(button);
              } else {
                $('#' + containerId).find('span[cd="' + cd + '"]').remove();
              }
            });
          });
        }
      });
    });
  });
  $('#' + containerId).append(button);
};
/**
 * 
 */
var PaginationTable = function (opts) {
  // 远程数据源
  this.url = opts.url;
  // 本地数据源，未封装的数据源
  this.local = opts.local;
  if (typeof opts.local !== "undefined") {
    this.local = {};
    this.local.total = opts.local.length;
    this.local.data = opts.local;
  }
  this.limit = opts.limit || 25;
  this.cache = opts.cache || "server";
  this.style = opts.style || "full";
  this.headless = opts.headless || false;
  // 高度和宽度，用来固定表头和列的参数
  this.width = opts.width;
  this.height = opts.height;
  this.tbodyHeight = opts.tbodyHeight;

  // 冻结的列数量，基于零开始冻结
  this.frozenColumnCount = opts.frozenColumnCount || 0;
  this.frozenHeader = opts.frozenHeader || false;
  this.columnHeight = opts.columnHeight || '32px';

  this.boundedQuery = opts.boundedQuery || null;
  this.fixedColumns = opts.fixedColumn || 0;
  //是否只显示获取的数据长度对应的表格行数
  this.showDataRowLength = opts.showDataRowLength || false;
  this.containerId = opts.containerId;

  if (typeof opts.useCookie === "undefined") {
    this.useCookie = false;
  } else {
    this.useCookie = opts.useCookie;
  }
  this.afterLoad = opts.afterLoad || function (obj) {};
  /**
   * [{ title: "", children: [], template: "<a href='${where}'>${displayName}</a>", params: {where: "", displayName:
   * "default"} rowspan: 1 }]
   */
  this.columns = opts.columns || []; //所有一级列数量
  this.allcolumns = 0; //所有的列数量（包含了嵌套列)）
  this.columnMatrix = [];
  var max = 0;
  for (var i = 0; i < this.columns.length; ++i) {
    var col = this.columns[i];
    max = Math.max(max, (col.rowspan || 1));
    if (typeof col.colspan != "undefined") {
      this.allcolumns += col.colspan;
    } else {
      this.allcolumns++;
    }
  }
  this.mappingColumns = [];
  this.filters = {};
  this.headRowCount = max;
  this.start = 0;
  this.rollbackStart = 0;
  this.total = 0;
  this.table = null;
  this.result = null;
  for (var i = 0; i < max; ++i) {
    this.columnMatrix.push([]);
  }
  this.buildMatrix(this.columns, 0);
  this.buildMappingColumns(this.columns);

  this.rotateconfig = {
    len: 25, //图像每次旋转的角度
    brushtm: 70, //旋转的间隙时间
    maxptnum: 10, //提示文字后面.的最长数量
    textcololor: "#629BA0"
  }
};

/**
 * Turns to the previous page.
 */
PaginationTable.prototype.prev = function () {
  if (this.start <= 0)
    return;
  this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
PaginationTable.prototype.next = function () {
  if (this.start + this.limit >= this.total)
    return;
  this.go((this.start + this.limit) / this.limit + 1);
};

/**
 * Goes to the given page.
 * 
 * @param {integer}
 *            page - the page number
 */
PaginationTable.prototype.go = function (page, criteria) {
  if (page <= 0 || page > this.lastPageNumber())
    return;
  this.rollbackStart = this.start;
  this.start = this.limit * (page - 1);
  // this.disablePaging();
  this.request(criteria);
};

/**
 * Renders the table in the web brower.
 * 
 * @param {string}
 *            containerId - the container id in the dom.
 */
PaginationTable.prototype.render = function (containerId, params) {
  if (typeof this.contaienrId === 'undefined') this.containerId = containerId;
  var cntr = $('#' + this.containerId);
  cntr.empty();
  cntr.append(this.root(params)).append(this.pagination());
  if (typeof params === "undefined" || params == '' || params == '{}') {
    // this.beforeRequest();
    this.go(1);
    this.afterRequest();
  } else if (typeof params === 'object') {
    for (k in params) {
      this.addFilter(k, params[k]);
    }
    this.request({});
  } else {
    var ps = $.parseJSON(params);
    // this.beforeRequest(ps);
    this.request(ps);
    this.afterRequest();
  }
};

PaginationTable.prototype.beforeRequest = function (initParams) {
  var _this = this;


  //var loadding = $("<h6> 正在加载数据，请稍候....</h6>");
  var loaddingct = $("<div></div>");
  loaddingct.attr("class", "loaddingct");
  var loadding = $("<img/>");
  var loaddingtext = $("<h6>数据正在加载，请稍候</h6>");
  loaddingtext.css("color", _this.rotateconfig.textcololor);
  loaddingct.append(loaddingtext);
  var len = 0,
    ptnum = 0;

  window.setInterval(function () {
    len += _this.rotateconfig.len;
    $("#" + loadding.attr("id")).css({
      '-webkit-transform': "rotate(" + len + "deg)",
      '-moz-transform': "rotate(" + len + "deg)",
      '-ms-transform': "rotate(" + len + "deg)",
      '-o-transform': "rotate(" + len + "deg)",
      'transform': "rotate(" + len + "deg)",
    });

    if (ptnum++ < _this.rotateconfig.maxptnum)
      loaddingtext.html(loaddingtext.html() + ".");
    else {
      ptnum = 0;
      loaddingtext.html("数据正在加载，请稍候");
    }
  }, _this.rotateconfig.brushtm);

  $(this.table.find('tbody')).append($("<tr></tr>").append($("<td></td>").attr("colspan", this.allcolumns).append(loaddingct)));
};

PaginationTable.prototype.afterRequest = function () {

};

PaginationTable.prototype.requestError = function () {
  this.table.find("div.loaddingct").html('<h6 style="color:red">数据加载出错，请联系管理员解决...</h6>');
};
/**
 * Gets the html source for this pagination table object.
 *
 * @return {object} the jquery table
 */
PaginationTable.prototype.root = function (initParams) {
  if (typeof initParams === "undefined") {
    initParams = {};
  }
  var ret = $('<div>');
  ret.css('overflow-y', 'auto');
  this.table = $("<table></table>");
  if (typeof this.width !== 'undefined') this.table.css('width', this.width);
  if (typeof this.height !== 'undefined') ret.css('height', this.height);
  // if (!this.frozenHeader) this.table.addClass('table');
  // this.table.addClass("table table-bordered table-striped");
  this.table.addClass("table table-responsive-sm table-hover table-outline mb-0");

  var self = this;
  var thead = $('<thead class="thead-light"></thead>');
  for (var i = 0; i < this.columnMatrix.length; ++i) {
    var tr = $("<tr></tr>");
    for (var j = 0; j < this.columnMatrix[i].length; ++j) {
      var col = this.columnMatrix[i][j];
      var th = $('<th style="text-align: center"></th>');
      // 冻结列
      if (j < this.frozenColumnCount) th.addClass('headcol');
      var span = $("<span class='pull-right fa fa-arrows-v'></span>");
      span.css("opacity", "0.3");
      span.css('margin-top', '2px');
      span.addClass('fa');
      span.on("click", function (evt) {
        var sorting = "asc";
        var span = $(evt.target);
        if (span.hasClass("fa-arrows-v")) {
          span.removeClass("fa-arrows-v");
          span.addClass("fa-sort-amount-asc");
          span.css("opacity", "0.6");
          sorting = "asc";
        } else if (span.hasClass("fa-sort-amount-asc")) {
          span.removeClass("fa-sort-amount-asc");
          span.addClass("fa-sort-amount-desc");
          sorting = "desc";
        } else if (span.hasClass("fa-sort-amount-desc")) {
          span.removeClass("fa-sort-amount-desc");
          span.addClass("fa-sort-amount-asc");
          sorting = "asc";
        }
        // 其余的重置
        if (!span.hasClass("fa-arrows-v")) {
          self.table.find("th span").each(function (idx, elm) {
            if (span.attr("data-order") == $(elm).attr("data-order")) return;
            $(elm).removeClass("fa-sort-amount-asc");
            $(elm).removeClass("fa-sort-amount-desc");
            $(elm).addClass("fa-arrows-v");
            $(elm).css("opacity", "0.3");
          });
        }
        // 请求数据
        self.filters["orderBy"] = span.attr("data-order");
        self.filters["sorting"] = sorting;
        self.request();
      });
      th.attr('rowspan', col.rowspan || 1);
      th.attr('colspan', col.colspan || 1);
      // style
      th.attr('style', col.style || "");
      // 如果设置了列宽
      if (typeof col.width !== 'undefined') th.css('width', col.width);
      // 当需要冻结表头
      if (this.frozenHeader == true) {
        thead.css('float', 'left');
        th.css('float', 'left');
      }
      // 默认居中
      // th.css('text-align', 'center');
      if (typeof col.headerClick === "undefined") {
        //th.text(col.title);
        th.append(col.title);
      } else {
        var a = $('<a>');
        a.on('click', col.headerClick);
        th.append(a);
        a.css("cursor", "default");
        a.text(col.title);
      }
      // 如果定义了data-order属性，则添加
      if (typeof col.order !== "undefined") {
        span.attr("data-order", col.order);
        // 根据初始化的过滤条件中，显示图标
        if (col.order === initParams["orderBy"]) {
          span.removeClass("fa sort");
          if (initParams["sorting"] === "asc") {
            // span.addClass("glyphicon-sort-by-attributes");
            span.addClass('fa fa-sort-amount-asc')
          } else {
            // span.addClass("glyphicon-sort-by-attributes-alt");
            span.addClass('fa fa-sort-amount-desc')
          }
        }
        th.append(span);
      }
      tr.append(th);
    }
    thead.append(tr);
  }
  if (!this.headless)
    this.table.append(thead);
  // 添加个空的表体
  this.table.append('<tbody></tbody>');
  ret.append(this.table);
  return ret;
};


/**
 * Builds pagination bar for table.
 * 
 * @return {object} a pagination bar, the jquery div.
 */
PaginationTable.prototype.pagination = function () {
  if (this.limit <= 0) {
    return;
  }
  var self = this;
  var div = $('<div></div>');
  div.css('float', 'right');
  div.css('margin', '8px');
  var ul = $('<ul></ul>');
  ul.addClass('pagination');
  this.firstPage = $('<li></li>');
  var a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('首页');
  a.on('click', function () {
    self.go(1);
  });
  this.firstPage.append(a);

  if (this.style === 'full') {
    ul.append(this.firstPage);
  }

  this.prevPage = $('<li></li>');
  a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('上一页');
  a.on('click', function () {
    self.prev();
  });
  this.prevPage.append(a);
  ul.append(this.prevPage);

  li = $('<li></li>');
  li.addClass('disabled');
  this.pagebar = $('<a></a>');
  this.pagebar.attr('href', 'javascript:void(0)');
  this.pagebar.attr('style', 'cursor: default');
  this.pagebar.text("0/0");
  li.append(this.pagebar);
  ul.append(li);

  this.nextPage = $('<li></li>');
  a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('下一页');
  a.on('click', function () {
    self.next();
  });
  this.nextPage.append(a);
  ul.append(this.nextPage);

  this.lastPage = $('<li></li>');
  a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('末页');
  a.on('click', function () {
    self.go(self.lastPageNumber());
  });
  this.lastPage.append(a);
  if (this.style === 'full') {
    ul.append(this.lastPage);
  }

  li = $('<li class=disabled></li>');
  a = $('<a></a>');
  a.attr('style', 'cursor: default');
  /*
  this.pagenum = $('<input/>');
  this.pagenum.attr('size', 1);
  this.pagenum.attr('style', 'font-size: 11px; text-align: right; width: 25px; height: 20px;');
  if (this.style === 'full') {
    a.append(this.pagenum);
    li.append(a);
    ul.append(li);
  }

  li = $('<li></li>');
  a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('跳转');
  a.on('click', function () {
    var str = self.pagenum.val();
    if (typeof str === 'undefined' || str === '')
      return;
    // remove whitespace
    str = str.replace(/^\s+|\s+$/g, '');
    if (str === '')
      return;
    if (isNaN(self.pagenum.val()))
      return;
    var pn = parseInt(self.pagenum.val());
    if (pn < 0 || pn > self.lastPageNumber())
      return;
    self.go(pn);
  });

  if (this.style === 'full') {
    li.append(a);
    ul.append(li);
  }
  */

  if (this.style === 'none') {
    return;
  }
  div.append(ul);
  return div;
};

/**
 * Shows the page number in the page bar and controls each link status.
 * 
 * @private
 */
PaginationTable.prototype.showPageNumber = function () {
  var pagenum = this.start / this.limit + 1;
  var lastpagenum = this.lastPageNumber(),
    total = this.total;
  lastpagenum = lastpagenum ? lastpagenum : 0, total = total ? total : 0;
  if (this.limit <= 0) {
    return;
  }
  this.pagebar.html(pagenum + "/" + lastpagenum + "&nbsp;&nbsp;共" + total + "条记录");
  this.firstPage.removeClass();
  this.prevPage.removeClass();
  this.nextPage.removeClass();
  this.lastPage.removeClass();
  if (pagenum == 1) {
    this.firstPage.addClass('disabled');
    this.prevPage.addClass('disabled');
  }
  if (pagenum == this.lastPageNumber()) {
    this.nextPage.addClass('disabled');
    this.lastPage.addClass('disabled');
  }
};

PaginationTable.prototype.disablePaging = function () {
  if (this.limit <= 0) {
    return;
  }
  this.firstPage.removeClass();
  this.prevPage.removeClass();
  this.nextPage.removeClass();
  this.lastPage.removeClass();
  this.firstPage.addClass('disabled');
  this.prevPage.addClass('disabled');
  this.nextPage.addClass('disabled');
  this.lastPage.addClass('disabled');
};

/**
 * Gets the last page number.
 * 
 * @return the last page number
 */
PaginationTable.prototype.lastPageNumber = function () {
  if (this.total == 0 || this.limit == -1) {
    return 1;
  }
  var residue = this.total % this.limit;
  if (residue == 0) {
    return parseInt(this.total / this.limit);
  } else {
    return parseInt(this.total / this.limit + 1);
  }
};

/**
 * Gets the max col span for the given column.
 * 
 * @param {object}
 *            column - the column object
 * 
 * @private
 */
PaginationTable.prototype.maxColSpan = function (column) {
  var ret = 1;
  var max = 0;
  for (var i = 0; column.children && i < column.children.length; ++i) {
    max = Math.max(max, this.maxColSpan(column.children[i]));
  }
  ret += max;
  return ret;
};

/**
 * Clears all data rows.
 * 
 * @private
 */
PaginationTable.prototype.clear = function () {
  // this.table.find("thead").remove(); // 如果手动添加了表格头部
  $(this.table.find('tbody')).empty();
};

/**
 * Builds the direct columns which are used to map values with result.
 * 
 * @param {array}
 *            columns - the columns
 * 
 * @private
 */
PaginationTable.prototype.buildMappingColumns = function (columns) {
  for (var i = 0; i < columns.length; i++) {
    var col = columns[i];
    if (!col.children || col.children.length == 0) {
      this.mappingColumns.push(col);
    } else {
      this.buildMappingColumns(col.children);
    }
  }
};

/**
 * Builds column matrix.
 * 
 * @param {object}
 *            parent - the parent column
 * 
 * @param {integer}
 *            index - the matrix row index
 * 
 * @private
 */
PaginationTable.prototype.buildMatrix = function (columns, index) {
  if (!columns)
    return;
  var currentIndex = index;

  // add column children
  for (var i = 0; i < columns.length; ++i) {
    var col = columns[i];
    if (col.children && col.children.length > 0) {
      col.colspan = col.colspan || 1;
      this.buildMatrix(col.children, index + 1);
    }
    this.columnMatrix[currentIndex].push(col);
  }
};

/**
 * 
 */
PaginationTable.prototype.request = function (others) {
  var self = this;
  var params = {};
  if (self.boundedQuery != null) {
    var ft = self.boundedQuery.formdata();
    for (var k in ft) {
      this.filters[k] = ft[k];
    }
  }
  if (typeof others !== "undefined") {
    for (var k in others) {
      if (k == "start") {
        this.start = parseInt(others[k])
      } else if (k == "limit") {
        this.limit = parseInt(others[k]);
      } else {
        this.filters[k] = others[k];
      }
    }
  }
  for (var k in this.filters) {
    params[k] = this.filters[k];
  }
  params['start'] = this.start;
  params['limit'] = this.limit;
  for (var k in this.filters) {
    params[k] = this.filters[k];
  }
  // params['criteria'] = JSON.stringify(this.filters);
  // this.setCookie();
  if (typeof this.url !== "undefined") {
    $.ajax({
      url: this.url,
      type: 'POST',
      data: params,
      success: function (resp) {
        var result;
        if (typeof resp === "string") {
          result = $.parseJSON(resp);
        } else {
          result = resp;
        }
        self.total = result.total;
        self.fill(result);
        self.showPageNumber();
        self.afterLoad(result);
      },
      error: function (resp) {
        self.start = self.rollbackStart;
        self.showPageNumber();
        self.requestError();
      }
    });
    return;
  }
  this.loadLocal();
};

/**
 * 加载本地数据分页显示。
 */
PaginationTable.prototype.loadLocal = function () {
  this.total = this.local.total;
  var result = {};
  result.total = this.local.total;
  result.data = [];
  for (var i = this.start; i < (this.start + this.limit); i++) {
    result.data.push(this.local.data[i] == null ? "&nbsp;" : this.local.data[i]);
  }
  this.fill(result);
  this.showPageNumber();
  this.afterLoad(result);
};

PaginationTable.prototype.addFilter = function (name, value) {
  this.filters[name] = value;
};

PaginationTable.prototype.clearFilters = function () {
  this.filters = {};
};

PaginationTable.prototype.replace = function (str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
};

/**
 * Fills the table with the result.
 * 
 * @param the result from the server side
 */
PaginationTable.prototype.fill = function (result) {
  this.clear();
  var mappingColumns = this.mappingColumns;
  if (result.data && result.data[0]) {
    var limit = this.limit;
    limit = limit < 0 ? result.data.length : limit;
    var tbody = $(this.table.find('tbody'));
    if (typeof this.tbodyHeight !== 'undefined') {
      tbody.css('height', this.tbodyHeight);
      tbody.css('overflow-y', 'auto');
    }
    for (var i = 0; i < limit; ++i) {
      var tr = $("<tr></tr>");
      tr.css('height', this.columnHeight)
      if (i < result.data.length) {
        var row = result.data[i];
        for (var j = 0; j < mappingColumns.length; ++j) {
          var col = mappingColumns[j];
          var td = $("<td></td>");
          // 冻结列
          if (j < this.frozenColumnCount) td.addClass('headcol');
          if (col.style) {
            td.attr("style", col.style);
          } else {
            td.attr("style", "text-align: center; vertical-align:middle");
          }
          if (typeof col.width !== 'undefined') td.css('width', col.width);
          if (this.frozenHeader == true) {
            tbody.css('float', 'left');
            td.css('float', 'left');
          }
          if (col.template) {
            var html = col.template.toString();
            for (k in row) {
              row[k] = row[k] == null ? "" : row[k];
              html = this.replace(html, "\\{" + k + "\\}", row[k]);
            }
            if (html.indexOf('{') == 0 && html.indexOf('}') != -1) {
              html = '';
            }
            td.html(html);
          }
          if (col.displayFunction) {
            col.displayFunction(row, td, j);
          }
          tr.append(td);
        }
        tbody.append(tr);
      } else {
        
//        if (this.limit <= 0) {
//          break;
//        }
//        for (var j = 0; j < mappingColumns.length; ++j) {
//          var td = $("<td>&nbsp;</td>");
//          tr.append(td);
//        }
      }
      
    }
  }

};

$.fn.searchbox = function(options) {
    options = options || {};
    this.direction = options.direction || 'down';
    var self = this;
    $(this).on('keyup', function(e) {
        var input = $(this);
        var offset = input.offset();
        var left = offset.left;
        if (self.direction === 'up') {
            var top = offset.top - input.height();
        } else {
            var top = offset.top + input.height();
        }

        var keyword = input.val();
        if (keyword === '') return;
        $.ajax({
            url: options.url,
            data: {keyword: keyword},
            dataType: 'json',
            success: function(data) {
                displayResult(data, {left: left, top: top});
            }
        });
    });
    
    this.data = [];

    var self = this;
    function displayResult(data, pos) {
        self.data = data;
        var divResult = $('#__search_result');
        if (divResult.length) {
            divResult.empty();
        } else {
            divResult = $('<div id="__search_result" class="dropdown-menu dropdown-menu-right" style="width: 200px" role="menu"></div>');
            $('body').append(divResult);
        }
        divResult.css('position', 'absolute');
        
        var ul = $('<ul style="list-style: none">');
        for (var i = 0; i < data.length; i++) {
            var itm = data[i];
            var li = $('<li>');
            var a = $('<a style="cursor: pointer">');
            for (var k in itm) {
                a.attr('data-' + k, itm[k]);
            }
            a.on('click', function() {
                divResult.hide();
                $(self).val($(this).text());
                var attrs = {};
                $(this).each(function() {
                    $.each(this.attributes, function() {
                        if(this.specified) {
                            if (this.name.indexOf('data-') == 0)
                                attrs[this.name.substr(5)] = this.value;
                        }
                    });
                });
                if (typeof options.callback !== 'undefined') {
                    options.callback(attrs);
                }
            });
            a.text(itm.text);
            li.append(a);
            ul.append(li);
        }
        divResult.append(ul);

        // positioning
        if (self.direction == 'down') {
            divResult.css('left', pos.left);
            divResult.css('top', pos.top);
        } else {
            divResult.css('left', pos.left);
            divResult.css('top', pos.top - divResult[0].offsetHeight);
        }

        divResult.show();
    }
};
/**
 * 构造函数。
 *
 * @param {object} option
 *          选项设置
 *
 * @constructor
 */
function StatisticsTable(option) {
    this.url = option.url;
    this.columns = option.columns;
    this.onDimensionChanged = option.onDimensionChanged;
}

/**
 * 继承分页表为父类型。
 *
 * @type {PaginationTable}
 */
StatisticsTable.prototype = new PaginationTable({});


StatisticsTable.prototype.render = function (containerId) {
    this.containerId = containerId;

    this.table = $('<table>');
    this.table.addClass('table table-responsive-sm table-hover table-outline mb-0');

    var thead = $('<thead class="thead-light">');
    var tr = $('<tr>');
    for (var i = 0; i < this.columns.length; i++) {
        var col = this.columns[i];
        var th = $('<th style="text-align: center">');
        if (col.dimensions) {
            var a = $('<a data-toggle="dropdown">');
            a.attr('id', this.containerId + '__' + col.title + '__dimensions');
            var span = $('<span>');
            span.addClass('fa fa-ellipsis-v');
            a.addClass('pull-right');
            a.css('cursor', 'pointer');
            a.append(span);

            var div = $('<div class="dropdown-menu">');
            div.attr('aria-labelledby', a.attr('id'));
            for (var j = 0; j < col.dimensions.length; j++) {
                var dim = col.dimensions[j];
                if (j == 0) {
                    th.text(dim.title);
                }
                div.append('<button class="dropdown-item" type="button">' + dim.title + '</button>');
            }
            th.append(a);
            th.append(div);
        } else {
            th.text(col.title);
        }
        tr.append(th);
    }
    thead.append(tr);
    this.table.append(thead);
    var container = $('#' + this.containerId);
    var params = {};
    var self = this;
    ajax.post(this.url, params, function () {
       container.empty();
       container.append(self.table);
    });
};

/**
 * @constructor
 * 
 * 构造一个以svg为基础的图形显示。依赖d3库操作svg对象。
 * 
 * @param {object}
 *          option - 配置项
 */
function Svg(option) {
  this.svgurl = option.svgurl;
  this.zoomable = option.zoomable || false;
  this.onLoad = option.onLoad;
  this.onDecorate = option.onDecorate;
  this.enableDrawing = option.enableDrawing || false;
  this.isDrawingLine = false;
  this.isDrawingPolygon = false;
  this.lastClickedPoint = null;
  this.clickedPoints = [];
}

Svg.prototype.render = function(containerId) {
  this.containerId = containerId;
  var self = this;
  d3.xml(this.svgurl).mimeType('image/svg+xml').get(function (error, xml) {
    self.container = document.getElementById(self.containerId);
    var svg = d3.select(xml.documentElement);
    self.dom = xml.documentElement;
    self.svg = svg;
    
    self.container.innerHTML = '';
    self.container.appendChild(self.dom);
    
    // keep the original viewBox
    self.viewBox = svg.attr('viewBox');
    var vals = self.viewBox.split(' ');
    var width = parseFloat(vals[2]);
    var height = parseFloat(vals[3]);

    if (self.zoomable) {
      var zoom = d3.zoom().on('zoom', function () {
        var svg = d3.select(this).select('svg');

        var containerHeight = self.container.offsetHeight;
        var containerWidth = self.container.offsetWidth;

        var scaleX = width / containerWidth;
        var scaleY = height / containerHeight;

        var k = d3.event.transform.k;
        var x = d3.event.transform.x;
        var y = d3.event.transform.y;

        svg.attr('viewBox', (-x / k * scaleX) + ' ' + (-y / k * scaleY) + ' ' + (width / k) + ' ' + (height / k));
        // 例子中的transform，可以到处跑
        // svg.attr('transform', d3.event.transform);
      });
    }

    if (self.onDecorate)
      self.onDecorate(self.svg, self.dom);

    if (self.onLoad)
      self.onLoad(self.svg, self.dom);
    if (self.enableDrawing) {
      svg.on('mousedown', function () {
        var point = d3.mouse(this);
        var newClickedPoint = {x: point[0], y: point[1]};
        self.lastClickedPoint = newClickedPoint;
        self.clickedPoints.push(newClickedPoint);

        self.lastLine = self.svg.select('#_tmp_line');
        if (self.lastLine.empty()) {
          self.lastLine = self.svg.append('line');
          self.lastLine.attr('id', '_tmp_line').style('stroke', 'blue')
          .attr('x1', newClickedPoint.x).attr('y1', newClickedPoint.y)
          .attr('x2', newClickedPoint.x).attr('y2', newClickedPoint.y);
        } else {
          self.lastLine.attr('id', '');
          self.lastLine = self.svg.append('line');
          self.lastLine.attr('id', '_tmp_line').style('stroke', 'blue')
          .attr('x1', newClickedPoint.x).attr('y1', newClickedPoint.y)
          .attr('x2', newClickedPoint.x).attr('y2', newClickedPoint.y);
        }
      });

      svg.on('contextmenu', function () {
        d3.event.preventDefault();
        self.lastClickedPoint = null;
      });

      svg.on('mousemove', function() {
        if (!self.lastClickedPoint) {
          return;
        }
        var point = d3.mouse(this);

        self.lastLine.attr('x2', point[0]).attr('y2', point[1]);
      });
    }
    // binding events
    if (self.zoomable) 
      d3.select(self.container).call(zoom);
  });
};

Svg.prototype.restore = function () {
  var svg = d3.select(this.container).select('svg');
  svg.attr('viewBox', this.viewBox);
};

/**
 * @private
 */
Svg.prototype.findClosest = function (x, y) {
  // TODO
};


// JavaScript Document
var utils = {};

/**
 * 
 */
utils.append = function (container, html) {
  var range = document.createRange();
  var fragment = range.createContextualFragment(html);
  container.innerHTML = '';
  container.appendChild(fragment);
};
var NO_ERRORS = 0;
var REQUIRED_ERROR = 1;
var FORMAT_ERROR = 2;
var INVALID_ERROR = 3;

// add string trim method if not existing
if (!String.prototype.trim) {
    (function() {
        // Make sure we trim BOM and NBSP
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function() {
            return this.replace(rtrim, '');
        };
    })();
}

/**
 * The jquery plugin to validate user-input elements under a element.
 * 
 * @param {function}
 *            callback - the callback function
 * 
 * @return errors including message and element
 */
$.fn.validate = function(callback) {
    return Validation.validate(this, callback);
};

Validation = {
    /**
     * 
     */
    validate: function(container, callback) {
        var ret = [];
        if (typeof container === 'undefined') {
            container = $(document);
        }
        // 输入框
        container.find('input[type!=checkbox][type!=radio][type!=button]').each(function(idx, el) {
            var val = $(el).val().trim();
            var label = Validation.getLabel(el);
            // 必填项校验
            var msg = $(el).attr('required-message') ? $(el).attr('required-message') : label + '必须填写！';
            if (($(el).prop('required') || $(el).attr("required") == "required") && val === '') {
                ret.push({
                    element: el,
                    message: msg
                });
            }
            // 专用类型校验
            var expr = $(el).attr('domain-type');
            if (!expr) {
                return;
            }
            var msg = label + '填写不合要求。';
            var dt = Validation.getDomainValidator(new ValidationModel(expr));
            if (dt != null && val !== '') {
                var res = dt.test(val);
                switch (res) {
                case REQUIRED_ERROR:
                    break;
                case FORMAT_ERROR:
                    msg = $(el).attr('format-message') ? $(el).attr('format-message') : msg;
                    break;
                case INVALID_ERROR:
                    msg = $(el).attr('invalid-message') ? $(el).attr('invalid-message') : msg;
                    break;
                default:
                    break;
                }
                if (res != NO_ERRORS) {
                    ret.push({
                        element: $(el),
                        message: msg
                    });
                }
            }
        });
        container.find('textarea').each(function(idx, el) {
            var val = $(el).val().trim();
            var label =Validation.getLabel(el);
            // 必填项校验
            var msg = $(el).attr('required-message') ? $(el).attr('required-message') : label + '必须填写！';
            if ($(el).prop('required') && val === '') {
                ret.push({
                    element: el,
                    message: msg
                });
            }
            // 专用类型校验
            var expr = $(el).attr('domain-type');
            if (!expr) {
                return;
            }
            var msg = label + '填写不合要求。';
            var dt = Validation.getDomainValidator(new ValidationModel(expr));
            if (dt != null && val !== '') {
                var res = dt.test(val);
                switch (res) {
                case REQUIRED_ERROR:
                    break;
                case FORMAT_ERROR:
                    msg = $(el).attr('format-message') ? $(el).attr('format-message') : msg;
                    break;
                case INVALID_ERROR:
                    msg = $(el).attr('invalid-message') ? $(el).attr('invalid-message') : msg;
                    break;
                default:
                    break;
                }
                if (res != NO_ERRORS) {
                    ret.push({
                        element: $(el),
                        message: msg
                    });
                }
            }
        });
        // 下拉框
        container.find('select').each(function(idx, el) {
            if ($(el).prop('required') && $(el).val() == '-1') {
                var label = Validation.getLabel(el);
                var msg = label + '必须选择！';
                msg = $(el).attr('required-message') ? $(el).attr('required-message') : msg;
                ret.push({
                    element: $(el),
                    message: msg
                });
            }
        });
        // 复选框
        var names = {};
        container.find('input[type=checkbox]').each(function(idx, el) {
            // 名称必须要有
            var name = $(el).attr('name');
            names[name] = name;
        });
        for ( var name in names) {
            var checked = false;
            var label = null;
            var elm = null;
            container.find('input[name="' + name + '"]').each(function(idx, el) {
                if (idx == 0) {
                    label = Validation.getLabel(el);
                    elm = el;
                }
                if (!checked && $(el).prop('checked')) {
                    checked = true;
                }
            });
            if (!checked && $(elm).prop('required')) {
                var msg = label + '必须选择！';
                msg = $(elm).attr('required-message') ? $(elm).attr('required-message') : msg;
                ret.push({
                    element: $(elm),
                    message: msg
                });
            }
        }
        // 单选框
        var names = {};
        container.find('input[type=radio]').each(function(idx, el) {
            // 名称必须要有
            var name = $(el).attr('name');
            names[name] = name;
        });
        for ( var name in names) {
            var checked = false;
            var label = null;
            var elm = null;
            container.find('input[name="' + name + '"]').each(function(idx, el) {
                if (idx == 0) {
                    label = Validation.getLabel(el);
                    elm = el;
                }
                if (!checked && $(el).prop('checked')) {
                    checked = true;
                }
            });
            if (!checked && $(elm).prop('required')) {
                var msg = label + '必须选择！';
                msg = $(elm).attr('required-message') ? $(elm).attr('required-message') : msg;
                ret.push({
                    element: $(elm),
                    message: msg
                });
            }
        }
        // ajax验证
        container.find('input[remote]').each(function(idx, el) {
            var uri = $(el).attr('remote');
            var val = $(el).val().trim();
            if (uri && uri != '' && val != '') {
                $.ajax({
                    url: uri,
                    method: 'POST',
                    data: "check=" + val,
                    success: function(resp) {
                        var obj = $.parseJSON(resp);
                        if (obj.err) {
                            ret.push({
                                element: $(el),
                                message: obj.msg
                            });
                        }
                    }
                });
            }
        });
        if (callback) {
            callback(ret);
        }

        return ret;
    },

    getLabel: function(_el){
        var el = $(_el);
        return el.attr('label') || (el.attr("name") || el.attr("id"));
    },

    getDomainValidator: function(model) {
        var domain = model.keyword.toLowerCase();
        var vm = model;
        var ret = null;
        if (domain === 'mail' || domain === 'email') {
            ret = new Validation.Mail();
        } else if (domain === 'number') {
            ret = new Validation.Number(vm.symbol, vm.args);
        } else if (domain === 'string') {
            ret = new Validation.String(vm.args);
        } else if (domain === 'mobile') {
            ret = new Validation.Mobile();
        } else if (domain === 'range') {
            ret = new Validation.Range(vm.opts, vm.args);
        } else if (domain === 'phone') {
            ret = new Validation.Phone();
        } else if (domain === 'cmpexp') {
            ret = new Validation.CmpExp(vm.args[0], vm.args[1]);
        } else if (domain === 'regexp') {
            ret = new Validation.RegExp(vm.args[0]);
        } else if (domain === 'remote') {
            ret = new Validation.Remote(vm.args[0]);
        } else if (domain === 'date') {
            ret = new Validation.Date();
        } else if (domain === 'time') {
            ret = new Validation.Time();
        } else if (domain === 'datetime') {
            ret = new Validation.DateTime();
        } else {
            throw new Error('not support for the domain("' + domain + '")');
        }
        return ret;
    },

    String: function(args) {
        this.min = 0;
        this.max = parseInt(args[0]);
        if (args.length > 1) {
            this.min = parseInt(args[0]);
            this.max = parseInt(args[1]);
        }
        this.test = function(str) {
            if (str.length < this.min) {
                return FORMAT_ERROR;
            }
            if (this.max && str.length > this.max) {
                return FORMAT_ERROR;
            }
            return NO_ERRORS;
        }
    },

    Number: function(sym, args) {
        var start = 7;
        this.plus = -1;
        this.minus = -1;
        if (sym === '-') {
            this.minus = 0;
        } else if (sym === '+') {
            this.plus = 0;
        }

        if (this.minus == 0 || this.plus == 0) {
            start += 1;
        }
        this.precision = parseInt(args[0]);
        if (args.length > 1) {
            this.scale = parseInt(args[1]);
        }

        this.test = function(str) {
            if (this.plus == 0) {
                var re = /^\s*(\+)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
                if (!re.test(str)) {
                    return FORMAT_ERROR;
                }
            } else if (this.minus == 0) {
                var re = /^\s*(-)((\d+(\.\d+)?)|(\.\d+))\s*$/;
                if (!re.test(str)) {
                    return FORMAT_ERROR;
                }
            } else {
                var re = /^\s*(\+)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
                if (!re.test(str)) {
                    return FORMAT_ERROR;
                }
            }

            var idx = str.indexOf('.');
            var maxlen = idx == -1 ? this.precision : this.precision + 1;
            maxlen = this.plus == 0 || this.minus == 0 ? maxlen + 1 : maxlen;
            if (str.length > maxlen) {
                return FORMAT_ERROR;
            }

            if (idx != -1 && this.scale) {
                var s = str.substring(idx + 1);
                if (s.length > this.scale) {
                    return FORMAT_ERROR;
                }
            }
            return NO_ERRORS;
        }
    },

    Mail: function() {
        this.test = function(str) {
            var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if (!re.test(str)) {
                return FORMAT_ERROR;
            }
            return NO_ERRORS;
        }
    },

    Phone: function() {
        this.test = function(str) {
            var re = /^\d{11}$/i;
            if (!re.test(str)) {
                return FORMAT_ERROR;
            }
            return NO_ERRORS;
        }
    },

    Mobile: function() {
        this.test = function(str) {
            var re = /^\d{11}$/i;
            if (!re.test(str)) {
                return FORMAT_ERROR;
            }
            return NO_ERRORS;
        }
    },

    Date: function() {
        this.test = function(str) {
            var re = /^\d{4}-\d{1,2}-\d{1,2}$/;
            if (!re.test(str)) {
                return FORMAT_ERROR;
            }
            if (isNaN(Date.parse(str))) {
                return INVALID_ERROR;
            }
            return NO_ERRORS;
        }
    },

    Time: function() {
        this.test = function(str) {
            var re = /^\d{1,2}:\d{1,2}(:\d{1,2})?$/;
            if (!re.test(str)) {
                return FORMAT_ERROR;
            }
            str = "1970-01-01 " + str;
            if (isNaN(Date.parse(str))) {
                return INVALID_ERROR;
            }
            return NO_ERRORS;
        }
    },

    DateTime: function() {
        this.test = function(str) {
            var re = /^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}(:\d{1,2})?$/;
            if (!re.test(str)) {
                return FORMAT_ERROR;
            }
            if (isNaN(Date.parse(str))) {
                return INVALID_ERROR;
            }
            return NO_ERRORS;
        }
    },

    RegExp: function(expr) {
        this.re = new RegExp(expr);
        this.test = function(str) {
            if (!this.re.test(str)) {
                return FORMAT_ERROR;
            }
            return NO_ERRORS;
        }
    },

    CmpExp: function(type, expr) {
        this.model = new ValidationModel(type);
        this.expr = expr;
        this.ignore = false;
        var self = this;
        this.test = function(str) {
            var expr = this.expr;
            var dt = Validation.getDomainValidator(this.model);
            if (dt.test(str) != NO_ERRORS) {
                return FORMAT_ERROR;
            }
            $('input[type!=checkbox][type!=radio][type!=button]').each(function(idx, el) {
                var name = $(el).attr('name');
                var val = $(el).val();
                if (expr.indexOf(name) != -1) {
                    if (val == '') {
                        self.ignore = true;
                    }
                    expr = expr.replace(new RegExp(name, 'g'), val);
                }
            });
            if (!this.ignore) {
                try {
                    if (!eval(expr)) {
                        return INVALID_ERROR;
                    }
                } catch (e) {
                    return INVALID_ERROR;
                }
            }
            return NO_ERRORS;
        }
    },

    Remote: function(uri) {
        this.test = function(str) {
            $.ajax({
                url: uri + str,
                dataType: "json",
                success: function(resp) {
                    if (resp.error != 0) {

                    }
                }
            });
        }
    },

    Range: function(opts, args) {
        this.min = parseFloat(args[0]);
        this.max = parseFloat(args[1]);
        this.test = function(str) {
            var check = parseFloat(str.trim());
            if (isNaN(check)) {
                return INVALID_ERROR;
            }
            var ret = false;
            if (opts[0] == ">") {
                ret = (check > this.min);
            } else if (opts[0] === ">=") {
                ret = (check >= this.min);
            }
            if (!ret) {
                return INVALID_ERROR;
            }
            if (opts[1] == "<") {
                ret = (check < this.max);
            } else if (opts[1] === "<=") {
                ret = (check <= this.max);
            }
            if (!ret) {
                return INVALID_ERROR;
            }
            return NO_ERRORS;
        }
    }
};

ValidationModel = function(expr) {
    this.symbol = '';
    this.keyword = '';
    this.opts = [];
    this.args = [];

    this.unary_ops = {
        '+': true,
        '-': true
    };

    this.keywords = {
        'string': true,
        'number': true,
        'range': true,
        'regexp': true,
        'mobile': true,
        'email': true,
        'phone': true,
        'cmpexp': true
    };
    var index = 0;
    var length = expr.length;
    var word = '';
    while (index < length) {
        var ch = expr.charAt(index);
        if (this.isUnaryOp(ch) && index == 0) {
            this.symbol = ch;
        } else if (ch == '[') {
            if (this.keyword != '') {
                word += ch;
            } else {
                if (!this.stringEqual('range', word)) {
                    throw new Error('"[" is just available for range.');
                }
                this.keyword = word;
                this.opts.push('>=');
                word = '';
            }
        } else if (ch == '(') {
            if (this.keyword != '') {
                this.opts.push('(');
                word += ch;
            } else {
                this.keyword = word;
                this.opts.push(">");
                word = '';
            }
        } else if (ch == ']') {
            this.opts.push("<=")
            this.args.push(word);
            word = '';
        } else if (ch == ')' && index == length - 1) {
            this.args.push(word);
            this.opts.push('<');
            word = '';
        } else if (ch == ')') {
            this.opts.pop('<');
            if (this.opts.length == 1) {
                word += ch;
            }
        } else if (ch == ',') {
            if (this.opts.length == 1) {
                this.args.push(word);
                word = '';
            } else {
                word += ch;
            }
        } else {
            word += ch;
        }
        index++;
    }
    if (this.keyword == '') {
        this.keyword = word;
    }
};

ValidationModel.prototype = {

    isKeyword: function(str) {
        return this.keywords[str.toLowerCase()];
    },

    isUnaryOp: function(ch) {
        return this.unary_ops[ch];
    },

    isDecimalDigit: function(ch) {
        return (ch >= 48 && ch <= 57); // 0...9
    },

    isIdentifierStart: function(ch) {
        return (ch === 36) || (ch === 95) || // `$` and `_`
        (ch >= 65 && ch <= 90) || // A...Z
        (ch >= 97 && ch <= 122); // a...z
    },

    isIdentifierPart: function(ch) {
        return (ch === 36) || (ch === 95) || // `$` and `_`
        (ch >= 65 && ch <= 90) || // A...Z
        (ch >= 97 && ch <= 122) || // a...z
        (ch >= 48 && ch <= 57); // 0...9
    },

    stringEqual: function(str0, str1) {
        return str0.toLowerCase() === str1.toLowerCase();
    }
};


/**
 * Constructs a 
 */
var WorkflowDesigner = function(opts) {
  this.nodes = opts.nodes;
};

WorkflowDesigner.prototype.render = function(containerId) {
  var container = d3.select('#' + containerId);
  console.log(container);
  var svg = container.append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', '0 0 300 300');
};

WorkflowDesigner.prototype.drawArrow = function (prevNode, nextNode) {
  
}

/**
 * 根据前置节点和后置节点信息得到最大的行数。
 */
WorkflowDesigner.prototype.maxRows = function () {
  
}

/**
 * 侦测每行中的节点数判断出最大的列数。
 */
WorkflowDesigner.prototype.maxCols = function () {
  
}
if (typeof wiagram === 'undefined') wiagram = {};

/**
 * 单纯显示监测测点。
 *
 * @param {object} option - 配置项
 *
 * @constructor
 */
wiagram.Crsc = function (option) {
    this.svgurl = option.svgurl;
    this.points = option.points || [];
    this.clickPoint = option.clickPoint || function (point) { };
};

wiagram.Crsc.prototype.render = function (containerId) {
    var self = this;
    this.containerId = containerId;
    var svg = new Svg({
        svgurl: this.svgurl,
        onDecorate: function (svg, dom) {
            // 设置SVG根文档，绑定在对象实例
            self.svg = svg;
            self.dom = dom;
            self.decorate(self.dom.cloneNode(true));
        }
    });
    svg.render(containerId);
};

wiagram.Crsc.prototype.setValues = function (values) {

};

wiagram.Crsc.prototype.decorate = function (svg) {
    var styles = { 'font-size': '0.04em', 'font-family': 'FontAwesome', 'style': 'cursor: pointer'};
    styles.onclick = this.clickPoint;

    var container = document.getElementById(this.containerId);
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        wiagram.icon(svg, point.x, point.y, point.icon, styles);
    }
    container.innerHTML = '';
    container.appendChild(svg);
};
if (typeof wiagram === 'undefined') wiagram = {};

var RSRWL_DAM = {
    gaugeX: 7,
    gaugeY: 40.7,
    lbX: 25.7,
    lbY: 40.7,
    rbX: 206.5,
    rbY: 40.7,
    ltX: 112.3,
    ltY: 6,
    rtX: 124,
    rtY: 6
};

/**
 * 水库水位实时示意图。依赖库为d3，里面最重要的参数是viewBox，因为水位示意图底图是预置的，
 * 它的viewBox是固定的，所以很多参数同样是需要根据这个viewBox来预置。
 *
 * @param {object} option - 选项 
 * <ul>
 *   <li>crel: 坝顶高程</li>
 *   <li>maxdmhg: 最大坝高</li>
 *
 *   <li>rz: 坝前水位</li>
 *   <li>drz: 下游水位</li>
 *   <li>w: 蓄水量</li>
 *
 *   <li>dsfllv: 设计洪水位</li>
 *   <li>chfllv: 校核洪水位</li>
 *   <li>ddwl: 死水位</li>
 *   <li>flsscnwl: 汛限水位</li>
 *   <li>nrstlv: 正常蓄水位</li>
 *
 *   <li>svgurl: 底图加载路径</li>
 * </ul>
 *
 * @constructor 
 */
wiagram.Rsrwl = function (option) {
    this.svgurl = option.svgurl;

    this.maxdmhg = option.maxdmhg;
    this.crel = option.crel;

    this.rz = option.rz;
    this.drz = option.drz;
    this.w = option.w || 0;

    this.ddwl = option.ddwl;
    this.flsscnwl = option.flsscnwl;
    this.nrstlv = option.nrstlv;
    this.chfllv = option.chfllv;
    this.dsfllv = option.dsfllv;
};

wiagram.Rsrwl.prototype.render = function (containerId) {
    var self = this;
    // 绑定DOM元素标识到对象上
    this.containerId = containerId;
    var svg = new Svg({
        svgurl: this.svgurl,
        onDecorate: function (svg, dom) {
            // 设置SVG根文档，绑定在对象实例
            self.svg = svg;
            self.dom = dom;
            self.decorate(self.dom.cloneNode(true));
        }
    });
    svg.render(containerId);
};

/**
 * 设置或者更新显示值。
 *
 * @param {object} values - 更新值
 * <ul>
 *   <li>rz: 坝前水位</li>
 *   <li>drz: 下游水位</li>
 *   <li>drp: 小时雨量</li>
 * </ul>
 * 
 * @public
 */
wiagram.Rsrwl.prototype.setValues = function (values) {
    this.rz = values.rz;
    this.drz = values.drz;
    this.w = values.w;

    this.render(this.containerId);

    // need rebind events, so comment it
    // this.decorate(this.dom.cloneNode(true));
};

/**
 * Decorates the svg document with custom drawing.
 * 
 * @param {object} svg - svg文档
 *
 * @private
 */
wiagram.Rsrwl.prototype.decorate = function (svg) {

    var crel = this.crel;
    var maxdmhg = this.maxdmhg;

    var rz = this.rz;
    var drz = this.drz;
    var w = this.w;

    var ddwl = this.ddwl;
    var chfllv = this.chsfllv;
    var dsfllv = this.dsfllv;
    var flsscnwl = this.flsscnwl;
    var nrstlv = this.nrstlv;

    var cbel = crel - maxdmhg;
    var dam = RSRWL_DAM;
    var self = this;

    // 先被5除
    var maxdmhgBy5 = parseInt(maxdmhg / 5);
    var maxdmhgResi = maxdmhg % 5;
    if (maxdmhgResi != 0) maxdmhgBy5 += 1;

    // 每米的实际坐标
    var scale1m = (dam.lbY - dam.ltY) / maxdmhg;

    // 距离坝底最近的能够被5除尽
    var cbelBy5 = parseInt(cbel / 5);
    var scaleEl = cbelBy5 * 5 + maxdmhgBy5;

    var scales = [];
    for (var i = 0; i < 5; i++) {
        scales.push({ el: scaleEl, offsetY: (scaleEl - cbel) * scale1m });
        scaleEl += maxdmhgBy5;
    }

    var distanceY = scales[1].offsetY - scales[0].offsetY;

    // 计算水位在图中坐标
    var rzY = dam.lbY - (rz - cbel) * scale1m;

    var rzX = (dam.ltX - dam.lbX) * (dam.lbY - rzY) / (dam.lbY - dam.ltY) + dam.lbX;

    // 下游水位
    var drzY = 0;
    var drzX = 0;
    if (typeof drz !== 'undefined') {
        drzY = dam.lbY - (drz - cbel) * scale1m;
        drzX = dam.rbX - (dam.rbX - dam.rtX) * (dam.lbY - drzY) / (dam.lbY - dam.ltY);
    }

    // 坝前水位
    if (typeof rz !== 'undefined') {
        wiagram.polygon(svg, [[0, dam.lbY], [dam.lbX, dam.lbY], [rzX, rzY], [0, rzY]], { fill: '#74ccf4', stroke: '#74ccf4', 'stroke-width': 0.02 });
        if (w === 0) {
            wiagram.text(svg, rzX - 20, rzY - 1, '坝前水位：' + rz + '米', { 'font-size': 2, 'font-weight': 'bold', fill: 'blue' });
        } else {
            wiagram.text(svg, rzX - 45, rzY - 1, '坝前水位：' + rz + '米，库容：' + w + '万立方', { 'font-size': 2, 'font-weight': 'bold', fill: 'blue' });
        }
        if (drzY !== 0) {
            wiagram.polygon(svg, [[210, dam.lbY], [dam.rbX, dam.rbY], [drzX, drzY], [210, drzY]], { fill: '#74ccf4', stroke: '#74ccf4', 'stroke-width': 0.02 });
            wiagram.text(svg, drzX - 7, drzY - 1, '下游水位：' + drz + '米', { 'font-size': 2, 'font-weight': 'bold', fill: 'blue' });
        }
    }
    // 整数刻度
    // 竖线
    wiagram.line(svg, dam.gaugeX, dam.gaugeY, dam.gaugeX, dam.ltY, { fill: 'blue', stroke: 'blue', 'stroke-width': 0.4 });
    for (var i = 0; i < scales.length; i++) {
        if (scales[i].el > crel) break;
        var scale = scales[i];
        var y = dam.gaugeY - scale.offsetY;
        // 大于了坝顶高程，刻度不画出来
        wiagram.line(svg, dam.gaugeX, y, dam.gaugeX + 3.0, y, { fill: 'blue', stroke: 'blue', 'stroke-width': 0.4 });
        wiagram.text(svg, 2, y, '' + scale.el, { 'font-size': 2, 'font-weight': 'bold' });
        // 标注高程文字
        for (var j = 1; j < 5; j++) {
            if (scale.el + j > crel) break;
            y = dam.gaugeY - scale.offsetY - distanceY / 5 * j;
            wiagram.line(svg, dam.gaugeX, y, dam.gaugeX + 1.5, y, { fill: 'blue', stroke: 'blue', 'stroke-width': 0.4 });
        }
    }
    var el = scales[0].el;
    var j = 0;
    // 最下面的刻度到坝底
    while (el > cbel) {
        y = dam.gaugeY - scales[0].offsetY + distanceY / 5 * j;
        wiagram.line(svg, dam.gaugeX, y, dam.gaugeX + 1.5, y, { fill: 'blue', stroke: 'blue', 'stroke-width': 0.4 });
        el -= parseFloat(maxdmhgBy5 / 5);
        j++;
    }
    // 特征水位
    wiagram.text(svg, dam.ltX, dam.ltY - 2, '坝顶高程：' + crel + '米', { 'font-size': 2, 'font-weight': 'bold' });
    wiagram.text(svg, dam.ltX, 28, '最大坝高：' + maxdmhg + '米', { 'font-size': 2, 'font-weight': 'bold' });
    if (typeof ddwl !== 'undefined') {
        var ddwlY = dam.lbY - (ddwl - cbel) * scale1m;
        wiagram.text(svg, 12, ddwlY, '死水位：' + ddwl + '米', { 'font-size': 2, 'font-weight': 'bold' });
    }
    if (typeof flsscnwl !== 'undefined') {
        var flsscnwlY = dam.lbY - (flsscnwl - cbel) * scale1m;
        if (nrstlv !== flsscnwl)
            wiagram.text(svg, 12, flsscnwlY, '汛限水位：' + flsscnwl + '米', { 'font-size': 2, 'font-weight': 'bold' });
        else
            wiagram.text(svg, 12, flsscnwlY, '汛限水位、正常蓄水位：' + flsscnwl + '米', { 'font-size': 2, 'font-weight': 'bold' });
    }
    if (typeof nrstlv !== 'undefined' && typeof flsscnwl === 'undefined') {
        var nrstlvY = dam.lbY - (flsscnwl - cbel) * scale1m;
        svg.text(svg, 12, nrstlvY, '正常水位：' + nrstlv + '米', { 'font-size': 2, 'font-weight': 'bold' });
    }
    var top = 2;
    if (typeof chfllv !== 'undefined') {
        wiagram.text(svg, 12, 2, '校核洪水位：' + chfllv + '米', { 'font-size': 2, 'font-weight': 'bold' });
    }
    if (typeof dsfllv !== 'undefined') {
        wiagram.text(svg, 12, 4, '设计洪水位：' + dsfllv + '米', { 'font-size': 2, 'font-weight': 'bold' });
    }

    // 显示SVG DOM
    var container = document.getElementById(this.containerId);
    container.innerHTML = '';
    container.appendChild(svg);
};

function isInt(n) {
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}
if (typeof wiagram === 'undefined') wiagram = {};

wiagram.polygon = function (svg, points, styles) {
    var elmPolygon = d3.select(svg).append('polygon');
    var strPoints = '';
    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        strPoints += point[0] + ',' + point[1] + ' ';
    }
    elmPolygon.attr('points', strPoints);
    for (var key in styles) {
        elmPolygon.attr(key, styles[key]);
    }
};

wiagram.line = function (svg, startX, startY, endX, endY, styles) {
    var elmLine = d3.select(svg).append('path');
    elmLine.attr('d', 'M' + startX + ',' + startY + 'L' + endX + ',' + endY);
    for (var key in styles) {
        elmLine.attr(key, styles[key]);
    }
};

wiagram.text = function (svg, x, y, text, styles) {
    var elmText = d3.select(svg).append('text');
    elmText.attr('x', x);
    elmText.attr('y', y);
    for (var key in styles) {
        elmText.attr(key, styles[key]);
    }
    elmText.text(text);
    if (typeof styles.onclick !== 'undeinfed') {
        elmText.on('click', function () {
            styles.onclick(d3.select(this));
            d3.event.stopPropagation();
        })
    }
};

wiagram.icon = function (svg, x, y, icon, styles) {
    wiagram.text(svg, x, y, icon, styles);
};