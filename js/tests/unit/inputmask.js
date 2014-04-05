$(function () {

      var $body;

      module('inputmask', {
        setup : function() {
          $body = $(document.body);
          $body.removeData('inputmask');
        }
      })

      test('should provide no conflict', function () {
        var inputmask = $.fn.inputmask.noConflict()
        ok(!$.fn.inputmask, 'inputmask was set back to undefined (org value)')
        $.fn.inputmask = inputmask
      })

      test('should be defined on jquery object', function () {
        ok($(document.body).inputmask, 'inputmask method is defined')
      })

      test('should return element', function () {
        ok($(document.body).inputmask()[0] == document.body, 'document.body returned')
      })

      test('should use default mask', function() {
        var expected = ""
        $.fn.inputmask.Constructor.DEFAULTS.mask = expected

        $body.inputmask()

        equal(expected, $body.data('inputmask').options.mask)
      })

      test('should use default placeholder', function() {
        var expected = "_"
        $.fn.inputmask.Constructor.DEFAULTS.placeholder = expected

        $body.inputmask()

        equal(expected, $body.data('inputmask').options.placeholder)
      })

      test('should use default definitions', function() {
        var expected = {
          '9': "[0-9]",
          'a': "[A-Za-z]"
        }
        $.fn.inputmask.Constructor.DEFAULTS.definitions = expected

        $body.inputmask()

        deepEqual(expected, $body.data('inputmask').options.definitions)
      })

      test('should override mask when options.mask provided', function() {
        var expected = '99-99';
        $body.inputmask({ mask: expected})

        equal(expected, $body.data('inputmask').options.mask)
      })

      test('should override placeholder when options.placeholder provided', function() {
          var expected = '-';
          $body.inputmask({ placeholder: expected})

          equal(expected, $body.data('inputmask').options.placeholder)
      })

      test('should override definitions when options.definitions provided', function() {
        var expected = {
          '9': "[0-9]",
          'a': "[A-Za-z]"
        }

        $body.inputmask({definitions: expected})

        deepEqual(expected, $body.data('inputmask').options.definitions)
      })
      // TODO: add inputmask tests
})
