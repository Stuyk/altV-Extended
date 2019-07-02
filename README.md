# altV-Extended
A series of custom functions that help with running your server.

Remember to 🌟 this Github if you 💖 it.

### Installation:

Add 'server-extended' into your deps for your resource.

Example (resource.cfg)
```js
type: js,
main: server/startup.mjs,
client-main: client/startup.mjs,
client-files: [
    client/*
],
deps: [
    chat,
    server-extended
]
```

### Server Setup:
```js
// Note that the reference path may not be accurate; and you need to adjust it accordingly.
/// <reference path="../../../server-extended/server-extended.d.ts" />
import * as extended from 'server-extended'

alt.on('playerConnect', (player) => {
    extended.SetupExportsForPlayer(player);
});
```

### EXAMPLES FOR SERVER-SIDE:

```js
    // player.forwardVector
    player.forwardVector((result) => {
        chat.send(player, `Forward Vector: ${JSON.stringify(result)}`);
    });

    // GetGroundZFrom3DCoord
    Extended.GetGroundZFrom3DCoord(player, player.pos, (result) => {
        chat.send(player, `Ground POS: ${result}`);
    });

    // AddVector3
    var newVector = Extended.AddVector3(player.pos, player.pos);
    chat.send(player, `Added Two Vectors: ${JSON.stringify(newVector)}`);

    // SubVector3
    newVector = Extended.SubVector3(player.pos, player.pos);
    chat.send(player, `Subtracted Two Vectors: ${JSON.stringify(newVector)}`);
    
    // GetRandomColor
    var randomColor = Extended.GetRandomColor();
    chat.send(player, `Got Random Color: ${JSON.stringify(randomColor)}`);

    // GetPlayersInRange
    var playersInRange = Extended.GetPlayersInRange(player.pos, 5);
    var playerNamesInRange = [];
    for (var i = 0; i < playersInRange.length; i++) {
        playerNamesInRange.push(playersInRange[i].name);
    }
    chat.send(player, `Players In Range: ${JSON.stringify(playerNamesInRange)}`);

    // player.isNearPos
    var inRange = player.isNearPos(player.pos, 5);
    chat.send(player, `isNearPos: ${inRange}`);

    // RandomPosAround
    var randomPos = Extended.RandomPosAround(player.pos, 10);
    var newVehicle = new alt.Vehicle('infernus', randomPos.x, randomPos.y, randomPos.z, 0, 0, 0);

    // Create new blip
    player.createLocalBlip(player.pos, 1, 2, 1, 'New Fancy Blip', false, 'abc123');

    setTimeout(() => {
        player.deleteLocalBlip('abc123');
        chat.send(player, `Deleted Blip: abc123`);
    }, 5000);

    // Create new marker
    // type, pos, dir, rot, scale, color, enterColor, deleteOnEnter, range, uniqueID
    let rgba = {r: 255, g: 255, b: 255, alpha: 100 };
    let rgba2 = {r: 255, g: 0, b: 0, alpha: 100 };
    randomPos = Extended.RandomPosAround(player.pos, 5);
    player.createLocalMarker(1, randomPos, undefined, undefined, {x: 2, y: 2, z: 2}, rgba, rgba2, true, 2, 'mymarker1');

    setTimeout(() => {
        player.deleteLocalMarker('mymarker1');
        chat.send(player, `Deleted Marker: mymarker1`);
    }, 5000);

    // Show notification to player
    // imageName, headerMsg, detailsMsg, message
    player.showNotification('CHAR_AMMUNATION', 'Header', 'Small Details', 'The rest of the owl.');

    // Freeze the player from moving example
    chat.send(player, `{00FFFF} You're now Frozen! `);
    player.freeze(true);
    setTimeout(() => {
        player.freeze(false);
        chat.send(player, `{00FFFF} No longer frozen. `);
    }, 5000);

    // Screen Fade Example
    setTimeout(() => {
        chat.send(player, `{00FFFF} Fading Screen Out `);
        player.fadeScreen(true, 5000)
        setTimeout(() => {
            chat.send(player, `{00FFFF} Fading Screen In `);
            player.fadeScreen(false, 5000)
        }, 5000);
    }, 10000);

    // Screen Blur Example
    setTimeout(() => {
        chat.send(player, `{00FF00} Lets blur the screen.`)
        player.blurScreen(true, 2000);
        setTimeout(() => {
            chat.send(player, `{00FF00} No more blur.`)
            player.blurScreen(false, 2000);
        }, 3000)
    }, 2000)

    // Cursor! Can also be called from clientside.
    chat.send(player, `{0000AA} Look at this cursor!`)
    player.showCursor(true);
    setTimeout(() => {
        player.showCursor(false);
    }, 5000);

    // Show Help Text
    player.showHelpText('~g~This is some help text. ~INPUT_ATTACK~', 5000)

    // Show Subtitle
    player.showSubtitle('Look at all those chickens!', 5000);

    // Display Loading
    // Last parameter when set to true will turn on loading.
    // When last parameter is set to false it will turn off loading.
    // Set the time to undefined to turn off loading manually.
    player.showLoading('Loading!!!zzz', 5000, 1, undefined);
    
    // Colshape Event Emitter
    // Automatically calls an event when a player or entity enters/exits a colshape.
    // pos, enterEventName, exitEventName, markerType, enterMarkerColor, exitMarkerColor,
    // markerScale, markerRange, isEnterClientside = false, isExitClientside = false, isPlayerOnly = true
    extended.ColshapeEmitter(
        {x: 794, y: -260, z: 66}, 
        'test1', 
        'test2', 
        1, 
        {r: 255, g: 255, b: 255, alpha: 50}, 
        {r: 255, g: 0, b: 0, alpha: 50},
        {x: 5, y: 5, z: 2},
        5,
        false,
        false,
        true 
    );

    // Displays a message above a player's head for a period of time.
    // player, message, timeInMS, range, r, g, b, a
    extended.DisplayAboveHead(player, `Look at my fancy message everyone in a range can see.`, 5000, 10, 190, 165, 200, 255);

    alt.on('test1', (entity) => {
        chat.send(entity, '{FF0000} You have entered the colshape for test1');
    });

    alt.on('test2', (entity) => {
        chat.send(entity, '{FF0000} You have left the colshape for test2');
    });
```

### EXAMPLES FOR CLIENT-SIDE:
```js
import * as extended from 'server-extended'

// Keybinds
//key, eventToCall, callEventToServer
extended.CreateKeybind('X', 'test', false);

alt.on('test', () => {
    alt.log('pressed');
});

// Loading Spinner
// text, time in ms, type, toggleOn
// put time to undefined if you want to toggle this manually.
new extended.Loading('Loading!!', 5000, 1, false);

// Subtitle at bottom of screen
// text, time in ms
new extended.Subtitle('Hello World!', 5000);

// Get absolute cursor position. Based on total screen res.
// Looks like: 1920 x 1080
var cursor = extended.GetMousePOSAbs();
alt.log(`${JSON.stringify(cursor)}`);

// Get cursor position based on floats.
// Looks like: 0.1 x 0.5
var cursor1 = extended.GetMousePOS();
alt.log(`${JSON.stringify(cursor1)}`);

// Retrieves entity hovered over by mouse, position, etc.
// cursorX, cursorY, flags, ignoreEntity, callback
extended.Screen2dToWorld3dPosition(cursor.x, cursor.y, 1, alt.getLocalPlayer().scriptID, (result) => {
    alt.log(`Entity, world whatever: ${JSON.stringify(result)}`);
});

// cursorX, cursorY, result
extended.Get3DFrom2D(cursor.x, cursor.y, (result) => {
    alt.log(`3D Pos from 2D: ${JSON.stringify(result)}`);
});

// Add Two Vectors
var result = extended.AddVector3(alt.getLocalPlayer().pos, alt.getLocalPlayer().pos);
alt.log(`${JSON.stringify(result)}`);

// Subtract Two VEctors
var result = extended.SubVector3(alt.getLocalPlayer().pos, alt.getLocalPlayer().pos);
alt.log(`${JSON.stringify(result)}`);

// Show or Hide Cursor
extended.ShowCursor(true);

// Get Distance Between Two Vectors
var dist = extended.Distance(alt.getLocalPlayer().pos, alt.getLocalPlayer().pos);

// DrawHud
extended.DrawHUD(true);

// 3D Space Context Menus:
// 3d pos, float width, float height
extended.CreateContextMenu(alt.getLocalPlayer().pos, 0.3, 0.1);

// item name, event name to call
extended.AppendContextMenu('abc', 'test');

// call to show
extended.ShowContextMenu(true);
```


