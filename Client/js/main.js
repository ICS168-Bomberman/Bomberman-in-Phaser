var Bomberman = Bomberman || {};

Bomberman.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO,'game_div');

Bomberman.game.state.add('Boot', Bomberman.Boot);
Bomberman.game.state.add('Preload', Bomberman.Preload);
Bomberman.game.state.add('IntroMenu', Bomberman.IntroMenu);
Bomberman.game.state.add('SinglePlayerGame', Bomberman.SinglePlayerGame);
Bomberman.game.state.add('MultiplayerMenu', Bomberman.MultiplayerMenu);
Bomberman.game.state.add('Lobby', Bomberman.Lobby);
Bomberman.game.state.add('MultiplayerGame', Bomberman.MultiplayerGame);

Bomberman.game.state.start('Boot');