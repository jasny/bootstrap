/* ==========================================================
 * bootstrap-carousel.js v2.0.0
 * http://twitter.github.com/bootstrap/javascript.html#carousel
 * 
 * Based on work by Daniel Stocks (http://webcloud.se)
 * ==========================================================
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
 * ========================================================== */

!function ( $ ) {
  function Placeholder(input) {
    this.input = input;
    if (input.attr('type') == 'password') {
      this.handlePassword();
    }
    
    // Prevent placeholder values from submitting
    $(input[0].form).submit(function() {
      if (input.hasClass('placeholder') && input[0].value == input.attr('placeholder')) {
        input[0].value = '';
      }
    });
  }
  
  Placeholder.prototype = {
    show : function(loading) {
      // FF and IE saves values when you refresh the page. If the user refreshes the page with
      // the placeholders showing they will be the default values and the input fields won't be empty.
      if (this.input[0].value === '' || (loading && this.valueIsPlaceholder())) {
        if (this.isPassword) {
          try {
            this.input[0].setAttribute('type', 'text');
          } catch (e) {
            this.input.before(this.fakePassword.show()).hide();
          }
        }
        this.input.addClass('placeholder');
        this.input[0].value = this.input.attr('placeholder');
      }
    }
    
  , hide : function() {
      this.input.removeClass('placeholder');

      if (this.input.hasClass('placeholder') && (this.valueIsPlaceholder() || (this.isPassword && $this.input[0].getAttribute('type') != 'password'))) {
        this.input[0].value = '';
        if (this.isPassword) {
          try {
            this.input[0].setAttribute('type', 'password');
          } catch (e) { }
          // Restore focus for Opera and IE
          this.input.show();
          this.input[0].focus();
        }
      }
    }
    
  , valueIsPlaceholder : function() {
      return this.input[0].value == this.input.attr('placeholder');
    }
    
  , handlePassword: function() {
      var input = this.input;
      input.attr('realType', 'password');
      this.isPassword = true;
      // IE < 9 doesn't allow changing the type of password inputs
      if ($.browser.msie && input[0].outerHTML) {
        var fakeHTML = $(input[0].outerHTML.replace(/type=(['"])?password\1/gi, 'type=$1text$1'));
        this.fakePassword = fakeHTML.val(input.attr('placeholder')).addClass('placeholder').focus(function() {
          input.trigger('focus');
          $(this).hide();
        });
        $(input[0].form).submit(function() {
          fakeHTML.remove();
          input.show()
        });
      }
    }
  };
  
 /* PLACEHOLDER PLUGIN DEFINITION
  * ========================== */

  var NATIVE_SUPPORT = !!("placeholder" in document.createElement( "input" ));
  $.fn.placeholder = function() {
    return NATIVE_SUPPORT ? this : this.each(function() {
      var input = $(this);
      var placeholder = new Placeholder(input);
      placeholder.show(true);
      input.focus(function() {
        placeholder.hide();
      });
      input.blur(function() {
        placeholder.show(false);
      });

      // On page refresh, IE doesn't re-populate user input
      // until the window.onload event is fired.
      if ($.browser.msie) {
        $(window).load(function() {
          if(input.val()) {
            input.removeClass("placeholder");
          }
          placeholder.show(true);
        });
        // What's even worse, the text cursor disappears
        // when tabbing between text inputs, here's a fix
        input.focus(function() {
          if(this.value == "") {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveStart('character', 0);
            range.select();
          }
        });
      }
    });
  }

 /* PLACEHOLDER DATA-API
  * ================= */

  $(function () {
    $('input[placeholder], textarea[placeholder]').placeholder();
  })

}( window.jQuery )
