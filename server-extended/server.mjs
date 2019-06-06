import * as alt from 'alt';
import * as shared from './shared.mjs';

export function randomColor() {
    return Math.floor(Math.random() * 255) + 1;
}

export function getPlayersInRange(pos, range) {
    return alt.players.find(x => shared.distance(x.pos, pos) <= range );
}

export function randomPositionNear(pos, range, randomizeZAxis) {
    pos.x = pos.x + (Math.random() * (range * 2)) - range;
    pos.y = pos.y + (Math.random() * (range * 2)) - range;
    if (randomizeZAxis)
        pos.z = pos.z + (Math.random() * (range * 2)) - range;
    return pos;
}

export async function positionInFrontOfPlayer(player, distance) {
    var result = await GetForwardVector(player);
    var pos = {
        x: player.pos.x + result.x * distance,
        y: player.pos.y + result.y * distance,
        z: player.pos.z + result.z * distance
    }
    return pos;
}

export async function getForwardVector(player) {
    var result = await ClientCallback(player, 'getForwardVector', []);
    return result;
}

export async function getGroundZFrom3DCoord(player, pos) {
    var result = await ClientCallback(player, 'getGroundZFrom3DCoord', pos);
    return result;
}

export async function ClientCallback(player, clientEventName, argsArray) {
    alt.emitClient(player, clientEventName, argsArray);
    
    let promise = new Promise((res, rej) => {
        alt.onClient(clientEventName, (player, resultsArray) => {
            res(resultsArray);
        });
    });
    
    var result = await promise;
    return result;
}


export function isPlayerNearPosition(player, pos, distance) {
    var currentDistance = Distance(player.pos, pos);
    if (currentDistance <= distance)
        return true;
    return false;
}


export function createLocalBlip(player, pos, sprite, color, scale, name, shortRange, uniqueID) {
    alt.emitClient(player, 'createLocalBlip', pos, sprite, color, scale, name, shortRange, uniqueID);
}

export function deleteLocalBlip(player, uniqueID) {
    alt.emitClient(player, 'deleteLocalBlip', uniqueID);
}

export function createMarker(player, type, pos, direction, rotation, scale, r, g, b, alpha, bobUpAndDown, faceCamera, isRotating, deleteOnEnter, range, uniqueID) {
    alt.emitClient(player, 'createMarker', type, pos, direction, rotation, scale, r, g, b, alpha, bobUpAndDown, faceCamera, isRotating, deleteOnEnter, range, uniqueID);
}

export function deleteMarker(player, uniqueID) {
    alt.emitClient(player, 'deleteMarker', uniqueID);
}

export function hideHUD(player, state) {
    alt.emitClient(player, 'toggleHUD', state);
}

export function freezePlayer(player, state) {
    alt.emitClient(player, 'freezePlayer', state);
}

export function interpolateCamera(player, pos1X, pos1Y, pos1Z, rot1, fov, pos2X, pos2Y, pos2Z, rot2, fov2, duration) {
    alt.emitClient(player, 'interpolateCamera', pos1X, pos1Y, pos1Z, rot1, fov, pos2X, pos2Y, pos2Z, rot2, fov2, duration);
}

export function createCamera(player, pos, rot, fov) {
    alt.emitClient(player, 'createCamera', pos, rot, fov);
}

export function destroyCamera(player) {
    alt.emitClient(player, 'destroyCamera');
}

export function showNotification(player, imageName, headerMsg, detailsMsg, message) {
    alt.emitClient(player, 'showNotification', imageName, headerMsg, detailsMsg, message);
}