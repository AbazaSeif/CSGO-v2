$(function() {
    "use strict";
    window.roulette = ({
        _rolling: false,
        _timeLeft: 0,
        _maxTime: 30 * 100,
        _order: [0, 11, 5, 10, 6, 9, 7, 8, 1, 14, 2, 13, 3, 12, 4],
        _position: 0,
        _bets: {
            red: [],
            green: [],
            black: []
        },
        sounds: {
            roll: new buzz.sound('//csgodouble.com/sounds/rolling.wav', {
                preload: true
            }),
            tone: new buzz.sound('//csgodouble.com/sounds/tone.wav', {
                preload: true
            })
        },
        set timeLeft(x) {
            this._timeLeft = x;
            this.updateTimer();
        },
        get timeLeft() {
            return this._timeLeft;
        },
        _numberToColor: function(num) {
            if (num === 0) {
                return 'green';
            } else if (num < 8) {
                return 'red';
            } else {
                return 'black';
            }
        },
        _wheel: $('.roulette'),
        rotateTo: function(number, diff, rotations) {
            rotations = rotations || 5;
            var self = this;
            rotations = rotations || 5;
            diff = diff - 0.5 || 0;
            this._position = (this._order.indexOf(number) + diff) * 75;
            var position = this._position - (this._wheel.width() - 1125) / 2;
            this._rolling = true;
            $('.bet-button').addClass('disabled');
            if (localStorage.getItem('muteSound') != 'on') this.sounds.roll.play();
            this._wheel.animate({
                backgroundPositionX: -1 * (position + rotations * 1125)
            }, 7000, $.bez([.06, .79, 0, 1]), function() {
                if (localStorage.getItem('muteSound') != 'on') self.sounds.tone.play();
                self._rolling = false;
                self.positionFix();
                self.updateHistory(number);
                $('.total-bet-amount').addClass('lose');
                var a = $('.total-bet-amount.' + self._numberToColor(number) + '-total');
                var b = $('.your-bet.bet-on-' + self._numberToColor(number));
                a.removeClass('lose').addClass('win').text(parseInt(a.text()) * (number === 0 ? 14 : 2));
                b.removeClass('lose').addClass('win').text(parseInt(b.text()) * (number === 0 ? 14 : 2));
                $('.rolling span').text('CSGOCasino rolled ' + number + '!');
            });
        },
        positionFix: function() {
            if (this._rolling) return;
            this._wheel.css({
                'background-position-x': -1 * (this._position - (this._wheel.width() - 1125) / 2)
            });
        },
        updateHistory: function(number) {
            if ($('.latest').children().length >= 10) $('.latest > div').first().remove();
            var color = this._numberToColor(number);
            $('.latest').append('<div class="' + color + '-last-color last"><span>' + number + '</span></div>');
        },
        newRound: function(time, bets) {
            this._bets = bets || {
                red: [],
                green: [],
                black: []
            };
            $('.bet-button').removeClass('disabled');
            $('.player-bets').empty();
            $('.total-bet-amount').removeClass('lose').removeClass('win').data('value', '0').text('0');
            $('.your-bet').removeClass('lose').removeClass('win').data('value', '0').text('0');
            this.updateDisplay();
            this.startCountDown(time);
        },
        startCountDown: function(time) {
            clearInterval(this.countDownInterval);
            var self = this;
            this.timeLeft = time * 100;
            if (time === 0) return;
            this.countDownInterval = setInterval(function() {
                self.timeLeft -= 1;
                if (self.timeLeft === 0) {
                    clearInterval(self.countDownInterval);
                }
            }, 10);
        },
        updateTimer: function() {
            var progress = (this.timeLeft / this._maxTime) * 100;
            var text = 'Rolling...';
            if (this.timeLeft > 0) text = 'Rolling in ' + (this.timeLeft / 100).toFixed(2) + 's';
            $('.rolling span').text(text);
            $('.rolling .progress-line').width(progress.toFixed(2) + '%');
        },
        _addBet: function(data, color) {
            if (!this._bets[color]) return;
            this._bets[color].push(data);
            this._displayBet(data, color);
        },
        _displayBet: function(data, color) {
            if (typeof steamid !== 'undefined' && data.player.steamid === steamid) {
                var myBet = $('.your-bet.bet-on-' + color);
                myBet.data('value', parseInt(myBet.data('value')) + parseInt(data.amount)).text(myBet.data('value'));
            }
            var totalBet = $('.total-bet-amount.' + color + '-total');
            totalBet.data('value', parseInt(totalBet.data('value')) + parseInt(data.amount)).text(totalBet.data('value'));
            $(this._generateBetFromData(data)).hide().prependTo('.' + color + '-bet .player-bets').fadeIn(500);
            this.sortColor(color);
        },
        sortColor: function(color) {
            var $wrapper = $('.' + color + '-bet .player-bets');
            $wrapper.find('.player-bet').sort(function(a, b) {
                return +b.dataset.sort - +a.dataset.sort;
            }).appendTo($wrapper);
        },
        updateDisplay: function() {
            var self = this;
            $('.bet-list').empty();
            Object.keys(this._bets).forEach(function(color) {
                $('.my-bet-' + color).data('value', 0);
                $('.total-bet-' + color).data('value', 0);
                self._bets[color].forEach(function(bet) {
                    self._displayBet(bet, color)
                });
            });
        },
        _generateBetFromData: function(data) {
            return '<div class="player-bet" data-sort="' + data.amount + '"><div class="user player-bet-item col-xs-10"><img src="' + data.player.avatar + '">' + data.player.username + '</div><div class="amount player-bet-item col-xs-2">' + data.amount + '</div></div>'
        }
    });
    $('.buttons').on('click', '.button', function() {
        var input = $('input.bet');
        switch ($(this).data('action')) {
            case 'clear':
                input.val('0');
                break;
            case 'min':
                input.val('1');
                break;
            case 'max':
                input.val($('.balance').data('balance'));
                break;
            case '+1':
                if (!isNaN(parseInt(input.val()))) input.val(parseInt(input.val()) + 1);
                break;
            case '+10':
                if (!isNaN(parseInt(input.val()))) input.val(parseInt(input.val()) + 10);
                break;
            case '+100':
                if (!isNaN(parseInt(input.val()))) input.val(parseInt(input.val()) + 100);
                break;
            case '+1000':
                if (!isNaN(parseInt(input.val()))) input.val(parseInt(input.val()) + 1000);
                break;
            case '1/2':
                if (!isNaN(parseInt(input.val()))) input.val(parseInt(parseInt(input.val()) / 2));
                break;
            case 'x2':
                if (!isNaN(parseInt(input.val()))) input.val(parseInt(parseInt(input.val()) * 2));
                break;
        }
    });
    $('.bet-button').on('click', function() {
        var value = parseInt($('input.bet').val());
        if (!isNaN(value) && value > 0) {
            socket.emit('roulette play', value, $(this).data('color'));
        } else {
            $('input.bet').val('0');
        }
    });
    socket.on('roulette new round', function(time, hash) {
        roulette.newRound(time);
        $('.info').text('Round hash: ' + hash);
    });
    socket.on('roulette player', function(data, color) {
        roulette._addBet(data, color)
    });
    socket.on('roulette ends', function(data) {
        roulette.rotateTo(data.winningNumber, data.shift);
    });
    socket.on('roulette history', function(history) {
        history.forEach(function(bet) {
            roulette.updateHistory(bet);
        });
    });
    socket.on('roulette round', function(time, bets, hash) {
        roulette.newRound(time, bets);
        $('.info').html('Round hash: ' + hash);
    });
    $(window).resize(roulette.positionFix.bind(roulette));
});