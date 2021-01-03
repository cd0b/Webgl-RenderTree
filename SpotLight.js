"use strict";




const SpotLight = function SpotLight(settings = {}) {
    
    this.lightType = "SPOT";
    
    const gm = new GlMath();
    
    
    this.__proto__ = new Light(settings.color ?? gm.vec3(1.0, 1.0, 1.0), 
                                settings.angle ?? 30.0, 
                                settings.direction ?? gm.vec3(0.0, -1.0, 0.0), 
                                settings.position ?? gm.vec3(0.0, 0.0, 0.0),
                                settings.intensity ?? 300.0);
    
}