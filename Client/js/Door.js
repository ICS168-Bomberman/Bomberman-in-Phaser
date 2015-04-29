var Door = function() {};

Door.prototype = {

	blockCoords: {},

	updateBlockCoordinates: function() {

		this.blockCoords.x = 
		Math.floor((this.sprite.world.x - map.offsetX + map.playerBlockSize/2) / 
						map.terrainBlockSize);

		this.blockCoords.y = 
		Math.floor((this.sprite.world.y - map.offsetY + map.playerBlockSize/2) / 
						map.terrainBlockSize);
	}

};