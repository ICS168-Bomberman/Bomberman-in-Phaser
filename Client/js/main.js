var Bomberman = Bomberman || {};

var audio = new Audio('Client/assets/music/Bomberman Theme.mp3');
audio.play();

Bomberman.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO,'game_div');

Bomberman.game.state.add('Boot', Bomberman.Boot);
Bomberman.game.state.add('Preload', Bomberman.Preload);
//Bomberman.game.state.add('MainMenu', Bomberman.MainMenu);
Bomberman.game.state.add('Game', Bomberman.Game);

Bomberman.game.state.start('Boot');
