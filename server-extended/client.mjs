import alt from 'alt';
import * as native from 'natives';

var blips = new Map();
var markers = new Map();
var keybinds = new Map();
var helpText = undefined;
var subtitle = undefined;
var loading = undefined;
var totalBlips = 0;
var totalMarkers = 0;
var drawHud = true;
var drawCursor = false;
var isChatOpen = false;

class Marker {
    constructor(type, pos, dir, rot, scale, color, enterColor, deleteOnEnter, range, uniqueID) {
        this.type = type;
        this.pos = pos;
        this.dir = dir;
        this.rot = rot;
        this.scale = scale;
        this.color = color;
        this.deleteOnEnter = deleteOnEnter;
        this.markForDelete = false;
        this.range = range;

        if (enterColor !== undefined)
            this.color2 = enterColor;

        if (dir === undefined || dir === null)
            this.dir = { x: 0, y: 0, z: 0 };

        if (rot === undefined || rot === null)
            this.rot = { x: 0, y: 0, z: 0 };

        if (uniqueID === undefined || uniqueID === null) {
            totalMarkers += 1;
            this.uniqueID = `${totalMarkers}`;
        } else {
            this.uniqueID = uniqueID;
        }

        markers.set(uniqueID, this);

        alt.log(markers.size);
    }

    Draw() {
        if (this.markForDelete) {
            markers.delete(this.uniqueID);
            return;
        }
        
        let playerPos = alt.getLocalPlayer().pos;
        let playerDist = Distance(playerPos, this.pos);

        if (this.deleteOnEnter) {
            if (playerDist <= this.range) {
                this.markForDelete = true;
            }
        }

        // Draw the color the player is entering.
        if (this.color2 !== undefined) {
            if (playerDist <= this.range) {
                native.drawMarker(
                    this.type,
                    this.pos.x,
                    this.pos.y,
                    this.pos.z,
                    this.dir.x,
                    this.dir.y,
                    this.dir.z,
                    this.rot.x,
                    this.rot.y,
                    this.rot.z,
                    this.scale.x,
                    this.scale.y,
                    this.scale.z,
                    this.color2.r,
                    this.color2.g,
                    this.color2.b,
                    this.color2.alpha,
                    false,
                    false,
                    2,
                    false,
                    undefined,
                    undefined,
                    false
                );
                return;
            }
        }
        
        native.drawMarker(
            this.type,
            this.pos.x,
            this.pos.y,
            this.pos.z,
            this.dir.x,
            this.dir.y,
            this.dir.z,
            this.rot.x,
            this.rot.y,
            this.rot.z,
            this.scale.x,
            this.scale.y,
            this.scale.z,
            this.color.r,
            this.color.g,
            this.color.b,
            this.color.alpha,
            false,
            false,
            2,
            false,
            undefined,
            undefined,
            false
        );
    }
}

export class HelpText {
    constructor(text, time) {
        this.text = text;
        this.time = Date.now() + time;
        helpText = this;
    }

    Draw() {
        if (this.time < Date.now()) {
            helpText = undefined;
        }

        native.beginTextCommandDisplayHelp("STRING")
        native.addTextComponentSubstringPlayerName(this.text);
        native.endTextCommandDisplayHelp(0, false, true, 0);
    }
}

export class Subtitle {
    constructor(text, time) {
        this.text = text;
        this.time = Date.now() + time;
        subtitle = this;
    }

    Draw() {
        if (this.time < Date.now()) {
            subtitle = undefined;
        }

        native.beginTextCommandPrint("STRING")
        native.addTextComponentSubstringPlayerName(this.text);
        native.endTextCommandPrint(0, true);
    }
}

export class Loading {
    constructor(text, time, type, toggled) {
        alt.log(time);

        this.text = text;
        this.type = type;
        this.toggled = toggled;

        if (time !== null && time !== undefined) {
            this.time = Date.now() + time;
        }

        loading = this;
        native.removeLoadingPrompt();
        native.beginTextCommandBusyString("STRING");
        native.addTextComponentSubstringPlayerName(this.text);
        native.endTextCommandBusyString(this.type);
    }

    Draw() {
        if (this.time < Date.now()) {
            loading = undefined;
            native.removeLoadingPrompt();
        }

        if (this.toggled !== null && this.toggled !== undefined && !this.toggled) {
            loading = undefined;
            native.removeLoadingPrompt();
        }
    }
}

export class KeyBind {
    constructor(keyAsString, eventNameToCall, isServer) {
        this.key = keyAsString;
        this.eventNameToCall = eventNameToCall;
        this.isServer = isServer;

        alt.on('keydown', (key) => {
            if (isChatOpen)
                return;
        
            if (key == this.key.charCodeAt(0)) {
                this.Press();
            }
        });
        
        alt.on('keyup', (key) => {
            if (isChatOpen)
                return;
        
            if (key == this.key.charCodeAt(0)) {
                this.Release();
            }
        })

        keybinds.set(keyAsString, this);
    }

    Press() {
        if (this.press != undefined)
            return;

        this.press = true;

        if (this.isServer) {
            alt.emitServer(this.eventNameToCall);
        } else {
            alt.emit(this.eventNameToCall);
        }
    }

    Release() {
        this.press = undefined;
    }
}

// Chatbox Handler
alt.on('keydown', (key) => {
    if ((key == 0x1B && isChatOpen) || (key == 0x0D && isChatOpen)) {
        isChatOpen = false;
        alt.log(isChatOpen);
    }

    if (key == 'T'.charCodeAt(0) && !isChatOpen) {
        isChatOpen = true;
        alt.log(isChatOpen);
    }
})

alt.on('disconnect', () => {
    // Clear old blips.
    for (var [key, value] of Object.entries(blips)) {
        native.removeBlip(value);
    }

    // Unfreeze Player
    native.freezeEntityPosition(alt.getLocalPlayer().scriptID, false);

    // Destroy All Cameras
    native.renderScriptCams(false, false, 0, false, false);
    native.destroyAllCams(true);

    // Turn off Screen Fades
    native.doScreenFadeIn(1);
    native.transitionFromBlurred(1);
});

alt.on('update', () => {
    if (markers.size >= 1) {
        markers.forEach((value) => {
            value.Draw();
        });
    }

    if (helpText !== undefined) {
        helpText.Draw();
    }

    if (subtitle !== undefined) {
        subtitle.Draw();
    }

    if (loading !== undefined) {
        loading.Draw();
    }

    if (!drawHud)
        native.hideHudAndRadarThisFrame();

    if (drawCursor)
        native.showCursorThisFrame();
});

// forwardVector
alt.onServer('getForwardVector', () => {
    var forward = native.getEntityForwardVector(alt.getLocalPlayer().scriptID);
    alt.emitServer('getForwardVector', forward);
});

// groundPos
alt.onServer('getGroundZFrom3DCoord', (pos) => {
    alt.log(JSON.stringify(pos));
    alt.emitServer('getGroundZFrom3DCoord', native.getGroundZFor3dCoord(pos.x, pos.y, pos.z, undefined, true));
});

// Create a new blip.
alt.onServer('createLocalBlip', (pos, sprite, color, scale, name, shortRange, uniqueID) => {
    let blip = native.addBlipForCoord(pos.x, pos.y, pos.z);
    native.setBlipSprite(blip, sprite);
    native.setBlipColour(blip, color);
    native.setBlipScale(blip, scale);
    native.setBlipAsShortRange(blip, shortRange);
    native.beginTextCommandSetBlipName("STRING");
    native.addTextComponentSubstringPlayerName(name);
    native.endTextCommandSetBlipName(blip);

    if (uniqueID === undefined || uniqueID === null) {
        totalBlips += 1;
        uniqueID = `${totalBlips}`;
    }

    if (blips[uniqueID] !== undefined) {
        native.removeBlip(blips[uniqueID]);
    }

    blips[uniqueID] = blip;
});

// Delete a blip by uniqueID
alt.onServer('deleteLocalBlip', (uniqueID) => {
    if (blips[uniqueID] !== undefined) {
        native.removeBlip(blips[uniqueID]);
        blips.delete(uniqueID);
    }
});

// Create a new Marker
alt.onServer('createLocalMarker', (type, pos, dir, rot, scale, color, enterColor, deleteOnEnter, range, uniqueID) => {
    new Marker(type, pos, dir, rot, scale, color, enterColor, deleteOnEnter, range, uniqueID);
});

// Delete a marker by uniqueID.
alt.onServer('deleteLocalMarker', (uniqueID) => {
    if (markers.has(uniqueID)) {
        markers.get(uniqueID).markForDelete = true;
        markers.delete(uniqueID);
    }
});

// Show notification for player:
alt.onServer('showNotification', (imageName, headerMsg, detailsMsg, message) => {
    native.setNotificationTextEntry("STRING");
    native.addTextComponentSubstringPlayerName(message);
    native.setNotificationMessageClanTag(imageName.toUpperCase(), imageName.toUpperCase(), false, 4, headerMsg, detailsMsg, 1.0, "");
    native.drawNotification(false, false);
})

// Freeze a player
alt.onServer('freezePlayer', (state) => {
    native.freezeEntityPosition(alt.getLocalPlayer().scriptID, state);
});

// Fade Out Screen
alt.onServer('fadeOutScreen', (state, time) => {
    if (state) {
        native.doScreenFadeOut(time);
    } else {
        native.doScreenFadeIn(time);
    }
});

// Blur Out Screen
alt.onServer('blurOutScreen', (state, time) => {
    if (state) {
        native.transitionToBlurred(time);
    } else {
        native.transitionFromBlurred(time);
    }
});

// Show Cursor
alt.onServer('showCursor', (state) => {
    ShowCursor(state);
});

alt.onServer('drawHud', (state) => {
    DrawHUD(state);
});

alt.onServer('displayHelpText', (text, time) => {
    new HelpText(text, time);
});

alt.onServer('displaySubtitle', (text, time) => {
    new Subtitle(text, time);
});

alt.onServer('showLoading', (text, time, type, toggled) => {
    new Loading(text, time, type, toggled);
});

export function DrawHUD(state) {
    drawHud = state;
}

export function Distance(positionOne, positionTwo) {
    return Math.pow(positionOne.x - positionTwo.x, 2) + Math.pow(positionOne.y - positionTwo.y, 2) + Math.pow(positionOne.z - positionTwo.z, 2);
}

// Show the Cursor
export function ShowCursor(state) {
    drawCursor = state;
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

// Get Mouse Position as Float
export function GetMousePOS() {
    var x = native.getControlNormal(0, 239);
    var y = native.getControlNormal(0, 240);
    return { x: x, y: y }
}

// Get Mouse Position Absolute
export function GetMousePOSAbs() {
    var x = native.getControlNormal(0, 239);
    var y = native.getControlNormal(0, 240);
    var screenRes = native.getActiveScreenResolution(0, 0);
    var actualX = screenRes[1] * x;
    var actualY = screenRes[2] * y;
    return { x: actualX, y: actualY }
}

// Get entity, ground, etc. targeted by mouse position in 3D space.
export function Screen2dToWorld3dPosition(absoluteX, absoluteY, flags, ignore, callback) {
    let camPos = native.getGameplayCamCoord();
    let processedCoords = processCoordinates(absoluteX, absoluteY);
    let target = s2w(camPos, processedCoords.x, processedCoords.y);
 
    let dir = SubVector3(target, camPos);
    let from = AddVector3(camPos, mulNumber(dir, 0.05));
    let to = AddVector3(camPos, mulNumber(dir, 300));
 
    let ray = native.startShapeTestRay(from.x, from.y, from.z, to.x, to.y, to.z, flags, ignore, 0);
    let result = native.getShapeTestResult(ray, undefined, undefined, undefined, undefined);
    callback(result);
}

// Get the Ground Location
export function Get3DFrom2D(absoluteX, absoluteY, callback) {
    Screen2dToWorld3dPosition(absoluteX, absoluteY, 1, alt.getLocalPlayer().scriptID, (result) => {
        callback(result[2]);
    });
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
    let result = native.getScreenCoordFromWorldCoord(position.x, position.y, position.z, undefined, undefined);

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
    var res = native.getActiveScreenResolution(0, 0);
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
    let camRot = native.getGameplayCamRot(0);
    let camForward = rotationToDirection(camRot);
    let rotUp = AddVector3(camRot, { x: 10, y: 0, z: 0 });
    let rotDown = AddVector3(camRot, { x: -10, y: 0, z: 0 });
    let rotLeft = AddVector3(camRot, { x: 0, y: 0, z: -10 });
    let rotRight = AddVector3(camRot, {x: 0, y: 0, z: 10 });
 
    let camRight = SubVector3(rotationToDirection(rotRight), rotationToDirection(rotLeft));
    let camUp = SubVector3(rotationToDirection(rotUp), rotationToDirection(rotDown));
 
    let rollRad = -degToRad(camRot.y);
 
    let camRightRoll = SubVector3(mulNumber(camRight, Math.cos(rollRad)), mulNumber(camUp, Math.sin(rollRad)));
    let camUpRoll = AddVector3(mulNumber(camRight, Math.sin(rollRad)), mulNumber(camUp, Math.cos(rollRad)));
 
    let point3D = AddVector3(
        AddVector3(
            AddVector3(camPos, mulNumber(camForward, 10.0)),
            camRightRoll
        ),
        camUpRoll);
 
    let point2D = w2s(point3D);
 
    if (point2D === undefined) {
        return AddVector3(camPos, mulNumber(camForward, 10.0));
    }
 
    let point3DZero = AddVector3(camPos, mulNumber(camForward, 10.0));
    let point2DZero = w2s(point3DZero);
 
    if (point2DZero === undefined) {
        return AddVector3(camPos, mulNumber(camForward, 10.0));
    }
 
    let eps = 0.001;
 
    if (Math.abs(point2D.x - point2DZero.x) < eps || Math.abs(point2D.y - point2DZero.y) < eps) {
        return AddVector3(camPos, mulNumber(camForward, 10.0));
    }
 
    let scaleX = (relX - point2DZero.x) / (point2D.x - point2DZero.x);
    let scaleY = (relY - point2DZero.y) / (point2D.y - point2DZero.y);
    let point3Dret = AddVector3(
        AddVector3(
            AddVector3(camPos, mulNumber(camForward, 10.0)),
            mulNumber(camRightRoll, scaleX)
        ),
        mulNumber(camUpRoll, scaleY));
 
    return point3Dret;
}

function degToRad(deg) {
    return deg * Math.PI / 180.0;
}
