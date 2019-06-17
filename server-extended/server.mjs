import * as alt from 'alt';
import { Player, Vehicle } from 'alt';
import * as color from './colors.mjs';

console.log(`${color.FgYellow}Extended v0.1 is running.`);

// This needs to be called for each player that joins the server.
export function SetupExportsForPlayer(player) {
    // Returns the ForwardVector of the player.
    // player.forwardVector((res) => { console.log(res) });
    player.forwardVector = (callback) => {
        SetupCallback(player, 'getForwardVector', undefined, (result) => {
            callback(result);
        });
    }

    // Returns if the player is near a position.
    player.isNearPos = (pos, range) => {
        var currentDistance = Distance(player.pos, pos);
        if (currentDistance <= range)
            return true;
        return false;
    }

    // Create a local blip for a player.
    player.createLocalBlip = (pos, sprite, color, scale, name, shortRange, uniqueID) => {
        alt.emitClient(player, 'createLocalBlip', pos, sprite, color, scale, name, shortRange, uniqueID);
    }

    // Delete a local blip by uniqueID.
    player.deleteLocalBlip = (uniqueID) => {
        alt.emitClient(player, "deleteLocalBlip", uniqueID);
    }

    // Create a marker for a player.
    player.createLocalMarker = (type, pos, dir, rot, scale, color, enterColor, deleteOnEnter, range, uniqueID) => {
        alt.emitClient(player, 'createLocalMarker', type, pos, dir, rot, scale, color, enterColor, deleteOnEnter, range, uniqueID);
    }

    // Delete a marker for a player.
    player.deleteLocalMarker = (uniqueID) => {
        alt.emitClient(player, 'deleteLocalMarker', uniqueID);
    }

    // Show Notification to Player
    player.showNotification = (imageName, headerMsg, detailsMsg, message) => {
        alt.emitClient(player, 'showNotification', imageName, headerMsg, detailsMsg, message);
    }

    // Freeze Player
    player.freeze = (state) => {
        alt.emitClient(player, 'freezePlayer', state);
    }

    // Fade screen to black and back.
    player.fadeScreen = (state, timeInMS) => {
        alt.emitClient(player, 'fadeOutScreen', state, timeInMS);
    }

    // Blur screen.
    player.blurScreen = (state, timeInMS) => {
        alt.emitClient(player, 'blurOutScreen', state, timeInMS);
    }

    // Show Cursor
    player.showCursor = (state) => {
        alt.emitClient(player, 'showCursor', state);
    }

    // Show Help Text
    player.showHelpText = (text, timeInMS) => {
        alt.emitClient(player, 'displayHelpText', text, timeInMS)
    }

    // Show Subtitle Text
    player.showSubtitle = (text, timeInMS) => {
        alt.emitClient(player, 'displaySubtitle', text, timeInMS);
    }

    // Display Loading
    player.showLoading = (text, time, type, toggled) => {
        alt.emitClient(player, 'showLoading', text, time, type, toggled);
    }
}

// Returns the GroundLevel from a 3D Position near a player.
// Returns undefined if ground was not present. Otherwise a number.
export function GetGroundZFrom3DCoord(player, pos, callback) {
    SetupCallback(player, 'getGroundZFrom3DCoord', pos, (result) => {
        if (result[0] == false)
            callback(undefined);

        callback(result[1]);
    });
}

// Add one vector to another.
export function AddVector3(vector1, vector2) {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y,
        z: vector1.z + vector2.z
    }
}

// Subtract one vector from another.
export function SubVector3(vector1, vector2) {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y,
        z: vector1.z - vector2.z
    }
}

// Returns as {r,g,b}
export function GetRandomColor() {
    return {
        r: Math.floor(Math.random() * 255) + 1,
        g: Math.floor(Math.random() * 255) + 1,
        b: Math.floor(Math.random() * 255) + 1
    }
}

// Get all of the players in range of a position.
export function GetPlayersInRange(pos, range) {
    var inRange = [];
    
    Player.all.forEach((value) => {
        if (Distance(pos, value.pos) > range)
            return;
        inRange.push(value);
    });

    return inRange;
}

// Get the distance between two vectors.
export function Distance(vector1, vector2) {
    return Math.pow(vector1.x - vector2.x, 2) + Math.pow(vector1.y - vector2.y, 2) + Math.pow(vector1.z - vector2.z, 2);
}

// Get Random Position Around Position
export function RandomPosAround(pos, range) {
    return {
        x: pos.x + (Math.random() * (range * 2)) - range,
        y: pos.y + (Math.random() * (range * 2)) - range,
        z: pos.z
    }
}

async function SetupCallback(player, eventName, args, callback) {
    let promise = new Promise(async (resolve) => {
        var results = await ClientsideCall(player, eventName, args).catch(
            (err) =>  { return resolve(undefined); }
        );
        return resolve(results);
    }); 

    var finalResult = await promise;
    callback(finalResult);
}

async function ClientsideCall(player, eventName, args) {
    return new Promise(async (resolve, reject) => {
        if (player === undefined)
            return reject(new Error('Player is undefined.'));

        if (eventName === undefined)
            return reject(new Error('Event name is undefined.'));

        alt.emitClient(player, eventName, args);
        
        const promise = new Promise((resolve) => {
            alt.onClient(eventName, (player, results) => {
                resolve(results);
            });
        })

        var finalResult = await promise;
        return resolve(finalResult);
    });
}
