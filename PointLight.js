"use strict";




const PointLight = function PointLight(settings = {}) {
    
    this.lightType = "POINT";
    
    const gm = new GlMath();
    
    this.__proto__ = new Light(settings.color ?? gm.vec3(1.0, 1.0, 1.0), 
                                180.0, 
                                gm.vec3(0.0, -1.0, 0.0), 
                                settings.position ?? gm.vec3(0.0, 0.0, 0.0),
                                settings.intensity ?? 300.0);
    
}