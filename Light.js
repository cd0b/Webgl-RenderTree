"use strict";






const Light = function Light(lightColor, lightAngle, lightDirection, lightPosition, lightIntensity) {
    Object.defineProperty(this, "color", {
        get: () => lightColor,
        set: (color) => lightColor = color,
        enumerable: false,
        configurable: false,
    });
    Object.defineProperty(this, "angle", {
        get: () => lightAngle,
        set: (angle) => lightAngle = angle,
        enumerable: false,
        configurable: false,
    });
    Object.defineProperty(this, "direction", {
        get: () => lightDirection,
        set: (direction) => lightDirection = direction,
        enumerable: false,
        configurable: false,
    });
    Object.defineProperty(this, "position", {
        get: () => lightPosition,
        set: (position) => lightPosition = position,
        enumerable: false,
        configurable: false,
    });
    Object.defineProperty(this, "intensity", {
        get: () => lightIntensity,
        set: (intensity) => {lightIntensity = intensity; if(lightIntensity < 0) lightIntensity = 0;},
        enumerable: false,
        configurable: false,
    });
    Object.defineProperty(this, "isLight", {
        get: () => true,
        enumerable: false,
        configurable: false,
    });
    Object.defineProperty(this, "isReadyToRender", {
        get: () => true,
        enumerable: false,
        configurable: false,
    });
    
    this.__proto__ = new Loadable("LIGHT");
}