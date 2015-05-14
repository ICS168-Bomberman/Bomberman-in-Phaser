var Bomberman = Bomberman || {};

Bomberman.MultiplayerGame = function(){};

//object created for namespace purposes
var mpg = {
	keyboard: {},
	map: {
		initialBombRange: 1
	},
	updateDataQueue: new Queue(),
	defaultVelocity: 130,
	sendInterval: 10 //in milliseconds
};

//information (mainly about sprites) for the 4 players in the game defined clockwise
//starting from the upper left corner
var characterSprites = [
	{
		up0: "blue_bomberman_up0.png", up1: "blue_bomberman_up1.png", up2: "blue_bomberman_up2.png",
		down0: "blue_bomberman_down0.png", down1: "blue_bomberman_down1.png", down2: "blue_bomberman_down2.png",
		right0: "blue_bomberman_right0.png", right1: "blue_bomberman_right1.png", right2: "blue_bomberman_right2.png",
		left0: "blue_bomberman_left0.png", left1: "blue_bomberman_left1.png", left2: "blue_bomberman_left2.png",
		initialStandingFrame: "blue_bomberman_right0.png",
		initialOrientation: "right"
	},
	{
		up0: "black_bomberman_up0.png", up1: "black_bomberman_up1.png", up2: "black_bomberman_up2.png",
		down0: "black_bomberman_down0.png", down1: "black_bomberman_down1.png", down2: "black_bomberman_down2.png",
		right0: "black_bomberman_right0.png", right1: "black_bomberman_right1.png", right2: "black_bomberman_right2.png",
		left0: "black_bomberman_left0.png", left1: "black_bomberman_left1.png", left2: "black_bomberman_left2.png",
		initialStandingFrame: "black_bomberman_left0.png",
		initialOrientation: "left"
	},
	{
		up0: "red_bomberman_up0.png", up1: "red_bomberman_up1.png", up2: "red_bomberman_up2.png",
		down0: "red_bomberman_down0.png", down1: "red_bomberman_down1.png", down2: "red_bomberman_down2.png",
		right0: "red_bomberman_right0.png", right1: "red_bomberman_right1.png", right2: "red_bomberman_right2.png",
		left0: "red_bomberman_left0.png", left1: "red_bomberman_left1.png", left2: "red_bomberman_left2.png",
		initialStandingFrame: "red_bomberman_left0.png",
		initialOrientation: "left"
	},
	{
		up0: "white_bomberman_up0.png", up1: "white_bomberman_up1.png", up2: "white_bomberman_up2.png",
		down0: "white_bomberman_down0.png", down1: "white_bomberman_down1.png", down2: "white_bomberman_down2.png",
		right0: "white_bomberman_right0.png", right1: "white_bomberman_right1.png", right2: "white_bomberman_right2.png",
		left0: "white_bomberman_left0.png", left1: "white_bomberman_left1.png", left2: "white_bomberman_left2.png",
		initialStandingFrame: "white_bomberman_right0.png",
		initialOrientation: "right"
	}
];

Bomberman.MultiplayerGame.prototype = {

	create: function() {

  		//set up the keyboard
  		mpg.keyboard.cursors = this.game.input.keyboard.createCursorKeys();
  		mpg.keyboard.spaceBar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  		//generate map
		this.generateMap();

		//register callbacks fucntions in the socket
		socket.on('receive game loop update data', this.enqueueUpdateData);		

	},

	generateMap: function() {

		//create map as a bidimensional array
		mpg.map.offsetX = 100;
		mpg.map.offsetY = 50;
		mpg.map.terrainBlockSize = 35;
		mpg.map.playerBlockSize = 20;
		mpg.map.board = Utils.create_2D_array(mpg.map.width, mpg.map.height);	
		mpg.nextSendTime = mpg.sendInterval;
		mpg.initialTime = this.game.time.now;

		//clear the coordinates queue
		while(mpg.updateDataQueue.length > 0) {
			mpg.updateDataQueue.dequeue();
		}


		///////////////////////////
		////  CREATING PLAYERS ////
		///////////////////////////

		for(var i = 0; i < 4; ++i) {

			var player = mpg.players[i];

			if(player == null)
				continue;

			///set initial velocity
			player.vel = mpg.defaultVelocity;
			//set initial orientation
			player.orientation = characterSprites[i].initialOrientation;

			//computing initial coordinates
			if(i == 0) { //upper left
				player.x = mpg.map.offsetX + mpg.map.terrainBlockSize;
				player.y = mpg.map.offsetY + mpg.map.terrainBlockSize;		

			} else if(i == 1) { //upper right
				player.x = mpg.map.offsetX + mpg.map.terrainBlockSize * (mpg.map.width-2);
				player.y = mpg.map.offsetY + mpg.map.terrainBlockSize;		

			} else if(i == 2) { //lower right
				player.x = mpg.map.offsetX + mpg.map.terrainBlockSize * (mpg.map.width-2);
				player.y = mpg.map.offsetY + mpg.map.terrainBlockSize * (mpg.map.height-2);		

			} else { //lower left
				player.x = mpg.map.offsetX + mpg.map.terrainBlockSize;
				player.y = mpg.map.offsetY + mpg.map.terrainBlockSize * (mpg.map.height-2);		

			}

			//creating the sprite
			player.sprite = this.game.add.sprite(player.x,player.y, 'global_spritesheet');	

			//movement animations
			player.sprite.animations.add('down',[
				characterSprites[i].down1,
				characterSprites[i].down2
				],8,true);
			player.sprite.animations.add('up',[
				characterSprites[i].up1,
				characterSprites[i].up2
				],8,true);
			player.sprite.animations.add('right',[
				characterSprites[i].right1,
				characterSprites[i].right2
				],8,true);
			player.sprite.animations.add('left',[
				characterSprites[i].left1,
				characterSprites[i].left2
				],8,true);	

			//storing the default standing position frame 
			player.standingFrame = characterSprites[i].initialStandingFrame;
			player.standingLeft = characterSprites[i].left0;
			player.standingRight = characterSprites[i].right0;
			player.standingUp = characterSprites[i].up0;
			player.standingDown = characterSprites[i].down0;
			player.sprite.frameName = player.standingFrame;

			// scaling the srpite to fit inside a block of the board
			Utils.updateFrameDimensions(player,this.game.cache);
			player.sprite.anchor.x = 0.5;
			player.sprite.anchor.y = 0.5;
			player.sprite.scale.set( mpg.map.playerBlockSize / player.frameWidth,
											  mpg.map.playerBlockSize / player.frameHeight);

			//enabling physics
			this.game.physics.arcade.enable(player.sprite);
		}		


		///////////////////////////////////////////////
		//// CREATING STATIC ELEMENTS ON THE BOARD ////
		///////////////////////////////////////////////

		//define rock blocks group
		mpg.map.rockBlocks = this.game.add.group();
		mpg.map.rockBlocks.enableBody = true;
		mpg.map.rockBlocks.physicsBodyType = Phaser.Physics.ARCADE;

		//define grass blocks group
		mpg.map.grassBlocks = this.game.add.group();
		mpg.map.grassBlocks.enableBody = true;
		mpg.map.grassBlocks.physicsBodyType = Phaser.Physics.ARCADE;

		//define bombs group
		mpg.map.bombs = this.game.add.group();
		mpg.map.bombs.enableBody = true;
		mpg.map.bombs.physicsBodyType = Phaser.Physics.ARCADE;

		//define powerups group
		mpg.map.powerups = this.game.add.group();
		mpg.map.powerups.enableBody = true;
		mpg.map.powerups.physicsBodyType = Phaser.Physics.ARCADE;

		//define explosions group
		mpg.map.explosions = this.game.add.group();
		mpg.map.explosions.enableBody = true;
		mpg.map.explosions.physicsBodyType = Phaser.Physics.ARCADE;

		//define enemies group
		mpg.map.enemies = this.game.add.group();
		mpg.map.enemies.enableBody = true;
		mpg.map.enemies.physicsBodyType = Phaser.Physics.ARCADE;

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
		var rockScaleX = mpg.map.terrainBlockSize / rockFrameDimensions.width;
		var rockScaleY = mpg.map.terrainBlockSize / rockFrameDimensions.height;
		var grassScaleX = mpg.map.terrainBlockSize / grassFrameDimensions.width;
		var grassScaleY = mpg.map.terrainBlockSize / grassFrameDimensions.height;

		for(var i = 0; i < mpg.map.width; ++i) {
			for(var j = 0; j <  mpg.map.height; ++j) {
				x = mpg.map.offsetX + i*mpg.map.terrainBlockSize;
				y = mpg.map.offsetY + j*mpg.map.terrainBlockSize;
				if(i == 0 || i == mpg.map.width -1 || j ==0 || j == mpg.map.height -1
				  || (i%2 == 0 && j%2 == 0)) {

					rockBlock = mpg.map.rockBlocks.create(x,y,'global_spritesheet');
					rockBlock.frameName = 'rock.png';
					rockBlock.anchor.x = 0.5;
					rockBlock.anchor.y = 0.5;
					rockBlock.scale.set(rockScaleX,rockScaleY);
					rockBlock.body.immovable = true;
					mpg.map.board[i][j].terrain = TerrainType.ROCK;

				} else if(!Utils.isInRangeOfSomePlayer(x,y, mpg.map.initialBombRange,mpg.players,mpg.map)) {

					grassBlock = mpg.map.grassBlocks.create(x,y,'global_spritesheet');
					grassBlock.frameName = 'Grass.png';
					grassBlock.anchor.x = 0.5;
					grassBlock.anchor.y = 0.5;
					grassBlock.scale.set(grassScaleX,grassScaleY);
					grassBlock.body.immovable = true;
					mpg.map.board[i][j].terrain = TerrainType.GRASS;
					mpg.map.board[i][j].grassBlock = grassBlock;

				} else {

					mpg.map.board[i][j].terrain = TerrainType.EMPTY;

				}
			}
		}	
	},


	update: function() {		

		//check for coordinates updates from the server
		if (mpg.updateDataQueue.getLength() > 0) {
			
			var data = mpg.updateDataQueue.dequeue();

			//console.log("from the update loop: we are dequeueing the following data");
			//console.log(data);

			for(var i = 0; i < data.length; ++i) {
				var playerData = data[i];

				if(playerData.playerNum == mpg.myPlayerNumber) continue; //skip updates for our own player

				mpg.players[playerData.playerNum].sprite.x = playerData.x;
				mpg.players[playerData.playerNum].sprite.y = playerData.y;
				mpg.players[playerData.playerNum].sprite.body.velocity.x = playerData.velX;
				mpg.players[playerData.playerNum].sprite.body.velocity.y = playerData.velY;
				mpg.players[playerData.playerNum].orientation = playerData.orientation;

			}
		}		

		//check collisions for our player	
		//against rocks
		this.game.physics.arcade.collide(mpg.myPlayer.sprite, mpg.map.rockBlocks);
		//against grass
		this.game.physics.arcade.collide(mpg.myPlayer.sprite, mpg.map.grassBlocks);			

		//handle our player's movement and animations
		mpg.myPlayer.sprite.body.velocity.x = 0;
		mpg.myPlayer.sprite.body.velocity.y = 0;

		if(mpg.keyboard.cursors.left.isDown) {
			mpg.myPlayer.sprite.body.velocity.x = -mpg.myPlayer.vel;
			mpg.myPlayer.standingFrame = mpg.myPlayer.standingLeft ;
			mpg.myPlayer.sprite.animations.play('left');
			mpg.myPlayer.orientation = "left";

		} else if(mpg.keyboard.cursors.right.isDown) {
			mpg.myPlayer.sprite.body.velocity.x = mpg.myPlayer.vel;
			mpg.myPlayer.standingFrame = mpg.myPlayer.standingRight;
			mpg.myPlayer.sprite.animations.play('right');
			mpg.myPlayer.orientation = "right";

		} else if(mpg.keyboard.cursors.up.isDown) {
			mpg.myPlayer.sprite.body.velocity.y = -mpg.myPlayer.vel;
			mpg.myPlayer.standingFrame = mpg.myPlayer.standingUp;
			mpg.myPlayer.sprite.animations.play('up');
			mpg.myPlayer.orientation = "up";

		} else if(mpg.keyboard.cursors.down.isDown) {
			mpg.myPlayer.sprite.body.velocity.y = mpg.myPlayer.vel;
			mpg.myPlayer.standingFrame = mpg.myPlayer.standingDown;
			mpg.myPlayer.sprite.animations.play('down');
			mpg.myPlayer.orientation = "down";

		} else {
			mpg.myPlayer.sprite.animations.stop();
			mpg.myPlayer.sprite.frameName = mpg.myPlayer.standingFrame;
		}
		
		//check if it's time to send our coordinates to the server		
		if(this.game.time.now - mpg.initialTime >= mpg.nextSendTime) {
			mpg.nextSendTime += mpg.sendInterval;
			var data = {				
					x: mpg.myPlayer.sprite.x,
					y: mpg.myPlayer.sprite.y,
					velX: mpg.myPlayer.sprite.body.velocity.x,
					velY: mpg.myPlayer.sprite.body.velocity.y,
					orientation: mpg.myPlayer.orientation
				};
			socket.emit("my coordinates and such", data);
			//console.log("we are sending information to the server");
			//console.log(data);
		}
		
	},

	enqueueUpdateData: function(data) {
		//console.log("from enqueueUpdateData: we are receiving following data from the server");
		//console.log(data);

		mpg.updateDataQueue.enqueue(data);
		//console.log(mpg.updateDataQueue.getLength());

	}

};
