var Bomberman = Bomberman || {};

//title screen
Bomberman.Game = function(){};

//Terrain Enum
var TerrainType = Object.freeze({
  ROCK : 1,
  GRASS : 2,
  EMPTY: 3
});

//keyboard
var keyboard = {};

//players
var players = [];

//player 1 default variables
var player1 = new Player();
player1.vel = 120;
player1.frameWidth = 16;
player1.frameHeight = 22;
players.push(player1);
player1.alive = true;

//map
var map = {};
map.initialBombRange = 1;
map.initialNumberOfBombs = 1;
map.bombCounter = 0;

//powerups
var powerups = ["powerup_increase_bomb_drops.png", "powerup_increase_bomb_range.png", "powerup_increase_speed.png"];

Bomberman.Game.prototype = {

  create: function() {  	

  		//set up the keyboard
  		keyboard.cursors = this.game.input.keyboard.createCursorKeys();
  		keyboard.spaceBar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  		//generate map
		this.generateMap();
  },

  generateMap: function() {

		//create map as a bidimensional array

		//map.width = 23; //3 + 2*n
		map.width = this.game.rnd.integerInRange(2, 10) * 2  + 3;
		//map.height = 19;
		map.height = this.game.rnd.integerInRange(2, 10) * 2  + 3;
		map.offsetX = 100;
		map.offsetY = 50;
		map.terrainBlockSize = 35;
		map.playerBlockSize = 20;
		map.board = Utils.create_2D_array(map.width,map.height);

		/////////////////////////////
		/////  CREATING PLAYER 1 ////
		/////////////////////////////

		//computing initial coordinates
		player1.x = map.offsetX + map.terrainBlockSize;
		player1.y = map.offsetY + map.terrainBlockSize;		

		//creating the sprite
		player1.sprite = this.game.add.sprite(player1.x,player1.y, 'global_spritesheet');	

		//movement animations
		player1.sprite.animations.add('down',[
			'blue_bomberman_down1.png',
			'blue_bomberman_down2.png'
			],8,true);
		player1.sprite.animations.add('up',[
			'blue_bomberman_up1.png',
			'blue_bomberman_up2.png'
			],8,true);
		player1.sprite.animations.add('right',[
			'blue_bomberman_right1.png',
			'blue_bomberman_right2.png'
			],8,true);
		player1.sprite.animations.add('left',[
			'blue_bomberman_left1.png',
			'blue_bomberman_left2.png'
			],8,true);

		//storing the default standing position frame 
		player1.standingFrame = "blue_bomberman_right0.png";

		player1.standingLeft = "blue_bomberman_left0.png";
		player1.standingRight = "blue_bomberman_right0.png";
		player1.standingUp = "blue_bomberman_up0.png";
		player1.standingDown = "blue_bomberman_down0.png";

		player1.sprite.frameName = player1.standingFrame;

		// scaling the srpite to fit inside a block of the board
		Utils.updateFrameDimensions(player1,this.game.cache);
		player1.sprite.anchor.x = 0.5;
		player1.sprite.anchor.y = 0.5;
		player1.sprite.scale.set( map.playerBlockSize / player1.frameWidth,
										  map.playerBlockSize / player1.frameHeight);

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

				} else if(!Utils.isInRangeOfSomePlayer(x,y,map.initialBombRange)) {
						
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
	},

	update: function() {

		//check collisions
		for(var i = 0; i < players.length; ++i) {

			if(players[i].destroyMe) {

				players[i].alive = false;
				players[i].sprite.destroy();
				Utils.removeElementFromArray(players[i], players);
				--i;

			} else {

				this.game.physics.arcade.collide(players[i].sprite, map.rockBlocks);
				this.game.physics.arcade.collide(players[i].sprite, map.grassBlocks);
				this.game.physics.arcade.collide(players[i].sprite, map.bombs);		
				this.game.physics.arcade.overlap(players[i].sprite, map.powerups, this.handlePowerUps, null, players[i]);
				this.game.physics.arcade.overlap(players[i].sprite, map.explosions, this.destroyPlayer, null, players[i]);	

			}

		}

		//which block is player1 standing in right now?
		for(var i = 0; i < players.length; ++i)
		{
			players[i].updateBlockCoordinates();
		}

		//handle player movement and related animations
		if(player1.alive) {

			player1.sprite.body.velocity.x = 0;
			player1.sprite.body.velocity.y = 0;

			if(keyboard.cursors.left.isDown) {

				player1.sprite.body.velocity.x = -player1.vel;
				player1.standingFrame = player1.standingLeft ;
				player1.sprite.animations.play('left');

			} else if(keyboard.cursors.right.isDown) {

				player1.sprite.body.velocity.x = player1.vel;
				player1.standingFrame = player1.standingRight;
				player1.sprite.animations.play('right');

			} else if(keyboard.cursors.up.isDown) {

				player1.sprite.body.velocity.y = -player1.vel;
				player1.standingFrame = player1.standingUp;
				player1.sprite.animations.play('up');

			} else if(keyboard.cursors.down.isDown) {

				player1.sprite.body.velocity.y = player1.vel;
				player1.standingFrame = player1.standingDown;
				player1.sprite.animations.play('down');

			} else {

				player1.sprite.animations.stop();
				player1.sprite.frameName = player1.standingFrame;

			}

			//trying to drop a bomb when spacebar is pressed
			if(keyboard.spaceBar.isDown) {
				this.tryDropBomb(player1);
			} 
		}

	},

	handlePowerUps: function(player, powerup)
	{
		var bx = this.blockCoords.x;
		var by = this.blockCoords.y;

		if (map.board[bx][by].hasPowerUp)
		{
			switch(powerup.frameName)
			{
				case "powerup_increase_bomb_drops.png":
					map.initialNumberOfBombs++;
					break;
				case "powerup_increase_bomb_range.png":
					map.initialBombRange++;
					break;
				case "powerup_increase_speed.png":
					player1.vel += 20;
					break;
			}
			powerup.destroy();
			map.board[bx][by].hasPowerUp = false;
		}
	},
	tryDropBomb: function(player) {

		/*
			- if there is a bomb already in the block where the player is standing, then
				a new bomb cannot be dropped here
			- if a bomb is dropped:
				1) First, we add a new bomb sprite with animation and we launch a timer event
					synchronized with the duration of the animation.
				2) When the timer ticks, it calls a callback function. This callback
					function removes the bomb from the map and replaces it with a set of explosion
					objects simulating a full explosion of the bomb (all the points reachable by
					the exlosion should be checked here). All players reached by the explosion should
					be destroyed immediately. A new timer must be launched at the same time.
				3) When the second timer ticks it should remove all the explosion objects and
					reveal all the eventual power ups that might have been hidden inside the
					destructed blocks.

		*/

		var bx = player.blockCoords.x;
		var by = player.blockCoords.y;

		var wcoords = Utils.blockCoords2WorldCoords(bx,by);

		//check that block doesn't have a bomb already
		if(map.board[bx][by].hasBomb) 
			return;

		//for (var i = 0; i < map.width; i++){
		//	for (var j = 0; j < map.height; j++){
		//		if (map.board[i][j].hasBomb)
		//			return;
		//	}
		//}

		//////////////////////////
		//// DROPPING A BOMB /////
		//////////////////////////
		if (map.bombCounter != map.initialNumberOfBombs)
		{
			map.board[bx][by].hasBomb = true;
			var bomb = new Bomb();

			bomb.explosionFragments = [];
			bomb.bx = bx;
			bomb.by = by;
			bomb.wx = wcoords.x;
			bomb.wy = wcoords.y;

			//bomb sprite
			bomb.sprite = map.bombs.create(wcoords.x, wcoords.y,'global_spritesheet');
			bomb.sprite.frameName = 'bomb0.png';

			//scaling bomb sprite to fin in a cell of the board
			Utils.updateFrameDimensions(bomb,this.game.cache);
			bomb.sprite.anchor.x = 0.5;
			bomb.sprite.anchor.y = 0.5;
			bomb.sprite.scale.set(map.terrainBlockSize / bomb.frameWidth,
										 map.terrainBlockSize / bomb.frameHeight);

			//bomb animation (no explosion yet)
			bomb.sprite.animations.add('bomb',[
				'bomb0.png',
				'bomb1.png',
				'bomb2.png',
				'bomb3.png'
				],2,false);
			bomb.sprite.animations.play('bomb');

			//enabling physics
			this.game.physics.arcade.enable(bomb.sprite);
			bomb.sprite.body.immovable = true;

			//storing in map.board
			map.board[bx][by].bomb = bomb;

			//launching time event that will perform the explosion animation
			this.game.time.events.add(2000,this.explodeBomb,this,bomb);

			map.bombCounter++;
		}
	},

	//callback function called to simulate the actual explosion of the bomb
	explodeBomb: function(bomb) {

		//add the central explosion fragment at the position of the bomb by default
		this.addNewExplosionFragmentToBomb(bomb,"explosion_center.png",bomb.wx,bomb.wy);

		var bx, by, next_bx, next_by;		
		var frnameMiddle;
		var frnameEnd;

		//upwards
		bx = bomb.bx;
		next_bx = bx;
		frnameMiddle = "explosion_up1.png";
		frnameEnd = "explosion_up2.png"
		for(var i = 1; i <= map.initialBombRange; ++i) {
			by = bomb.by - i;
			next_by = by - 1;
			if(this.handleExplosionEffectOnBlock(frnameMiddle,frnameEnd,bomb,bx,by,next_bx,next_by))
				break;	
		}
		//downwards
		bx = bomb.bx;
		next_bx = bx;
		frnameMiddle = "explosion_down1.png";
		frnameEnd = "explosion_down2.png"
		for(var i = 1; i <= map.initialBombRange; ++i) {
			by = bomb.by + i;
			next_by = by + 1;
			if(this.handleExplosionEffectOnBlock(frnameMiddle,frnameEnd,bomb,bx,by,next_bx,next_by))
				break;	
		}
		//rightwards
		by = bomb.by;
		next_by = by;
		frnameMiddle = "explosion_right1.png";
		frnameEnd = "explosion_right2.png"
		for(var i = 1; i <= map.initialBombRange; ++i) {
			bx = bomb.bx + i;
			next_bx = bx + 1;
			if(this.handleExplosionEffectOnBlock(frnameMiddle,frnameEnd,bomb,bx,by,next_bx,next_by))
				break;	
		}
		//leftwards
		by = bomb.by;
		next_by = by;
		frnameMiddle = "explosion_left1.png";
		frnameEnd = "explosion_left2.png"
		for(var i = 1; i <= map.initialBombRange; ++i) {
			bx = bomb.bx - i;
			next_bx = bx - 1;
			if(this.handleExplosionEffectOnBlock(frnameMiddle,frnameEnd,bomb,bx,by,next_bx,next_by))
				break;	
		}

		this.game.time.events.add(500,this.removeExplosion,this,bomb);

		//remove bomb from the place
		bomb.sprite.destroy();
		map.board[bomb.bx][bomb.by].hasBomb = false;
		map.bombCounter--;
	},

	//check if the explosion collisions with a destructible block
	//at this position in the board, destroy it
	//and report this back to the caller by returning false,
	//otherwise return true
	handleExplosionEffectOnBlock: function(frnameMiddle, frnameEnd, bomb, bx, by, next_bx, next_by) {

		//check that we are not beyond the allowed dimensions
		if(Utils.outsideBoard(bx,by))
			return true;

		var cell = map.board[bx][by];

		var output = true;

		if(cell.terrain == TerrainType.GRASS) {

			//destroy the grass block
			cell.grassBlock.destroy();
			cell.terrain = TerrainType.EMPTY;

			var randomValue = Math.floor(Math.random()*5);
			if (randomValue == 0)
			{
				var wcoords = Utils.blockCoords2WorldCoords(bx, by);
				var powerup = map.powerups.create(wcoords.x, wcoords.y, "global_spritesheet");
				map.board[bx][by].hasPowerUp = true;
				var randomPowerUp = powerups[Math.floor(Math.random() * powerups.length)];
				powerup.frameName = randomPowerUp;
				powerup.anchor.x = 0.5;
				powerup.anchor.y = 0.5;
				var dim = Utils.getFrameDimensions(randomPowerUp, this.game.cache);
				var scaleX = map.terrainBlockSize / dim.width;
				var scaleY = map.terrainBlockSize / dim.height;
				powerup.scale.set(scaleX,scaleY);	
			}
			//else if (randomValue == 1)
			//{
			//	var wcoords = Utils.blockCoords2WorldCoords(bx, by);
			//	var powerup = map.powerups.create(wcoords.x, wcoords.y, "global_spritesheet");
			//	map.board[bx][by].hasPowerUp = true;
			//	powerup.frameName = "powerup_increase_bomb_range.png";
			//	powerup.anchor.x = 0.5;
			//	powerup.anchor.y = 0.5;
			//	var dim = Utils.getFrameDimensions("powerup_increase_bomb_range.png", this.game.cache);
			//	var scaleX = map.terrainBlockSize / dim.width;
			//	var scaleY = map.terrainBlockSize / dim.height;
			//	powerup.scale.set(scaleX,scaleY);	
			//}

			output = false;

		} else if(cell.terrain == TerrainType.EMPTY) {

			output = false;
		}

		if(output == false) {

			//add a new explosion fragment in the place.
			//first, check the lookahead coords to know whether
			//we have to use the middle sprite or the end sprite
			var frameName;
			if( Utils.outsideBoard(next_bx,next_by))
				frameName = frnameEnd;
			else {
				var nextTerrain = map.board[next_bx][next_by];
				if(nextTerrain == TerrainType.EMPTY || nextTerrain == TerrainType.GRASS)
					frameName = frnameMiddle;
				else 
					frameName = frnameEnd;
			}

			var wcoords = Utils.blockCoords2WorldCoords(bx,by);
			this.addNewExplosionFragmentToBomb(bomb,frameName,wcoords.x,wcoords.y);
		}

		return output;
	},

	//bomb: source of the explosion
	//frameName: the frame name to display for the explosion fragment
	//x,y: world coordinates to place the new explosion fragment
	addNewExplosionFragmentToBomb: function(bomb,frameName,x,y){
		var explosion;

		explosion = map.explosions.create(x, y, 'global_spritesheet');
		explosion.frameName =  frameName;

		explosion.anchor.x = 0.5;
		explosion.anchor.y = 0.5;

		var dims = Utils.getFrameDimensions(explosion.frameName,this.game.cache);
		var scaleX = map.terrainBlockSize / dims.width;
		var scaleY = map.terrainBlockSize / dims.height;
		explosion.scale.set(scaleX,scaleY);	

		explosion.body.immovable = true;
		this.game.physics.arcade.enable(explosion);

		//add the explosion to the explosion fragments of the source bomb
		bomb.explosionFragments.push(explosion);
	},

	removeExplosion: function(bomb) {
		for(var i = 0; i < bomb.explosionFragments.length; ++i) {
			bomb.explosionFragments[i].destroy();
		}
		bomb.explosionFragments.length = 0;
	},

	//this function assumes that the callContext is set to the player object
	//to be destroyed
	destroyPlayer: function() {
		this.destroyMe = true;
	}
};