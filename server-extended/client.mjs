import * as alt from 'alt';
import * as game from 'natives';

var blips = new Map();
var markers = [];
var hudState = false;
var camera = null;
var interpolateCamera = null;

alt.onServer('getForwardVector', () => {
    alt.emitServer('getForwardVector', game.getEntityForwardVector(alt.getLocalPlayer().scriptID));
});

alt.onServer('getGroundZFrom3DCoord', (pos) => {
    var result;
    alt.emitServer('getGroundZFrom3DCoord', game.getGroundZFor3dCoord(pos.x, pos.y, pos.z, result, true));
});

alt.onServer('createLocalBlip', (pos, sprite, color, scale, name, shortRange, uniqueID) => {
    let blip = new alt.PointBlip(pos.x, pos.y, pos.z);
    blip.sprite = sprite;
    blip.color = color;
    blip.scale = scale;
    blip.name = name;
    blip.shortRange = shortRange;

    if (uniqueID === undefined)
        uniqueID = `${Math.random() + 9999999999}`;

    blips[uniqueID] = blip;
});

alt.onServer('deleteLocalBlip', (uniqueID) => {
    if (blips[uniqueID] !== undefined) {
        blips[uniqueID].remove();
    }
});

alt.onServer('createMarker', (type, pos, direction, rotation, scale, r, g, b, alpha, bobUpAndDown, faceCamera, isRotating, deleteOnEnter, range, uniqueID) => {
    var marker = {
        type: type,
        pos: pos,
        dir: direction,
        rot: rotation,
        scale: scale,
        r: r,
        g: g,
        b: b,
        alpha: alpha,
        bobUpAndDown: bobUpAndDown,
        faceCamera: faceCamera,
        isRotating: isRotating,
        deleteOnEnter: deleteOnEnter,
        range: range,
        uniqueID: uniqueID
    }

    markers.push(marker);
});

alt.onServer('deleteMarker', (uniqueID) => {
    var result = markers.findIndex(x => x.uniqueID == uniqueID);

    if (result == -1)
        return;

    markers[result].markForDelete = true;
});

alt.onServer('toggleHUD', (state) => {
    alt.log('hidingHud');
    hudState = state;
});

alt.onServer('freezePlayer', (state) => {
    game.freezeEntityPosition(alt.getLocalPlayer().scriptID, true);
});

// Thanks Moretti for Camera Functions
alt.onServer('interpolateCamera', (pos1X, pos1Y, pos1Z, rot1, fov, pos2X, pos2Y, pos2Z, rot2, fov2, duration) => {
    if (camera != null || interpolateCamera != null) {
        DestroyCamera();
    }

    game.setFocusArea(pos1X, pos1Y, pos1Z, 0.0, 0.0, 0.0);
    game.setHdArea(pos1X, pos1Y, pos1Z, 30)

    camera = game.createCamWithParams("DEFAULT_SCRIPTED_CAMERA", pos1X, pos1Y, pos1Z, 0, 0, rot1, fov, false, 0);
    interpolateCamera = game.createCamWithParams("DEFAULT_SCRIPTED_CAMERA", pos2X, pos2Y, pos2Z, 0, 0, rot2, fov2, false, 0);
    game.setCamActiveWithInterp(interpolateCamera, camera, duration, 1, 1);
    game.renderScriptCams(true, false, 0, true, false);
});

alt.onServer('destroyCamera', DestroyCamera);

function DestroyCamera() {
    if (camera != -1 || interpolateCamera != -1) {
        game.destroyAllCams(true);
        game.renderScriptCams(false, false, 0, false, false);
        camera = null;
        interpolateCamera = null;
    }
}

alt.onServer('createCamera', (position, rotation, fov) => {
    if (camera != null || interpolateCamera != null) {
        destroyCamera();
    }

    camera = game.createCamWithParams("DEFAULT_SCRIPTED_CAMERA", position.X, position.Y, position.Z, rotation.Z, fov, 0, 2, false, 0);
    game.setCamActive(camera, true);
    game.renderScriptCams(true, false, 0, true, false);
});

alt.onServer('showNotification', (imageName, headerMsg, detailsMsg, message) => {
    game.setNotificationTextEntry("STRING");
    game.addTextComponentSubstringPlayerName(message);
    game.setNotificationMessageClanTag(imageName.toUpperCase(), imageName.toUpperCase(), false, 4, headerMsg, detailsMsg, 1.0, "");
    game.drawNotification(false, false);
})

alt.on('update', () => {
    if (markers.length >= 1) {
        drawMarkers();
    }

    if (hudState)
        game.hideHudAndRadarThisFrame();
});

function drawMarkers() {
    for(var i = 0; i < markers.length; i++) {
        if (markers[i] == undefined)
            continue;
        
        game.drawMarker(
            markers[i].type,
            markers[i].pos.x,
            markers[i].pos.y,
            markers[i].pos.z,
            markers[i].dir.x,
            markers[i].dir.y,
            markers[i].dir.z,
            markers[i].rot.x,
            markers[i].rot.y,
            markers[i].rot.z,
            markers[i].scale.x,
            markers[i].scale.y,
            markers[i].scale.z,
            markers[i].r,
            markers[i].g,
            markers[i].b,
            markers[i].alpha,
            markers[i].bobUpAndDown,
            markers[i].faceCamera,
            2,
            markers[i].isRotating,
            undefined,
            undefined,
            false
        );

        if (markers[i].deleteOnEnter) {
            if (distance(alt.getLocalPlayer().pos, markers[i].pos) <= markers[i].range) {
                alt.emitServer('enteredMarker', markers[i].uniqueID);
                markers.splice(i, 1);
            }
        }

        if (markers[i].markForDelete !== undefined)
            markers.splice(i, 1);
    }
}

export function distance(positionOne, positionTwo) {
    return Math.pow(positionOne.x - positionTwo.x, 2) + Math.pow(positionOne.y - positionTwo.y, 2) + Math.pow(positionOne.z - positionTwo.z, 2);
}