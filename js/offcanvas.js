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
  // =================================

  var OffCanvas = function (element, options) {
    this.$element = $(element)
    this.options  = $.extend({}, OffCanvas.DEFAULTS, options)
    this.state    = null
    
    if (this.options.recalc) {
      this.calcClone()
      $(window).on('resize.bs.offcanvas', $.proxy(this.recalc, this))
    }
    
    if (this.options.autohide)
      $(document).on('click.bs.offcanvas', $.proxy(this.autohide, this))

    if (this.options.toggle) this.toggle()
  }

  OffCanvas.DEFAULTS = {
    toggle: true,
    placement: 'left',
    autohide: true,
    recalc: true
  }

  OffCanvas.prototype.offset = function () {
    switch (this.options.placement) {
      case 'left':
      case 'right':  return this.$element.outerWidth()
      case 'top':
      case 'bottom': return this.$element.outerHeight()
    }
  }

  OffCanvas.prototype.getCanvasElements = function() {
    // Return a set containing the canvas plus all fixed elements
    var canvas = $(this.options.canvas)
    
    var fixed_elements = canvas.find('*').filter(function() {
      return $(this).css('position') === 'fixed'
    }).not(this.options.exclude)
    
    return canvas.add(fixed_elements)
  }
  
  OffCanvas.prototype.slide = function (elements, offset, callback) {
    // Use jQuery animation if CSS transitions aren't supported
    if (!$.support.transition) {
      var anim = {}
      anim[this.options.placement] = offset
      return elements.animate(anim, 350, callback)
    }

    var placement = this.options.placement
    
    elements.each(function() {
      $(this).css(placement, (parseInt($(this).css(placement)) || 0) + offset)
    })
    
    this.$element
      .one($.support.transition.end, callback)
      .emulateTransitionEnd(350)
  }

  OffCanvas.prototype.show = function () {
    if (this.state) return
    
    var startEvent = $.Event('show.bs.offcanvas')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    this.state = 'sliding'

    var elements = this.getCanvasElements()
    var offset = this.offset()

    var complete = function () {
      this.state = 'slid'

      elements
        .addClass('canvas-slid')
        .removeClass('canvas-sliding')
      this.$element.trigger('shown.bs.offcanvas')
    }

    $('body').css('overflow', 'hidden')
    if (elements.index(this.$element) !== -1) this.$element.css(this.options.placement, -1 * offset)

    elements.filter(function() {
        return $(this).css('position') === 'static'
    }).css('position', 'relative').css(this.options.placement, 0)
    
    elements.addClass('canvas-sliding')
    
    setTimeout($.proxy(function() {
        this.$element.addClass('in')
        this.slide(elements, offset, $.proxy(complete, this))
    }, this), 1)
  }

  OffCanvas.prototype.hide = function (fast) {
    if (this.state !== 'slid') return

    var startEvent = $.Event('hide.bs.offcanvas')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    this.state = 'sliding'

    var elements = this.getCanvasElements()
    var offset = -1 * this.offset()

    var complete = function () {
      this.state = null

      elements.removeClass('canvas-sliding')
      $('body').css('overflow', '')
      
      this.$element.removeClass('in')
      if (elements.index(this.$element) !== -1) this.$element.css(this.options.placement, -1 * offset)
      this.$element.trigger('hidden.bs.offcanvas')
    }

    elements.removeClass('canvas-slid').addClass('canvas-sliding')
    
    setTimeout($.proxy(function() {
        this.slide(elements, offset, $.proxy(complete, this))
    }, this), 1)
  }

  OffCanvas.prototype.toggle = function () {
    if (this.state === 'sliding') return
    this[this.state === 'slid' ? 'hide' : 'show']()
  }

  OffCanvas.prototype.calcClone = function() {
    this.$calcClone = this.$element.clone()
      .html('')
      .addClass('offcanvas-clone').removeClass('in')
      .appendTo($('body'))
  }

  OffCanvas.prototype.recalc = function () {
    if (this.state() !== 'slid' || this.$calcClone.css('display') === 'none') return
    
    var offset = -1 * this.offset()
    
    var placement = this.options.placement
    this.getCanvasElements().each(function() {
      $(this).css(placement, (parseInt($(this).css(placement)) || 0) + offset)
    }).removeClass('canvas-slid')
    
    $('body').css('overflow', '')
    this.$element.css(placement, '').removeClass('in canvas-slid')
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
