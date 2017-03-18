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
  socket.emit('search', $('.identifier').text());
  socket.emit('searchTime', {'identifier': $('.identifier').text()});

  clickListeners();

  socket.on('time', function(data) {
    var percentage = Number(data.time) / 30 * 100;
    $('.timeleft').html('Time Remaining: ' + data.time + ' seconds');
    $('.timebar').css('width', percentage.toString() + '%');
  });

  socket.on("message", function(data) {
    $(".messages").append('<div class="message"><b class="chat_username">' + data.username + ':</b><p class="content">' + data.message + '</p></div><hr>');
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

  socket.on('betted', function(data) {
    my_bets[data.color].amount += Number(data.amount);
    my_bets[data.color].bets += 1;

    $('.user_coins').text('Coins: ' + data.new_coins);
    $('#bets_' + data.color).text("You're bet: " + my_bets[data.color].amount + ' coins');
  });

  socket.on('found', function(bets) {
    if(bets.green > 0) {
      $('#bets_green').text("You're bet: " + bets.green + ' coins');
    }
    if(bets.red > 0) {
      $('#bets_red').text("You're bet: " + bets.red + ' coins');
    }
    if(bets.blue > 0) {
      $('#bets_blue').text("You're bet: " + bets.blue + ' coins');
    }
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
    console.log('hi');

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

function bet() {
  socket.emit('bet', {
    'identifier': $('.identifier').text(),
    'amount': $('.bet_input').val(),
    'color': color
  });
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
}