import $ from 'jquery';

function component () {
  var $element = $('<div>');

  $element.html("Welcome to gulp starter");

  return $element;
}

$('body').append(component());
