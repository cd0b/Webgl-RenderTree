"use strict";


/*
 * 
 * Shader code generator will be updated
 * createProgram's argument will be updated
 * 
 */


function $(func) {
    
    window.onload = func;
    
}




function ShaderCompilingError(msg) {
    this.name = "ShaderCompilingError";
    this.message = msg;
}

function ProgramLinkingError(msg) {
    this.name = "ProgramLinkingError";
    this.message = msg;
}

function InvalidSceneSetError(msg) {
    this.name = "InvalidSceneSetError";
    this.message = msg;
}


function SceneNotBindedError(msg) {
    this.name = "SceneNotBindedError";
    this.message = msg;
}


function InvalidShaderCodeSettingError(msg) {
    this.name = "InvalidShaderCodeSettingError";
    this.message = msg;
}


function JsonFileReadingError(msg) {
    this.name = "JsonFileReadingError";
    this.message = msg;
}


function NoSuchModelInformationError(msg) {
    this.name = "NoSuchModelInformationError";
    this.message = msg;
}





const Cs = function() {
    
    if(Cs.prototype._cs)
        return Cs.prototype._cs;
    
    
    
    const gm = new GlMath();
    
    /*
     * cpp
     */
    this.PER_VERTEX_SHADING = 1;
    this.PER_FRAGMENT_SHADING = 2;
    
    
    let Scene = null;
    Object.defineProperty(this, "activeScene", {
        get: function() {
            if(!Scene)
                throw new SceneNotBindedError("Scene is not binded!");
            return Scene;
        },
        enumerable: false,
        configurable: false,
    });
    this.bindScene = function(renderTree) {
        if(!(renderTree instanceof RenderTree))
            throw new InvalidSceneSetError("You must bind a Scene or a RenderTree object!");
        Scene = renderTree;
        Scene.setActive();
    }
    this.createScene = function() {
        return new RenderTree();
    }
    this.clearScene = function(scene) {
        if(!scene)
            scene = this.activeScene;
        
        scene.clear();
    }
    this.createCamera = function(settings = {}) {
        return new Camera(settings.at ?? gm.vec3(0, 0, 1), 
                         settings.eye ?? gm.vec3(0, 0, 0), 
                          settings.up ?? gm.vec3(0, 1, 0));
    }
    
    
    // helper variables
    let widthRatio = null;
    let heightRatio = null;
    const whRatio = 0.99;
    let projectionSettings = {};
    
    // helper functions
    function windowInnerWidth() {
        return window.innerWidth * whRatio;
    }
    function windowInnerHeight() {
        return window.innerHeight * whRatio;
    }
    function screenWidth() {
        return window.screen.width * whRatio;
    }
    function screenHeight() {
        return 0.4427 * window.screen.height * whRatio;
    }
    const isCanvas = function isCanvas() {
        return (this.canvas !== undefined && this.canvas !== null);
    }.bind(this);
    const isGl = function isGl() {
        return (this.gl !== undefined && this.gl !== null);
    }.bind(this);
    const isProgram = function() {
        return (this.program !== undefined && this.program !== null);
    }.bind(this);
    const fullSize = function fullSize() {
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        
        this.canvas.width = windowInnerWidth();
        this.canvas.height = windowInnerHeight();
        
        widthRatio = 1;
        heightRatio = 1;
    }.bind(this);
    const setSize = function setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        widthRatio = width / screenWidth();
        heightRatio = height / screenHeight();
    }.bind(this);
    function autoSize() {
        window.addEventListener("resize", updateSize);
    }
    function removeAutoSize() {
        window.removeEventListener("resize", updateSize);
    }
    const updateSize = function updateSize() {
        this.canvas.width = windowInnerWidth() * widthRatio;
        this.canvas.height = windowInnerHeight() * heightRatio;
        
        projectionSettings.aspect = this.canvas.width / this.canvas.height;
        this.setProjection(projectionSettings);
    }.bind(this);
      
    
    this.canvas = null;
    this.gl = null;
    this.program = null;
    
    
    /*
     * creating canvas in scene
     * options
     * 
     * int width
     * int heigth
     * boolean autoSize
     * boolean fullSize
     * 
     * if fullSize true width and height is not important
     * if autoSize is true it will use width / window.width and height / window.height ratios
     * 
     */
    this.createCanvas = function(settings = {
        width: 600,
        height: 400,
        fullSize: true,
        autoSize: false,
    }) {
        if(isCanvas())
            return;
        const width = settings.width;
        const height = settings.height;
        const as = settings.autoSize;
        const fs = settings.fullSize;
        
        // create a canvas
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        
        // set canvas size
        if(fs)
            fullSize();
        else
            setSize(width, height);
        
        // set auto size
        if(as)
            autoSize();
    }
    this.removeCanvas = function() {
        if(!isCanvas())
            return;
        
        widthRatio = null;
        heightRatio = null;
        
        removeAutoSize();
        this.removeGl();
        document.body.removeChild(this.canvas);
        document.removeElement(this.canvas);
        this.canvas = null;
    }
    
    
    
    /*
     * if no canvas create one
     * if there is canvas get a webgl2 context object from canvas
     * 
     */
    this.createGl = function() {
        if(!isCanvas())
            this.createCanvas();
        else if(isGl())
            return;
        
        this.gl = this.canvas.getContext("webgl2");
        this.gl.enable(this.gl.DEPTH_TEST);
    }
    this.removeGl = function() {
        if(!isGl())
            return;
        
        this.removeProgram();
        this.gl = null;
        
    }
    
    
    
    /*
     * generate shader code according to settings
     * compile shaders
     * link program
     * use program
     *
     */
    /*
     * helper function to generate shader
     */
    const shaderVariables = {
        iPosition: "iPosition",
        iNormal: "iNormal",
        iTexCoord: "iTexCoord",
        iColor: "iColor",
        
        viewMatrix: "uViewMatrix",
        projectionMatrix: "uProjectionMatrix",
        transformMatrix: "uTransformMatrix",
        normalMatrix: "uNormalMatrix",
        
        shininess: "uShininess",
        
        lightColor: "uLightColor",
        lightPosition: "uLightPosition",
        lightDirection: "uLightDirection",
        lightIntensity: "uLightIntensity",
        lightAngle: "uLightAngle",
    };
    const generateShaderCode = function generateShaderCode(settings) {
        const shading = settings.shading;
        shaderVariables.lightCount = settings.lightCount ?? 0;
        
        if(!shading)
            throw new InvalidShaderCodeSettingError("There is no shading information in shader code generation settings!");
        
        let vertexShaderCode = `#version 300 es
        in vec3 ${shaderVariables.iPosition};
        in vec3 ${shaderVariables.iNormal};
        in vec3 ${shaderVariables.iTexCoord};
        in vec3 ${shaderVariables.iColor};
        
        uniform mat4 ${shaderVariables.transformMatrix};
        uniform mat4 ${shaderVariables.viewMatrix};
        uniform mat4 ${shaderVariables.projectionMatrix};
        uniform mat4 ${shaderVariables.normalMatrix};
        
        out vec2 fTexCoord;
        `;
        let fragmentShaderCode = `#version 300 es
        precision mediump float;
        
        in vec2 fTexCoord;
        uniform sampler2D uSampler;
        `;
        
        if(shading == this.PER_FRAGMENT_SHADING) {
            vertexShaderCode += `
            uniform vec3 ${shaderVariables.lightPosition};
            uniform vec3 ${shaderVariables.lightDirection};
            
            out vec3 l;
            out vec3 n;
            out vec3 r;
            out vec3 v;
            out vec3 lightDirection;
            out float lightDistance;
            out vec3 color;
            
            void main() {
            
                vec4 viewPosition = ${shaderVariables.viewMatrix} * 
                                ${shaderVariables.transformMatrix} * 
                                vec4(${shaderVariables.iPosition}, 1.0);
                
                gl_Position = ${shaderVariables.projectionMatrix} * viewPosition;
                
                vec3 lightPosition = vec3(${shaderVariables.viewMatrix} * vec4(${shaderVariables.lightPosition}, 1.0));
                lightDirection = normalize(vec3(${shaderVariables.normalMatrix} * vec4(${shaderVariables.lightDirection}, 1.0)));
                
                vec3 vertexToLight = lightPosition - viewPosition.xyz;
            
                lightDistance = length(vertexToLight);
            
                l = normalize(vertexToLight);
                n = normalize(vec3(${shaderVariables.normalMatrix} * vec4(${shaderVariables.iNormal}, 1.0)));
                r = normalize(reflect(l, n));
                v = normalize(vec3(-viewPosition.xyz));
                
                color = ${shaderVariables.iColor};
                fTexCoord = vec2(${shaderVariables.iTexCoord});
            }
            `;
            
            fragmentShaderCode += `
            uniform float ${shaderVariables.lightAngle};
            uniform float ${shaderVariables.lightIntensity};
            uniform vec3 ${shaderVariables.lightColor};
            uniform float ${shaderVariables.shininess};
            
            in vec3 l;
            in vec3 n;
            in vec3 r;
            in vec3 v;
            in vec3 lightDirection;
            in float lightDistance;
            in vec3 color;
            
            out vec4 oColor;
            
            void main(){
                float lightAngle = radians(${shaderVariables.lightAngle});
            
                float diffuseComponent = max(dot(l, n), 0.0);
                float specularComponent = pow(max(dot(v, r), 0.0), ${shaderVariables.shininess});
                
                if(dot(-l, lightDirection) < cos(lightAngle)) {
                    diffuseComponent = 0.0;
                    specularComponent = 0.0;
                }
            
                vec3 diffuseColor = color * ${shaderVariables.lightColor} * diffuseComponent;
                vec3 ambientColor = color * vec3(0.1, 0.1, 0.1);
                vec3 specularColor = color * ${shaderVariables.lightColor} * specularComponent;
                
                
                vec3 fColor = ambientColor + (specularColor + diffuseColor) * (${shaderVariables.lightIntensity} / pow(lightDistance, 2.0));
                oColor = vec4(fColor, 1.0) * texture(uSampler, fTexCoord); 
            }
            `;
        }
        else if(shading == this.PER_VERTEX_SHADING) {
            vertexShaderCode += `
            uniform float ${shaderVariables.shininess};
            
            uniform vec3 ${shaderVariables.lightColor};
            uniform vec3 ${shaderVariables.lightPosition};
            uniform vec3 ${shaderVariables.lightDirection};
            uniform float ${shaderVariables.lightIntensity};
            uniform float ${shaderVariables.lightAngle};
            
            out vec3 fColor;
            
            void main() {
            
                vec4 viewPosition = ${shaderVariables.viewMatrix} * 
                                ${shaderVariables.transformMatrix} * 
                                vec4(${shaderVariables.iPosition}, 1.0);
                
                gl_Position = ${shaderVariables.projectionMatrix} * viewPosition;
                
                
                vec3 lightPosition = vec3(${shaderVariables.viewMatrix} * vec4(${shaderVariables.lightPosition}, 1.0));
                vec3 lightDirection = normalize(vec3(${shaderVariables.normalMatrix} * vec4(${shaderVariables.lightDirection}, 1.0)));
                float lightAngle = radians(${shaderVariables.lightAngle});
                
            
                vec3 vertexToLight = lightPosition - viewPosition.xyz;
                float lightDistance = length(vertexToLight);
            
                vec3 l = normalize(vertexToLight);
                vec3 n = normalize(vec3(${shaderVariables.normalMatrix} * vec4(${shaderVariables.iNormal}, 1.0)));
                vec3 r = normalize(reflect(l, n));
                vec3 v = normalize(vec3(-viewPosition.xyz));
                
                float diffuseComponent = max(dot(l, n), 0.0);
                float specularComponent = pow(max(dot(v, r), 0.0), ${shaderVariables.shininess});
                
                if(dot(-l, lightDirection) < cos(lightAngle)) {
                    diffuseComponent = 0.0;
                    specularComponent = 0.0;
                }
                
                vec3 diffuseColor = ${shaderVariables.iColor} * ${shaderVariables.lightColor} * diffuseComponent;
                vec3 ambientColor = ${shaderVariables.iColor} * vec3(0.1, 0.1, 0.1);
                vec3 specularColor = ${shaderVariables.iColor} * ${shaderVariables.lightColor} * specularComponent;
                
                
                fColor = ambientColor + (specularColor + diffuseColor) * (${shaderVariables.lightIntensity} / pow(lightDistance, 2.0));
                fTexCoord = vec2(${shaderVariables.iTexCoord});
            }
            `;
            
            fragmentShaderCode += `
            in vec3 fColor;
            out vec4 oColor;
            void main(){
                oColor = vec4(fColor, 1.0) * texture(uSampler, fTexCoord); 
            }
            `;
        }
        else {
            throw new InvalidShaderCodeSettingError("Shading information is not PER_FRAGMENT_SHADING or PER_VERTEX_SHADING!");
        }
        
        return [vertexShaderCode, fragmentShaderCode];
        
    }.bind(this);
    /*
     * helper function
     * compile shaders
     * 
     */
    const compileShader = function compileShader(shaderCode, shaderType) {
        const shader = this.gl.createShader(shaderType);
        this.gl.shaderSource(shader, shaderCode);
        this.gl.compileShader(shader);
        
        if(this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
            return {
                shader: shader,
                success: true,
                message: "",
            };
        else 
            return {
                shader: shader,
                success: false,
                message: `Compile error: ${shaderType}\n${this.gl.getShaderInfoLog(shader)}\n`,
            };
    }.bind(this);
    const linkProgram = function linkProgram(vertexShader, fragmentShader) {
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        
        if(this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS))
            return {
                success: true,
                message: "",
            };
        else
            return {
                success: false,
                message: `Link error: ${this.gl.getProgramInfoLog(this.program)}\n`,
            };
    }.bind(this);
    this.createProgram = function(settings = {
        shading: this.PER_FRAGMENT_SHADING,
    }) {
        if(!isGl())
            this.createGl();
        else if(isProgram())
            return;
        
        // generate shader code according to settings
        const [vertexShaderCode, fragmentShaderCode] = generateShaderCode(settings);
        
        
        // compile shaders
        let vertexShader = null, fragmentShader = null;
        
        const vertexShaderObj = compileShader(vertexShaderCode, this.gl.VERTEX_SHADER);
        if(vertexShaderObj.success)
            vertexShader = vertexShaderObj.shader;
        else
            throw new ShaderCompilingError(vertexShaderObj.message);
        
        const fragmentShaderObj = compileShader(fragmentShaderCode, this.gl.FRAGMENT_SHADER); 
        if(fragmentShaderObj.success)
            fragmentShader = fragmentShaderObj.shader;
        else
            throw new ShaderCompilingError(fragmentShaderCode.message);
        
        
        // create and link program
        this.program = this.gl.createProgram();
        const linkerObject = linkProgram(vertexShader, fragmentShader);
        if(!linkerObject.success)
            throw new ProgramLinkingError(linkerObject.message);
        
        /*
         * add locations of uniform variables to program
         * 
         */
        this.program.transformMatrixLoc = this.gl.getUniformLocation(this.program, shaderVariables.transformMatrix);
        this.program.viewMatrixLoc = this.gl.getUniformLocation(this.program, shaderVariables.viewMatrix);
        this.program.projectionMatrixLoc = this.gl.getUniformLocation(this.program, shaderVariables.projectionMatrix);
        this.program.normalMatrixLoc = this.gl.getUniformLocation(this.program, shaderVariables.normalMatrix);
        this.program.shininessLoc = this.gl.getUniformLocation(this.program, shaderVariables.shininess);
        this.program.lightColorLoc = this.gl.getUniformLocation(this.program, shaderVariables.lightColor);
        this.program.lightPositionLoc = this.gl.getUniformLocation(this.program, shaderVariables.lightPosition);
        this.program.lightDirectionLoc = this.gl.getUniformLocation(this.program, shaderVariables.lightDirection);
        this.program.lightIntensityLoc = this.gl.getUniformLocation(this.program, shaderVariables.lightIntensity);
        this.program.lightAngleLoc = this.gl.getUniformLocation(this.program, shaderVariables.lightAngle);
        
        this.gl.useProgram(this.program);
        
    }
    this.removeProgram = function() {
        if(!isProgram())
            return;
        
        this.gl.deleteProgram(this.program);
        this.gl.useProgram(null);
        this.program = null;
    }
    
    
    
    /*
    this.render = function() {
        if(!Scene)
            throw new SceneNotBindedError("You must bind a screen to render!");

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const gen = Scene.traverse();
        for(let obj of gen) {
            this.gl.uniformMatrix4fv(this.program.transformMatrixLoc, false, gm.toGlArray(Scene.transformMatrix));

            if(Scene.cameraUpdated) {
                this.gl.uniformMatrix4fv(this.program.viewMatrixLoc, false, gm.toGlArray(Scene.modelViewMatrix));
                this.gl.uniformMatrix4fv(this.program.normalMatrixLoc, false, gm.toGlArray(Scene.normalMatrix));
                Scene.cameraUpdated = false;
            }

            if(obj.isLight) {
                let lightPosition = gm.vec3(gm.mul(Scene.transformMatrix, gm.vec4()));
                let lightDirection = gm.vec3(gm.mul(Scene.transformMatrix, gm.vec4(obj.direction)));

                lightDirection = gm.sub(lightDirection, lightPosition);
                lightPosition = gm.add(lightPosition, obj.position);

                this.gl.uniform3fv(this.program.lightColorLoc, gm.toGlArray(obj.color));
                this.gl.uniform3fv(this.program.lightPositionLoc, gm.toGlArray(lightPosition));
                this.gl.uniform3fv(this.program.lightDirectionLoc, gm.toGlArray(lightDirection));
                this.gl.uniform1f(this.program.lightIntensityLoc, obj.intensity);
                this.gl.uniform1f(this.program.lightAngleLoc, obj.angle);
            }

            if(obj.isModel) {
                this.gl.bindVertexArray(obj.vao);

                let drawType = this.gl.TRIANGLES;
                if(obj.drawType === "POINTS")
                    drawType = this.gl.POINTS;
                else if(obj.drawType === "LINES")
                    drawType = this.gl.LINES;
                else if(obj.drawType === "LINE_STRIP")
                    drawType = this.gl.LINE_STRIP;
                else if(obj.drawType === "LINE_LOOP")
                    drawType = this.gl.LINE_LOOP;
                else if(obj.drawType === "TRIANGLE_STRIP")
                    drawType = this.gl.TRIANGLE_STRIP;
                else if(obj.drawType === "TRIANGLE_FAN")
                    drawType = this.gl.TRIANGLE_FAN;

                if(obj.texture) {
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, obj.texture);
                    this.gl.uniform1i(this.program.uSampler, 0);
                }

                this.gl.uniform1f(this.program.shininessLoc, obj.shininess);

                //this.gl.drawArrays(drawType, 0, obj.vertexCount);
                this.gl.drawArrays(drawType, 0, obj.vertexCount);
            }
        }


        requestAnimationFrame(this.render.bind(this));
    }
    */
    
    
    this.render = function() {
        if(!Scene)
            throw new SceneNotBindedError("You must bind a screen to render!");

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        Scene.storedTraverse();
        
        if(Scene.cameraUpdated) {
            this.gl.uniformMatrix4fv(this.program.viewMatrixLoc, false, gm.toGlArray(Scene.modelViewMatrix));
            this.gl.uniformMatrix4fv(this.program.normalMatrixLoc, false, gm.toGlArray(Scene.normalMatrix));
            Scene.cameraUpdated = false;
        }
        
        /* send light to gpu */
        let obj = Scene.lightStack[0].light;
        let transform = Scene.lightStack[0].transform;
        let lightPosition = gm.vec3(gm.mul(transform, gm.vec4()));
        let lightDirection = gm.vec3(gm.mul(transform, gm.vec4(obj.direction)));

        lightDirection = gm.sub(lightDirection, lightPosition);
        lightPosition = gm.add(lightPosition, obj.position);

        this.gl.uniform3fv(this.program.lightColorLoc, gm.toGlArray(obj.color));
        this.gl.uniform3fv(this.program.lightPositionLoc, gm.toGlArray(lightPosition));
        this.gl.uniform3fv(this.program.lightDirectionLoc, gm.toGlArray(lightDirection));
        this.gl.uniform1f(this.program.lightIntensityLoc, obj.intensity);
        this.gl.uniform1f(this.program.lightAngleLoc, obj.angle);


        /* render models */
        for(let modelInfo of Scene.modelStack) {
            const model = modelInfo.model;
            const transform = modelInfo.transform;
            
            this.gl.uniformMatrix4fv(this.program.transformMatrixLoc, false, gm.toGlArray(transform));
            
            /* obj geometry */
            this.gl.bindVertexArray(model.vao);

            let drawType = this.gl.TRIANGLES;
            if(model.drawType === "POINTS")
                drawType = this.gl.POINTS;
            else if(model.drawType === "LINES")
                drawType = this.gl.LINES;
            else if(model.drawType === "LINE_STRIP")
                drawType = this.gl.LINE_STRIP;
            else if(model.drawType === "LINE_LOOP")
                drawType = this.gl.LINE_LOOP;
            else if(model.drawType === "TRIANGLE_STRIP")
                drawType = this.gl.TRIANGLE_STRIP;
            else if(model.drawType === "TRIANGLE_FAN")
                drawType = this.gl.TRIANGLE_FAN;

            /* uniform tex */
            if(model.texture) {
                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(this.gl.TEXTURE_2D, model.texture);
                this.gl.uniform1i(this.program.uSampler, 0);
            }

            /* uniform shininess */
            this.gl.uniform1f(this.program.shininessLoc, model.shininess);

            //this.gl.drawArrays(drawType, 0, model.vertexCount);
            this.gl.drawArrays(drawType, 0, model.vertexCount);
            
        }
        
        
        requestAnimationFrame(this.render.bind(this));
    }
    
    
    
    
    
    this.setProjection = function(settings = {
        type: "Perspective",
        fovy: 45,
        aspect: this.canvas.width / this.canvas.height,
        near: 0.3,
        far: 10.0,
    }) {
        if(!Scene)
            throw new SceneNotBindedError("You must bind a screen to set projection!");
        
        projectionSettings = settings;
        Scene.setProjection(settings);
        
        this.gl.uniformMatrix4fv(this.program.projectionMatrixLoc, false, gm.toGlArray(Scene.projectionMatrix));
    }
    
    
    const _models = new Map();
    this.loadModel = async function loadModel(filename, name) {
        const response = await fetch(filename);
        if(response.ok) {
            const text = await response.text();
            const obj = JSON.parse(text);
            
            _models.set(name, obj);
        } else {
            throw new JsonFileReadingError("Can not load json file!");
        }
    } 
    
    this.getModel = function getModel(name) {
        const program = this.program;
        const gl = this.gl;
        const modelInfo = _models.get(name);
        if(!modelInfo)
            throw new NoSuchModelInformationError("The model is not loaded!");
        
        const posLoc = gl.getAttribLocation(program, shaderVariables.iPosition);
        const norLoc = gl.getAttribLocation(program, shaderVariables.iNormal);
        const texLoc = gl.getAttribLocation(program, shaderVariables.iTexCoord);
        const colorLoc = gl.getAttribLocation(program, shaderVariables.iColor);
        
        const model = new Model(gl, [posLoc, norLoc, texLoc, colorLoc],[modelInfo.vertex, modelInfo.normal, modelInfo.texcoord, modelInfo.color], modelInfo.draw, modelInfo.imageUrl, modelInfo.shininess);
        return model;
    }
    
    
    this.loadImage = async function(imageUrl) {
        const imageLoader = new ImageLoader();
        const image = await imageLoader.load("textures/" + imageUrl);
    }
    
    
    
    
    this.SPOT_LIGHT = 0;
    this.POINT_LIGH = 1;
    this.createLight = function(type, settings) {
        if(type === this.SPOT_LIGHT) {
            return new SpotLight(settings);
        } else if(type === this.POINT_LIGHT) {
            return new PointLight(settings);
        }
    }
    
    
    
    
    
    Cs.prototype._cs = this;
    
}