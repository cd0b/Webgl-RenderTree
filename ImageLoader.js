"use strict";





const ImageLoader = function() {
    
    if(ImageLoader.prototype._imageLoader)
        return ImageLoader.prototype._imageLoader;
    
    const images = new Map();
    
    this.load = async function(imageUrl) {
        return new Promise((resolve) => {
            let image = new Image();
            image.src = imageUrl;
            image.onload = () => {
                images.set(imageUrl, image);
                resolve(image);
            }
        });
    }
    
    this.image = function(imageUrl) {
        return images.get(imageUrl);
    }
    
    
    
    
    
    ImageLoader.prototype._imageLoader = this;
    
}