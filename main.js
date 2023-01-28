var clientId = ''; 
var accessToken = '';
var userId = '';
var redirectURI = document.location.origin + document.location.pathname;
var scope = 'channel:read:redemptions+chat:read+bits:read';
var ws;

function parseFragment(hash) {
    var hashMatch = function(expr) {
      var match = hash.match(expr);
      return match ? match[1] : null;
    };
    var state = hashMatch(/state=(\w+)/);
    if (sessionStorage.twitchOAuthState !== state)
        window.location = redirectURI;
    return hashMatch(/access_token=(\w+)/);
};

function authUrl() {
    sessionStorage.twitchOAuthState = nonce(15);
    var url = 'https://api.twitch.tv/kraken/oauth2/authorize' +
        '?response_type=token' +
        '&client_id=' + clientId + 
        '&redirect_uri=' + redirectURI +
        '&state=' + sessionStorage.twitchOAuthState +
        '&scope=' + scope;
    return url
}

// Source: https://www.thepolyglotdeveloper.com/2015/03/create-a-random-nonce-string-using-javascript/
function nonce(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function heartbeat() {
    message = {
        type: 'PING'
    };
    $('.ws-output').append('SENT: ' + JSON.stringify(message) + '\n');
    ws.send(JSON.stringify(message));
}

function listen(topic) {
    message = {
        type: 'LISTEN',
        nonce: nonce(15),
        data: {
            topics: [topic],
            auth_token: accessToken
        }
    };
    $('.ws-output').append('SENT: ' + JSON.stringify(message) + '\n');
    ws.send(JSON.stringify(message));
}

function connect() {
    var heartbeatInterval = 1000 * 60; //ms between PING's
    var reconnectInterval = 1000 * 3; //ms to wait before reconnect
    var heartbeatHandle;

    ws = new WebSocket('wss://pubsub-edge.twitch.tv');

    ws.onopen = function(event) {
        $('.ws-output').append('INFO: Socket Opened\n');
        heartbeat();
        heartbeatHandle = setInterval(heartbeat, heartbeatInterval);
        listen('channel-points-channel-v1.' + userId);

    };

    ws.onerror = function(error) {
        $('.ws-output').append('ERR:  ' + JSON.stringify(error) + '\n');
    };

    ws.onmessage = function(event) {
        message = JSON.parse(event.data);
        $('.ws-output').append('RECV: ' + JSON.stringify(message) + '\n');
        if (message.type == 'RECONNECT') {
            $('.ws-output').append('INFO: Reconnecting...\n');
            setTimeout(connect, reconnectInterval);
        } else {
            if (!message.data) return;
            const rewardMessage = JSON.parse(message.data.message);
            if (rewardMessage.data.redemption) {
                console.log(rewardMessage);
                const {reward: { title }, user: { display_name }, user_input } = rewardMessage.data.redemption;
                $(window).trigger('redemption', [title, display_name, user_input]);
            }
        }
    };

    ws.onclose = function() {
        $('.ws-output').append('INFO: Socket Closed\n');
        clearInterval(heartbeatHandle);
        $('.ws-output').append('INFO: Reconnecting...\n');
        setTimeout(connect, reconnectInterval);
    };

}

$(function() {
    if (userId && accessToken) {
        connect();
        $('.socket').show()
    } else if (document.location.hash.match(/access_token=(\w+)/)) {
        var accessTokenRes = parseFragment(document.location.hash);
        $('#access-token').val(accessTokenRes);
        $('.step-2').show()
    } else {
        var url = authUrl()
        $('#url').val(document.URL);
        $('#auth-link').attr("href", url);
        $('.step-1').show()
    }
});

$('#topic-form').submit(function() {
    listen($('#topic-text').val());
    event.preventDefault();
});