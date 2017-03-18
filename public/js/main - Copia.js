$(function() {
  var blue_green = $('.blue').offset().left - $('.green').offset().left,
      green_blue = $('.green').offset().left - $('.blue').offset().left,
      
      blue_red = $('.blue').offset().left - $('.red').offset().left,
      red_blue = $('.red').offset().left - $('.blue').offset().left,
      
      green_red = $('.green').offset().left - $('.red').offset().left,
      red_green = $('.red').offset().left - $('.green').offset().left;
  // Phase 1:
  $('.green').animate({
    left: blue_green
  }, 500);

  $('.green').animate({
    left: blue_green - blue_green
  }, 500);

  $('.blue').animate({
    left: green_blue
  }, 500);

  $('.blue').animate({
    left: green_blue - green_blue
  }, 500);

  window.setTimeout(function() {
    // Phase 2:
    $('.red').animate({
      left: blue_red
    }, 500);

    $('.red').animate({
      left: blue_red - blue_red
    }, 500);

    $('.blue').animate({
      left: red_blue
    }, 500);

    $('.blue').animate({
      left: red_blue - red_blue
    }, 500);
  }, 1000);

  window.setTimeout(function() {
    // Phase 3:
    $('.red').animate({
      left: green_red
    }, 500);

    $('.red').animate({
      left: green_red - green_red
    }, 500);

    $('.green').animate({
      left: red_green
    }, 500);

    $('.green').animate({
      left: red_green - red_green
    }, 500);
  }, 2000);

  window.setTimeout(function() {
    // Phase 4:
    $('.green').animate({
      left: blue_green
    }, 500);

    $('.green').animate({
      left: blue_green - blue_green
    }, 500);

    $('.blue').animate({
      left: green_blue
    }, 500);

    $('.blue').animate({
      left: green_blue - green_blue
    }, 500);
  }, 3000);

});

$(function() {
  scrollit();
});

function scrollit() {
  var $target = $('#messages'); 
  $target.scrollTop(500000);
}