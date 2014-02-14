$(function () {

    module('inputmask')

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
      
      // TODO: add inputmask tests
})
