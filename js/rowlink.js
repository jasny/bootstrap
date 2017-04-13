/* ============================================================
 * Bootstrap: rowlink.js v3.1.3
 * http://jasny.github.io/bootstrap/javascript/#rowlink
 * ============================================================
 * Copyright 2012-2014 Arnold Daniels
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
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
 * ============================================================ */

+function ($) { "use strict";

  var Rowlink = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, Rowlink.DEFAULTS, options)

    this.$element.on('click.bs.rowlink mouseup.bs.rowlink', 'td:not(.rowlink-skip)', $.proxy(this.click, this))
  }

  Rowlink.DEFAULTS = {
    target: "a"
  }

  Rowlink.prototype.click = function(e, ctrlKey) {
    var target = $(e.currentTarget).closest('tr').find(this.options.target)[0]

    if (typeof target === 'undefined' || $(e.target)[0] === target) return
    if (e.type === 'mouseup' && e.which !== 2) return

    e.preventDefault();
    ctrlKey = ctrlKey || e.ctrlKey || (e.type === 'mouseup' && e.which === 2)

    if (!ctrlKey && target.click) {
      target.click()
    } else if (document.createEvent) {
      var evt = new MouseEvent("click", {
          view: window,
          bubbles: true,
          cancelable: true,
          ctrlKey: ctrlKey
       });
      target.dispatchEvent(evt);
    }
  }


  // ROWLINK PLUGIN DEFINITION
  // ===========================

  var old = $.fn.rowlink

  $.fn.rowlink = function (options) {
    return this.each(function () {
      var $this = $(this)
      var data = $this.data('bs.rowlink')
      if (!data) $this.data('bs.rowlink', (data = new Rowlink(this, options)))
    })
  }

  $.fn.rowlink.Constructor = Rowlink


  // ROWLINK NO CONFLICT
  // ====================

  $.fn.rowlink.noConflict = function () {
    $.fn.rowlink = old
    return this
  }


  // ROWLINK DATA-API
  // ==================

  $(document).on('click.bs.rowlink.data-api mouseup.bs.rowlink.data-api', '[data-link="row"]', function (e) {
    if (e.type === 'mouseup' && e.which !== 2) return
    if ($(e.target).closest('.rowlink-skip').length !== 0) return

    var $this = $(this)
    if ($this.data('bs.rowlink')) return
    $this.rowlink($this.data())

    var ctrlKey = e.ctrlKey || e.which === 2
    $(e.target).trigger('click.bs.rowlink', [ctrlKey])
  })

}(window.jQuery);
