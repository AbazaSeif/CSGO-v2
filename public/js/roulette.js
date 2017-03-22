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
  
  clickListeners();

  socket.on('time', function(data) {
    var percentage = Number(data.time) / 30 * 100;
    $('.timeleft').html('Time Remaining: ' + data.time + ' seconds');
    $('.timebar').css('width', percentage.toString() + '%');
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

function spinB() {
  rollN = Math.round(Math.random() * 14);
  spin({
      type: "roll",
      roll: "0",
      rollid: "1",
      nets: {
        0: '{ lower: "10", upper: "100", swon: "5", samount: "10"}',
        1: '{ lower: "10", upper: "100", swon: "5", samount: "10"}',
        2: '{ lower: "10", upper: "100", swon: "5", samount: "10"}'
      },
      length: "250",
      won: "113545",
      balance: "50",
      wait: "9",
      wobble: "17"
    }
  );
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

  $('.spin').click(function() {
    spinB();
  });

  $('.betshort').click(function() {
    if($(this).data("clicked")) {
      alert("You already clicked this cell");
    } else {
      $(this).data("clicked", true);
      alert("Clicked this cell for the first time");
    }
  });
}