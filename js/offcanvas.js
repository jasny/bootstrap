/* ========================================================================
 * Bootstrap: offcanvas.js v3.0.3-p7
 * http://jasny.github.io/bootstrap/javascript.html#offcanvas
 * 
 * Based on Boostrap collapse.js by Twitter, Inc. 
 * ========================================================================
 * Copyright 2013 Jasny, BV.
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
  // ================================

  var OffCanvas = function (element, options) {
    this.$element      = $(element)
    this.$canvas       = options.canvas ? $(options.canvas) : this.$element
    this.options       = $.extend({}, OffCanvas.DEFAULTS, options)
    this.transitioning = null
    
    if (this.options.recalc) {
      this.calcClone()
      $(window).on('resize.bs.offcanvas', $.proxy(this.recalc, this))
    }
    
    if (this.options.autohide)
      $(document).on('click.bs.offcanvas', $.proxy(this.autohide, this))

    // With IE and Android translate doesn't move fixed elements
    if (isIE || isAndroid || !this.transform) {
      var elems = this.$canvas.find('*').filter(function() {
        return $(this).css("position") === 'fixed' && this !== element
      })
      this.$canvas = this.$canvas.add(elems)
    }

    if (this.options.toggle) this.toggle()
  }

  OffCanvas.DEFAULTS = {
    toggle: true,
    placement: 'auto',
    autohide: true,
    recalc: true
  }

  OffCanvas.prototype.calcTransform = function() {
    this.transform = false

    // Don't use transform with jQuery animations just to move the element
    if (!$.support.transition && this.$canvas === this.$element) return

    var $el = $('<div style="visibility: hidden"></div>'),
        props = {
          'transform':'transform',
          'webkitTransform':'-webkit-transform',
          'OTransform':'-o-transform',
          'msTransform':'-ms-transform',
          'MozTransform':'-moz-transform'
        }

    // Add it to the body to get the computed style.
    $el.appendTo($('body'))

    for (var prop in props) {
      if ($el[0].style[prop] === undefined) continue

      $el[0].style[prop] = "translate3d(1px,1px,1px)"
      var m = window.getComputedStyle($el[0]).getPropertyValue(props[prop])
      this.transform = props[prop]
      this.translate = m.match(/^matrix3d/) ? 'translate3d' : 'translate'
      break
    }

    $el.remove()
  }

  OffCanvas.prototype.offset = function () {
    switch (this.options.placement) {
      case 'left':
      case 'right':  return this.$element.outerWidth()
      case 'top':
      case 'bottom': return this.$element.outerHeight()
    }
  }

  OffCanvas.prototype.slideTransform = function (offset, callback) {
    var placement = this.options.placement,
        prop = this.transform

    offset *= (placement === 'right' || placement === 'bottom' ? -1 : 1)

    var css = placement === 'left' || placement === 'right' ?
        "{}px, 0" : "0, {}px"
    if (this.translate === 'translate3d') css += ', 0'
    css = this.translate + "(" + css + ")"

    // Use jQuery animation if CSS transitions aren't supported
    if (!$.support.transition) {
      return this.$canvas.animate({ borderSpacing: offset }, {
        step: function(now, fx) {
          $(this).css(prop, css.replace('{}', now))
        },
        complete: callback,
        duration: 350
      })
    }

    this.$canvas.css(prop, css.replace('{}', offset))

    this.$element
      .one($.support.transition.end, callback)
      .emulateTransitionEnd(350)
  }

  OffCanvas.prototype.slidePosition = function (offset, callback) {
    // Use jQuery animation if CSS transitions aren't supported
    if (!$.support.transition) {
      var anim = {}
      anim[this.options.placement] = offset
      return this.$canvas.animate(anim, 350, callback)
    }

    this.$element.css(this.options.placement, 0)

    this.$canvas.filter(function () { return $(this).css('position') === 'static' } ).css('position', 'relative')
    this.$canvas.css(this.options.placement, offset)

    this.$element
      .one($.support.transition.end, callback)
      .emulateTransitionEnd(350)
  }

  OffCanvas.prototype.show = function () {
    if (this.transitioning || this.$canvas.hasClass('canvas-slid')) return

    var startEvent = $.Event('show.bs.offcanvas')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (this.$canvas.find(this.$element).length) this.$element.css('top', $(window).scrollTop())

    var complete = function () {
      this.$canvas
        .addClass('canvas-slid')
        .removeClass('canvas-sliding')

      this.transitioning = 0
      this.$element.trigger('shown.bs.offcanvas')
    }
    
    if (!this.$element.is(':visible') || !this.transform)
      this.$element.css(this.options.placement, 0)
    this.$element.addClass('in')

    // Workaround for ignored transition because of display: none
    setTimeout($.proxy(function() {
        this.$canvas.addClass('canvas-sliding')
        $('body').css('overflow', 'hidden')

        this.transitioning = 1

        if (this.transform) this.slideTransform(this.offset(), $.proxy(complete, this))
        else this.slidePosition(this.offset(), $.proxy(complete, this))
    }, this), 1)
  }

  OffCanvas.prototype.hide = function (fast) {
    if (this.transitioning || !this.$canvas.hasClass('canvas-slid')) return

    var startEvent = $.Event('hide.bs.offcanvas')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var complete = function () {
      this.transitioning = 0

      this.$element
        .removeClass('in')
        .css('left', '').css('right', '').css('top', '').css('bottom', '')

      this.$canvas
        .removeClass('canvas-sliding canvas-slid')
        .css('transform', '')

      $('body').css('overflow', '')
      
      this.$element.trigger('hidden.bs.offcanvas')
    }

    if (fast) return complete.call(this)

    this.$canvas.removeClass('canvas-slid').addClass('canvas-sliding')

    this.transitioning = 1

    if (this.transform) this.slideTransform(0, $.proxy(complete, this))
    else this.slidePosition(-1 * this.offset(), $.proxy(complete, this))
  }

  OffCanvas.prototype.toggle = function () {
    this[this.$canvas.hasClass('canvas-slid') ? 'hide' : 'show']()
  }

  OffCanvas.prototype.calcClone = function() {
    this.$calcClone = this.$element.clone()
      .html('')
      .addClass('offcanvas-clone').removeClass('in')
      .appendTo($('body'))
  }

  OffCanvas.prototype.recalc = function () {
    if (this.$calcClone.css('display') !== 'none') this.hide(true)
  }
  
  OffCanvas.prototype.autohide = function (e) {
    if ($(e.target).closest(this.$element).length === 0) this.hide()
  }

  // OFFCANVAS PLUGIN DEFINITION
  // ==========================

  var old = $.fn.offcanvas

  $.fn.offcanvas = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.offcanvas')
      var options = $.extend({}, OffCanvas.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.offcanvas', (data = new OffCanvas(this, options)))
      if (typeof option == 'string') data[option]()
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
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    var $canvas = $(target)
    var data    = $canvas.data('bs.offcanvas')
    var option  = data ? 'toggle' : $this.data()

    e.stopPropagation()

    if (data) data.toggle()
      else $canvas.offcanvas(option)
  })

}(window.jQuery);
