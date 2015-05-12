var Bomberman = Bomberman || {};

//title screen
Bomberman.SinglePlayerGame = function(){};

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

//enemies
var enemies = [];
var enemy1WalkCounter = 1000;
var enemy2WalkCounter = 1000;
var direction;

//player 1 default variables
var player1 = new Player();
player1.vel = 130;

player1.frameWidth = 16;
player1.frameHeight = 22;
players.push(player1);
player1.alive = true;

//enemy default variables
var enemy1 = new Enemy();
enemy1.vel = 120;
enemy1.frameWidth = 16;
enemy1.frameHeight = 22;
enemies.push(enemy1);
enemy1.alive = true;

var enemy2 = new Enemy();
enemy2.vel = 120;
enemy2.frameWidth = 16;
enemy2.frameHeight = 22;
enemies.push(enemy2);
enemy2.alive = true;

//map
var map = {};
map.initialBombRange = 1;
map.initialNumberOfBombs = 1;
map.bombCounter = 0;

//door
var door = new Door();
door.frameWidth = 16;
door.frameHeight = 22;
var doorCount = 0;
var enter = false;

//powerups
var powerups = ["powerup_increase_bomb_drops.png", "powerup_increase_bomb_range.png", "powerup_increase_speed.png", "powerup_decrease_speed.png"];

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
console.log("BEGIN NOW");
Bomberman.SinglePlayerGame.prototype = {

  create: function() {  	
console.log("CREATE");
  		//set up the keyboard
  		keyboard.cursors = this.game.input.keyboard.createCursorKeys();
  		keyboard.spaceBar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  		//generate map
		this.generateMap();


		 var startTime = function() {
		    if (!gameOver && s > -1)
		    {
		    	timer.text = ("Timer: " + s);
		    	s--;
		    	var t = setTimeout(function(){startTime()},1000);
		    }
		    else if (gameOver && s > -1 && player1.alive)
		    {
		    	score++;
		    	timer.text = ("Timer: " + s);
		    	s--;
		    	Score.text = ("Score: " + score);
		    	var t = setTimeout(function(){startTime()},100);
		    }
		    else
		    {
		    	timesUp = true;
		    }
		}

		var audio = new Audio('Client/assets/music/Bomberman Theme.mp3');
		audio.play();

		startTime();
  },
  generateMap: function() {

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

		/////////////////////////////
		/////  CREATING ENEMY 1 ////
		/////////////////////////////

		//computing initial coordinates
		enemy1.x = -map.offsetX-5 + (map.width + 4)*map.terrainBlockSize;
		enemy1.y = map.offsetY+5 + map.terrainBlockSize*Math.floor((Math.random() * (map.height-2)) + 1);

		//creating the sprite
		enemy1.sprite = this.game.add.sprite(enemy1.x,enemy1.y, 'Pass_Bear_spritesheet');	

		//movement animations
		enemy1.sprite.animations.add('down',[
			'pass_bear_right1.png',
			'pass_bear_right2.png',
			'pass_bear_right3.png',
			'pass_bear_right4.png',
			],8,true);
		enemy1.sprite.animations.add('up',[
			'pass_bear_left1.png',
			'pass_bear_left2.png',
			'pass_bear_left3.png',
			'pass_bear_left4.png',
			],8,true);
		enemy1.sprite.animations.add('right',[
			'pass_bear_right1.png',
			'pass_bear_right2.png',
			'pass_bear_right3.png',
			'pass_bear_right4.png',
			],8,true);
		enemy1.sprite.animations.add('left',[
			'pass_bear_left1.png',
			'pass_bear_left2.png',
			'pass_bear_left3.png',
			'pass_bear_left4.png',
			],8,true);

		//storing the default standing position frame 
		enemy1.standingFrame = 'pass_bear_right1.png';

		enemy1.standingLeft = 'pass_bear_left1.png';
		enemy1.standingRight = 'pass_bear_right1.png';
		enemy1.standingUp = 'pass_bear_left1.png';
		enemy1.standingDown = 'pass_bear_right1.png';

		enemy1.sprite.frameName = enemy1.standingFrame;

		var frame = this.game.cache.getFrameData("Pass_Bear_spritesheet").getFrameByName(enemy1.sprite.frameName);

		enemy1.frameWidth = frame.width;
		enemy1.frameHeight = frame.height;

		enemy1.sprite.anchor.x = 0.5;
		enemy1.sprite.anchor.y = 0.5;
		enemy1.sprite.scale.set( (map.playerBlockSize / enemy1.frameWidth)*1.5,
										  (map.playerBlockSize / enemy1.frameHeight)*1.5);
		//enabling physics		
		this.game.physics.arcade.enable(enemy1.sprite);

		/////////////////////////////
		/////  CREATING ENEMY 2 ////
		/////////////////////////////

		//computing initial coordinates
		enemy2.x = map.offsetX + map.terrainBlockSize * Math.floor((Math.random() * (map.width-2)) + 1);
		enemy2.y = -map.offsetY-5 + (map.height + 1)*map.terrainBlockSize;	

		//creating the sprite
		enemy2.sprite = this.game.add.sprite(enemy2.x,enemy2.y, 'Doria_Ghost_spritesheet');	

		//movement animations
		enemy2.sprite.animations.add('down',[
			'doria_ghost_right1.png',
			'doria_ghost_right2.png',
			'doria_ghost_right3.png',
			'doria_ghost_right4.png',
			],8,true);
		enemy2.sprite.animations.add('up',[
			'doria_ghost_left1.png',
			'doria_ghost_left2.png',
			'doria_ghost_left3.png',
			'doria_ghost_left4.png',
			],8,true);
		enemy2.sprite.animations.add('right',[
			'doria_ghost_right1.png',
			'doria_ghost_right2.png',
			'doria_ghost_right3.png',
			'doria_ghost_right4.png',
			],8,true);
		enemy2.sprite.animations.add('left',[
			'doria_ghost_left1.png',
			'doria_ghost_left2.png',
			'doria_ghost_left3.png',
			'doria_ghost_left4.png',
			],8,true);

		//storing the default standing position frame 
		enemy2.standingFrame = 'doria_ghost_right1.png';

		enemy2.standingLeft = 'doria_ghost_left1.png';
		enemy2.standingRight = 'doria_ghost_right1.png';
		enemy2.standingUp = 'doria_ghost_left1.png';
		enemy2.standingDown = 'doria_ghost_right1.png';

		enemy2.sprite.frameName = enemy2.standingFrame;

		var frame = this.game.cache.getFrameData("Doria_Ghost_spritesheet").getFrameByName(enemy2.sprite.frameName);

		enemy2.frameWidth = frame.width;
		enemy2.frameHeight = frame.height;

		enemy2.sprite.anchor.x = 0.5;
		enemy2.sprite.anchor.y = 0.5;
		enemy2.sprite.scale.set( (map.playerBlockSize / enemy2.frameWidth)*1.5,
										  (map.playerBlockSize / enemy2.frameHeight)*1.5);
		//enabling physics		
		this.game.physics.arcade.enable(enemy2.sprite);
	},

	update: function() {

		if (timesUp && !gameOver)
		{
			alert("TIME'S UP!!!!");
			this.game.add.sprite(0,28, 'you_lose');
			var audio = new Audio('Client/assets/music/HURRYUP.wav');
			audio.play();
			timesUp = false;
			gameOver = true;

		}

		//check player collisions

		for(var i = 0; i < players.length; ++i) {

			if(players[i].destroyMe) {
				this.game.add.sprite(0, 28, 'you_lose');
				players[i].alive = false;
				players[i].sprite.destroy();
				Utils.removeElementFromArray(players[i], players);

				--i;
				var audio = new Audio('Client/assets/music/PLAYER_OUT.wav');
				audio.play();
				gameOver = true;

			} else {
				if (players[i].blockCoords.x == door.blockCoords.x && players[i].blockCoords.y == door.blockCoords.y && !enter && enemies.length == 0)
				{
					var audio = new Audio('Client/assets/music/P1UP.wav');
					audio.play();
					enter = true;
					this.game.add.sprite(0,28, 'you_win');
					gameOver = true;
				}
				this.game.physics.arcade.collide(players[i].sprite, map.rockBlocks);
				this.game.physics.arcade.collide(players[i].sprite, map.grassBlocks);
				this.game.physics.arcade.collide(players[i].sprite, map.bombs);		
				this.game.physics.arcade.overlap(players[i].sprite, map.powerups, this.handlePowerUps, null, players[i]);
				this.game.physics.arcade.overlap(players[i].sprite, map.explosions, this.destroyPlayer, null, players[i]);
				this.game.physics.arcade.overlap(players[i].sprite, map.enemies, this.destroyPlayer, null, players[i]);	
			}
		}

		for(var i = 0; i < enemies.length; ++i) {
			if(enemies[i].destroyMe) {
				score++;
				Score.text = ("Score: " + score);
				enemies[i].alive = false;
				enemies[i].sprite.destroy();
				Utils.removeElementFromArray(enemies[i], enemies);
				var audio = new Audio('Client/assets/music/PAUSE.wav');
				audio.play();

			} else {
				this.game.physics.arcade.collide(enemies[i].sprite, map.rockBlocks);
				//this.game.physics.arcade.collide(enemies[i].sprite, map.grassBlocks);
				this.game.physics.arcade.collide(enemies[i].sprite, map.bombs);		
				//this.game.physics.arcade.overlap(enemies[i].sprite, map.powerups, this.handlePowerUps, null, enemies[i]);
				this.game.physics.arcade.overlap(enemies[i].sprite, map.explosions, this.destroyPlayer, null, enemies[i]);	
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

		if(enemy1.alive)
		{
			enemy1.sprite.body.velocity.x = 0;
			enemy1.sprite.body.velocity.y = 0;

			moveChooser = Math.floor((Math.random() * 4) + 1);

			if (moveChooser == 1)
			{
				setTimeout(function(){
					if(enemy1.alive)
					{
						enemy1.sprite.body.velocity.x = -enemy1.vel;
						enemy1.standingFrame = enemy1.standingLeft ;
						enemy1.sprite.animations.play('left');
						direction = 1;
					}
				}, enemy1WalkCounter)
			}
			else if (moveChooser == 2)
			{
				setTimeout(function(){
					if (enemy1.alive)
					{
						enemy1.sprite.body.velocity.x = enemy1.vel;
						enemy1.standingFrame =enemy1.standingRight;
						enemy1.sprite.animations.play('right');
						direction = 2;
					}
				}, enemy1WalkCounter)
			}
			else if (moveChooser == 3)
			{
				setTimeout(function(){
					if (enemy1.alive)
					{
						enemy1.sprite.body.velocity.y = -enemy1.vel;
						enemy1.standingFrame = enemy1.standingUp;
						enemy1.sprite.animations.play('up');	
						direction = 3;
					}
				}, enemy1WalkCounter)
			}
			else if (moveChooser == 4)
			{
				setTimeout(function(){
					if (enemy1.alive)
					{
					enemy1.sprite.body.velocity.y = enemy1.vel;
					enemy1.standingFrame = enemy1.standingDown;
					enemy1.sprite.animations.play('down');
					direction = 4;
					}
				}, enemy1WalkCounter)
			}

			enemy1WalkCounter += 560;

			if (direction == 1)
			{
					enemy1.sprite.body.velocity.x = -enemy1.vel;
					enemy1.standingFrame = enemy1.standingLeft ;
					enemy1.sprite.animations.play('left');
			}
			else if (direction == 2)
			{
					enemy1.sprite.body.velocity.x = enemy1.vel;
					enemy1.standingFrame =enemy1.standingRight;
					enemy1.sprite.animations.play('right');
			}
			else if (direction == 3)
			{
					enemy1.sprite.body.velocity.y = -enemy1.vel;
					enemy1.standingFrame = enemy1.standingUp;
					enemy1.sprite.animations.play('up');	
			}
			else if (direction == 4)
			{
					enemy1.sprite.body.velocity.y = enemy1.vel;
					enemy1.standingFrame = enemy1.standingDown;
					enemy1.sprite.animations.play('down');
			}		
		}

		if(enemy2.alive)
		{
			enemy2.sprite.body.velocity.x = 0;
			enemy2.sprite.body.velocity.y = 0;

			moveChooser = Math.floor((Math.random() * 9) + 6);

			if (moveChooser == 9)
			{
				setTimeout(function(){
					if (enemy2.alive)
					{
						enemy2.sprite.body.velocity.x = -enemy2.vel;
						enemy2.standingFrame = enemy2.standingLeft ;
						enemy2.sprite.animations.play('left');
						direction = 1;
					}
				}, enemy2WalkCounter)
			}
			else if (moveChooser == 8)
			{
				setTimeout(function(){
					if (enemy2.alive)
					{
						enemy2.sprite.body.velocity.x = enemy2.vel;
						enemy2.standingFrame =enemy2.standingRight;
						enemy2.sprite.animations.play('right');
						direction = 2;
					}
				}, enemy2WalkCounter)
			}
			else if (moveChooser == 7)
			{
				setTimeout(function(){
					if (enemy2.alive)
					{
						enemy2.sprite.body.velocity.y = -enemy2.vel;
						enemy2.standingFrame = enemy2.standingUp;
						enemy2.sprite.animations.play('up');	
						direction = 3;
					}
				}, enemy2WalkCounter)
			}
			else if (moveChooser == 6)
			{
				setTimeout(function(){
					if (enemy2.alive)
					{
						enemy2.sprite.body.velocity.y = enemy2.vel;
						enemy2.standingFrame = enemy2.standingDown;
						enemy2.sprite.animations.play('down');
						direction = 4;
					}
				}, enemy2WalkCounter)
			}

			enemy2WalkCounter += 560;

			if (direction == 1)
			{
					enemy2.sprite.body.velocity.x = -enemy2.vel;
					enemy2.standingFrame = enemy2.standingLeft ;
					enemy2.sprite.animations.play('left');
			}
			else if (direction == 2)
			{
					enemy2.sprite.body.velocity.x = enemy2.vel;
					enemy2.standingFrame =enemy2.standingRight;
					enemy2.sprite.animations.play('right');
			}
			else if (direction == 3)
			{
					enemy2.sprite.body.velocity.y = -enemy2.vel;
					enemy2.standingFrame = enemy2.standingUp;
					enemy2.sprite.animations.play('up');	
			}
			else if (direction == 4)
			{
					enemy2.sprite.body.velocity.y = enemy2.vel;
					enemy2.standingFrame = enemy2.standingDown;
					enemy2.sprite.animations.play('down');
			}		
		}
	},

	handlePowerUps: function(player, powerup)
	{
		var bx = this.blockCoords.x;
		var by = this.blockCoords.y;
		//console.log(bx);
		//console.log(by);
		if (map.board[bx][by].hasPowerUp)
		{
			var audio = new Audio('Client/assets/music/ITEM_GET.wav');
			audio.play();
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
				case "powerup_decrease_speed.png":
					if (player1.vel > 60)
					{
						player1.vel -= 20;
					}
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

		//////////////////////////
		//// DROPPING A BOMB /////
		//////////////////////////

		if (map.bombCounter != map.initialNumberOfBombs)
		{
			var audio = new Audio('Client/assets/music/BOM_SET.wav');
			audio.play();
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
		var maxRangeReached;

		//upwards
		bx = bomb.bx;
		next_bx = bx;
		frnameMiddle = "explosion_up1.png";
		frnameEnd = "explosion_up2.png"
		for(var i = 1; i <= map.initialBombRange; ++i) {
			by = bomb.by - i;
			next_by = by - 1;
			maxRangeReached = (i == map.initialBombRange);
			if(this.handleExplosionEffectOnBlock(frnameMiddle,frnameEnd,bomb,bx,by,next_bx,next_by, maxRangeReached))
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
			maxRangeReached = (i == map.initialBombRange);
			if(this.handleExplosionEffectOnBlock(frnameMiddle,frnameEnd,bomb,bx,by,next_bx,next_by, maxRangeReached))
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
			maxRangeReached = (i == map.initialBombRange);
			if(this.handleExplosionEffectOnBlock(frnameMiddle,frnameEnd,bomb,bx,by,next_bx,next_by, maxRangeReached))
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
			maxRangeReached = (i == map.initialBombRange);
			if(this.handleExplosionEffectOnBlock(frnameMiddle,frnameEnd,bomb,bx,by,next_bx,next_by, maxRangeReached))
				break;	
		}

		this.game.time.events.add(500,this.removeExplosion,this,bomb);

		//remove bomb from the place
		bomb.sprite.destroy();
		map.board[bomb.bx][bomb.by].hasBomb = false;

		var audio = new Audio('Client/assets/music/BOM_11_S.wav');
		audio.play();
		map.bombCounter--;
	},

	//check if the explosion collisions with a destructible block
	//at this position in the board, destroy it
	//and report this back to the caller by returning false,
	//otherwise return true
	handleExplosionEffectOnBlock: function(frnameMiddle, frnameEnd, bomb, bx, by, next_bx, next_by, maxRangeReached) {

		//check that we are not beyond the allowed dimensions
		if(Utils.outsideBoard(bx,by))
			return true;

		var cell = map.board[bx][by];

		var output = true;

		if(cell.terrain == TerrainType.GRASS) {

			//destroy the grass block
			cell.grassBlock.destroy();
			cell.terrain = TerrainType.EMPTY;
			numberOfGrass--;
			var randomValue = Math.floor(Math.random()*10);
			if (randomValue == 0 && switchCount == 0 && numberOfGrass != 0)
			{
				var wcoords = Utils.blockCoords2WorldCoords(bx, by);
				var powerup = map.powerups.create(wcoords.x, wcoords.y, "global_spritesheet");
				map.board[bx][by].hasPowerUp = true;
				map.board[bx][by].powerup = powerup;
				var randomPowerUp = powerups[Math.floor(Math.random() * powerups.length)];
				powerup.frameName = randomPowerUp;
				powerup.anchor.x = 0.5;
				powerup.anchor.y = 0.5;
				var dim = Utils.getFrameDimensions(randomPowerUp, this.game.cache);
				var scaleX = map.terrainBlockSize / dim.width;
				var scaleY = map.terrainBlockSize / dim.height;
				powerup.scale.set(scaleX,scaleY);
				switchCount = 1;	
			}

			var randomValue2 = Math.floor(Math.random()*10);
			if (((randomValue2 == 0 && doorCount == 0) || (numberOfGrass == 0 && doorCount == 0)) && switchCount == 0)
			{
				door.blockCoords.x = bx;
				door.blockCoords.y = by;

				var wcoords = Utils.blockCoords2WorldCoords(bx, by);
				/////////////////////
				// CREATING A DOOR //
				/////////////////////

				//computing initial coordinates
				door.x = wcoords.x;
				door.y = wcoords.y;

				//creating the sprite
				door.sprite = this.game.add.sprite(door.x,door.y, 'Door_spritesheet');	

				//movement animations
				door.sprite.animations.add('move',[
					'door1.png',
					'door2.png',
					'door3.png',
					'door4.png',
					],8,true);

				door.sprite.frameName = 'door1.png';

				var frame = this.game.cache.getFrameData("Door_spritesheet").getFrameByName(door.sprite.frameName);

				door.frameWidth = frame.width;
				door.frameHeight = frame.height;

				door.sprite.anchor.x = 0.5;
				door.sprite.anchor.y = 0.5;
				door.sprite.scale.set( (map.playerBlockSize / door.frameWidth)*1.5,
												  (map.playerBlockSize / door.frameHeight)*1.5);
				//enabling physics		
				this.game.physics.arcade.enable(door.sprite);

				doorCount = 1;

				door.sprite.animations.play('move');
			}
			switchCount = 0;

			output = false;

		} else if(cell.terrain == TerrainType.EMPTY) {
			if (map.board[bx][by].hasPowerUp)
			{
				map.board[bx][by].powerup.destroy();
				map.board[bx][by].hasPowerUp = false;
			}
			output = false;
		}

		if(output == false) {

			//add a new explosion fragment in the place.
			//first, check the lookahead coords to know whether
			//we have to use the middle sprite or the end sprite
			var frameName;
			if( Utils.outsideBoard(next_bx,next_by) || maxRangeReached)
				frameName = frnameEnd;
			else {
				var nextTerrain = map.board[next_bx][next_by].terrain;
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