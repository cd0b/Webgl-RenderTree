"use strict";




const FlashLightController = function(obj, settings) {
    
    const camera = settings.activeCamera;
    const speed = settings.speed;
    
    const gm = new GlMath();
    
    const wheelListener = function(e) {
        obj.intensity = obj.intensity - event.deltaY * speed;
    }
    window.addEventListener("wheel", wheelListener);
    
    const keyboardListener = function(e) {
        if(e.code === "NumpadAdd") {
            obj.angle = obj.angle + 1.0;
            if(obj.angle <= 0)
                obj.angle = 0.0;
            else if(obj.angle >= 60.0)
                obj.angle = 60.0;
        }
        else if(e.code === "NumpadSubtract") {
            obj.angle = obj.angle - 1.0;
            if(obj.angle <= 0)
                obj.angle = 0.0;
            else if(obj.angle >= 60.0)
                obj.angle = 60.0;
        }
    }
    window.addEventListener("keypress", keyboardListener);
    
    const swithFlashListener = function(e) {
        if(e.code === "KeyO") {
            if(obj.intensity <= 0)
                obj.intensity = 300.0;
            else
                obj.intensity = 0.0;
        }
    }
    window.addEventListener("keypress", swithFlashListener);
    
}