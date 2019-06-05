import alt from 'alt';

/**
 * @returns number
 */
export function randomColor() {
    return Math.floor(Math.random() * 255) + 1;
}

/**
 * @param pos Vector3 Position
 * @param range Range to Look In
 * @returns [player1, player2, player3, etc.]
 */
export function getPlayersInRange(pos, range) {
    return alt.players.find(x => Distance(x.pos, pos) <= range );
}

// Credit: Tuxick
/**
 * @param positionOne 
 * @param positionTwo 
 * @returns distance
 */
export function distance(positionOne, positionTwo) {
    return Math.pow(positionOne.x - positionTwo.x, 2) + Math.pow(positionOne.y - positionTwo.y, 2) + Math.pow(positionOne.z - positionTwo.z, 2);
}

/**
 * @param pos Position to be based around.
 * @param range Range to look in.
 * @param randomizeZAxis Randomize the Z axis up and down. Not recommended.
 * @returns {x, y, z}
 */
export function randomPositionNear(pos, range, randomizeZAxis) {
    pos.x = pos.x + (Math.random() * (range * 2)) - range;
    pos.y = pos.y + (Math.random() * (range * 2)) - range;
    if (randomizeZAxis)
        pos.z = pos.z + (Math.random() * (range * 2)) - range;
    return pos;
}

/**
 * Get the position directly in front of the player.
 * @param player 
 * @param distance How far should it go forward.
 * @returns {x, y, z}
 */
export async function positionInFrontOfPlayer(player, distance) {
    var result = await GetForwardVector(player);
    var pos = {
        x: player.pos.x + result.x * distance,
        y: player.pos.y + result.y * distance,
        z: player.pos.z + result.z * distance
    }
    return pos;
}

/**
 * Retrieve the player's forward vector.
 * @param player 
 * @returns {x, y, z}
 */
export async function getForwardVector(player) {
    var result = await ClientCallback(player, 'getForwardVector', []);
    return result;
}

/**
 * Return the ground Z axis from a 3D coordinate.
 * @param player 
 * @param pos 
 * @returns Array: [true, ZPos];
 */
export async function getGroundZFrom3DCoord(player, pos) {
    var result = await ClientCallback(player, 'getGroundZFrom3DCoord', pos);
    return result;
}

/**
 * Custom callback function
 * @param player 
 * @param clientEventName 
 * @param argsArray 
 */
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

/**
 * Returns if the player is in range / near a position.
 * @param player
 * @param pos
 * @param distance
 * @returns true/false
 */
export function isPlayerNearPosition(player, pos, distance) {
    var currentDistance = Distance(player.pos, pos);
    if (currentDistance <= distance)
        return true;
    return false;
}

/**
 * Create a blip specifically for a player.
 * @param player 
 * @param pos 
 * @param sprite 
 * @param color 
 * @param scale 
 * @param name 
 * @param shortRange 
 * @param uniqueID Give it a special id to call later.
 */
export function createLocalBlip(player, pos, sprite, color, scale, name, shortRange, uniqueID) {
    alt.emitClient(player, 'createLocalBlip', pos, sprite, color, scale, name, shortRange, uniqueID);
}

/**
 * Delete a local blip by the unique id assigned.
 * @param player 
 * @param uniqueID 
 */
export function deleteLocalBlip(player, uniqueID) {
    alt.emitClient(player, 'deleteLocalBlip', uniqueID);
}

/**
 * Create a local marker for a player.
 * @param player 
 * @param type 
 * @param pos 
 * @param direction 
 * @param rotation 
 * @param scale 
 * @param r 
 * @param g 
 * @param b 
 * @param alpha 
 * @param bobUpAndDown 
 * @param faceCamera 
 * @param isRotating 
 * @param deleteOnEnter Delete this when the player enters?
 * @param range The range to delete at.
 * @param uniqueID Any unique id you want to give it.
 */
export function createMarker(player, type, pos, direction, rotation, scale, r, g, b, alpha, bobUpAndDown, faceCamera, isRotating, deleteOnEnter, range, uniqueID) {
    alt.emitClient(player, 'createMarker', type, pos, direction, rotation, scale, r, g, b, alpha, bobUpAndDown, faceCamera, isRotating, deleteOnEnter, range, uniqueID);
}

export function deleteMarker(player, uniqueID) {
    alt.emitClient(player, 'deleteMarker', uniqueID);
}