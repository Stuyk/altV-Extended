# altV-Extended
A series of custom functions that help with running your server.

---

Installation:

Add 'server-extended' into your deps for your resource.

Example (resource.cfg)
```
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

---

Examples:
```
import * as extended from 'server-extended'

var result = extended.randomColor();
```

Any function that has async in it needs to await for a return.
```
chat.registerCmd('getForward', async (player, args) => {
    var result = await getForwardVector(player);
});
```

General functions you can call:
```
/**
 * @returns number
 */
export function randomColor()

/**
 * @param pos Vector3 Position
 * @param range Range to Look In
 * @returns [player1, player2, player3, etc.]
 */
export function getPlayersInRange(pos, range)

// Credit: Tuxick
/**
 * @param positionOne 
 * @param positionTwo 
 * @returns distance
 */
export function distance(positionOne, positionTwo)

/**
 * @param pos Position to be based around.
 * @param range Range to look in.
 * @param randomizeZAxis Randomize the Z axis up and down. Not recommended.
 * @returns {x, y, z}
 */
export function randomPositionNear(pos, range, randomizeZAxis)

/**
 * Get the position directly in front of the player.
 * @param player 
 * @param distance How far should it go forward.
 * @returns {x, y, z}
 */
export async function positionInFrontOfPlayer(player, distance)

/**
 * Retrieve the player's forward vector.
 * @param player 
 * @returns {x, y, z}
 */
export async function getForwardVector(player)

/**
 * Return the ground Z axis from a 3D coordinate.
 * @param player 
 * @param pos 
 * @returns Array: [true, ZPos];
 */
export async function getGroundZFrom3DCoord(player, pos)

/**
 * Custom callback function
 * @param player 
 * @param clientEventName 
 * @param argsArray 
 */
export async function ClientCallback(player, clientEventName, argsArray)

/**
 * Returns if the player is in range / near a position.
 * @param player
 * @param pos
 * @param distance
 * @returns true/false
 */
export function isPlayerNearPosition(player, pos, distance)

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
export function createLocalBlip(player, pos, sprite, color, scale, name, shortRange, uniqueID)

/**
 * Delete a local blip by the unique id assigned.
 * @param player 
 * @param uniqueID 
 */
export function deleteLocalBlip(player, uniqueID)

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
export function createMarker(player, type, pos, direction, rotation, scale, r, g, b, alpha, bobUpAndDown, faceCamera, isRotating, deleteOnEnter, range, uniqueID)

/**
 * Delete a marker by a uniqueID
 * @param player 
 * @param uniqueID 
 */
export function deleteMarker(player, uniqueID);
```
