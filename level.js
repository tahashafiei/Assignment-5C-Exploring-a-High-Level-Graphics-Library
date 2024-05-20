import * as THREE from 'three';
import anime from './anime-master/lib/anime.es.js';
import {OBJLoader} from './three.js-master/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from './three.js-master/examples/jsm/loaders/MTLLoader.js';

const placed = false;

const level_map = [
	'xxx@xxx',
	'xxxxxxx',
	'xxxxxxx',
	'xxxxxxx',
	'xxxxxxx',
	'xxxoxxx',
	'xxxxxxx',
]

class Level {
	constructor(scene) {
		this.scene = scene;
		this.geo = new THREE.BoxGeometry(1, 0.25, 1);
		this.matX = new THREE.MeshLambertMaterial({ color: 0x444444 });
		this.matO = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
		this.matZ = new THREE.MeshLambertMaterial({ color: 0xe74c3c });

		this.layer = new THREE.Group();
		this.scene.add(this.layer);
	}

	remove(callback) {
		this.layer.children.map(e => {
			anime({
				targets: [e.scale],
				x: 0, y: 0, z: 0,
				duration: 300,
				easing: "easeInOutQuad",
			});
		});
		anime({
			duration: 500,
			complete: () => {
				this.layer.remove(...this.layer.children);
				this.layer.scale.set(1, 1, 1);
				callback();
			}
		});
	}

	loadLevel(callback) {
		const level = level_map;
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
					this.placeCrown(x, z);
				} else if (level[z][x] == "z") {
					this.createTile(this.matZ, x, z);
				}
			}
		}

		callback();
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
		this.placed = true;
		const obj = new OBJLoader();
		const mtl = new MTLLoader();
		mtl.load('./resources/golden_crown/13451_Golden_Crown_v1_L2.mtl', (mtl) => {
			mtl.preload();
			for (const material of Object.values(mtl.materials)) {
				material.side = THREE.DoubleSide;
			}
			obj.setMaterials(mtl);
			obj.load('./resources/golden_crown/13451_Golden_Crown_v1_L2.obj', (root) => {
				root.scale.set(0.05, 0.05, 0.05);
				root.rotation.set(-Math.PI / 2, 0, 0);
				root.position.set(x - 3, 0.125, z - 3);
				this.scene.add(root);
			});
		});

		// anime({
		// 	targets: [obj.rotate],
		// 	z: Math.PI / 2,
		// 	duration: 300,
		// 	easing: 'easeInQuad',
		// 	loop: true
		// });
	}

	isDeath({ x1, z1, x2, z2 }) {
		if (x2 !== undefined) {
			const isRed = this.get(x1, z1) === "z" || this.get(x2, z2) === "z";
			const isEmpty = this.get(x1, z1) === "." && this.get(x2, z2) === ".";
			return isRed || isEmpty;
		} 
		return this.get(x1, z1) === "z" || this.get(x1, z1) === ".";
	}

	isWin({ x1, z1, x2, z2 }) {
		if (x2 !== undefined) {
			return this.get(x1, z1) === "o" && this.get(x2, z2) === "o";
		} 

		return false;
	}

	get(x, z) {
		const offsetX = level_map[0].length/2 - 0.5;
		const offsetZ =  level_map.length/2 - 0.5;
		x = Math.round(x + offsetX);
		z = Math.round(z + offsetZ);

		if (x < 0 || x >= level_map.length || z < 0 || z >= level_map.length) {
			return '.';
		}
		// console.log(offsetZ, z);
		return level_map[z][x];
	}
}

export{Level};