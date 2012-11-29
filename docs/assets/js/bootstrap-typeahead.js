/* =============================================================
 * bootstrap-typeahead.js v2.2.1-j3
 * http://twitter.github.com/bootstrap/javascript.html#typeahead
 * =============================================================
 * Copyright 2012 Twitter, Inc.
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


!function($){

  "use strict"; // jshint ;_;


 /* TYPEAHEAD PUBLIC CLASS DEFINITION
  * ================================= */

  var Typeahead = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.typeahead.defaults, options)
    if (this.options.target) this.$target = $(this.options.target)
    this.searcher = this.options.searcher || (typeof this.options.source == 'string' ? this.searcherAjax : this.searcher)
    this.matcher = this.options.matcher || this.matcher
    this.sorter = this.options.sorter || this.sorter
    this.highlighter = this.options.highlighter || this.highlighter
    this.updater = this.options.updater || this.updater
    this.$menu = $(this.options.menu).appendTo('body')
    this.source = this.options.source
    this.strict = this.options.strict
    this.shown = false

    if (element.nodeName == 'SELECT') this.replaceSelect()

    this.text = this.$element.val()
    
    this.$element
      .attr('data-text', this.value)
      .attr('autocomplete', "off")
      
    if (typeof this.$target != 'undefined') this.$element.attr('data-value', this.$target.val())
      else if (typeof this.$element.attr('data-value') == 'undefined') this.$element.attr('data-value', this.strict ? '' : this.value)
    
    this.$menu.css('min-width', this.$element.width() + 12)

    this.listen()
  }

  Typeahead.prototype = {

    constructor: Typeahead

  , replaceSelect: function () {
      this.$target = this.$element
      this.$element = $('<input type="text" />')
      
      this.source = {}
      this.strict = true
      
      var options = this.$target.find('option')
      var $option;
      for (var i=0; i<options.length; i++) {
        $option = $(options[i]);
        if ($option.val() === '') {
          this.$element.attr('placeholder', $option.html());
          continue;
        }
        
        this.source[$option.val()] = $option.html()
        if (this.$target.val() == $option.val()) this.$element.val($option.html())
      }
      
      var attr = this.$target[0].attributes
      for (i=0; i<attr.length; i++) {
        if (attr[i].nodeName != 'type' && attr[i].nodeName != 'name' && attr[i].nodeName != 'id' && attr[i].nodeName != 'data-provide' && !attr[i].nodeName.match(/^on/)) {
          this.$element.attr(attr[i].nodeName, attr[i].nodeValue)
        }
      }

      this.$element.insertAfter(this.$target)
      if (this.$target.attr('autofocus')) this.$element.trigger('focus').select()
      this.$target.attr('autofocus', false)
      this.$target.hide()
    }
  
  , destroyReplacement: function () {
      // Detroy replacement element, so it doesn't mess up the browsers autofill on refresh
      if (typeof this.$target != 'undefined' && this.$target[0].nodeName == 'SELECT') {
        this.$element.replaceWith('');
      }
    }
  
  , select: function () {
      var li = this.$menu.find('.active')
        , val = li.attr('data-value')
        , text = li.find('.item-text').length > 0 ? li.find('.item-text').text() : li.text()

      val = this.updater(val, 'value')
      text = this.updater(text, 'text')

      this.$element
        .val(text)
        .attr('data-value', val)
      
      this.text = text
      
      if (typeof this.$target != 'undefined') {
        this.$target
          .val(val)
          .trigger('change')
      }
      
      this.$element.trigger('change')
      
      return this.hide()
    }

  , updater: function (text, type) {
      return text
    }

  , show: function () {
      var pos = $.extend({}, this.$element.offset(), {
        height: this.$element[0].offsetHeight
      })

      this.$menu.css({
        top: pos.top + pos.height
      , left: pos.left
      })

      this.$menu.show()
      this.shown = true
      return this
    }

  , hide: function () {
      this.$menu.hide()
      this.shown = false
      return this
    }

  , lookup: function (event) {
      var items

      this.query = this.$element.val()

      if (!this.query) {
        return this.shown ? this.hide() : this
      }

      items = this.searcher()
      
      if (typeof items == 'undefined') {
        return this
      }

      if ($(items).length === 0) {
        return this.shown ? this.hide() : this
      }

      return this.render(items).show()
    }

  , searcher: function () {
      var that = this
        , array
        , object = {}
      
      
      array = $.map(this.source, function (item, key) {
        if (!that.matcher(item)) return
        object[key] = item
        return item
      })
      
      return $.isArray(this.source) ? array : object
  }

  , searcherAjax: function () {
      var that = this
      
      if (this.ajaxTimeout) clearTimeout(this.ajaxTimeout)

      this.ajaxTimeout = setTimeout(function () {
        if (that.ajaxTimeout) clearTimeout(that.ajaxTimeout)

        if (that.query === "") {
          that.hide()
          return
        }

        $.get(that.source, {'q': that.query, 'limit': that.options.items }, function (items) {
          if ($(items).length === 0) {
            if (that.shown) that.hide()
            return
          }

          that.render(items).show()
        })
      }, this.options.ajaxdelay)
  }

  , matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.query.toLowerCase())
    }

  , sorter: function (items) {
      return $.isArray(items) ? this.sortArray(items) : this.sortObject(items)  
    }

  , sortArray: function (items) {
      var beginswith = []
        , caseSensitive = []
        , caseInsensitive = []
        , item

      while (item = items.shift()) {
        if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
        else if (~item.indexOf(this.query)) caseSensitive.push(item)
        else caseInsensitive.push(item)
      }

      return beginswith.concat(caseSensitive, caseInsensitive)
    }

  , sortObject: function (items) {
      var sorted = {}
        , key;
        
      for (key in items) {
        if (!items[key].toLowerCase().indexOf(this.query.toLowerCase())) {
            sorted[key] = items[key]
        }
        delete items[key]
      }
      
      for (key in items) {
        if (~items[key].indexOf(this.query)) {
            sorted[key] = items[key]
        }
        delete items[key]
      }

      for (key in items) {
        sorted[key] = items[key]
      }
      
      return sorted
    }

  , highlighter: function (item) {
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
      return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>'
      })
    }

  , render: function (items) {
      var that = this
        , list = $([])
      
      $.map(items, function (item, value) {
        if (list.length >= that.options.items) return
        
        var li
          , a
          , text
        
        if ($.isArray(items)) value = item
        
        li = $(that.options.item)
        a = li.find('a').length ? li.find('a') : li
        a.html(that.highlighter(item))
        
        li.attr('data-value', value)
        if (li.find('a').length === 0) li.addClass('dropdown-header')
        
        list.push(li[0])
      })

      list.not('.dropdown-header').first().addClass('active')
      
      this.$menu.html(list)
      
      return this
    }
    
  , next: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , next = active.nextAll('li:not(.dropdown-header)').first()

      if (!next.length) {
        next = $(this.$menu.find('li:not(.dropdown-header)')[0])
      }

      next.addClass('active')
    }

  , prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , prev = active.prevAll('li:not(.dropdown-header)').first()

      if (!prev.length) {
        prev = this.$menu.find('li:not(.dropdown-header)').last()
      }

      prev.addClass('active')
    }

  , listen: function () {
      this.$element
        .on('blur',     $.proxy(this.blur, this))
        .on('change',   $.proxy(this.change, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this))

      if (this.eventSupported('keydown')) {
        this.$element.on('keydown', $.proxy(this.keydown, this))
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
      
      $(window).on('unload', $.proxy(this.destroyReplacement, this));
    }

  , eventSupported: function(eventName) {
      var isSupported = eventName in this.$element
      if (!isSupported) {
        this.$element.setAttribute(eventName, 'return;')
        isSupported = typeof this.$element[eventName] === 'function'
      }
      return isSupported
    }

  , move: function (e) {
      if (!this.shown) return

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          e.preventDefault()
          break

        case 38: // up arrow
          e.preventDefault()
          this.prev()
          break
          
        case 40: // down arrow
          e.preventDefault()
          this.next()
          break
      }

      e.stopPropagation()
    }

  , keydown: function (e) {
      this.suppressKeyPressRepeat = !~$.inArray(e.keyCode, [40,38,9,13,27])
      this.move(e)
    }

  , keypress: function (e) {
      if (this.suppressKeyPressRepeat) return
      this.move(e)
    }

  , keyup: function (e) {
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
        case 16: // shift
        case 17: // ctrl
        case 18: // alt
          break

        case 9: // tab
        case 13: // enter
          if (!this.shown) return
          this.select()
          break

        case 27: // escape
          if (!this.shown) return
          this.hide()
          break

        default:
          this.lookup()
      }

      e.stopPropagation()
      e.preventDefault()
  }

  , change: function (e) {
      var value
      
      if (this.$element.val() != this.text) {
        value = this.$element.val() === '' || this.strict ? '' : this.$element.val()
            
        this.$element.val(value)
        this.$element.attr('data-value', value)
        this.text = value
        if (typeof this.$target != 'undefined') this.$target.val(value)
      }
    }

  , blur: function (e) {
      var that = this
      setTimeout(function () { if (!that.$menu.is(':hover')) that.hide() }, 150)
    }

  , click: function (e) {
      e.stopPropagation()
      e.preventDefault()
      this.select()
    }

  , mouseenter: function (e) {
      this.$menu.find('.active').removeClass('active')
      $(e.currentTarget).addClass('active')
    }

  }


  /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */

  $.fn.typeahead = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeahead')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeahead.defaults = {
    source: []
  , items: 8
  , menu: '<ul class="typeahead dropdown-menu"></ul>'
  , item: '<li><a href="#"></a></li>'
  , ajaxdelay: 400
  , minLength: 1
  }

  $.fn.typeahead.Constructor = Typeahead


 /*   TYPEAHEAD DATA-API
  * ================== */

  $(document)
    .off('focus.typeahead.data-api')  // overwriting Twitter's typeahead 
    .on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
      var $this = $(this)
      if ($this.data('typeahead')) return
      if ($this.is('select')) $this.attr('autofocus', true)
      e.preventDefault()
      $this.typeahead($this.data())
  })

}(window.jQuery);
