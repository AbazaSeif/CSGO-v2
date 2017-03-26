var socket, color,
    my_bets = {
      'black': {
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

function roulette() {
  socket = io();
  socket.emit('search', $('.identifier').text());
  socket.emit('searchTotal');
  
  clickListenersRoullete();

  socket.on('time', function(data) {
    var percentage = Number(data.time) / 30 * 100;
    $('.timeleft').html('Time Remaining: ' + data.time + ' seconds');
    $('.timebar').css('width', percentage.toString() + '%');
  });

  socket.on('betted', function(data) {
    my_bets[data.color].amount += Number(data.amount);
    my_bets[data.color].bets += 1;

    $('#balance').text('Coins: ' + data.new_coins);
    $('#bets_' + data.color).text(my_bets[data.color].amount);
  });

  socket.on('found', function(bets) {
    if(bets.green > 0) {
      $('#bets_green').text(bets.green);
    }
    if(bets.red > 0) {
      $('#bets_red').text(bets.red);
    }
    if(bets.black > 0) {
      $('#bets_black').text(bets.black);
    }
  });

  socket.on('new_bet', function(bets) {
    if(bets.green.total > 0) {
      $('#totalBets_green').text(bets.green.total);
    }
    if(bets.red.total > 0) {
      $('#totalBets_red').text(bets.red.total);
    }
    if(bets.black.total > 0) {
      $('#totalBets_black').text(bets.black.total);
    }
  });

  socket.on('my_bet', function(bet) {
    addBet(bet);
  });

  socket.on('totalFound', function(bets) {
    if(bets.green > 0) {
      $('#totalBets_green').text(bets.green);
    }
    if(bets.red > 0) {
      $('#totalBets_red').text(bets.red);
    }
    if(bets.black > 0) {
      $('#totalBets_black').text(bets.black);
    }
  });
}

function addBet(bet) {
  if (bet.amount > 0) {
    var betid = bet.id + "-" + bet.amount;
    //var pid = "#panel" + bet.lower + "-" + bet.upper;
    var pid = "#panel-" + bet.color;
    var $panel = $(pid);
    //$panel.find("#" + betid).remove();
    var f = "<div class='bet' id='{0}' data-amount='{1}'>";
    f += "<img src='{2}'>";
    f += "<div class='username user'>{3}</div>";
    f += "<div class='amount'>{4}</div>";
    f += "</div>";
    var $bet_list = $(f.format(bet.id, bet.amount, bet.avatar, bet.username, bet.amount));
    $bet_list.hide().prependTo($panel).slideDown("fast", function() {
        snapRender();
    });
  }
}

function bet() {
  socket.emit('bet', {
    'identifier': $('#identifier').text(),
    'id': $('#id').text(),
    'username': $('#username').text(),
    'avatar': $('#avatar').text(),
    'amount': $('#bet_input').val(),
    'color': color
  });
}

function spinBtn() {
  rollN = Math.round(Math.random() * 14);
  
  spin({
      type: "roll",
      roll: rollN,
      rollid: "1",
      nets: {
        0: '{ lower: "10", upper: "100", swon: "5", samount: "10"}',
        1: '{ lower: "10", upper: "100", swon: "5", samount: "10"}',
        2: '{ lower: "10", upper: "100", swon: "5", samount: "10"}'
      },
      length: "250",
      won: "113545",
      balance: "500",
      wait: "9",
      wobble: "17"
    }
  );
}

function clickListenersRoullete() {
  $('.bet_submit').click(function() {
    bet();
  })

  $('.spin').click(function() {
    spinBtn();
  });

  $('.betshort').click(function() {
    if($(this).data("clicked")) {
      alert("You already clicked this cell");
    } else {
      $(this).data("clicked", true);
      alert("Clicked this cell for the first time");
    }
  });

  $('.btn_red').click(function() {
    color = 'red';
    bet();
  });
  $('.btn_green').click(function() {
    color = 'green';
    bet();
  });
  $('.btn_black').click(function() {
    color = 'black';
    bet();
  });
}