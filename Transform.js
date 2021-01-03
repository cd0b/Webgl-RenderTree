



const Transform = function Transform(matrix) {
    
    this.matrix = matrix;
    this.isTransform = true;
    
}

const Translation = function Translation(matrix) {
    this.transformType = "Translation";
    this.__proto__ = new Transform(matrix);
}

const Rotation = function Rotation(matrix) {
    this.transformType = "Rotation";
    this.__proto__ = new Transform(matrix);
}

const Scaling = function Scaling(matrix) {
    this.transformType = "Scaling";
    this.__proto__ = new Transform(matrix);
} 