// Credit: Tuxick
/**
 * @param positionOne 
 * @param positionTwo 
 * @returns distance
 */
export function distance(positionOne, positionTwo) {
    return Math.pow(positionOne.x - positionTwo.x, 2) + Math.pow(positionOne.y - positionTwo.y, 2) + Math.pow(positionOne.z - positionTwo.z, 2);
}