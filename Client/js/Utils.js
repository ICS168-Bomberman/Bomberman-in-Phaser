var Utils = {
	squaredDistance: function(x1,y1,x2,y2) {
		var result =(x1- x2)*(x1-x2) + (y1-y2)*(y1-y2);
		return result;
	},

	isInRangeOfSomePlayer: function(x,y,blockRange, players, map) {
		var xcenter = x + map.terrainBlockSize/2;
		var ycenter = y + map.terrainBlockSize/2;
		var px,py;
		var range2 = blockRange + 1;
		range2 *= map.terrainBlockSize;
		range2 *= range2;

		for(var i = 0; i < players.length; ++i) {
			if(players[i] == null) continue;
			px = players[i].sprite.world.x + map.terrainBlockSize/2;
			py = players[i].sprite.world.y + map.terrainBlockSize/2;
			if( Math.abs(px - xcenter) > 1 && Math.abs(py - ycenter) > 1) continue;
			if(Utils.squaredDistance(px,py,xcenter,ycenter) < range2) {
				return true;
			}
		}
		return false;
	},

	blockCoords2WorldCoords: function(bx, by, map) {
		wcoords = {};
		wcoords.x = map.offsetX + bx * map.terrainBlockSize;
		wcoords.y = map.offsetY + by * map.terrainBlockSize;
		return wcoords;
	},
	worldCoords2BlockCoords: function(x, y, height, width, map)
	{
		var blockCoords = {};
		blockCoords.x = 
		Math.floor((x - map.offsetX + 5 + width/2) / 
						map.terrainBlockSize);

		blockCoords.y = 
		Math.floor((y - map.offsetY + 5 + height/2)/ 
						map.terrainBlockSize);
		console.log(blockCoords);
		return blockCoords;
	},
	create_2D_array: function(width, height) {
   	var array = new Array(width);
   	for (var i = 0; i < width; i++) {
      	array[i] = new Array(height);
      	for(var j = 0; j < height; ++j) {
      		array[i][j] = {};
      	}
      }
		return array;
	},

	updateFrameDimensions: function(object, cache) {		
		var frame = cache.getFrameData("global_spritesheet").getFrameByName(object.sprite.frameName);
		
		//alert("from utils.updateFrameDimensions: frame = "+frame);
		//alert("from utils.updateFrameDimensions: frame.width = "+frame.width+" frame.height = "+frame.height);
		object.frameWidth = frame.width;
		object.frameHeight = frame.height;
		//alert("from utils.updateFrameDimensions: frame = "+frame);
		//alert("from utils.updateFrameDimensions: frame.width = "+frame.width+" frame.height = "+frame.height);
	},

	getFrameDimensions: function(frameName, cache) {				
		var frame = cache.getFrameData("global_spritesheet").getFrameByName(frameName);
		//alert("from utils.getFrameDimensions: frame = "+frame);
		//alert("from utils.getFrameDimensions: frame.width = "+frame.width+" frame.height = "+frame.height);
		return {width: frame.width, height: frame.height};
	},

	removeElementFromArray: function(element, array) {
		var index = array.indexOf(element);
		if(index > -1) {
			array.splice(index, 1);
		}
	},

	outsideBoard: function(bx,by) {
		return (bx < 0 || bx > map.width || by < 0 || by > map.height); 
	}

}