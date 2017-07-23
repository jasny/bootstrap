/* ========================================================================
 * Bootstrap: offcanvas.js v3.1.3
 * http://jasny.github.io/bootstrap/javascript/#offcanvas
 * ========================================================================
 * Copyright 2013-2014 Arnold Daniels
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

+function ($) { "use strict";

  // OFFCANVAS PUBLIC CLASS DEFINITION
  // =================================
  var isIphone = (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))
  var OffCanvas = function (element, options) {
    this.$element = $(element)
    this.options  = $.extend({}, OffCanvas.DEFAULTS, options)
    this.state    = null
    this.placement = null
    this.$calcClone = null

    if (this.options.recalc) {
      this.calcClone()
      $(window).on('resize', $.proxy(this.recalc, this))
    }

    if (this.options.autohide && !this.options.modal) {
      var eventName = (navigator.userAgent.match(/(iPad|iPhone)/i) === null) ? 'click' : 'touchstart'
      $(document).on('click touchstart', $.proxy(this.autohide, this))
    }

    // Backdrop is added to dropdown on it's open, if device is touchable (or desctop FF, https://github.com/twbs/bootstrap/issues/13748)
    // and dropdown is not inside .navbar-nav. So we remove it
    $(this.$element).on('shown.bs.dropdown', $.proxy(function(e) {
        $(this.$element).find('.dropdown .dropdown-backdrop').remove()
    }, this))

    if (typeof(this.options.disablescrolling) === "boolean") {
        this.options.disableScrolling = this.options.disablescrolling
        delete this.options.disablescrolling
    }

    if (this.options.toggle) this.toggle()
  }

  OffCanvas.DEFAULTS = {
    toggle: true,
    placement: 'auto',
    autohide: true,
    recalc: true,
    disableScrolling: true,
    modal: false
  }

  OffCanvas.prototype.setWidth = function () {
    var size = this.$element.outerWidth()
    var max = $(window).width()
    max -= 68 //Minimum space between menu and screen edge

    this.$element.css('width', size > max ? max : size)
  }

  OffCanvas.prototype.offset = function () {
    switch (this.placement) {
      case 'left':
      case 'right':  return this.$element.outerWidth()
      case 'top':
      case 'bottom': return this.$element.outerHeight()
    }
  }

  OffCanvas.prototype.calcPlacement = function () {
    if (this.options.placement !== 'auto') {
        this.placement = this.options.placement
        return
    }

    if (!this.$element.hasClass('in')) {
      this.$element.addClass('in')
    }

    var horizontal = $(window).width() / this.$element.width()
    var vertical = $(window).height() / this.$element.height()

    var element = this.$element
    function ab(a, b) {
      if (element.css(b) === 'auto') return a
      if (element.css(a) === 'auto') return b

      var size_a = parseInt(element.css(a), 10)
      var size_b = parseInt(element.css(b), 10)

      return size_a > size_b ? b : a
    }

    this.placement = horizontal >= vertical ? ab('left', 'right') : ab('top', 'bottom')
    this.$element.removeClass('in')
  }

  OffCanvas.prototype.opposite = function (placement) {
    switch (placement) {
      case 'top':    return 'bottom'
      case 'left':   return 'right'
      case 'bottom': return 'top'
      case 'right':  return 'left'
    }
  }

  OffCanvas.prototype.getCanvasElements = function() {
    // Return a set containing the canvas plus all fixed elements
    var canvas = this.options.canvas ? $(this.options.canvas) : this.$element

    var fixed_elements = canvas.find('*').filter(function() {
      return getComputedStyle(this).getPropertyValue('position') === 'fixed'
    }).not(this.options.exclude)

    return canvas.add(fixed_elements)
  }

  OffCanvas.prototype.slide = function (elements, offset, callback) {
    // Use jQuery animation if CSS transitions aren't supported
    if (!$.support.transition) {
      var anim = {}
      anim[this.placement] = "+=" + offset
      return elements.animate(anim, 350, callback)
    }

    var placement = this.placement
    var opposite = this.opposite(placement)
    var setPlacement = [];

    // Determine needed changes in position
    // This should be done before adding class 'in', otherwise we won't detect 'auto' position in Chrome
    elements.each(function() {
      var item = {element: this, set: {}}

      var posName = 'offcanvas-auto-' + placement
      var isAuto = $(this).css(placement) === 'auto' || $(this).data(posName)

      isAuto ?
        $(this).data(posName, true) :
        item.set[placement] = (parseInt($(this).css(placement), 10) || 0) + offset

      posName = 'offcanvas-auto-' + opposite
      isAuto = $(this).css(opposite) === 'auto' || $(this).data(posName)

      isAuto ?
        $(this).data(posName, true) :
        item.set[opposite] = (parseInt($(this).css(opposite), 10) || 0) - offset

      setPlacement.push(item)
    })

    this.$element.addClass('in')

    // Apply changes in position
    setTimeout($.proxy(function() {
        for (var i = 0; i < setPlacement.length; i++) {
          var data = setPlacement[i]

          for (var name in data.set) {
            $(data.element).css(name, data.set[name])
          }
        }

        this.$element
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(350)
    }, this), 10)
  }

  OffCanvas.prototype.disableScrolling = function() {
    var bodyWidth = $('body').width()
    var prop = 'padding-right'

    if ($('body').data('offcanvas-style') === undefined) {
      $('body').data('offcanvas-style', $('body').attr('style') || '')
    }

    $('body').css('overflow', 'hidden')
    //Fix iPhone scrolling
    if (isIphone) {
      $('body').addClass('lockIphone');
    }

    if ($('body').width() > bodyWidth) {
      var padding = parseInt($('body').css(prop), 10) + $('body').width() - bodyWidth

      setTimeout(function() {
        $('body').css(prop, padding)
      }, 1)
    }
    //disable scrolling on mobiles (they ignore overflow:hidden)
    $('body').on('touchmove.bs', function(e) {
      if (!$(event.target).closest('.offcanvas').length)
        e.preventDefault();
    });
  }

  OffCanvas.prototype.enableScrolling = function() {
    $('body').off('touchmove.bs');
    $('body').removeClass('lockIphone');
  }

  OffCanvas.prototype.show = function () {
    if (this.state) return

    var startEvent = $.Event('show.bs.offcanvas')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    this.state = 'slide-in'
    this.$element.css('width', '')
    this.calcPlacement()
    this.setWidth()

    var elements = this.getCanvasElements()
    var placement = this.placement
    var opposite = this.opposite(placement)
    var offset = this.offset()

    if (elements.index(this.$element) !== -1) {
      $(this.$element).data('offcanvas-style', $(this.$element).attr('style') || '')
      this.$element.css(placement, -1 * offset)
      this.$element.css(placement); // Workaround: Need to get the CSS property for it to be applied before the next line of code
    }

    elements.addClass('canvas-sliding').each(function() {
      var $this = $(this)
      if ($this.data('offcanvas-style') === undefined) $this.data('offcanvas-style', $this.attr('style') || '')
      if ($this.css('position') === 'static' && !isIphone) $this.css('position', 'relative')
      if (($this.css(placement) === 'auto' || $this.css(placement) === '0px') &&
          ($this.css(opposite) === 'auto' || $this.css(opposite) === '0px')) {
        $this.css(placement, 0)
      }
    })

    if (this.options.disableScrolling) this.disableScrolling()
    if (this.options.modal || this.options.backdrop) this.toggleBackdrop()

    var complete = function () {
      if (this.state != 'slide-in') return

      this.state = 'slid'

      elements.removeClass('canvas-sliding').addClass('canvas-slid')
      this.$element.trigger('shown.bs.offcanvas')
    }

    this.slide(elements, offset, $.proxy(complete, this))
  }

  OffCanvas.prototype.hide = function (fast) {
    if (this.state !== 'slid') return

    var startEvent = $.Event('hide.bs.offcanvas')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    this.state = 'slide-out'

    var elements = $('.canvas-slid')
    var placement = this.placement
    var offset = -1 * this.offset()

    var complete = function () {
      if (this.state != 'slide-out') return

      this.state = null
      this.placement = null

      this.$element.removeClass('in')

      elements.removeClass('canvas-sliding')
      elements.add(this.$element).add('body').each(function() {
        $(this).attr('style', $(this).data('offcanvas-style')).removeData('offcanvas-style')
      })

      this.$element.css('width', '')
      this.$element.trigger('hidden.bs.offcanvas')
    }

    if (this.options.disableScrolling) this.enableScrolling()
    if (this.options.modal || this.options.backdrop) this.toggleBackdrop()

    elements.removeClass('canvas-slid').addClass('canvas-sliding')

    this.slide(elements, offset, $.proxy(complete, this))
  }

  OffCanvas.prototype.toggle = function () {
    if (this.state === 'slide-in' || this.state === 'slide-out') return
    this[this.state === 'slid' ? 'hide' : 'show']()
  }

  OffCanvas.prototype.toggleBackdrop = function (callback) {
    callback = callback || $.noop
    var time = 150

    if (this.state == 'slide-in') {
      var doAnimate = $.support.transition

      this.$backdrop = $('<div class="modal-backdrop fade" />')
      if (this.options.backdrop) {
        this.$backdrop.addClass('allow-navbar')

        if (this.options.canvas && $(this.options.canvas)[0] !== $('body')[0]) {
          $(this.options.canvas).addClass('limit-backdrop')
          this.$backdrop.appendTo(this.options.canvas)
        } else {
          this.$backdrop.insertAfter(this.$element)
        }
      } else {
        this.$backdrop.insertAfter(this.$element)
      }

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')
      this.$backdrop.on('click.bs', $.proxy(this.autohide, this))

      doAnimate ?
        this.$backdrop
        .one($.support.transition.end, callback)
        .emulateTransitionEnd(time) :
        callback()
    } else if (this.state == 'slide-out' && this.$backdrop) {
      this.$backdrop.removeClass('in');
      $('body').off('touchmove.bs');
      var self = this;
      if ($.support.transition) {
        this.$backdrop
          .one($.support.transition.end, function() {
            self.$backdrop.remove();
            callback()
            self.$backdrop = null;
          })
        .emulateTransitionEnd(time);
      } else {
        this.$backdrop.remove();
        this.$backdrop = null;
        callback();
      }

      if (this.options.canvas && $(this.options.canvas)[0] !== $('body')[0]) {
        var canvas = this.options.canvas
        setTimeout(function() {
          $(canvas).removeClass('limit-backdrop')
        }, time)
      }
    } else if (callback) {
      callback()
    }
  }

  OffCanvas.prototype.calcClone = function() {
    this.$calcClone = $('.offcanvas-clone')

    if (!this.$calcClone.length) {
      this.$calcClone = this.$element.clone()
        .addClass('offcanvas-clone')
        .appendTo($('body'))
        .html('')
    }

    this.$calcClone.removeClass('in')
  }

  OffCanvas.prototype.recalc = function () {
    if (this.$calcClone.css('display') === 'none' || (this.state !== 'slid' && this.state !== 'slide-in')) return

    this.state = null
    this.placement = null
    var elements = this.getCanvasElements()

    this.$element.trigger('hide.bs.offcanvas')
    this.$element.removeClass('in')

    elements.removeClass('canvas-slid')
    elements.add(this.$element).add('body').each(function() {
      $(this).attr('style', $(this).data('offcanvas-style')).removeData('offcanvas-style')
    })

    this.$element.trigger('hidden.bs.offcanvas')
  }

  OffCanvas.prototype.autohide = function (e) {
    if ($(e.target).closest(this.$element).length === 0) this.hide()
    var target = $(e.target);
    if (!target.hasClass('dropdown-backdrop') && $(e.target).closest(this.$element).length === 0) this.hide()
  }

  // OFFCANVAS PLUGIN DEFINITION
  // ==========================

  var old = $.fn.offcanvas

  $.fn.offcanvas = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.offcanvas')
      var options = $.extend({}, OffCanvas.DEFAULTS, $this.data(), typeof option === 'object' && option)

      if (!data) $this.data('bs.offcanvas', (data = new OffCanvas(this, options)))
      if (typeof option === 'string') data[option]()
    })
  }

  $.fn.offcanvas.Constructor = OffCanvas


  // OFFCANVAS NO CONFLICT
  // ====================

  $.fn.offcanvas.noConflict = function () {
    $.fn.offcanvas = old
    return this
  }


  // OFFCANVAS DATA-API
  // =================

  $(document).on('click.bs.offcanvas.data-api', '[data-toggle=offcanvas]', function (e) {
    var $this   = $(this), href
    var target  = $this.attr('data-target')
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    var $canvas = $(target)
    var data    = $canvas.data('bs.offcanvas')
    var option  = data ? 'toggle' : $this.data()

    e.preventDefault();
    e.stopPropagation()

    if (data) data.toggle()
      else $canvas.offcanvas(option)
  })

}(window.jQuery);
