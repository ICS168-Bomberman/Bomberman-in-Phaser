//Terrain Enum
var TerrainType = Object.freeze({
  ROCK : 1,
  GRASS : 2,
  EMPTY: 3
});

//other
var numberOfGrass = 0;
var switchCount = 0;
var moveChooser = 0;

var timer;
var s = 40;
var timesUp = false;
var Score;
var score = 0;

var gameOver = false;

function generateMap() {

		//create map as a bidimensional array

		//map.width = 23; //3 + 2*n
		map.width = this.game.rnd.integerInRange(2, 2) * 2  + 3;
		//map.height = 19;
		map.height = this.game.rnd.integerInRange(2, 2) * 2  + 3;

		map.offsetX = 100;
		map.offsetY = 50;
		map.terrainBlockSize = 35;
		map.playerBlockSize = 20;
		map.board = Utils.create_2D_array(map.width,map.height);

		timer = this.game.add.text(100, 0, "Timer: " + s);
		timer.font = "Carter One";
		timer.fill = "red";
		timer.fontSize = 30;

		Score = this.game.add.text(250, 0, "Score: " + score);
		Score.font = "Carter One";
		Score.fill = "blue";
		Score.fontSize = 30;

		//enabling physics
		this.game.physics.arcade.enable(player1.sprite);

		///////////////////////////////////////////////
		//// CREATING STATIC ELEMENTS ON THE BOARD ////
		///////////////////////////////////////////////

		//define rock blocks group
		map.rockBlocks = this.game.add.group();
		map.rockBlocks.enableBody = true;
		map.rockBlocks.physicsBodyType = Phaser.Physics.ARCADE;

		//define grass blocks group
		map.grassBlocks = this.game.add.group();
		map.grassBlocks.enableBody = true;
		map.grassBlocks.physicsBodyType = Phaser.Physics.ARCADE;

		//define bombs group
		map.bombs = this.game.add.group();
		map.bombs.enableBody = true;
		map.bombs.physicsBodyType = Phaser.Physics.ARCADE;

		//define powerups group
		map.powerups = this.game.add.group();
		map.powerups.enableBody = true;
		map.powerups.physicsBodyType = Phaser.Physics.ARCADE;

		//define explosions group
		map.explosions = this.game.add.group();
		map.explosions.enableBody = true;
		map.explosions.physicsBodyType = Phaser.Physics.ARCADE;

		//define enemies group
		map.enemies = this.game.add.group();
		map.enemies.enableBody = true;
		map.enemies.physicsBodyType = Phaser.Physics.ARCADE;

		//place the rocks and the grass on the map
		var rockBlock;
		var grassBlock;
		var x;
		var y;

		//first, we retrieve the dimensions of the sprites stored in the global atlas
		//to rescale them in order to fit in a cell/block of the board
		var rockFrameDimensions = Utils.getFrameDimensions("rock.png",this.game.cache);
		var grassFrameDimensions = Utils.getFrameDimensions("Grass.png",this.game.cache);
		//we compute the transformation scales
		var rockScaleX = map.terrainBlockSize / rockFrameDimensions.width;
		var rockScaleY = map.terrainBlockSize / rockFrameDimensions.height;
		var grassScaleX = map.terrainBlockSize / grassFrameDimensions.width;
		var grassScaleY = map.terrainBlockSize / grassFrameDimensions.height;

		for(var i = 0; i < map.width; ++i) {
			for(var j = 0; j <  map.height; ++j) {
				x = map.offsetX + i*map.terrainBlockSize;
				y = map.offsetY + j*map.terrainBlockSize;
				if(i == 0 || i == map.width -1 || j ==0 || j == map.height -1
				  || (i%2 == 0 && j%2 == 0)) {

					rockBlock = map.rockBlocks.create(x,y,'global_spritesheet');
					rockBlock.frameName = 'rock.png';
					rockBlock.anchor.x = 0.5;
					rockBlock.anchor.y = 0.5;
					rockBlock.scale.set(rockScaleX,rockScaleY);
					rockBlock.body.immovable = true;
					map.board[i][j].terrain = TerrainType.ROCK;

				} else if(!Utils.isInRangeOfSomePlayer(x,y,map.initialBombRange) &&
					(i != map.width-2 || j != map.height-2) &&
					(i != map.width-3 || j != map.height-2) &&
					(i != map.width-2 || j != map.height-3)) {
					numberOfGrass++;
					grassBlock = map.grassBlocks.create(x,y,'global_spritesheet');
					grassBlock.frameName = 'Grass.png';
					grassBlock.anchor.x = 0.5;
					grassBlock.anchor.y = 0.5;
					grassBlock.scale.set(grassScaleX,grassScaleY);
					grassBlock.body.immovable = true;
					map.board[i][j].terrain = TerrainType.GRASS;
					map.board[i][j].grassBlock = grassBlock;

				} else {
					map.board[i][j].terrain = TerrainType.EMPTY;
				}
			}
		}
	};

	module.exports = Map;