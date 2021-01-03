"use strict";
/*
 * Definition and operations of vector and matrix.
 * 
 * mat2 2x2 matrix.
 * mat3 3x3 matrix.
 * mat4 4x4 matrix.
 * 
 * Operations throws TypeError.
 * 
 * Must be created with new HandMath().
 * Singleton class.
 * 
 */







function InvalidVectorInitializationError(msg, elm) {
    this.name = "InvalidVectorInitializationError";
    this.message = msg;
    this.element = elm;
}
function InvalidMatrixInitializationError(msg, elm) {
    this.name = "InvalidMatrixInitializationError";
    this.message = msg;
    this.element = elm;
}







function InvalidElementError(msg, elm) {
    this.name = "InvalidElementError";
    this.message = msg;
    this.element = elm;
}

function DifferentSizeOperationError(msg, op, m1, m2) {
    this.name = "DifferentSizeVectorOperationError";
    this.message = msg;
    this.operation = op;
    this.m1 = m1;
    this.m2 = m2;
}

function InvalidTypeOperationError(msg, op, t1, t2) {
    this.name = "InvalidTypeOperationError";
    this.message = msg;
    this.operation = op;
    this.t1 = t1.isVector ? "vector" : t1.isMatrix ? "matrix" : typeof t1;
    if(t2)
    this.t2 = t2.isVector ? "vector" : t2.isMatrix ? "matrix" : typeof t2;
}










function HandMath() {
    
    if(HandMath.prototype._handMath)
        return HandMath.prototype._handMath;
    
    /* Helper functions */
    function _getArgsHelper(args, k) {
        args.forEach(function(item, index, arr) {
            if(item instanceof Array)
                k = _getArgsHelper(item, k);
            else
                k.push(item);
        });
        return k;
    }
    function _getArgs(args) {
        return _getArgsHelper([...args],[]);
    }
    function _controlArgs(args) {
        return args.find(item => typeof item != "number");
    }
    function _vectorWithProperties(obj, size) {
        obj = obj.splice(0, size);
        Object.defineProperty(obj, "isVector", {
            get() { return true; },
            enumerable: false,
            configurable: false,
        });
        Object.defineProperty(obj, "size", {
           get() { return size; },
           enumerable: false,
           configurable: false,
        });
        obj.toString = function() {
            let str = "[";
            let k;
            for(let i = 0; i < obj.size; i++) {
                for(k = 10; k > obj[i].toFixed(2).toString().length; k--)
                    str += " ";
                str += obj[i].toFixed(2).toString();
            }
            for(; k > 0; k--) {
                str += " ";
            }
            str += "]";
            return str;
        }
        return obj;
    }
    function _matrixWithProperties(obj, size) {
        Object.defineProperty(obj, "isMatrix", {
            get() { return true; },
            enumerable: false,
            configurable: false,
        });
        Object.defineProperty(obj, "size", {
            get() { return size; },
            enumerable: false,
            configurable: false,
        });
        obj.toString = function() {
            let str = "[";
            for(let i = 0; i < obj.size; i++) {
                str += obj[i].toString();
                if(i != obj.size - 1)
                    str += "\n";
            }
                
            str += "]";
            return str;
        }
        return obj;
    }
    function _mulWithConstant(v1arr, c) {
        let v = [];
        v1arr.forEach(function(item) {
            v.push(c * item);
        });
        return v;
    }
    function _crossVec3(v1arr, v2arr) {
        
        return [
            v1arr[1] * v2arr[2] - v1arr[2] * v2arr[1],
            v1arr[2] * v2arr[0] - v1arr[0] * v2arr[2],
            v1arr[0] * v2arr[1] - v1arr[1] * v2arr[0]
        ];
    }
    function _det(v1arr) {
        switch(v1arr.length) {
            case 4:
                return (v1arr[0] * v1arr[3] - v1arr[1] * v1arr[2]);
            case 9:
                return (v1arr[0] * v1arr[4] * v1arr[8] +
                        v1arr[1] * v1arr[5] * v1arr [6] +
                        v1arr[2] * v1arr[7] * v1arr [3] -
                        v1arr[6] * v1arr[4] * v1arr [2] -
                        v1arr[3] * v1arr[1] * v1arr [8] -
                        v1arr[0] * v1arr[5] * v1arr [7]);
            case 16:
                let m0 = [
                    v1arr[5], v1arr[6], v1arr[7],
                    v1arr[9], v1arr[10], v1arr[11], 
                    v1arr[13], v1arr[14], v1arr[15]
                ];
                let m1 = [
                    v1arr[4], v1arr[6], v1arr[7],
                    v1arr[8], v1arr[10], v1arr[11], 
                    v1arr[12], v1arr[14], v1arr[15]
                ];
                let m2 = [
                    v1arr[4], v1arr[5], v1arr[7],
                    v1arr[8], v1arr[9], v1arr[11], 
                    v1arr[12], v1arr[13], v1arr[15]
                ];
                let m3 = [
                    v1arr[4], v1arr[5], v1arr[6],
                    v1arr[8], v1arr[9], v1arr[10], 
                    v1arr[12], v1arr[13], v1arr[14]
                ];
                return (v1arr[0]*_det(m0) - v1arr[1]*_det(m1) + v1arr[2]*_det(m2) - v1arr[3]*_det(m3));
        }
    }
    /* Helper functions */
    
    
    
    
    
    this.radians = function(degrees) {
        return degrees * Math.PI / 180;
    }
    this.degrees = function(radians) {
        return radians * 180 / Math.PI;
    }
    
    
    
    
    
    this.vec2 = function() {
        let args = _getArgs(arguments);
        let invalidItem = _controlArgs(args);
        if(invalidItem)
            throw new InvalidVectorInitializationError(`Invalid vec2 initialization!`, invalidItem);
       
        switch(args.length) {
            case 0:
                args.push(0.0);
            case 1:
                args.push(0.0);
        }
        
        return _vectorWithProperties(args, 2);
    }
    this.vec3 = function() {
        let args = _getArgs(arguments);
        let invalidItem = _controlArgs(args);
        if(invalidItem)
            throw new InvalidVectorInitializationError(`Invalid vec3 initialization!`, invalidItem);
        
        switch(args.length) {
            case 0:
                args.push(0.0);
            case 1:
                args.push(0.0);
            case 2:
                args.push(0.0);
        }
        
        return _vectorWithProperties(args, 3);
    }
    this.vec4 = function() {
        let args = _getArgs(arguments);
        let invalidItem = _controlArgs(args);
        if(invalidItem)
            throw new InvalidVectorInitializationError(`Invalid vec4 initialization!`, invalidItem);
        
        switch(args.length) {
            case 0:
                args.push(0.0);
            case 1:
                args.push(0.0);
            case 2:
                args.push(0.0);
            case 3:
                args.push(1.0);
        }
        
        return _vectorWithProperties(args, 4);
    }
    
    
    this.mat2 = function() {
        let args = _getArgs(arguments);
        let invalidItem = _controlArgs(args);
        if(invalidItem)
            throw new InvalidMatrixInitializationError(`Invalid mat2 initialization!`, invalidItem);
       
        
        const m = [];
        switch(args.length) {
            case 0:
            case 1:
                m.push(this.vec2(args[0] ?? 1.0, 0.0));
                m.push(this.vec2(0.0, args[0] ?? 1.0));
                break;
            default:
                m.push(this.vec2(args.splice(0,2)));
                m.push(this.vec2(args));
        }
        
        
        return _matrixWithProperties(m, 2);
    }
    this.mat3 = function() {
        let args = _getArgs(arguments);
        let invalidItem = _controlArgs(args);
        if(invalidItem)
            throw new InvalidMatrixInitializationError(`Invalid mat3 initialization!`, invalidItem);
        
        const m = [];
        switch(args.length) {
            case 0:
            case 1:
                m.push(this.vec3(args[0] ?? 1.0, 0.0, 0.0));
                m.push(this.vec3(0.0, args[0] ?? 1.0, 0.0));
                m.push(this.vec3(0.0, 0.0, args[0] ?? 1.0));
                break;
            default:
                m.push(this.vec3(args.splice(0,3)));
                m.push(this.vec3(args.splice(0,3)));
                m.push(this.vec3(args));
        }
        
        return _matrixWithProperties(m, 3);
    }
    this.mat4 = function() {
        let args = _getArgs(arguments);
        let invalidItem = _controlArgs(args);
        if(invalidItem)
            throw new InvalidMatrixInitializationError(`Invalid mat4 initialization!`, invalidItem);
        
        const m = [];
        switch(args.length) {
            case 0:
            case 1:
                m.push(this.vec4(args[0] ?? 1.0, 0.0, 0.0, 0.0));
                m.push(this.vec4(0.0, args[0] ?? 1.0, 0.0, 0.0));
                m.push(this.vec4(0.0, 0.0, args[0] ?? 1.0, 0.0));
                m.push(this.vec4(0.0, 0.0, 0.0, args[0] ?? 1.0));
                break;
            default:
                m.push(this.vec4(args.splice(0,4)));
                m.push(this.vec4(args.splice(0,4)));
                m.push(this.vec4(args.splice(0,4)));
                m.push(this.vec4(args));
        }
        
        return _matrixWithProperties(m, 4);
    }
    this.toArray = function(v1) {
        let args = _getArgs([v1]);
        let invalidItem = _controlArgs(args);
        
        if(invalidItem)
            throw new InvalidElementError("Invalid element in vector!", invalidItem);
        
        return args;
    }
    
    
    
    
    
    this.add = function(v1, v2) {
        let v1arr = this.toArray(v1);
        let v2arr = this.toArray(v2);
        
        if(v1arr.length != v2arr.length)
            throw new DifferentSizeOperationError("Different sizes!", "add", v1, v2);
        
        let invalidItem = _controlArgs(v1arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        invalidItem = _controlArgs(v2arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        
        let v3 = [];
        for(let i = 0; i < v1arr.length; i++)
            v3.push(v1arr[i] + v2arr[i]);
        
        if(v1.isVector && v2.isVector) {
            switch(v1.size) {
                case 2:
                    return this.vec2(v3);
                case 3:
                    return this.vec3(v3);
                case 4:
                    return this.vec4(v3);
            }
        }else if(v1.isMatrix && v2.isMatrix) {
            switch(v1.size) {
                case 2:
                    return this.mat2(v3);
                case 3:
                    return this.mat3(v3);
                case 4:
                    returnthis.mat4(v3);
            }
        } else {
            throw new InvalidTypeOperationError("Invalid types!", "add", v1, v2);
        }
    }
    this.sub = function(v1, v2) {
        let v1arr = this.toArray(v1);
        let v2arr = this.toArray(v2);
        if(v1arr.length != v2arr.length)
            throw new DifferentSizeOperationError("Different sizes!", "sub", v1, v2);
        
        let invalidItem = _controlArgs(v1arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        invalidItem = _controlArgs(v2arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        
        let v3 = [];
        for(let i = 0; i < v1arr.length; i++)
            v3.push(v1arr[i] - v2arr[i]);
        
        if(v1.isVector && v2.isVector) {
            switch(v1.size) {
                case 2:
                    return this.vec2(v3);
                case 3:
                    return this.vec3(v3);
                case 4:
                    return this.vec4(v3);
            }
        }else if(v1.isMatrix && v2.isMatrix) {
            switch(v1.size) {
                case 2:
                    return this.mat2(v3);
                case 3:
                    return this.mat3(v3);
                case 4:
                    returnthis.mat4(v3);
            }
        } else {
            throw new InvalidTypeOperationError("Invalid types!", "sub", v1, v2);
        }
    }
    this.equ = function(v1, v2) {
        let v1arr = this.toArray(v1);
        let v2arr = this.toArray(v2);
        
        if(v1arr.length != v2arr.length)
            return false;
        
        let invalidItem = _controlArgs(v1arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        invalidItem = _controlArgs(v2arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        
        if((v1.isVector && v2.isVector) || (v1.isMatrix && v2.isMatrix)) {
            for(let i = 0; i < v1arr.length; i++) {
                if(v1arr[i] != v2arr[i])
                    return false;
            }
            return true;
        } else {
            throw new InvalidTypeOperationError("Invalid types!", "equ", v1, v2);
        }
    }
    this.dot = function(v1, v2) {
        let v1arr = this.toArray(v1);
        let v2arr = this.toArray(v2);
        
        if(v1arr.length != v2arr.length)
            throw new DifferentSizeOperationError("Different sizes!", "dot", v1, v2);
        
        let invalidItem = _controlArgs(v1arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        invalidItem = _controlArgs(v2arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        
        if(v1.isVector && v2.isVector) {
            let res = 0;
            for(let i = 0; i < v1arr.length; i++)
                res += v1arr[i] * v2arr[i];
            return res;
        } else {
            throw new InvalidTypeOperationError("Invalid types!", "dot", v1, v2);
        }
    }
    this.mul = function(v1, v2) {
        let v1arr = this.toArray(v1);
        let v2arr = this.toArray(v2);
        
        if(v1.size !== v2.size && typeof v1 != "number" && typeof v2 != "number")
            throw new DifferentSizeOperationError("Different sizes!", "mul", v1, v2);
        
        let invalidItem = _controlArgs(v1arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        invalidItem = _controlArgs(v2arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        
        if(v1.isVector && v2.isVector) {
            if(v1.size == 3 && v2.size == 3)
                return this.vec3(_crossVec3(v1arr, v2arr));
            throw new InvalidTypeOperationError("Cross product with not vec3 vectors!", "mul", v1, v2);
        } else if((v1.isVector || v1.isMatrix) && typeof v2 == "number") {
            switch(v1.size) {
                case 2:
                    if(v1.isVector) return this.vec2(_mulWithConstant(v1arr, v2));
                    return this.mat2(_mulWithConstant(v1arr,v2));
                case 3:
                    if(v1.isVector)return this.vec3(_mulWithConstant(v1arr, v2));
                    return this.mat3(_mulWithConstant(v1arr,v2));
                case 4:
                    if(v1.isVector) return this.vec4(_mulWithConstant(v1arr,v2));
                    return this.mat4(_mulWithConstant(v1arr,v2));
            }
        } else if((v2.isVector || v2.isMatrix) && typeof v1 == "number") {
            switch(v1.size) {
                case 2:
                    if(v2.isVector) return this.vec2(_mulWithConstant(v2arr, v1));
                    return this.mat(_mulWithConstant(v2arr,v1));
                case 3:
                    if(v2.isVector)return this.vec3(_mulWithConstant(v2arr, v1));
                    return this.mat3(_mulWithConstant(v2arr,v1));
                case 4:
                    if(v2.isVector) return this.vec4(_mulWithConstant(v2arr, v1));
                    return this.mat4(_mulWithConstant(v2arr, v1));
            }
        } else if (v1.isMatrix && v2.isMatrix) {
            switch(v1.size) {
                case 2:
                    return this.mat2(
                                v1arr[0] * v2arr[0] + v1arr[1] * v2arr[2],
                                v1arr[0] * v2arr[1] + v1arr[1] * v2arr[3],
                                v1arr[2] * v2arr[0] + v1arr[3] * v2arr[2],
                                v1arr[2] * v2arr[1] + v1arr[3] * v2arr[3]
                            );
                case 3:
                    return this.mat3(
                                v1arr[0] * v2arr[0] + v1arr[1] * v2arr[3] + v1arr[2] * v2arr[6],
                                v1arr[0] * v2arr[1] + v1arr[1] * v2arr[4] + v1arr[2] * v2arr[7],
                                v1arr[0] * v2arr[2] + v1arr[1] * v2arr[5] + v1arr[2] * v2arr[8],
                                v1arr[3] * v2arr[0] + v1arr[4] * v2arr[3] + v1arr[5] * v2arr[6],
                                v1arr[3] * v2arr[1] + v1arr[4] * v2arr[4] + v1arr[5] * v2arr[7],
                                v1arr[3] * v2arr[2] + v1arr[4] * v2arr[5] + v1arr[5] * v2arr[8],
                                v1arr[6] * v2arr[0] + v1arr[7] * v2arr[3] + v1arr[8] * v2arr[6],
                                v1arr[6] * v2arr[1] + v1arr[7] * v2arr[4] + v1arr[8] * v2arr[7],
                                v1arr[6] * v2arr[2] + v1arr[7] * v2arr[5] + v1arr[8] * v2arr[8]
                            );
                case 4:
                    return this.mat4(
                        v1arr[0] * v2arr[0] + v1arr[1] * v2arr[4] + v1arr[2] * v2arr[8] + v1arr[3] * v2arr[12],
                        v1arr[0] * v2arr[1] + v1arr[1] * v2arr[5] + v1arr[2] * v2arr[9] + v1arr[3] * v2arr[13],
                        v1arr[0] * v2arr[2] + v1arr[1] * v2arr[6] + v1arr[2] * v2arr[10] + v1arr[3] * v2arr[14],
                        v1arr[0] * v2arr[3] + v1arr[1] * v2arr[7] + v1arr[2] * v2arr[11] + v1arr[3] * v2arr[15],
                        v1arr[4] * v2arr[0] + v1arr[5] * v2arr[4] + v1arr[6] * v2arr[8] + v1arr[7] * v2arr[12],
                        v1arr[4] * v2arr[1] + v1arr[5] * v2arr[5] + v1arr[6] * v2arr[9] + v1arr[7] * v2arr[13],
                        v1arr[4] * v2arr[2] + v1arr[5] * v2arr[6] + v1arr[6] * v2arr[10] + v1arr[7] * v2arr[14],
                        v1arr[4] * v2arr[3] + v1arr[5] * v2arr[7] + v1arr[6] * v2arr[11] + v1arr[7] * v2arr[15],
                        v1arr[8] * v2arr[0] + v1arr[9] * v2arr[4] + v1arr[10] * v2arr[8] + v1arr[11] * v2arr[12],
                        v1arr[8] * v2arr[1] + v1arr[9] * v2arr[5] + v1arr[10] * v2arr[9] + v1arr[11] * v2arr[13],
                        v1arr[8] * v2arr[2] + v1arr[9] * v2arr[6] + v1arr[10] * v2arr[10] + v1arr[11] * v2arr[14],
                        v1arr[8] * v2arr[3] + v1arr[9] * v2arr[7] + v1arr[10] * v2arr[11] + v1arr[11] * v2arr[15],
                        v1arr[12] * v2arr[0] + v1arr[13] * v2arr[4] + v1arr[14] * v2arr[8] + v1arr[15] * v2arr[12],
                        v1arr[12] * v2arr[1] + v1arr[13] * v2arr[5] + v1arr[14] * v2arr[9] + v1arr[15] * v2arr[13],
                        v1arr[12] * v2arr[2] + v1arr[13] * v2arr[6] + v1arr[14] * v2arr[10] + v1arr[15] * v2arr[14],
                        v1arr[12] * v2arr[3] + v1arr[13] * v2arr[7] + v1arr[14] * v2arr[11] + v1arr[15] * v2arr[15]
                            );
            }
        } else if(v1.isVector && v2.isMatrix) {
            switch(v1.size) {
                case 2:
                    return this.vec2(v1arr[0] * v2arr[0] + v1arr[1] * v2arr[2], v1arr[0] * v2arr[1] + v1arr[1] * v2arr[3]);
                case 3:
                    return this.vec3(
                                v1arr[0] * v2arr[0] + v1arr[1] * v2arr[3] + v1arr[2] * v2arr[6],
                                v1arr[0] * v2arr[1] + v1arr[1] * v2arr[4] + v1arr[2] * v2arr[7],
                                v1arr[0] * v2arr[2] + v1arr[1] * v2arr[5] + v1arr[2] * v2arr[8]
                            );
                case 4:
                    return this.vec4(
                                v1arr[0] * v2arr[0] + v1arr[1] * v2arr[4] + v1arr[2] * v2arr[8] + v1arr[3] * v2arr[12],
                                v1arr[0] * v2arr[1] + v1arr[1] * v2arr[5] + v1arr[2] * v2arr[9] + v1arr[3] * v2arr[13],
                                v1arr[0] * v2arr[2] + v1arr[1] * v2arr[6] + v1arr[2] * v2arr[10] + v1arr[3] * v2arr[14],
                                v1arr[0] * v2arr[3] + v1arr[1] * v2arr[7] + v1arr[2] * v2arr[11] + v1arr[3] * v2arr[15]
                            );
            }
        } else if(v1.isMatrix && v2.isVector) {
            switch(v1.size) {
                case 2:
                    return this.vec2(v2arr[0] * v1arr[0] + v2arr[1] * v1arr[1], v2arr[0] * v1arr[2] + v2arr[1] * v1arr[3]);
                case 3:
                    return this.vec3(
                                v2arr[0] * v1arr[0] + v2arr[1] * v1arr[1] + v2arr[2] * v1arr[2],
                                v2arr[0] * v1arr[3] + v2arr[1] * v1arr[4] + v2arr[2] * v1arr[5],
                                v2arr[0] * v1arr[6] + v2arr[1] * v1arr[8] + v2arr[2] * v1arr[10]
                            );
                case 4:
                    return this.vec4(
                                v2arr[0] * v1arr[0] + v2arr[1] * v1arr[1] + v2arr[2] * v1arr[2] + v2arr[3] * v1arr[3],
                                v2arr[0] * v1arr[4] + v2arr[1] * v1arr[5] + v2arr[2] * v1arr[6] + v2arr[3] * v1arr[7],
                                v2arr[0] * v1arr[8] + v2arr[1] * v1arr[9] + v2arr[2] * v1arr[10] + v2arr[3] * v1arr[11],
                                v2arr[0] * v1arr[12] + v2arr[1] * v1arr[13] + v2arr[2] * v1arr[14] + v2arr[3] * v1arr[15]
                            );
            }
        } else {
            throw new InvalidTypeOperationError("Invalid types!", "mul", v1, v2);
        }
    }
    this.tra = function(v1) {
        let v1arr = this.toArray(v1);
        
        let invalidItem = _controlArgs(v1arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        
        if(v1.isMatrix) {
            let m = [];
            for (let i = 0; i < v1.size; i++) {
                m.push([]);
                for (let j = 0; j < v1[i].size; j++) {
                    m[i].push( v1[j][i] );
                }
            }
            switch(v1.size) {
                case 2:
                    return this.mat2(m);
                case 3:
                    return this.mat3(m);
                case 4:
                    return this.mat4(m);
            }
        } else {
            throw new InvalidTypeOperationError("Invalid types!", "tra", v1, v2);
        }
    }
    this.det = function(v1) {
        let v1arr = this.toArray(v1);
        
        let invalidItem = _controlArgs(v1arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        
        if(v1.isMatrix) {
            return _det(this.toArray(v1));
        } else {
            throw new InvalidTypeOperationError("Invalid types!", "det", v1, v2);
        }
    }
    this.inv = function(v1) {
        let v1arr = this.toArray(v1);
        
        let invalidItem = _controlArgs(v1arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        
        if(v1.isMatrix) {
            switch(v1.size) {
                case 2:
                    return this.mul(this.mat2(v1arr[3], -v1arr[1], -v1arr[2], v1arr[0]), 1/_det(v1arr));
                case 3:
                    return this.mul(this.tra(this.mat3(
                            +_det([v1arr[4], v1arr[5], v1arr[7], v1arr[8]]),
                            -_det([v1arr[3], v1arr[5], v1arr[6], v1arr[8]]),
                            +_det([v1arr[3], v1arr[4], v1arr[6], v1arr[7]]),
                            -_det([v1arr[1], v1arr[2], v1arr[7], v1arr[8]]),
                            +_det([v1arr[0], v1arr[2], v1arr[6], v1arr[8]]),
                            -_det([v1arr[0], v1arr[1], v1arr[6], v1arr[7]]),
                            +_det([v1arr[1], v1arr[2], v1arr[4], v1arr[5]]),
                            -_det([v1arr[0], v1arr[2], v1arr[3], v1arr[5]]),
                            +_det([v1arr[0], v1arr[1], v1arr[3], v1arr[4]])
                            )), 1/_det(v1arr));
                case 4:
                    return this.mul(this.tra(this.mat4(
                        +_det([v1arr[5], v1arr[6], v1arr[7], 
                               v1arr[9], v1arr[10], v1arr[11],
                               v1arr[13], v1arr[14], v1arr[15]]),
                        -_det([v1arr[4], v1arr[6], v1arr[7], 
                               v1arr[8], v1arr[10], v1arr[11],
                               v1arr[12], v1arr[14], v1arr[15]]),
                        +_det([v1arr[4], v1arr[5], v1arr[7], 
                               v1arr[8], v1arr[9], v1arr[11],
                               v1arr[12], v1arr[13], v1arr[15]]),
                        -_det([v1arr[4], v1arr[5], v1arr[6], 
                               v1arr[8], v1arr[9], v1arr[10],
                               v1arr[12], v1arr[13], v1arr[14]]),
                        -_det([v1arr[1], v1arr[2], v1arr[3], 
                               v1arr[9], v1arr[10], v1arr[11],
                               v1arr[13], v1arr[14], v1arr[15]]),
                        +_det([v1arr[0], v1arr[2], v1arr[3], 
                               v1arr[8], v1arr[10], v1arr[11],
                               v1arr[12], v1arr[14], v1arr[15]]),
                        -_det([v1arr[0], v1arr[1], v1arr[3], 
                               v1arr[8], v1arr[9], v1arr[11],
                               v1arr[12], v1arr[13], v1arr[15]]),
                        +_det([v1arr[0], v1arr[1], v1arr[2], 
                               v1arr[8], v1arr[9], v1arr[10],
                               v1arr[12], v1arr[13], v1arr[14]]),
                        +_det([v1arr[1], v1arr[2], v1arr[3], 
                               v1arr[5], v1arr[6], v1arr[7],
                               v1arr[13], v1arr[14], v1arr[15]]),
                        -_det([v1arr[0], v1arr[2], v1arr[3], 
                               v1arr[4], v1arr[6], v1arr[7],
                               v1arr[12], v1arr[14], v1arr[15]]),
                        +_det([v1arr[0], v1arr[1], v1arr[3], 
                               v1arr[4], v1arr[5], v1arr[7],
                               v1arr[12], v1arr[13], v1arr[15]]),
                        -_det([v1arr[0], v1arr[1], v1arr[2], 
                               v1arr[4], v1arr[5], v1arr[6],
                               v1arr[12], v1arr[13], v1arr[14]]),
                        -_det([v1arr[1], v1arr[2], v1arr[3], 
                               v1arr[5], v1arr[6], v1arr[7],
                               v1arr[9], v1arr[10], v1arr[11]]),
                        +_det([v1arr[0], v1arr[2], v1arr[3], 
                               v1arr[4], v1arr[6], v1arr[7],
                               v1arr[8], v1arr[10], v1arr[11]]),
                        -_det([v1arr[0], v1arr[1], v1arr[3], 
                               v1arr[4], v1arr[5], v1arr[7],
                               v1arr[8], v1arr[9], v1arr[11]]),
                        +_det([v1arr[0], v1arr[1], v1arr[2], 
                               v1arr[4], v1arr[5], v1arr[6],
                               v1arr[8], v1arr[9], v1arr[10]]),
                            )), 1/_det(v1arr));
            }
        }else {
            throw new InvalidTypeOperationError("Invalid types!", "inv", v1, v2);
        }
    }
    this.neg = function(v1) {
        let v1arr = this.toArray(v1);
        
        let invalidItem = _controlArgs(v1arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        
        if(v1.isVector) {
            v1arr = _mulWithConstant(v1arr, -1);
            switch(v1.size) {
                case 2:
                    return this.vec2(v1arr);
                case 3:
                    return this.vec3(v1arr);
                case 4:
                    return this.vec4(v1arr);
            }
        } else if(v1.isMatrix) {
            v1arr = _mulWithConstant(v1arr, -1);
            switch(v1.size) {
                case 2:
                    return this.mat2(v1arr);
                case 3:
                    return this.mat3(v1arr);
                case 4:
                    return this.mat4(v1arr);
            }
        } else {
            throw new InvalidTypeOperationError("Invalid types!", "neg", v1, v2);
        }
    }
    this.len = function(v1) {
        let v1arr = this.toArray(v1);
        
        let invalidItem = _controlArgs(v1arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        
        if(v1.isVector) {
            return Math.sqrt(this.dot(v1,v1));
        } else {
            throw new InvalidTypeOperationError("Invalid types!", "len", v1);
        }
    }
    this.nor = function(v1, exLastComp=false) {
        let v1arr = this.toArray(v1);
        
        let invalidItem = _controlArgs(v1arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        
        if(v1.isVector) {
            
                
            let lastComp;
            if(exLastComp)
                lastComp = v1arr.pop();
            
            let lenOfVec = this.len(v1);
            if(lenOfVec != 0)
                v1arr = _mulWithConstant(v1arr, 1 / this.len(v1));

            if(exLastComp)
                v1arr.push(lastComp);
            
            switch(v1.size) {
                case 2:
                    return this.vec2(v1arr);
                case 3:
                    return this.vec3(v1arr);
                case 4:
                    return this.vec4(v1arr);
            }
        } else {
            throw new InvalidTypeOperationError("Invalid types!", "nor", v1, v2);
        }  
    }
    this.mix = function(v1, v2, c) {
        let v1arr = this.toArray(v1);
        let v2arr = this.toArray(v2);
        
        if(v1arr.length != v2arr.length)
            throw new DifferentSizeOperationError("Different sizes!", "dot", v1, v2);
        
        let invalidItem = _controlArgs(v1arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        invalidItem = _controlArgs(v2arr);
        if(invalidItem)
            throw new InvalidElementError("Invalid element!", invalidItem);
        
        if(v1.isVector && v2.isVector) {
            let v3 = [];
            for(let i = 0; i < v1arr.length; v3.push((1-c)*v1arr[i] + c*v2arr[i++]));
            switch(v1.size) {
                case 2:
                    return this.vec2(v3);
                case 3:
                    return this.vec3(v3);
                case 4:
                    return this.vec4(v3);
            }
        } if(v1.isMatrix && v2.isMatrix) {
             let v3 = [];
            for(let i = 0; i < v1arr.length; v3.push((1-c)*v1arr[i] + c*v2arr[i++]));
            switch(v1.size) {
                case 2:
                    return this.mat2(v3);
                case 3:
                    return this.mat3(v3);
                case 4:
                    return this.mat4(v3);
            }
        } else {
            throw new InvalidTypeOperationError("Invalid types!", "mix", v1, v2);
        } 
    }
    
    
    /* add cot to Math lib in js*/
    function userDefCot(theta) {
        return (1 / Math.tan(theta));
    }
    Math.cot = userDefCot;
    
    HandMath.prototype._handMath = this;
    
}