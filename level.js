import * as THREE from 'three';
import anime from './anime-master/lib/anime.es.js';
import {OBJLoader} from './three.js-master/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from './three.js-master/examples/jsm/loaders/MTLLoader.js';

const level_map = [
	'@xxxxxxx',
	'......x.',
	'......x.',
	'...o..x.',
	'...x..x.',
	'...x..x.',
	'...xxxx.',
]

const stage_one = [
	'xxx........',
	'x@xxxx.....',
	'xxxxxxxxx..',
	'.xxxxxxxxx.',
	'.....xxoxx.',
	'......xxx..',
]

const stage_two = [
	'......xxxxxxx..',
	'xxxx..xxx..xx..',
	'xxxxxxxxx..xxxx',
	'x@xx.......xxox',
	'xxxx.......xxxx',
	'............xxx',
]

const stage_three = [
	'.....xxxxxx....',
	'.....x..xxx....',
	'.....x..xxxxx..',
	'@xxxxx.....xxxx',
	'....xxx....xxox',
	'....xxx.....xxx',
	'......x..xx....',
	'......xxxxx....',
	'......xxxxx....',
	'.......xxx.....',
]

class Level {
	constructor(scene) {
		this.scene = scene;
		this.geo = new THREE.BoxGeometry(1, 0.25, 1);
		this.matX = new THREE.MeshLambertMaterial({ color: 0xffffff });
		this.matO = new THREE.MeshLambertMaterial({ color: 0x00ffff });

		this.stages = [level_map, stage_one, stage_two, stage_three]
		this.level = level_map;
		this.selection = 0;
		this.placed = false;

		this.obj = new OBJLoader();
		this.mtl = new MTLLoader();
		this.crown = undefined;
		this.spotLight = undefined;

		this.layer = new THREE.Group();
		this.scene.add(this.layer);
	}

	remove(callback) {
		console.log("level.remove");
		this.layer.children.map(e => {
			anime({
				targets: [e.scale],
				x: 0, y: 0, z: 0,
				duration: 300,
				easing: "easeInOutQuad",
				complete: () => {
					this.layer.remove(...this.layer.children);
					this.layer.scale.set(1, 1, 1);
					// callback();
				}	
			});
		});

		anime({
			targets: [this.crown.scale],
			x: 0, y: 0, z: 0,
			duration: 500,
			easing: "easeInOutQuad",
			complete: () => {
				this.layer.remove(this.crown);
				this.crown = undefined;
				this.placed = false;
				this.layer.remove(this.spotLight);
				this.spotLight = undefined;
				callback();
			}
		})
	}

	loadStage(callback) {
		console.log("stage loaded");
		this.level = this.stages[this.selection];
		this.loadLevel();
		anime({
			duration: 500,
			complete: () => callback()
		});
	}

	loadLevel() {
		const level = this.level;
		const offsetX = -level[0].length/2 +0.5;
		const offsetZ =  -level.length/2 +0.5;
		this.layer.position.set(offsetX, 0, offsetZ);

		for (let z = 0; z < level.length; z++) {
			for (let x = 0; x < level[z].length; x++) {
				if (level[z][x] == "@") {
					this.startPos = { x: offsetX + x, z: offsetZ + z };
					this.createTile(this.matX, x, z);
				} else if (level[z][x] == "x") {
					this.createTile(this.matX, x, z);
				} else if (level[z][x] == "o") {
					this.createTile(this.matO, x, z);
					this.placeCrown(x + offsetX, z + offsetZ);
				} 
			}
		}
	}


	createTile(mat, x, z) {
		const obj = new THREE.Mesh(this.geo, mat);
		obj.position.set(x, -0.125, z);
		obj.scale.set(0, 1, 0);
		obj.receiveShadow = true;
		this.layer.add(obj);
		anime({
			targets: [obj.scale],
			x: 1, z: 1,
			delay: (x+z)*30,
			duration: 300,
			easing: 'easeInOutQuad',
		});
	}

	placeCrown(x, z) {
		if (!this.placed) {
			this.placed = true;
			this.mtl.load('./resources/golden_crown/13451_Golden_Crown_v1_L2.mtl', (mtl) => {
				mtl.preload();
				for (const material of Object.values(mtl.materials)) {
					material.side = THREE.DoubleSide;
				}
				this.obj.setMaterials(mtl);
				this.obj.load('./resources/golden_crown/13451_Golden_Crown_v1_L2.obj', (root) => {
					this.crown = root;
					root.scale.set(0.05, 0.05, 0.05);
					root.rotation.set(-Math.PI / 2, 0, 0);
					root.position.set(x, 0.125, z);
					this.scene.add(root);
					anime({
						targets: [this.crown.scale],
						x: 0.05, y: 0.05, z: 0.05,
						delay: (x+z)*30,
						duration: 300,
						easing: 'easeInOutQuad',
					})
				});
			});
		}
		this.placeSpotlight(x, z);
	}

	placeSpotlight(x, z) {
		if (!this.spotLight) {
			console.log("spotlight created");
			this.spotLight = new THREE.SpotLight(0xffffff);
			this.spotLight.position.set(x, 10, z);
			this.spotLight.castShadow = true;
			this.spotLight.angle = 0.5;
			this.spotLight.penumbra = 0.2;
			this.spotLight.decay = 2;
			this.spotLight.intensity = 100
			this.scene.add(this.spotLight);
		}
	}

	isDeath({ x1, z1, x2, z2 }) {
		if (x2 !== undefined) {
			const isEmpty = this.get(x1, z1) === "." && this.get(x2, z2) === ".";
			return isEmpty;
		} 
		return this.get(x1, z1) === ".";
	}

	isWin({ x1, z1, x2, z2 }) {
		if (x2 == undefined) {
			return this.get(x1, z1) === "o";
		} 

		return false;
	}

	get(x, z) {
		const offsetX = this.stages[this.selection][0].length/2 - 0.5;
		const offsetZ =  this.stages[this.selection].length/2 - 0.5;
		x = Math.round(x + offsetX);
		z = Math.round(z + offsetZ);

		if (x < 0 || x >= this.stages[this.selection].length || z < 0 || z >= this.stages[this.selection].length) {
			return '.';
		}
		// console.log(offsetZ, z);
		return this.stages[this.selection][z][x];
	}
}

export{Level};