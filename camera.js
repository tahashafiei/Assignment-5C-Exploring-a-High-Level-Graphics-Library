import * as THREE from 'three';


class Camera {
    constructor(scene) {
        this.obj = new THREE.OrthographicCamera(-6.5, 6.5, 6.5, -6.5, 1, 20);
		this.obj.position.set(8, 6, 6);
		this.obj.lookAt(0, 0, 0);
		
		this.pivot = new THREE.Group();
		this.pivot.add(this.obj);
		this.pivot.rotation.set(0, (-Math.PI - 0.3) /2, 0);

		scene.add(this.pivot);
    }
}

export{Camera};