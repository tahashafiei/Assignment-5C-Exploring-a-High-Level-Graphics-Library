import * as THREE from 'three';
import anime from './anime-master/lib/anime.es.js';


class Controls {
    constructor() {
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;

        addEventListener("keydown", this.onKeyDown.bind(this));
    }

    onKeyDown = function(event) {
        switch(event.code) {
            case 'ArrowUp':
            case 'KeyW': // w
                this.up = true; console.log('Up ' + this.up); break;

            case 'ArrowLeft':
            case 'KeyA': // a
                this.left = true; console.log('Left ' + this.up); break;

            case 'ArrowDown':
            case 'KeyS': // s
                this.down = true; console.log('Down ' + this.up); break;

            case 'ArrowRight':
            case 'KeyD': // d
                this.right = true; console.log('Right ' + this.up); break;
            // case 32: // space
                // reset camera position
        }
    }

    anyKey() {
        // console.log("anyKey: " + (this.left || this.right || this.up || this.down) + " left: " + this.left + " right: " + this.right + " up: " + this.up + " down: " + this.down);
        return this.left || this.right || this.up || this.down;
    }

    reset() {
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
    }
}

class Player {
    constructor(scene) {
        this.scene = scene;
        this.rect = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 1),
            new THREE.MeshLambertMaterial( {color: 0xFFFFFF} ) 
        );

        this.rect.position.set(0, 0, 0);
        this.rect.scale.set(0, 0, 0);
        this.rect.castShadow = true;

        this.pivot = new THREE.Group()
        this.pivot.position.set(0, 1, 0);
        this.pivot.add(this.rect);
        this.scene.add(this.pivot);

        this.position = "|";
        this.canMove = true;
    }

    update(inputs) {
        if (!inputs.anyKey() || !this.canMove) {
            return;
        }
        
        console.log('player.update');

        this.canMove = false;
        this.computePosition();

        if (inputs.left) {
            this.rotateLeft();
        } else if (inputs.right) {
            this.rotateRight();
        } else if (inputs.up) {
            this.rotateUp();
        } else if (inputs.down) {
            this.rotateDown();
        }

        inputs.reset();
    }

    onMove(func) {
        this.onMove = func;
    }

    computePosition() {
        const xAngle = Math.round(this.rect.rotation.x / Math.PI * 10) / 10;
        const zAngle = Math.round(this.rect.rotation.z / Math.PI * 10) / 10;

        if (xAngle %1 === 0 && zAngle %1 === 0) {
            this.position = "|";
        } else if (Math.abs(zAngle %1) === 0.5) {
            this.position = "_";
        } else if (Math.abs(xAngle %1) === 0.5) {
            this.position = ".";
        }
    }

    rotateLeft(){
        let delta;
        if (this.position === "|") {
            delta = {x: -0.5, y: -1, z: 0};
        } else if (this.position === "_") {
            delta = {x: -1, y: -0.5, z: 0};
        } else if (this.position === ".") {
            delta = {x: -0.5, y: -0.5, z: 0};
        }

        this.setPivot(delta);

        anime({
            targets: [this.pivot.rotation],
            z: Math.PI / 2,
            duration: 300,
            easing: "easeInQuad",
            complete: () => this.finishMove(delta)
        });
    }

    rotateRight(){
        let delta;
        if (this.position === "|") {
            delta = {x: 0.5, y: -1, z: 0};
        } else if (this.position === "_") {
            delta = {x: 1, y: -0.5, z: 0};
        } else if (this.position === ".") {
            delta = {x: 0.5, y: -0.5, z: 0};
        }

        this.setPivot(delta);

        anime({
            targets: [this.pivot.rotation],
            z: -Math.PI / 2,
            duration: 300,
            easing: "easeInQuad",
            complete: () => this.finishMove(delta)   
        });

    }

    rotateUp(){
        let delta;
        if (this.position === "|") {
            delta = {x: 0, y: -1, z: -0.5};
        } else if (this.position === "_") {
            delta = {x: 0, y: -0.5, z: -1};
        } else if (this.position === ".") {
            delta = {x: 0, y: -0.5, z: -0.5};
        }

        this.setPivot(delta);

        anime({
            targets: [this.pivot.rotation],
            x: -Math.PI / 2,
            duration: 300,
            easing: "easeInQuad",
            complete: () => this.finishMove(delta)       
        });
    }

    rotateDown(){
        let delta;
        if (this.position === "|") {
            delta = {x: 0, y: -1, z: 0.5};
        } else if (this.position === "_") {
            delta = {x: 0, y: -0.5, z: 1};
        } else if (this.position === ".") {
            delta = {x: 0, y: -0.5, z: 0.5};
        }

        this.setPivot(delta);

        anime({
            targets: [this.pivot.rotation],
            x: Math.PI / 2,
            duration: 300,
            easing: "easeInQuad",
            complete: () => this.finishMove(delta)      
        });
    }

    setPivot(delta) {
        this.pivot.position.x += delta.x;
        this.pivot.position.y += delta.y;
        this.pivot.position.z += delta.z;

        this.rect.position.x -= delta.x;
        this.rect.position.y -= delta.y;
        this.rect.position.z -= delta.z;
    }

    finishMove(delta) {
        this.resetPivot(delta);
        this.canMove = true;
        this.computePosition();
        this.onMove();
    }

    resetPivot(delta) {
        let posRect = new THREE.Vector3();
        this.rect.localToWorld(posRect);
        let tmp = new THREE.Quaternion();
        this.rect.getWorldQuaternion(tmp);
        let rotRect = new THREE.Euler().setFromQuaternion(tmp);

        this.pivot.position.set(posRect.x, posRect.y, posRect.z);
        this.pivot.rotation.set(0, 0, 0);
        this.rect.rotation.set(rotRect.x, rotRect.y, rotRect.z);

        this.rect.position.x += delta.x;
        this.rect.position.y += delta.y;
        this.rect.position.z += delta.z;
    }

    coordinates() {
        let posRect = new THREE.Vector3();
        this.rect.localToWorld(posRect);

        if (this.position === "|") {
            return { x1: posRect.x, z1: posRect.z };
        } else if (this.position === "_") {
            return {
                x1: posRect.x -0.5, z1: posRect.z,
                x2: posRect.x +0.5, z2: posRect.z,
            };
        } else if (this.position === ".") {
            return {
                x1: posRect.x, z1: posRect.z -0.5,
                x2: posRect.x, z2: posRect.z +0.5,
            };
        }
    }

    reset({ x, z }) {
        this.pivot.position.set(x, 1, z);
        this.pivot.rotation.set(0, 0, 0);
        this.rect.position.set(0, 0, 0);
        this.rect.rotation.set(0, 0, 0);
        this.canMove = false;

        console.log(this.canMove)

        this.rect.scale.set(0, 0, 0);
        anime({
            targets: [this.rect.scale],
            x: 1, y: 1, z: 1,
            duration: 300,
            easing: "easeInOutQuad",
            complete: () => {this.canMove = true;}
        });
    }

    win(callback) {
        this.canMove = false;
        anime ({
            targets: [this.pivot.rotation],
            y: Math.PI,
            duration: 600,
            easing: 'easeInOutQuad',
            loop: 3,
            complete: () => callback()
        });
        anime({
           targets: [this.rect.scale],
           x: 0, y: 0, z: 0,
           duration: 300,
           easing: 'easeInOutQuad',
           complete: () => callback() 
        });
    }

    fall(callback) {
        this.canMove = false;
        callback();
    }
}

export{Controls, Player};
