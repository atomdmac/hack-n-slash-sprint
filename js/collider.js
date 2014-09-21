define(['jaws', 'lib/SAT'], function (jaws, SAT) {

function Collider () {
	this._subscribers = [];
	this._presences = {};
	this._terrainLayer = null;
}

Collider.prototype.update = function () {
	var self = this;
	// For each subscriber that we're keeping track of...
	this._subscribers.forEach( function (subscriber) {

		// For each subscribers' interest.
		subscriber.interests.forEach( function (interest) {

			// Check for terrain collisions.
			if(interest.name == 'terrain') {
				// If no terrain map is available, skip the collision check for
				// this interest.
				if(!this._terrainLayer) return true;

				this._collideWithTerrain(this._terrainLayer, subscriber);
			}

			// For each presence partaining to the subscriber's interest...
			self.getPresencesLike(interest).forEach( function (presence) {
				if(subscriber === presence.entity) return true;

				var isCollision = jaws.collideOneWithOne(
					{
						x     : subscriber.x, 
						y     : subscriber.y, 
						radius: interest.radius,
						rect  : interest.rect
					},
					{
						x: presence.entity.x, 
						y: presence.entity.y, 
						// Yeah, I know.  This is very confusing and should be fixed.
						radius: presence.presence.radius,
						rect  : presence.presence.rect
					}
				);

				// If the subscriber's interest collides with an entity's
				// presence, notify the subscriber.
				if(isCollision) {
					subscriber.onCollision(presence.entity, interest);
				}
			});
		});
	});
};

Collider.prototype.addEntity = function (entity) {
	// Keep track of things that other Entities might want know about.
	for(var i=0; i<entity.presences.length; i++) {
		this._addEntityPresence(entity, entity.presences[i]);
	}

	// Let Entity know about other Entities in it's vicinity that have 
	// properties that it is interested in.
	if(entity.interests.length) {
		this._subscribeEntity(entity);
	}

	// Listen for changes in the Entity so we can manage internal assets.
	entity.signals.gainedInterest.add(this._onEntityGainedInterest, this);
	entity.signals.lostInterest  .add(this._onEntityLostInterest  , this);
	entity.signals.gainedPresence.add(this._onEntityGainedPresence, this);
	entity.signals.lostPresence  .add(this._onEntityLostPresence  , this);
	entity.signals.gave          .add(this._onEntityGave          , this);
	entity.signals.took          .add(this._onEntityTook          , this);
	entity.signals.destroyed     .add(this._onEntityDestroyed     , this);
};


Collider.prototype.getPresencesLike = function (presence) {
	if (jaws.isArray(this._presences[presence.name])) {
		return this._presences[presence.name];
	}
	return [];
};


Collider.prototype.removeEntity = function (entity) {
	// Stop tracking entity presences.
	entity.presences.forEach( function (presence) {
		this._removeEntityPresence(entity, presence);
	}, this);

	// Stop tracking entity interests.
	this._unsubscribeEntity(entity);

	// Stop listening for events.
	entity.signals.gainedInterest.remove(this._onEntityGainedInterest);
	entity.signals.lostInterest  .remove(this._onEntityLostInterest  );
	entity.signals.gainedPresence.remove(this._onEntityGainedPresence);
	entity.signals.lostPresence  .remove(this._onEntityLostPresence  );
	entity.signals.gave          .remove(this._onEntityGave          );
	entity.signals.took          .remove(this._onEntityTook          );
	entity.signals.destroyed     .remove(this._onEntityDestroyed     );
};


// TODO: Support multiple terrain/collision layers.
Collider.prototype.addTerrainLayer = function (layer) {
	this._terrainLayer = layer;
};

Collider.prototype.removeTerrainLayer = function (layer) {
	this._terrainLayer = null;
};



// ------
// "PRIVATE" METHODS
// ------

Collider.prototype._subscribeEntity = function (entity) {
	if(this._subscribers.indexOf(entity) < 0) {
		this._subscribers.push(entity);
	}
};

Collider.prototype._unsubscribeEntity = function (entity) {
	// TODO: Check to make sure entity isn't adding to subscriber list more than once?
	this._subscribers.splice(
		this._subscribers.indexOf(entity), 1
	);
};

Collider.prototype._addEntityPresence = function (entity, presence) {
	// If a list of entities with the given presence doesn't already exist,
	// create it.
	if(!this.getPresencesLike(presence).length) {
		this._presences[presence.name] = [];
	}
	this._presences[presence.name].push({entity: entity, presence: presence}); 
};

Collider.prototype._removeEntityPresence = function (entity, presence) {
	if(this.getPresencesLike(presence)) {
		this._presences[presence.name].forEach(function (obj, index) {
			if(obj.entity === entity && obj.presence === presence) {
				this._presences[presence.name].splice(index, 1);
				return false;
			}
		}, this);
	}
};

/*
 * Check for collisions between the given Object and any objects in the
 * given TileMap.
 */
Collider.prototype._collideWithTerrain = function (layer, obj) {
	function __getResponse (tile, obj) {
		// NOTE: Requires SAT.js.
		var polygon = new SAT.Polygon(
			new SAT.Vector(tile.x, tile.y),
			[
				new SAT.Vector(0, 0),
				new SAT.Vector(tile.width, 0),
				new SAT.Vector(tile.width, tile.height),
				new SAT.Vector(0, tile.height)
			]
		);

		var circle = new SAT.Circle(
			new SAT.Vector(
				obj.x, 
				obj.y
			), 
			obj.radius
		);

		var response = new SAT.Response();

		var collision = SAT.testCirclePolygon(circle, polygon, response);

		if (collision) {
			return response;
		} else {
			return false;
		}
	}

	var tiles = layer.atRect(obj.rect()),
		cols  = [];

	for(var i=0, len=tiles.length; i<len; i++) {
		if (!tiles[i].passable && tiles[i] !== obj) {
			var col = __getResponse( tiles[i], obj );
			if (col) {
				cols.push({
					tile: tiles[i],
					overlapX: col.overlapV.x,
					overlapY: col.overlapV.y
				});
			}
		}
	}
	return cols;
};



// ------
// EVENT LISTENERS
// ------

Collider.prototype._onEntityGave = function (entity) {
	this.addEntity(entity);
};

Collider.prototype._onEntityTook = function (entity) {
	this.removeEntity(entity);
};

Collider.prototype._onEntityGainedInterest = function (entity, interest) {
	this._subscribeEntity(entity);
};

Collider.prototype._onEntityLostInterest = function (entity, interest) {
	if(!entity.interests.length) {
		this._unsubscribeEntity(entity);
	}
};

Collider.prototype._onEntityGainedPresence = function (entity, presence) {
	this._addEntityPresence(entity, presence);
};

Collider.prototype._onEntityLostPresence = function (entity, presence) {
	this._removeEntityPresence(entity, presence);
};

Collider.prototype._onEntityDestroyed = function (entity) {
	this.removeEntity(entity);
};

return Collider;

});