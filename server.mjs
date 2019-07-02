import * as alt from 'alt';
import * as color from './colors.mjs';

console.log(`${color.FgYellow}Extended v0.5 is running.`);

const markersToLoad = [];
const callbacks = [];
const registeredCallbacks = new Set();

alt.on('playerConnect', (player) => {
	if (markersToLoad.length >= 1) {
		for(var i = 0; i < markersToLoad.length; i++) {
			// (type, pos, dir, rot, scale, color, enterColor, deleteOnEnter, range, uniqueID)
			alt.emitClient(
				player, 
				'createLocalMarker', 
				markersToLoad[i].markerType, 
				markersToLoad[i].pos,
				{x: 0, y: 0, z: 0},
				{x: 0, y: 0, z: 0},
				markersToLoad[i].markerScale,
				markersToLoad[i].exitMarkerColor,
				markersToLoad[i].enterMarkerColor,
				false,
				markersToLoad[i].markerRange,
				undefined
			);
		}
	}
});

alt.on('entityEnterColshape', (colshape, entity) => {
	if (!colshape.emitter)
		return;

	if (!colshape.enterEventName)
		return;

	if (colshape.isEnterClientside && colshape.isPlayerOnly && entity instanceof alt.Player) {
		alt.emitClient(entity, colshape.enterEventName);
		return;
	}

	if (colshape.isPlayerOnly && entity instanceof alt.Player) {
		console.log('Called server-side event.');
		alt.emit(colshape.enterEventName, entity);
		return;
	}

	alt.emit(colshape.enterEventName, entity);
});

alt.on('entityLeaveColshape', (colshape, entity) => {
	if (!colshape.emitter)
		return;

	if (colshape.exitEventName == undefined || colshape.exitEventName == null)
		return;

	if (colshape.isExitClientside && colshape.isPlayerOnly && entity instanceof alt.Player) {
		alt.emitClient(entity, colshape.exitEventName);
		return;
	}

	if (colshape.isPlayerOnly && entity instanceof alt.Player) {
		alt.emit(colshape.exitEventName, entity);
		return;
	}

	alt.emit(colshape.exitEventName, entity);
});

// This emits server or client functions automatically on entering.
export function ColshapeEmitter(pos, enterEventName, exitEventName, markerType, enterMarkerColor, exitMarkerColor, markerScale, markerRange, isEnterClientside = false, isExitClientside = false, isPlayerOnly = true) {
	var colshape = new alt.ColshapeCylinder(pos.x, pos.y, pos.z, markerRange, markerScale.z);
	colshape.emitter = true;
	colshape.isPlayerOnly = isPlayerOnly;
	colshape.exitEventName = exitEventName;
	colshape.enterEventName = enterEventName;
	colshape.isEnterClientside = isEnterClientside;
	colshape.isExitClientside = isExitClientside;
	colshape.markerType = markerType;
	colshape.enterMarkerColor = enterMarkerColor;
	colshape.exitMarkerColor = exitMarkerColor;
	colshape.markerScale = markerScale;
	colshape.markerRange = markerRange;
	markersToLoad.push(colshape);
}

// This needs to be called for each player that joins the server.
export function SetupExportsForPlayer(player) {
	if (player === undefined) {
		throw new Error('SetupExportsForPlayer => player is undefined.');
	}

	// Returns the ForwardVector of the player.
	player.forwardVector = (callback) => {
		SetupCallback(player, 'getForwardVector', undefined, (result) => {
			callback(result);
		});
	};

	// Returns if the player is near a position.
	player.isNearPos = (pos, range) => {
		if (pos === undefined || range === undefined) {
			throw new Error('isNearPos => pos or range is undefined');
		}

		var currentDistance = Distance(player.pos, pos);
		if (currentDistance <= range)
			return true;
		return false;
	};

	// Create a local blip for a player.
	player.createLocalBlip = (pos, sprite, color, scale, name, shortRange, uniqueID) => {
		if (pos === undefined || sprite === undefined || color === undefined || scale === undefined) {
			throw new Error('createLocalBlip => One or more parameters is undefined.');
		}

		alt.emitClient(player, 'createLocalBlip', pos, sprite, color, scale, name, shortRange, uniqueID);
	};

	// Delete a local blip by uniqueID.
	player.deleteLocalBlip = (uniqueID) => {
		if (uniqueID === undefined) {
			throw new Error('deleteLocalBlip => uniqueID is undefined.');
		}

		alt.emitClient(player, 'deleteLocalBlip', uniqueID);
	};

	// Create a marker for a player.
	player.createLocalMarker = (type, pos, dir, rot, scale, color, enterColor, deleteOnEnter, range, uniqueID) => {
		if (type === undefined || pos === undefined || scale === undefined || color === undefined || enterColor === undefined || range === undefined) {
			throw new Error('createLocalMarker => One or more parameters is undefined.');
		}

		alt.emitClient(player, 'createLocalMarker', type, pos, dir, rot, scale, color, enterColor, deleteOnEnter, range, uniqueID);
	};

	// Delete a marker for a player.
	player.deleteLocalMarker = (uniqueID) => {
		if (uniqueID === undefined) {
			throw new Error('deleteLocalMarker => uniqueID is undefined.');
		}

		alt.emitClient(player, 'deleteLocalMarker', uniqueID);
	};

	// Show Notification to Player
	player.showNotification = (imageName, headerMsg, detailsMsg, message) => {
		if (imageName === undefined || headerMsg === undefined || detailsMsg === undefined || message === undefined) {
			throw new Error('showNotification => One or more parameters is undefined.');
		}

		alt.emitClient(player, 'showNotification', imageName, headerMsg, detailsMsg, message);
	};

	// Freeze Player
	player.freeze = (state) => {
		alt.emitClient(player, 'freezePlayer', state);
	};

	// Fade screen to black and back.
	player.fadeScreen = (state, timeInMS) => {
		if (timeInMS === undefined) {
			throw new Error('fadeScreen => state or timeInMS is undefined.');
		}

		alt.emitClient(player, 'fadeOutScreen', state, timeInMS);
	};

	// Blur screen.
	player.blurScreen = (state, timeInMS) => {
		if (timeInMS === undefined) {
			throw new Error('blurScreen => state or timeInMS is undefined.');
		}

		alt.emitClient(player, 'blurOutScreen', state, timeInMS);
	};

	// Show Cursor
	player.showCursor = (state) => {
		alt.emitClient(player, 'showCursor', state);
	};

	// Show Help Text
	player.showHelpText = (text, timeInMS) => {
		if (text === undefined || timeInMS === undefined) {
			throw new Error('showHelpText => text or timeInMS is undefined.');
		}

		alt.emitClient(player, 'displayHelpText', text, timeInMS);
	};

	// Show Subtitle Text
	player.showSubtitle = (text, timeInMS) => {
		if (text === undefined || timeInMS === undefined) {
			throw new Error('showSubtitle => text or timeInMS is undefined.');
		}

		alt.emitClient(player, 'displaySubtitle', text, timeInMS);
	};

	// Display Loading
	player.showLoading = (text, timeInMS, type, toggled) => {
		if (text === undefined || timeInMS === undefined) {
			throw new Error('showLoading => One or more parameters is undefined.');
		}

		alt.emitClient(player, 'showLoading', text, timeInMS, type, toggled);
	};
}

// Returns the GroundLevel from a 3D Position near a player.
// Returns undefined if ground was not present. Otherwise a number.
export function GetGroundZFrom3DCoord(player, pos, callback) {
	if (player === undefined || pos === undefined) {
		throw new Error('GetGroundZFrom3DCoord => player or pos is undefined.');
	}
    
	SetupCallback(player, 'getGroundZFrom3DCoord', pos, (result) => {
		if (result[0] == false)
			callback(undefined);

		callback(result[1]);
	});
}

// Add one vector to another.
export function AddVector3(vector1, vector2) {
	if (vector1 === undefined || vector2 === undefined) {
		throw new Error('AddVector => vector1 or vector2 is undefined');
	}
    
	return {
		x: vector1.x + vector2.x,
		y: vector1.y + vector2.y,
		z: vector1.z + vector2.z
	};
}

// Subtract one vector from another.
export function SubVector3(vector1, vector2) {
	if (vector1 === undefined || vector2 === undefined) {
		throw new Error('AddVector => vector1 or vector2 is undefined');
	}

	return {
		x: vector1.x - vector2.x,
		y: vector1.y - vector2.y,
		z: vector1.z - vector2.z
	};
}

// Returns as {r,g,b}
export function GetRandomColor() {
	return {
		r: Math.floor(Math.random() * 255) + 1,
		g: Math.floor(Math.random() * 255) + 1,
		b: Math.floor(Math.random() * 255) + 1
	};
}

// Get all of the players in range of a position.
export function GetPlayersInRange(pos, range) {
	if (pos === undefined || range === undefined) {
		throw new Error('GetPlayersInRange => pos or range is undefined');
	}
    
	var inRange = [];
    
	alt.Player.all.forEach((value) => {
		if (Distance(pos, value.pos) > range)
			return;
		inRange.push(value);
	});

	return inRange;
}

// Get the distance between two vectors.
export function Distance(vector1, vector2) {
	if (vector1 === undefined || vector2 === undefined) {
		throw new Error('AddVector => vector1 or vector2 is undefined');
	}

	return Math.sqrt(Math.pow(vector1.x - vector2.x, 2) + Math.pow(vector1.y - vector2.y, 2) + Math.pow(vector1.z - vector2.z, 2));
}

// Get Random Position Around Position
export function RandomPosAround(pos, range) {
	if (pos === undefined || range === undefined) {
		throw new Error('RandomPosAround => pos or range is undefined');
	}

	return {
		x: pos.x + (Math.random() * (range * 2)) - range,
		y: pos.y + (Math.random() * (range * 2)) - range,
		z: pos.z
	};
}

// Display a message above a player's head.
export function DisplayAboveHead(player, message, timeInMS, rangeToDisplay, r = 255, g = 255, b = 255, a = 255) {
	if (message === undefined || timeInMS <= 0) {
		throw new Error('DisplayAboveHead => message or timeInMS is undefined.');
	}

	var players = GetPlayersInRange(player.pos, rangeToDisplay);

	for (const target of players) {
		if (target === player) {
			continue;
		}

		alt.emitClient(target, 'displayMessageAboveHead', player, message, timeInMS, r, g, b, a);
	}
}

async function SetupCallback(player, eventName, args, callback) {
	ClientsideCall(player, eventName, args, (result) => {
		callback(result);
	});
}

async function ClientsideCall(player, eventName, args, callback) {
	if (player === undefined)
		throw new Error('ClientsideCall => Player is undefined.');

	if (eventName === undefined)
		throw new Error('ClientsideCall => eventName is undefined.');

	alt.emitClient(player, eventName, args);
	callbacks.push({player, eventName, startTime: Date.now(), completed: false, callback});

	if (registeredCallbacks.has(eventName))
		return;

	registeredCallbacks.add(eventName);

	alt.onClient(eventName, (player, results) => {
		let index = -1;
		for(var i = 0; i < callbacks.length; i++) {
			if (callbacks[i].player !== player && callbacks[i].eventName !== eventName)
				continue;
			index = i;
			break; 
		}

		if (index <= -1)
			return;

		callbacks[i].callback(results);
		callbacks[i].completed = true;
	});
}

// Callback Cleanup
setInterval(() => {
	var callbacksCleanedUp = 0;
	var i = callbacks.length;
	while(i--) {
		if (callbacks[i].completed) {
			callbacks.splice(i, 1);
			callbacksCleanedUp += 1;
			continue;
		}

		if ((callbacks[i].startTime + 10000) < Date.now()) {
			callbacks.splice(i, 1);
			callbacksCleanedUp += 1;
			continue;
		}
	}

	if (callbacksCleanedUp <= 0)
		return;

	console.log(`===> Extended: Cleaned up ${callbacksCleanedUp}`);
}, 5000);