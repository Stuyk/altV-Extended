declare module 'server-extended' {
    export interface Vector3 {
        x: number,
        y: number,
        z: number
    }

    export interface Scale {
        x: number,
        y: number,
        z: number
    }

    export interface Direction {
        x: number,
        y: number,
        z: number
    }
    
    /**
     * @returns number
     */
    export function randomColor(): number;

    /**
     * @param pos Vector3 Position
     * @param range Range to Look In
     * @returns [player1, player2, player3, etc.]
     */
    export function getPlayersInRage(pos: Vector3, range: number): Array<any>;

    /**
     * @param pos Position to be based around.
     * @param range Range to look in.
     * @param randomizeZAxis Randomize the Z axis up and down. Not recommended.
     * @returns {x, y, z}
     */
    export function randomPositionNear(pos: Vector3, range: number, randomizeZAxis: boolean): Vector3;

    /**
     * Get the position directly in front of the player.
     * @param player 
     * @param distance How far should it go forward.
     * @returns {x, y, z}
     */
    export async function positionInFrontOfPlayer(player: any, distance: number);

    /**
     * Retrieve the player's forward vector.
     * @param player 
     * @returns {x, y, z}
     */
    export async function getForwardVector(player: any): Vector3;

    /**
     * Return the ground Z axis from a 3D coordinate.
     * @param player 
     * @param pos 
     * @returns Array: [true, ZPos];
     */
    export async function getGroundZFrom3DCoord(player: any, pos: Vector3);

    /**
     * Returns if the player is in range / near a position.
     * @param player
     * @param pos
     * @param distance
     * @returns true/false
     */
    export function isNearPosition(player: any, pos: Vector3, distance: number): boolean;

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
    export function createLocalBlip(player: any, pos: Vector3, sprite: number, color: number, scale: number, name: string, shortRange: boolean, uniqueID: string);
    
    /**
     * Delete a local blip by the unique id assigned.
     * @param player 
     * @param uniqueID 
     */
    export function deleteLocalBlip(player: any, uniqueID: string)
    
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
    export function createMarker(player: any, type: number, pos: Vector3, direction: Direction, rotation: Vector3, scale: Scale, r: number, g: number, b: number, alpha: number, bobUpAndDown: boolean, faceCamera: boolean, isRotating: boolean, deleteOnEnter: boolean, range: number, uniqueID: string);
    
    /**
     * Delete a local marker by a uniqueID.
     * @param player 
     * @param uniqueID 
     */
    export function deleteMarker(player: any, uniqueID: string);

    /**
     * Hide/Show hud for local player.
     * @param player 
     * @param state 
     */
    export function hideHUD(player: any, state: boolean);

    /**
     * Freeze Player
     */
    export function freezePlayer(player: any, state: boolean);

    /**
     * Transition a camera from position to another.
     * @param player Who do show this camera to?
     * @param pos1X Cam Position 1 X
     * @param pos1Y Cam Position 1 Y
     * @param pos1Z Cam Position 1 Z
     * @param rot1 YAW Rotation for Cam 1
     * @param fov Field of View for Cam 1
     * @param pos2X Cam Position 2 X
     * @param pos2Y Cam Position 2 Y
     * @param pos2Z Cam Position 2 Z
     * @param rot2 YAW Rotation for Cam 2
     * @param fov2 Field of View for Cam 2
     * @param duration Time between start and end camera changes. In milliseconds.
     */
    export function interpolateCamera(player: any, pos1X: number, pos1Y: number, pos1Z: number, rot1: number, fov: number, pos2X: number, pos2Y: number, pos2Z: number, rot2: number, fov2: number, duration: number) {
        alt.emitClient(player, 'interpolateCamera', pos1X, pos1Y, pos1Z, rot1, fov, pos2X, pos2Y, pos2Z, rot2, fov2, duration);
    }
    
    /**
     * Create a camera and force a player to look through it.
     * @param player 
     * @param pos 
     * @param rot 
     * @param fov 
     */
    export function createCamera(player: any, pos: Vector3, rot: Vector3, fov: number) {
        alt.emitClient(player, 'createCamera', pos, rot, fov);
    }
    
    /**
     * Destroy the existing camera.
     * @param player 
     */
    export function destroyCamera(player: any) {
        alt.emitClient(player, 'destroyCamera');
    }

    /**
     * Draw a notification for a player.
     * @param player Player to show it to.
     * @param imageName https://pastebin.com/XdpJVbHz
     * @param headerMsg Title
     * @param detailsMsg Small Detail
     * @param message Longer Message Here
     */
    export function showNotification(player: any, imageName: string, headerMsg: string, detailsMsg: string, message: string);
}
