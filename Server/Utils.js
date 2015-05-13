var Utils = {

	squaredDistance: function(x1,y1,x2,y2) {
		var result =(x1- x2)*(x1-x2) + (y1-y2)*(y1-y2);
		return result;
	},

	isInRangeOfSomePlayer: function(x,y,blockRange,players) {
		var xcenter = x + 0.5;
		var ycenter = y + 0.5;
		var px,py;
		var range2 = (blockRange + 1)*(blockRange + 1);

		for(var i = 0; i < players.length; ++i) {
			if(players[i] == null) continue;
			px = players[i].worldX + 0.5;
			py = players[i].worldY + 0.5;
			if( Math.abs(px - xcenter) > 1 && Math.abs(py - ycenter) > 1) continue;
			if(this.squaredDistance(px,py,xcenter,ycenter) < range2) {
				return true;
			}
		}
		return false;
	},

	blockCoords2WorldCoords: function(bx, by) {
		wcoords = {};
		wcoords.x = map.offsetX + bx * map.terrainBlockSize;
		wcoords.y = map.offsetY + by * map.terrainBlockSize;
		return wcoords;
	},

	create_2D_array: function(width, height) {
   	var array = new Array(width);
   	for (var i = 0; i < width; i++) {
      	array[i] = new Array(height);
      	for(var j = 0; j < height; ++j) {
      		array[i][j] = {x: i, y: j};
      	}
      }
		return array;
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

module.exports = Utils;