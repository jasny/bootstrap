$(function ()
{
  module('fileinput')

  test('should provide no conflict', function ()
  {
    var fileinput = $.fn.fileinput.noConflict()
    ok(!$.fn.fileinput, 'fileinput was set back to undefined (org value)')
    $.fn.fileinput = fileinput
  })
  test('should be defined on jquery object', function ()
  {
    ok($(document.body).fileinput, 'fileinput method is defined')
  })
  test('should return element', function ()
  {
    ok($(document.body).append('<div class="fileinput fileinput-new input-group" data-provides="fileinput">'
   + '<div class="form-control" data-trigger="fileinput"><i class="glyphicon glyphicon-file fileinput-exists"></i> <span class="fileinput-filename"></span></div>'
  + '<span class="input-group-addon btn btn-default btn-file"><span class="fileinput-new">Select file</span><span class="fileinput-exists">Change</span><input type="file" name="..."></span>'
  + '<a href="#" class="input-group-addon btn btn-default fileinput-exists" data-dismiss="fileinput">Remove</a>'
 + '</div>').fileinput()[0] == document.body, 'document.body returned');
  })
  // TODO: add fileinput tests
})
