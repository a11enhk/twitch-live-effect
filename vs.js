// https://github.com/DenchiSoft/VTubeStudio
/*
1. Goto https://websocketking.com/
2. connect ws://localhost:8001
3. send the payload:
```
{
	"apiName": "VTubeStudioPublicAPI",
	"apiVersion": "1.0",
	"requestID": "SomeID",
	"messageType": "AuthenticationTokenRequest",
	"data": {
		"pluginName": "My Cool Plugin",
		"pluginDeveloper": "My Name"
	}
}
```
5. go back to Vtube Studio and approve.
6. Copy the authenticationToken and paste to line 22 ->
 */

var authenticationToken = '';
var vsWs;
var hotkeys = {};

function nonce(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function send(messageType, data) {
    vsWs.send(JSON.stringify({
        apiName: 'VTubeStudioPublicAPI',
        apiVersion: '1.0',
        requestID: nonce(8),
        messageType,
        data }));
}

function executeVSAction(name) {
    send('HotkeyTriggerRequest', { hotkeyID: hotkeys[name] });
}

function vsConnect() {
    vsWs = new WebSocket('ws://localhost:8001');

    vsWs.onopen = function(event) {
        setTimeout(() => {
            send('AuthenticationRequest', {
                pluginName: 'My Cool Plugin',
                pluginDeveloper: 'My Name',
                authenticationToken: authenticationToken,
            })
        }, 3000);
    };
    vsWs.onmessage = function(e) {
        const event = JSON.parse(e.data);
        if (event.messageType === 'AuthenticationResponse') {
            send('CurrentModelRequest');
        } else if (event.messageType === 'CurrentModelResponse') {
            send('HotkeysInCurrentModelRequest', {
                modelID: event.data.modelID
            });
        } else if (event.messageType === 'HotkeysInCurrentModelResponse') {
            event.data.availableHotkeys.forEach(element => {
                hotkeys[element.name] = element.hotkeyID;
            });
        }
    };

    vsWs.onclose = function(e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(function() {
            vsConnect();
        }, 1000);
    };
    
    vsWs.onerror = function(err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        vsWs.close();
    };

}

$(function() { vsConnect(); });