"use strict";


function CameraIsNotInActiveSceneError(msg) {
    this.name = "CameraIsNotInActiveSceneError";
    this.message = msg;
}


const Camera = function(at, eye, up) {
    
    const gm = new GlMath();
    
    this.at = gm.vec3(at);
    this.eye = gm.vec3(eye);
    this.up = gm.vec3(up);
    this.isCamera = true;
    let isActive = false;
    Object.defineProperty(this, "isActive", {
        get: () => isActive,
        enumerable: false,
        configurable: false,
    });
    let isUpdated = false;
    Object.defineProperty(this, "isUpdated", {
        get: () => isUpdated,
        set: (updated) => isUpdated = updated,
        enumerable: false,
        configurable: false,
    });
    
    
    
    
    
    ActiveCamera.addObserver(this);
    
    this.setActive = function() {
        isActive = true;
        isUpdated = true;
        ActiveCamera.notifyAll(this);
        
        const activeScene = this._scene;
        const cameraNode = activeScene.find(this); // find camera node
        if(cameraNode == null)
            throw new CameraIsNotInActiveSceneError("This camera is not in binded scene!");
        activeScene.changeOrder(cameraNode);
    }
    this.clearActive = function() {
        isActive = false;
        isUpdated = false;
    }
    
    /* rotate, translate, addtoscene... */
    this.__proto__ = new Loadable("CAMERA");

    
}



const ActiveCamera = {
    
    cameras: [],
    addObserver: function(camera) {
        this.cameras.push(camera);
    },
    removeObserver: function(camera) {
        this.cameras = this.cameras.filter(function(item, index, arr) {
            return item !== camera;
        });
    },
    notifyAll: function(camera) {
        this.cameras.forEach(function(item, index, arr) {
            if(camera !== item)
                item.clearActive();
        });
    }
    
}