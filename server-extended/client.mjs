import * as alt from 'alt';
import * as game from 'natives';

var blips = new Map();
var markers = [];
var hudState = false;
var camera = null;
var interpolateCamera = null;
var drawCursor = false;

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

    if (drawCursor)
        game.showCursorThisFrame();
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

function degToRad(deg) {
    return deg * Math.PI / 180.0;
}
 
function add(vector1, vector2) {
    var result = {}
    result.x = vector1.x + vector2.x,
    result.y = vector1.y + vector2.y,
    result.z = vector1.z + vector2.z
    return result;
}
 
function sub(vector1, vector2) {
    var result = {}
    result.x = vector1.x - vector2.x,
    result.y = vector1.y - vector2.y,
    result.z = vector1.z - vector2.z
    return result;
}
 
function mulNumber(vector1, value) {
    var result = {}
    result.x = vector1.x * value;
    result.y = vector1.y * value;
    result.z = vector1.z * value;
    return result;
}

function rotationToDirection(rotation) {
    let z = degToRad(rotation.z);
    let x = degToRad(rotation.x);
    let num = Math.abs(Math.cos(x));

    let result = {}
    result.x = (-Math.sin(z) * num);
    result.y = (Math.cos(z) * num);
    result.z =  Math.sin(x);
    return result;
}

function w2s(position) {
    let result = game.getScreenCoordFromWorldCoord(position.x, position.y, position.z, undefined, undefined);

    if (!result[0]) {
        return undefined;
    }
 
    let newPos = {}
    newPos.x = (result[1] - 0.5) * 2;
    newPos.y = (result[2] - 0.5) * 2;
    newPos.z = 0;
    return newPos;
}

function processCoordinates(x, y) {
    var res = game.getActiveScreenResolution(0, 0);
    let screenX = res[1];
    let screenY = res[2];

    let relativeX = (1 - ((x / screenX) * 1.0) * 2);
    let relativeY = (1 - ((y / screenY) * 1.0) * 2);
 
    if (relativeX > 0.0) {
        relativeX = -relativeX;
    } else {
        relativeX = Math.abs(relativeX);
    }
 
    if (relativeY > 0.0) {
        relativeY = -relativeY;
    } else {
        relativeY = Math.abs(relativeY);
    }
 
    return { x: relativeX, y: relativeY };
}

function s2w(camPos, relX, relY) {
    let camRot = game.getGameplayCamRot(0);
    let camForward = rotationToDirection(camRot);
    let rotUp = add(camRot, { x: 10, y: 0, z: 0 });
    let rotDown = add(camRot, { x: -10, y: 0, z: 0 });
    let rotLeft = add(camRot, { x: 0, y: 0, z: -10 });
    let rotRight = add(camRot, {x: 0, y: 0, z: 10 });
 
    let camRight = sub(rotationToDirection(rotRight), rotationToDirection(rotLeft));
    let camUp = sub(rotationToDirection(rotUp), rotationToDirection(rotDown));
 
    let rollRad = -degToRad(camRot.y);
 
    let camRightRoll = sub(mulNumber(camRight, Math.cos(rollRad)), mulNumber(camUp, Math.sin(rollRad)));
    let camUpRoll = add(mulNumber(camRight, Math.sin(rollRad)), mulNumber(camUp, Math.cos(rollRad)));
 
    let point3D = add(
        add(
            add(camPos, mulNumber(camForward, 10.0)),
            camRightRoll
        ),
        camUpRoll);
 
    let point2D = w2s(point3D);
 
    if (point2D === undefined) {
        return add(camPos, mulNumber(camForward, 10.0));
    }
 
    let point3DZero = add(camPos, mulNumber(camForward, 10.0));
    let point2DZero = w2s(point3DZero);
 
    if (point2DZero === undefined) {
        return add(camPos, mulNumber(camForward, 10.0));
    }
 
    let eps = 0.001;
 
    if (Math.abs(point2D.x - point2DZero.x) < eps || Math.abs(point2D.y - point2DZero.y) < eps) {
        return add(camPos, mulNumber(camForward, 10.0));
    }
 
    let scaleX = (relX - point2DZero.x) / (point2D.x - point2DZero.x);
    let scaleY = (relY - point2DZero.y) / (point2D.y - point2DZero.y);
    let point3Dret = add(
        add(
            add(camPos, mulNumber(camForward, 10.0)),
            mulNumber(camRightRoll, scaleX)
        ),
        mulNumber(camUpRoll, scaleY));
 
    return point3Dret;
}

function screen2dToWorld3dPosition(absoluteX, absoluteY, flags, ignore) {
    let camPos = game.getGameplayCamCoord();
    let processedCoords = processCoordinates(absoluteX, absoluteY);
    let target = s2w(camPos, processedCoords.x, processedCoords.y);
 
    let dir = sub(target, camPos);
    let from = add(camPos, mulNumber(dir, 0.05));
    let to = add(camPos, mulNumber(dir, 300));
 
    let ray = game.startShapeTestRay(from.x, from.y, from.z, to.x, to.y, to.z, flags, ignore, 0);
    let result = game.getShapeTestResult(ray, undefined, undefined, undefined, undefined);
    return result;
}
export { screen2dToWorld3dPosition };

function getMousePosition() {
    var x = game.getControlNormal(0, 239);
    var y = game.getControlNormal(0, 240);
    return { x: x, y: y }
}
export { getMousePosition }

function getMousePositionAbsolute() {
    var x = game.getControlNormal(0, 239);
    var y = game.getControlNormal(0, 240);
    var screenRes = game.getActiveScreenResolution(0, 0);
    var actualX = screenRes[1] * x;
    var actualY = screenRes[2] * y;
    return { x: actualX, y: actualY }
}
export { getMousePositionAbsolute }

function getGroundFromMouseAbsolute(absoluteX, absoluteY) {
    return screen2dToWorld3dPosition(absoluteX, absoluteY, 1, alt.getLocalPlayer().scriptID);
}
export { getGroundFromMouseAbsolute }

function showCursor(state) {
    drawCursor = state;
}
export { showCursor }
