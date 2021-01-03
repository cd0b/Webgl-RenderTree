"use strict";



function ImageIsNotLoadedError(msg) {
    this.name = "ImageIsNotLoadedError";
    this.message = msg;
}




const Model = function Model(gl, locs, data, drawType, imageUrl, shininess) {
    
    const gm = new GlMath();
    const vertexCount = data[0].length;
    
    let isReadyToRender = false;
    
    if(!imageUrl)
        isReadyToRender = true;
    
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    for(let i = 0; i < locs.length; i++) {
        const loc = locs[i];
        const arr = gm.toGlArray(data[i]);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
        gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc);
    }
    
    gl.bindVertexArray(null);
    
    
    /* texture operations */
    const texture = gl.createTexture();
    if(imageUrl) {
        const imageLoader = new ImageLoader();
        const image = imageLoader.image("textures/" + imageUrl);
        
        if(!image)
            throw new ImageIsNotLoadedError(`This image is not loaded, can not use as texture! 'textures/${imageUrl}'`);
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.bindTexture(gl.TEXTURE_2D, null);
        isReadyToRender = true;
    }
    Object.defineProperty(this, "vao", {
        get: () => vao,
        enumerable: false,
        configurable: false,
    });
    Object.defineProperty(this, "vertexCount", {
        get: () => vertexCount,
        enumerable: false,
        configurable: false,
    });
    Object.defineProperty(this, "drawType", {
        get: () => drawType,
        enumerable: false,
        configurable: false,
    });
    Object.defineProperty(this, "texture", {
        get: () => texture,
        enumerable:false,
        configurable:false,
    });
    Object.defineProperty(this, "shininess", {
        get: () => shininess,
        enumerable: false,
        configurable: false,
    });
    Object.defineProperty(this, "isModel", {
        get: () => true,
        enumerable: false,
        configurable: false,
    });
    Object.defineProperty(this, "isReadyToRender", {
        get: () => isReadyToRender,
        set: (ready) => isReadyToRender = ready,
        enumerable: false,
        configurable: false,
    });
 
    this.__proto__ = new Loadable("MODEL");
}