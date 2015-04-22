var Bomberman = Bomberman || {};

//loading the game assets
Bomberman.Preload = function(){};

Bomberman.Preload.prototype = {
  preload: function() {    
    this.load.atlasJSONHash('global_spritesheet', 'Client/assets/images/sprites/global_spritesheet.png', 
      'Client/assets/images/sprites/global_spritesheet_atlas.json');
  },
  create: function() {
  	//this.state.start('MainMenu');
    this.state.start('Game');
  }
};