var Bomberman = Bomberman || {};

//loading the game assets
Bomberman.Preload = function(){};

Bomberman.Preload.prototype = {
  preload: function() {    
    this.load.atlasJSONHash('global_spritesheet', 'Client/assets/images/sprites/global_spritesheet_atlas.png', 
      'Client/assets/images/sprites/global_spritesheet_atlas.json');
    this.load.atlasJSONHash('Pass_Bear_spritesheet', 'Client/assets/images/sprites/Pass_Bear.png', 
      'Client/assets/images/sprites/Pass_Bear_atlas.json');  	
  },
  create: function() {
  	//this.state.start('MainMenu');
    this.state.start('IntroMenu');
  }
};