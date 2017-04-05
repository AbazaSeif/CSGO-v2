var CASEW = 1050;
var LAST_BET = 0;
var MAX_BET = 0;
var HIDEG = false;
var USER = "";
var RANK = 0;
var ROUND = 0;
var HOST = "51.255.37.73:7828";
var SOCKET = null;
var showbets = true;

function todongersb(x) {
    if ($("#settings_dongers").is(":checked")) {
        return (x / 1000).toFixed(3);
    }
    return x;
}

function todongers(x) {
    if ($("#settings_dongers").is(":checked")) {
        return (x / 1000);
    }
    return x;
}

var snapX = 0;
var R = 0.999;
var S = 0.01;
var tf = 0;
var vi = 0;
var animStart = 0;
var isMoving = false;
var LOGR = Math.log(R);
var $CASE = null;
var $BANNER = null;
var $CHATAREA = null;
var SCROLL = true;
var LANG = 1;
var IGNORE = [];
var sounds_rolling = new Audio('./assets/sounds/rolling.wav');
sounds_rolling.volume = 0.5;
var sounds_tone = new Audio('./assets/sounds/tone.wav');
sounds_tone.volume = 0.75;

$CASE = $("#case");
$BANNER = $(".timeleft");
$CHATAREA = $("#chatArea");

function play_sound(x) {
    var conf = $("#settings_sounds").is(":checked");
    if (conf) {
        if (x == "roll") {
            sounds_rolling.play();
        } else if (x == "finish") {
            sounds_tone.play();
        }
    }
}

function snapRender(x, wobble) {
    CASEW = $("#case").width();
    if (isMoving) return;
    else if (typeof x === 'undefined') view(snapX);
    else {
        var order = [1, 14, 2, 13, 3, 12, 4, 0, 11, 5, 10, 6, 9, 7, 8];
        var index = 0;
        for (var i = 0; i < order.length; i++) {
            if (x == order[i]) {
                index = i;
                break
            }
        }
        var max = 34;
		var min = -34;
		var w = Math.floor(wobble * (max - min + 1) + min);
		var dist = index * 75 + 36 + w;
		dist += 1125 * 5;
		snapX = dist;
		view(snapX);
    }
}

function spin(m) {
    var x = m.roll;
    play_sound("roll");
    var order = [1, 14, 2, 13, 3, 12, 4, 0, 11, 5, 10, 6, 9, 7, 8];
    var index = 0;
    for (var i = 0; i < order.length; i++) {
        if (x == order[i]) {
            index = i;
            break
        }
    }
    var max = 34;
	var min = -34;
	var w = Math.floor(m.wobble * (max - min + 1) + min);
	var dist = index * 75 + 36 + w;
	dist += 1125 * 5;
	animStart = new Date().getTime();
	vi = getVi(dist);
	tf = getTf(vi);
	isMoving = true;
	setTimeout(function() {
		finishRoll(m, tf);
	}, tf);
	render();
}

function d_mod(vi, t) {
    return vi * (Math.pow(R, t) - 1) / LOGR;
}

function getTf(vi) {
    return (Math.log(S) - Math.log(vi)) / LOGR;
}

function getVi(df) {
    return S - df * LOGR;
}

function v(vi, t) {
    return vi * Math.pow(R, t);
}

function render() {
    var t = new Date().getTime() - animStart;
    if (t > tf)
        t = tf;
    var deg = d_mod(vi, t);
    view(deg);
    if (t < tf) {
        requestAnimationFrame(render);
    } else {
        snapX = deg;
        isMoving = false;
    }
}

function view(offset) {
    offset = -((offset + 1125 - CASEW / 2) % 1125);
    $CASE.css("background-position", offset + "px 0px");
}
jQuery.fn.extend({
    countTo: function(x, opts) {
        opts = opts || {};
        var dpf = "";
        var dolls = $("#settings_dongers").is(":checked");
        if (dolls) {
            dpf = "$";
            x = x / 1000;
        }
        var $this = $(this);
        var start = parseFloat($this.html());
        var delta = x - start;
        if (opts.color) {
            if (delta > 0) {
                $this.addClass("text-success");
            } else if (delta < 0) {
                $this.addClass("text-danger");
            }
        }
        var prefix = "";
        if (opts.keep && delta > 0) {
            prefix = "+";
        }
        var durd = delta;
        if (dolls) {
            durd *= 1000;
        }
        var dur = Math.min(400, Math.round(Math.abs(durd) / 500 * 400));
        $({
            count: start
        }).animate({
            count: x
        }, {
            duration: dur,
            step: function(val) {
                var vts = 0;
                if (dolls) {
                    vts = val.toFixed(3);
                } else {
                    vts = Math.floor(val);
                }
                $this.html("" + prefix + (vts));
            },
            complete: function() {
                if (!opts.keep) {
                    $this.removeClass("text-success text-danger");
                }
                if (opts.callback) {
                    opts.callback();
                }
            }
        });
    }
});

function cd(ms, cb) {
    $("#counter").finish().css("width", "100%");
    $("#counter").animate({
        width: "0%"
    }, {
        "duration": ms * 1000,
        "easing": "linear",
        progress: function(a, p, r) {
            var c = (r / 1000).toFixed(2);
            $BANNER.html("Rolling in " + c + "...");
        },
        complete: cb
    });
}

function send(msg) {
    if (SOCKET) {
        SOCKET.emit('mes', msg);
    }
}

function finishRoll(m, tf) {
    $BANNER.html("CSGODouble rolled " + m.roll + "!");
    addHist(m.roll, m.rollid);
    play_sound("finish");
    for (var i = 0; i < m.nets.length; i++) {
        $("#panel" + m.nets[i].lower + "-" + m.nets[i].upper).find(".total").countTo(m.nets[i].swon > 0 ? m.nets[i].swon : -m.nets[i].samount, {
            "color": true,
            "keep": true
        });
    }
    var cats = [
        [0, 0],
        [1, 7],
        [8, 14]
    ];
    for (var i = 0; i < cats.length; i++) {
        var $mytotal = $("#panel" + cats[i][0] + "-" + cats[i][1]).find(".mytotal");
        if (m.roll >= cats[i][0] && m.roll <= cats[i][1]) {
            $mytotal.countTo(m.won, {
                "color": true,
                "keep": true
            });
        } else {
            var curr = parseFloat($mytotal.html());
            if ($("#settings_dongers").is(":checked")) {
                curr *= 1000;
            }
            $mytotal.countTo(-curr, {
                "color": true,
                "keep": true
            });
        }
    }
    
    if (m.balance != null) {
        $("#balance").countTo(m.balance, {
            "color": true
        });
    }
    setTimeout(function() {
        cd(m.count);
        $(".total,.mytotal").removeClass("text-success text-danger").html(0);
        $(".betlist li").remove();
        snapRender();
        $(".bet_btn").prop("disabled", false);
        showbets = true;
    }, m.wait * 1000 - tf);
}

function addHist(roll, rollid) {
    var count = $("#past .ball").length;
    if (count >= 10) {
        $("#past .ball").first().remove();
    }
    if (roll == 0) {
        $("#past").append("<div data-rollid='" + rollid + "'class='ball ball-0'>" + roll + "</div>");
    } else if (roll <= 7) {
        $("#past").append("<div data-rollid='" + rollid + "'class='ball ball-1'>" + roll + "</div>");
    } else {
        $("#past").append("<div data-rollid='" + rollid + "'class='ball ball-8'>" + roll + "</div>");
    }
}

