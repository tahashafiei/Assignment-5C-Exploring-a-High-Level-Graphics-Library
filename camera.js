import * as THREE from 'three';


class Camera {
    constructor(scene) {
        // this.obj = new THREE.OrthographicCamera(-6.5, 6.5, 6.5, -6.5, 1, 20);
		this.obj = new THREE.PerspectiveCamera(10, 1, 1, 1000);
		this.obj.position.set(54, 52, 52);
		this.obj.lookAt(0, 0, 0);
		
		this.pivot = new THREE.Group();
		this.pivot.add(this.obj);
		this.pivot.rotation.set(0, (-Math.PI - 0.3) /4, 0);

		scene.add(this.pivot);
    }
}

export{Camera};