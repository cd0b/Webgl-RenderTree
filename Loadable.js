



function ObjectIsNotInActiveSceneError(msg) {
    this.name = "ObjectIsNotInActiveSceneError";
    this.message = msg;
}

function ObjectIsNotInSceneError(msg) {}



const Loadable = function Loadable(type) {
    
    const gm = new GlMath();
    let _scene = null;
    
    
    const loadableType = type;
    Object.defineProperty(this, "loadableType", {
        get: () => loadableType,
        enumerable: false,
        configurable: false,
    });
    
    
    this.addToScene = function(scene) {
        if(_scene != null)
            this.removeFromScene();
        _scene = scene;
        _scene.add(this);
    }
    this.removeFromScene = function() {
        if(!_scene)
            throw new ObjectIsNotInActiveSceneError("This object is not in binded scene! You can not remove this object from scene!");
        let node = _scene.find(this);
        if(!node)
            throw new ObjectIsNotInActiveSceneError("This object is not in binded scene! You can not remove this object from scene!");
        _scene.remove(node);
    }
    this.addChild = function(child) {
        const objNode = _scene.find(this);
        if(objNode == null)
            throw new ObjectIsNotInActiveSceneError("This object is not in binded scene! You can not append child this object!");
        _scene.add(child, objNode);
        child._scene = _scene;
    }
    this.translate = function() {
        const translation = new Translation(gm.translateMatrix(...arguments));
        const objNode = _scene.find(this);
        if(objNode == null)
            throw new ObjectIsNotInActiveSceneError("This object is not in binded scene! You can not add transform(translate) to this object!");
        _scene.addAsParent(translation, objNode);
        if(type === "CAMERA")
            this.isUpdated = true;
    }
    this.rotate = function() {
        const rotation = new Rotation(gm.rotateMatrix(...arguments));
        const objNode = _scene.find(this);
        if(objNode == null)
            throw new ObjectIsNotInActiveSceneError("This object is not in binded scene! You can not add transform(rotate) to this object!");
        _scene.addAsParent(rotation, objNode);
        if(type === "CAMERA")
            this.isUpdated = true;
    }
    this.scale = function() {
        const scaling = new Scaling(gm.scaleMatrix(...arguments));
        const objNode = _scene.find(this);
        if(objNode == null)
            throw new ObjectIsNotInActiveSceneError("This object is not in binded scene! You can not add transform(rotate) to this object!");
        _scene.addAsParent(scaling, objNode);
        if(type === "CAMERA")
            this.isUpdated = true;
    }
    
    
    
    
    this.addController = function(Controller, settings = {}) {
        Controller(this, settings);
    }
    
    
    Object.defineProperty(this, "_scene", {
        get: () => _scene,
        set: (sc) => _scene = sc,
        enumerable:false,
        configurable:false,
    });
    
    
}