import alt from 'alt';
import game from 'natives';

var blips = new Map();
var markers = [];

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

alt.on('update', () => {
    if (markers.length >= 1) {
        drawMarkers();
    }
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

function distance(positionOne, positionTwo) {
    return Math.pow(positionOne.x - positionTwo.x, 2) + Math.pow(positionOne.y - positionTwo.y, 2) + Math.pow(positionOne.z - positionTwo.z, 2);
}