var socket, color,
    my_bets = {
      'blue': {
        'amount': 0,
        'bets': 0
      },
      'red': {
        'amount': 0,
        'bets': 0
      },
      'green': {
        'amount': 0,
        'bets': 0
      }
    };

$(function() {
  scrollit();

  moment.tz.setDefault('America/New_York');

  socket = io();
  
  socket.emit('searchTime', {'identifier': $('.identifier').text()});

  clickListeners();

  roulette();

  socket.on("message", function(data) {
    $(".messages").append('<div class="message"><b class="chat_username">' + data.username + ':</b><p class="content">' + data.message + '</p></div><hr>');
    scrollit();
  });

  socket.on("new player", function(data) {
    $('.online').text(data.online);
  });

  socket.on("remove player", function(data) {
    $('.online').text(data.online);
  });

  socket.on('err', function(a) {
    text = a.msg;
    $('.error_body').text(text);
    $('.error').slideDown('slow');
    window.setTimeout(function() {
      $('.error').slideUp('slow');
    }, 3000);
  });

  socket.on('winMsg', function(a) {
    text = a.msg;
    $('.win_body').text(text);
    $('.win').slideDown('slow');
    window.setTimeout(function() {
      $('.win').slideUp('slow');
    }, 3000);
  });

  socket.on('rolled', function(data) {
    $('.luckyNumber').val(data.number);
    var time = moment(data.new_time).toDate();

    $('.timeRemaining').countdown(time, function(event) {
      $(this).val(event.strftime('%H:%M:%S'));
    });

    $('.user_coins').text('Coins: ' + data.new_coins);

    $('.' + data.coinsWon + 'coins').addClass("blink");
    window.setTimeout(function() {
      $('.' + data.coinsWon + 'coins').removeClass("blink");
    }, 200);
  });

  socket.on('updateTime', function(data) {
    var time = moment(data.time).toDate();
    
    $('.timeRemaining').countdown(time, function(event) {
      $(this).val(event.strftime('%H:%M:%S'));
    });
  });
});

$(document).ready(function() {
  socket.emit('connected');
});

function scrollit() {
  var $target = $('#messages'); 
  $target.scrollTop(500000);
}

function updateTime() {
  window.setInterval(function () {
    var realTime = $('.timeRemaining').val();
    var duration = moment.duration({seconds: 1});
    var sub = moment(realTime, 'HH:mm:ss').subtract(duration).format('HH:mm:ss');
    $('.timeRemaining').val(sub);
  }, 1000);
}

function roll() {
  socket.emit('roll', {
    'identifier': $('.identifier').text()
  });
}

function clickListeners() {
  $('.green_cup').click(function() {
    showBet("#20CF1D");
  });
  $('.red_cup').click(function() {
    showBet("#E2393E");
  });
  $('.blue_cup').click(function() {
    showBet("#2E7CD3");
  });
  $('.gold_bet').click(function() {
    showBet("#F08B00");
  });

  $('.bet_submit').click(function() {
    bet();
  })

  $('.roll').click(function() {
    roll();
  });

  $('.chat_submit').click(function() {
    socket.emit('chat', { identifier: $('.identifier').text(), username: $('.username').text(), message: $('.chat_input').val() });
  });

  $('.chat_input').keypress(function(e){
    if(e.which == 13) {
      socket.emit('chat', { identifier: $('.identifier').text(), username: $('.username').text(), message: $('.chat_input').val() });
    }
  });
}

function showBet(hex) {
  if(hex == '#20CF1D') {
    color = 'green';
  } else if(hex == '#E2393E') {
    color = 'red';
  } else if (hex == '#F08B00'){
    color = 'gold';
  } else {
    color = 'blue';
  }

  $('.bet_form').slideDown('fast');
  $('.bet_form').css('display', 'block');
  $('.bet_submit').css('background', hex);
}