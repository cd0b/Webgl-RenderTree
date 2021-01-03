"use strict";




const CameraController = function(obj, settings) {
    
    const camera = settings.activeCamera;
    const speed = settings.speed;
    
    const gm = new GlMath();
    
    const clearController = function() {
        window.removeEventListener("keypress", goForward);
        window.removeEventListener("keypress", goLeft);
        window.removeEventListener("keypress", goBackward);
        window.removeEventListener("keypress", goRight);
        window.removeEventListener("mousemove", mouseEventListener);
    }
    
    const goForward = function(e) {
        if(e.code === "KeyW" || e.code === "ArrowUp") {
            let localNegZ = gm.nor(gm.sub(camera.updatedEye, camera.updatedAt));
            //localNegZ[1] = 0;
            try {
                obj.translate(gm.mul(localNegZ, speed));
            }
            catch(err) {
                clearController();
            }
        }
    }
    window.addEventListener("keypress", goForward);
    
    const goLeft = function(e) {
        if(e.code === "KeyA" || e.code === "ArrowDown") {
            let localX = gm.nor(gm.mul(gm.sub(camera.updatedEye, camera.updatedAt), camera.updatedUp));
            //localX[1] = 0;
            try {
                obj.translate(gm.mul(localX, -speed));
            } catch(err) {
                clearController();
            }
        }
    }
    window.addEventListener("keypress", goLeft);
    
    const goBackward = function(e) {
        if(e.code === "KeyS" || e.code === "ArrowDown") {
            let localNegZ = gm.nor(gm.sub(camera.updatedEye, camera.updatedAt));
            //localNegZ[1] = 0;
            try {
                obj.translate(gm.mul(localNegZ, -speed));
            } catch(err) {
                clearController();
            }
        }
    }
    window.addEventListener("keypress", goBackward);
    
    const goRight = function(e) {
        if(e.code === "KeyD" || e.code === "ArrowRight") {
            let localX = gm.nor(gm.mul(gm.sub(camera.updatedEye, camera.updatedAt), camera.updatedUp));
            //localX[1] = 0;
            try {
                obj.translate(gm.mul(localX, speed));
            } catch(err) {
                clearController();
            }
        }
    }
    window.addEventListener("keypress", goRight);
    
    const mouseEventListener = function(e) {
        const localX = gm.mul(gm.sub(camera.updatedEye, camera.updatedAt), camera.updatedUp);
        try {
            obj.rotate(-e.movementY * speed, localX);
        } catch(err) {
            clearController();
        }
        
        let globalY = gm.vec3(0, 1, 0);
        if(camera.updatedUp[1] <= 0.0)
            globalY = gm.vec3(0, -1, 0);
        try {
            obj.rotate(-e.movementX * speed, globalY);
        } catch(err) {
            clearController();
        }
    }
    window.addEventListener("mousemove", mouseEventListener);
    
}