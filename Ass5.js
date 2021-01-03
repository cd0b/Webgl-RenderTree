"use strict";



$(async function() {
    
    const gm = new GlMath();
    const cs = new Cs();
    
    
    /* load textures */
    await cs.loadImage("cube.png");
    await cs.loadImage("plane.bmp");
    
    
    /* load models */
    await cs.loadModel("models/cube.json", "cube");
    await cs.loadModel("models/plane.json", "plane");
    
    
    /* init canvas, gl and program */
    cs.createCanvas({
        width: 0,
        height: 0,
        fullSize: true,
        autoSize: true,
    });
    cs.createGl();
    let PROGRAM_SETTINGS= { shading: cs.PER_FRAGMENT_SHADING, lightCount: 10, };
    cs.createProgram(PROGRAM_SETTINGS);
    
    
    /* start the game */
    let scene = null;
    start();
    
    // add to 'P' a command to toggle between PER_FRAGMENT_SHADING and PER_VERTEX_SHADING.
    window.addEventListener("keypress", function(e) {
        if(e.code === "KeyP") {
            if(PROGRAM_SETTINGS.shading == cs.PER_FRAGMENT_SHADING)
                PROGRAM_SETTINGS.shading = cs.PER_VERTEX_SHADING;
            else
                PROGRAM_SETTINGS.shading = cs.PER_FRAGMENT_SHADING;
           
            cs.removeProgram();
            cs.createProgram(PROGRAM_SETTINGS);
            
            start();
        }
    });
    
    /* mouse loc */ 
    cs.canvas.requestPointerLock = cs.canvas.requestPointerLock || cs.canvas.mozRequestPointerLock;
    const pointerLockEventListener = function() { cs.canvas.requestPointerLock(); }
    window.addEventListener("click", pointerLockEventListener);
    
    
    
    
    function start() {
      
        /* create and bind scene */
        if(!scene) {
            scene = cs.createScene();
            const popup = document.createElement("div");
            popup.id = "popup";
            popup.style.position = "fixed";
            popup.style.right = "1vw";
            popup.style.bottom = "1vh";
            popup.style.width = "40vw";
            popup.style.height = "40vh";
            popup.style.backgroundColor = "#eee";
            popup.style.borderRadius = "10px";
            popup.style.border = "2px solid #bbb";
            popup.style.padding = "10px";
            popup.style.zIndex = "1";
            popup.style.color = "black";
            popup.innerHTML = `Controller<br /><br />
                Use w, a, s, d or arrow keys to move.<br />
                Use mouse to look around.<br />
                Click to lock.<br />
                Use O to turn on/off flash.<br />
                Use wheel to inc/dec light intensity.<br />
                Use - and + to expand flashlight.<br />
                <button style="position: relative; left: 30vw; top: 12vh; width: 10vw; height: 5vh; background-color: green; color: white; border: 0px; cursor: pointer;" onclick="document.querySelector('#popup').style.display='none'; document.querySelector('#popup').remove();">Continue</button>
            `;
            document.body.append(popup);
            const removePopup = function() {
                popup.style.display = "none";
                popup.remove();
                window.removeEventListener("keypress", removePopup);
                window.removeEventListener("mousemove", removePopup);
                window.removeEventListener("wheel", removePopup);
                window.removeEventListener("click", removePopup);
            };
            window.addEventListener("keypress", removePopup);
            window.addEventListener("mousemove", removePopup);
            window.addEventListener("wheel", removePopup)
            window.addEventListener("click", removePopup);
        } 
        
        cs.bindScene(scene);
        cs.clearScene(scene);


        /* set projection */
        cs.setProjection({
            type: "Perspective",
            fovy: 45,
            aspect: cs.canvas.width / cs.canvas.height,
            near: 0.3,
            far: 200.0,
        });

        
        /* camera settings */
        const camera = cs.createCamera({
            at: gm.vec3(1, 1, 1),
            eye: gm.vec3(0, 0, 0),
            up: gm.vec3(0, 2, 0),
        });
        camera.addToScene(cs.activeScene);
        camera.setActive();
        camera.addController(CameraController, {
            activeCamera: camera,
            speed: 0.8,
        });
        
        
        /* add light */
        const flashLight = cs.createLight(cs.SPOT_LIGHT, {
            color: gm.vec3(1.0, 1.0, 1.0), 
            angle: 10, 
            direction: gm.vec3(-1.0, -1.0, -1.0), 
            position: gm.vec3(1.0, 1.0, 1.0),
            intensity: 300.0,
        });
        camera.addChild(flashLight);
        
        
        /* add controller to flashlight */
        flashLight.addController(FlashLightController, {
            activeCamera: camera,
            speed: 7.0,
        });
        
        
        /* set start position */
        camera.translate(50,10,50);
        camera.rotate(-150, 0,1,0);
        
        
        /* create cubes and add to scene */
        const space = 4;
        for(let j = 0; j < 25; j++)
            for(let i = 0; i < 25; i++) {
                const cube = cs.getModel("cube");
                cube.addToScene(cs.activeScene);
                cube.translate(i * space, 0, j * space);
            }
        
        
        /* plane */
        const plane = cs.getModel("plane");
        plane.addToScene(cs.activeScene);
        plane.translate(-2, -1.1, -2);
        
        
        
        
        /* render */
        cs.render();
    } 
    
});
