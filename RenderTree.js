"use strict";



function ObjectIsInSceneError(msg) {
    this.name = "ObjectIsInSceneError";
    this.message = msg;
}



/*
 * 
 * This tree is a representation for scene
 * All materials, objects, transforms will be here
 * 
 *  When adding transform a object if the object's parent is a object then add a transform node,
 *  otherwise update transform node.
 *  So, you can not keep track of all transforms in runtime.
 *  Performance concerns. 
 *  
 *  Camera must be first.
 *  Use changeOrder when set a camera active
 *  
 * 
 */
const Scene = RenderTree;

function RenderTree() {
    
    const matrixStack = [];
    const gm = new GlMath();
    
    
    let modelViewMatrix = gm.mat4();
    Object.defineProperty(this, "modelViewMatrix", {
        get: function() { return modelViewMatrix; },
        enumerable: false,
        configurable: false,
    });
    /*
     * must be set in initialize step,
     * update this in per frame is costly,
     * 
     * is not in render tree
     * 
     */
    let projectionMatrix = gm.mat4();
    Object.defineProperty(this, "projectionMatrix", {
        get: () => projectionMatrix,
        set: mt => projectionMatrix = mt,
        enumerable: false,
        configurable: false,
    });
    let transformMatrix = gm.mat4();
    Object.defineProperty(this, "transformMatrix", {
        get: () => transformMatrix,
        enumerable: false,
        configurable: false,
    });
    let normalMatrix = gm.mat4();
    Object.defineProperty(this, "normalMatrix", {
        get: () => normalMatrix,
        enumerable:false,
        configurable: false,
    });
    let cameraUpdated = false;
    Object.defineProperty(this, "cameraUpdated", {
        get: () => cameraUpdated,
        set: (newCameraUpdated) => cameraUpdated = newCameraUpdated,
        enumerable: false,
        configurable: false,
    });
    
    
    
    const modelStack = [];
    const lightStack = [];
    Object.defineProperty(this, "modelStack", {
        get: () => modelStack,
        enumerable: false,
        configurable: false,
    });
    Object.defineProperty(this, "lightStack", {
        get: () => lightStack,
        enumerable: false,
        configurable: false,
    });
    
    
    
    const Node = function Node(data, parent) {
        this.data = data;
        this.parent = parent;
        this.children = [];
    }
    
    
    const root = new Node({}, {});
    
    /*
     * 
     * if added object and parent both are transform, merge them
     * 
     */
    this.add = function(data, parent=root) {
        if(this.find(data))
            throw new ObjectIsInSceneError("This object is already added to scene!");
        const node = new Node(data, parent);
        node.parent.children.push(node);
        return node;
    }
    this.addAsParent = function(data, child) {
        /*
         * 
         * we need optimization
         * we need merge transforms. :)
         * 
         */
        const childIndex = child.parent.children.findIndex(nd => nd === child); // child index in parent's children
        
        
        /* do optimization */
        let merged = false;
        
        // try to merge this transformation with one of the parent's
        let currentNode = child.parent;
        while(currentNode != root){
            // is it transform
            if(!currentNode.data.isTransform)
                break;
            
            if(currentNode.children.length > 1)
                break;
            
            if(currentNode.data.transformType === data.transformType) {
                currentNode.data.matrix = gm.mul(data.matrix, currentNode.data.matrix);
                merged = true;
                break;
            }
                
            currentNode = currentNode.parent;
        }
        
        // if there is no merge add transformation to tree
        if(!merged) {
            child.parent.children[childIndex] = new Node(data, child.parent); // now, child is not in tree, it's new transform node
            child.parent = child.parent.children[childIndex]; // child's parent is new node
            child.parent.children.push(child); // load parent's children from child
        }
    }
    
    /*
     * 
     * transform objects update transformMatrix
     * camera objects update modelViewMatrix if it is active
     * other objects yield
     * 
     */
    this.traverse = function*(current=root) {
        for(let i = 0; i < current.children.length; i++) {
            if(current.children[i].data.isTransform) {
                matrixStack.push(transformMatrix);
                if(current.children[i].data.transformType === "Rotation")
                    transformMatrix = gm.mul(transformMatrix, current.children[i].data.matrix);
                else if (current.children[i].data.transformType === "Scaling") {
                    const x = transformMatrix[0][3];
                    const y = transformMatrix[1][3];
                    const z = transformMatrix[2][3];
                    const w = transformMatrix[3][3];
                    
                    transformMatrix = gm.mul(current.children[i].data.matrix, transformMatrix);
                    
                    transformMatrix[0][3] = x;
                    transformMatrix[1][3] = y;
                    transformMatrix[2][3] = z;
                    transformMatrix[3][3] = w;
                }
                else 
                    transformMatrix = gm.mul(current.children[i].data.matrix, transformMatrix);
            } else if(current.children[i].data.isCamera) {
                if(current.children[i].data.isActive && current.children[i].data.isUpdated) {
                    /*
                     * think camera as a triangle.
                     * at, eye is a point already
                     * generate a point with at + up
                     * 
                     */
                    const firstAt = gm.vec3(current.children[i].data.at);
                    let up = gm.vec4(current.children[i].data.up); // up a point in triangle now.
                    let at = gm.vec4();
                    let ey = gm.vec4(gm.sub(current.children[i].data.eye, firstAt));
                    // now, camera is a triangle which has a point on origin.
                    // this point is at point
                    // transform entire triangle
                    up = gm.vec3(gm.mul(transformMatrix, up));
                    at = gm.vec3(gm.mul(transformMatrix, at));
                    ey = gm.vec3(gm.mul(transformMatrix, ey));
                    // we get a transformed triangle
                    // now we should bring this triangle through firstAt
                    // dont forget up is a vector :)
                    up = gm.sub(up, at);
                    at = gm.add(at, firstAt);
                    ey = gm.add(ey, firstAt);
                    
                    modelViewMatrix = gm.modelViewMatrix(at, ey, up);
                    normalMatrix = gm.tra(gm.inv(modelViewMatrix));
                    
                    current.children[i].data.updatedAt = at;
                    current.children[i].data.updatedEye= ey;
                    current.children[i].data.updatedUp = up;
                    
                    cameraUpdated = true;
                    current.children[i].data.isUpdated = false;
                    
                }
            } else if(current.children[i].data.isReadyToRender) {
                yield current.children[i].data;
            }
            yield* this.traverse(current.children[i]);
            if(current.children[i].children.length > 0 && current.children[i].data.isTransform)
                transformMatrix = matrixStack.pop();
        }
    }
    
    
    this.storedTraverse = function() {
        
        // flush stacks
        lightStack.splice(0, lightStack.length);
        modelStack.splice(0, modelStack.length);
        
        const gen = this.traverse();
        for(let obj of gen) {
            if(obj.loadableType === "LIGHT") {
                lightStack.push({light: obj, transform: transformMatrix});
            } else if(obj.loadableType === "MODEL") {
                modelStack.push({model: obj, transform: transformMatrix});
            }
        }
    }
    
    
    const _traverse = function*(current=root) {
        for(let i = 0; i < current.children.length; i++) {
            yield current.children[i];
            yield* _traverse(current.children[i]);
        }
    }
    this.find = function(data) {
        const gen = _traverse();
        for(let nd of gen) {
            if(nd.data === data)
                return nd;
        }
        
        return null;
    }
    
    this.remove = function(node) {
        if(node === root)
            throw new RootDeletionError("You are not able to delete root!");
        
        const nodeIndex = node.parent.children.findIndex(nd => nd === node);
        node.parent.children.splice(nodeIndex, 1);
    }
    
    this.clear = function() {
        const gen = _traverse();
        for(let node of gen) {
            this.remove(node);
        }
    }
    
    /*
     * 
     * when setting a camera active run this for camera
     * camera will be first object in traverse
     * all other objects will use camera information for render
     * 
     */
    this.changeOrder = function(node) {
        if(node === root)
            return;
        let nodeIndex = node.parent.children.findIndex(nd => nd === node);
        [node.parent.children[0], node.parent.children[nodeIndex]] = [node.parent.children[nodeIndex], node.parent.children[0]];
        this.changeOrder(node.parent);
    }
    
    
    
    
    this.setProjection = function(settings) {
        if(settings.type === "Perspective")
            projectionMatrix = gm.perspectiveMatrix(settings.fovy ?? 45, settings.aspect ?? 1, settings.near ?? 0.3, settings.far ?? 10.0);
    }
    
    
    
    this.isActive = false;
    
    ActiveScene.addObserver(this);
    
    this.setActive = function() {
        this.isActive = true;
        ActiveScene.notifyAll(this);
    }
    this.clearActive = function() {
        this.isActive = false;
    }
    
    
    this.test = function() {
        let gen = _traverse();
        for(let node of gen) {
            alert(node);
        }
    }
}



const ActiveScene = {
    
    scenes: [],
    addObserver: function(scene) {
        this.scenes.push(scene);
    },
    removeObserver: function(scene) {
        this.scenes = this.scenes.filter(function(item, index, arr) {
            return item !== scene;
        });
    },
    notifyAll: function(scene) {
        this.scenes.forEach(function(item, index, arr) {
            if(scene !== item)
                item.clearActive();
        });
    }
    
}