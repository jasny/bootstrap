/* ========================================================================
 * Bootstrap: offcanvas.js v4.0.0
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

+function ($) { "use strict"

  // OFFCANVAS PUBLIC CLASS DEFINITION
  // =================================
  var isIphone = (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))
  var OffCanvas = function (element, options) {
    this.$element = $(element)
    this.options  = $.extend({}, OffCanvas.DEFAULTS, options)
    this.state    = null
    this.placement = null
    this.$calcClone = null

    this.calcClone()

    if (this.options.recalc) {
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
    modal: false,
    backdrop: false,
    exclude: null
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
      this.$element.css('visiblity', 'hidden !important').addClass('in')
    }

    var horizontal = $(window).width() / this.$element.outerWidth()
    var vertical = $(window).height() / this.$element.outerHeight()

    var element = this.$element
    function ab(a, b) {
      if (element.css(b) === 'auto') return a
      if (element.css(a) === 'auto') return b

      var size_a = parseInt(element.css(a), 10)
      var size_b = parseInt(element.css(b), 10)

      return size_a > size_b ? b : a
    }

    this.placement = horizontal > vertical ? ab('left', 'right') : ab('top', 'bottom')

    if (this.$element.css('visibility') === 'hidden !important') {
      this.$element.removeClass('in').css('visiblity', '')
    }
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
      anim[this.opposite(this.placement)] = "-=" + offset

      return elements.animate(anim, 350, callback)
    }

    var placement = this.placement
    var opposite = this.opposite(placement)

    elements.each(function() {
      if ($(this).css(placement) !== 'auto') {
        $(this).css(placement, (parseInt($(this).css(placement), 10) || 0) + offset)
      }

      if ($(this).css(opposite) !== 'auto') {
        $(this).css(opposite, (parseInt($(this).css(opposite), 10) || 0) - offset)
      }
    })

    this.$element
      .one($.support.transition.end, callback)
      .emulateTransitionEnd(350)
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
      $('body').addClass('lockIphone')
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
        e.preventDefault()
    })
  }

  OffCanvas.prototype.enableScrolling = function() {
    $('body').off('touchmove.bs')
    $('body').removeClass('lockIphone')
  }

  OffCanvas.prototype.show = function () {
    if (this.state) return

    var startEvent = $.Event('show.bs.offcanvas')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    this.hideOthers($.proxy(function() {
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
        this.$element.css(placement) // Workaround: Need to get the CSS property for it to be applied before the next line of code
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

      setTimeout($.proxy(function() {
        this.$element.addClass('in')
        this.slide(elements, offset, $.proxy(complete, this))
      }, this), 1)
    }, this))
  }

  //Hide other opened offcanvas menus, and then open this one
  OffCanvas.prototype.hideOthers = function (callback) {
    var doHide = false
    var id = this.$element.attr('id')
    var $clones = $('.offcanvas-clone:not([data-id="' + id + '"])')

    if (!$clones.length) return callback()

    $clones.each(function(index, clone) {
      var id = $(clone).attr('data-id')
      var $menu = $('#' + id)
      doHide = $menu.hasClass('canvas-slid')

      if (!doHide) return

      $menu.one('hidden.bs.offcanvas', callback)
      $menu.offcanvas('hide')
    })

    if (!doHide) callback()
  }

  OffCanvas.prototype.hide = function () {
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

    setTimeout($.proxy(function() {
      this.slide(elements, offset, $.proxy(complete, this))
    }, this), 1)
  }

  OffCanvas.prototype.toggle = function () {
    if (this.state === 'slide-in' || this.state === 'slide-out') return
    this[this.state === 'slid' ? 'hide' : 'show']()
  }

  OffCanvas.prototype.toggleBackdrop = function (callback) {
    callback = callback || $.noop
    var time = 150

    if (this.state == 'slide-in') {
      var $body = $('body')
      var doAnimate = $.support.transition

      this.$backdrop = $('<div class="modal-backdrop fade" />')
      if (this.options.backdrop) {
        this.$backdrop.addClass('allow-navbar')

        if (this.options.canvas && $(this.options.canvas)[0] !== $body[0]) {
          $(this.options.canvas).addClass('limit-backdrop')
          this.$backdrop.appendTo(this.options.canvas)
        } else {
          this.$backdrop.insertAfter(this.$element)
        }
      } else {
        this.$backdrop.insertAfter(this.$element)
      }

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      $body.addClass('modal-open')
      this.$backdrop.addClass('show').show()
      this.$backdrop.on('click.bs', $.proxy(this.autohide, this))

      doAnimate ?
        this.$backdrop
        .one($.support.transition.end, callback)
        .emulateTransitionEnd(time) :
        callback()
    } else if (this.state == 'slide-out' && this.$backdrop) {
      var self = this

      this.$backdrop.hide().removeClass('show')
      $('body').removeClass('modal-open').off('touchmove.bs')

      if ($.support.transition) {
        this.$backdrop
          .one($.support.transition.end, function() {
            self.$backdrop.remove()
            callback()
            self.$backdrop = null
          })
        .emulateTransitionEnd(time)
      } else {
        this.$backdrop.remove()
        this.$backdrop = null
        callback()
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
    var id = this.$element.attr('id')
    this.$calcClone = $('.offcanvas-clone[data-id="' + id + '"]')

    if (!this.$calcClone.length) {
      this.$calcClone = this.$element.clone()
        .addClass('offcanvas-clone')
        .attr('data-id', id)
        .removeAttr('id')
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
    var $target = $(e.target)
    var doHide = !$target.hasClass('dropdown-backdrop') && $target.closest(this.$element).length === 0

    if (doHide) this.hide()
  }

  // OFFCANVAS PLUGIN DEFINITION
  // ==========================

  var old = $.fn.offcanvas

  $.fn.offcanvas = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.offcanvas')
      var options = $.extend({}, OffCanvas.DEFAULTS, $this.data(), typeof option === 'object' && option)

      //In case if user does smth like $('.navmenu-fixed-left').offcanvas('hide'),
      //thus selecting also menu clone (that can cause issues)
      if ($this.hasClass('offcanvas-clone')) return

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
    var option = data ? 'toggle' : $.extend($this.data(), $canvas.data())

    e.preventDefault()
    e.stopPropagation()

    if (data) data.toggle()
      else $canvas.offcanvas(option)
  })

}(window.jQuery)
