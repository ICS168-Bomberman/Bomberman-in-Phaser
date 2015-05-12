var Bomberman = Bomberman || {};

//loading the game assets
Bomberman.Preload = function(){};

Bomberman.Preload.prototype = {
  preload: function() {    
    this.load.atlasJSONHash('global_spritesheet', 'Client/assets/images/sprites/global_spritesheet.png', 
      'Client/assets/images/sprites/global_spritesheet_atlas.json');
    this.load.atlasJSONHash('Pass_Bear_spritesheet', 'Client/assets/images/sprites/Pass_Bear.png', 
      'Client/assets/images/sprites/Pass_Bear_atlas.json'); 
    this.load.atlasJSONHash('Doria_Ghost_spritesheet', 'Client/assets/images/sprites/Doria_Ghost.png', 
      'Client/assets/images/sprites/Doria_Ghost_atlas.json');
    this.load.atlasJSONHash('Door_spritesheet', 'Client/assets/images/sprites/Door.png', 
      'Client/assets/images/sprites/Door_atlas.json'); 	
    this.load.image('you_lose', 'Client/assets/images/You_Lose.png');
    this.load.image('you_win', 'Client/assets/images/You_Win.png');
  },
  create: function() {
  	//this.state.start('MainMenu');
    this.state.start('Game');
  }
};