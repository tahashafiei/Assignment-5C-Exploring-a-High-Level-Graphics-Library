import * as THREE from 'three';

class GameScene {
	constructor() {
		const scene = new THREE.Scene();

		const loader = new THREE.CubeTextureLoader();
		const texture = loader.load([
			'./resources/pos-x.png',
			'./resources/neg-x.png',
			'./resources/pos-y.png',
			'./resources/neg-y.png',
			'./resources/pos-z.png',
			'./resources/neg-z.png',
		])
		scene.background = texture;

		// scene.background = new THREE.Color(0xbd1717);
		
		const canvas = document.querySelector("canvas");
		const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

		const size = Math.min(700, window.innerWidth);
		renderer.setSize(size, size);
		// renderer.setSize(window.innerWidth, window.innerHeight);

		renderer.setPixelRatio(Math.min(2, window.devicePixelRatio)); 
		renderer.shadowMap.enabled = true;
		//renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		document.body.appendChild(renderer.domElement);
		
		const ambiantLight = new THREE.AmbientLight(0xffffff, 0.6);
		scene.add(ambiantLight);
		
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
		directionalLight.position.set(0, 10, 0);
		directionalLight.castShadow = true;
		directionalLight.shadow.camera.left = -6.5;
		directionalLight.shadow.camera.right = 6.5;  
		directionalLight.shadow.camera.bottom = -6.5;  
		directionalLight.shadow.camera.top = 6.5;
		directionalLight.shadow.mapSize.width = 256; 
		directionalLight.shadow.mapSize.height = 256; 
		scene.add(directionalLight);
	
		window.addEventListener("resize", () => {
			const size = Math.min(700, window.innerWidth);
			if (canvas.width !== size) {
				renderer.setSize(size, size);
			}
		}, false);

		return [ scene, renderer ];
	}
}

export{GameScene};