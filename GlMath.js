"use strict";





function GlMath() {
    
    if(GlMath.prototype._glMath)
       return GlMath.prototype._glMath;
   
    
    this.translateMatrix = function() {
        let v1 = this.vec3(this.toArray([...arguments]));
        
        return this.mat4(
                this.vec4(1.0,0.0,0.0,v1[0]),
                this.vec4(0.0,1.0,0.0,v1[1]),
                this.vec4(0.0,0.0,1.0,v1[2]),
                this.vec4()
                );;
        
    }
    
    
    this.rotateMatrix = function() {
        let v1 = this.toArray([...arguments]);
        let angle = v1.shift();
        v1 = this.nor(this.vec3(v1));
        
        var c = Math.cos( this.radians(angle) );
        let cu = 1.0 - c;
        var s = Math.sin( this.radians(angle) );
        
        return this.mat4(
                this.vec4(v1[0]*v1[0]*cu + c, v1[0]*v1[1]*cu - v1[2]*s, v1[0]*v1[2]*cu + v1[1]*s, 0.0 ),
                this.vec4(v1[0]*v1[1]*cu + v1[2]*s, v1[1]*v1[1]*cu + c,   v1[1]*v1[2]*cu - v1[0]*s, 0.0 ),
                this.vec4(v1[0]*v1[2]*cu - v1[1]*s, v1[1]*v1[2]*cu + v1[0]*s, v1[2]*v1[2]*cu + c,   0.0 ),
                this.vec4()
                );
    }
    
    
    this.scaleMatrix = function() {
        let v1 = this.toArray([...arguments]);
        
        switch(v1.length) {
            case 0:
                return this.mat4();
            case 1:
                return this.mat4(v1[0]);
            default:
                return this.mat4(
                        this.vec4(v1[0], 0.0, 0.0, 0.0),
                        this.vec4(0.0, v1[1], 0.0, 0.0),
                        this.vec4(0.0, 0.0, v1[2] ?? 1.0, 0.0),
                        this.vec4()
                        );
        }
    }
    
    
    this.modelViewMatrix = function(at, eye, up) {
        
        if(!eye.isVector || eye.size != 3)
            eye = this.vec3(eye);
        if(!at.isVector || at.size != 3)
            at = this.vec3(at);
        if(!up.isVector || up.size != 3)
            up = this.vec3(up);
        
        if(this.equ(eye, at))
            return this.mat4();
        
        let z = this.neg(this.nor(this.sub(eye, at)));
        let x = this.nor(this.mul(this.neg(z), up));
        let y = this.nor(this.mul(z, x));
        
        
        
        return this.mat4(
                    this.vec4(x, -this.dot(x, at)),
                    this.vec4(y, -this.dot(y, at)),
                    this.vec4(z, -this.dot(z, at)),
                    this.vec4()
                );
        
    }
    
    
    this.orthographicMatrix = function() {
        console.log("pek yakında!");
        return this.mat4();
    }
    
    
    
    this.perspectiveMatrix = function(theta, aspect, near, far) {
        // aspect w/h
        let ctAngle = Math.cot(this.radians(theta)/2);
        let d = near - far;
        
        
        return this.mat4(
                this.vec4(ctAngle/aspect, 0.0, 0.0, 0.0),
                this.vec4(0.0, ctAngle, 0.0, 0.0),
                this.vec4(0.0,0.0,(near + far)/d, 2*near*far/d),
                this.vec4(0.0, 0.0, -1.0, 0.0)
               );
        
    }
    
    
    
    this.toGlArray = function(m1) {
        if(m1.isMatrix) {
            m1 = this.tra(m1);
        }
        let args = this.toArray(m1);
        
        return (new Float32Array(args));
    }
    
    
    
    
    GlMath.prototype._glMath = this;
    
}
GlMath.prototype = new HandMath();