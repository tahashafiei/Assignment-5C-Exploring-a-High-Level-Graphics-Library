import { GameScene } from './game_scene.js';
import { Camera } from './camera.js';
import { Controls, Player } from './player.js';
import { Level } from './level.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';

class Game {
	constructor() {
		[ this.scene, this.renderer ] = new GameScene();
		this.camera = new Camera(this.scene);
		this.player = new Player(this.scene);
		this.level = new Level(this.scene);
		this.controls = new Controls();
		this.moves = 0;

		this.con = new OrbitControls(this.camera.obj, this.renderer.domElement);
		this.con.update();

		this.level.loadLevel(() => {
			this.player.reset(this.level.startPos);
			console.log("player reset");
		});

		this.player.onMove(() => {
			this.moves++;
			const coord = this.player.coordinates();
			if (this.level.isDeath(coord)) {
				this.playerDeath();
			} else if (this.level.isWin(coord)) {
				this.playerWin();
			} 
		});

		this.update(0);
	}

	update(time) {
		requestAnimationFrame(this.update.bind(this));

		// const delta = time - this.previousTime;
		// this.previousTime = time;

		this.player.update(this.controls);
		this.con.update();
		this.renderer.render(this.scene, this.camera.obj);
	}

	playerDeath() {
		this.player.fall(() => {
			this.controls.reset();
			this.player.reset(this.level.startPos);
		});
	}

	playerWin() {
		this.player.win(() => {
			this.level.remove(() => {
				this.level.loadLevel(() => {
					this.controls.reset();
					this.player.reset(this.level.startPos);
				});
			});
		});
	}
}

new Game();