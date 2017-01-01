//-----------------------------
// vector functions
//

function vec(x, y) { // FACTORY
    return new Vec(x, y);
}

var Vec = function(x, y) { // CONSTRUCTOR
    this.x = x || 0;
    this.y = y || 0;
};

Vec.prototype = {
    constructor: Vec,
    toString: function() {
        return "(x: " + approx(this.x) + ", y: " + approx(this.y) + ")";
    },
    set: function(a, b) {
        this.x = a || 0;
        this.y = b || 0;
        return this;
    },
    dot: function(v) {
        return dot(this, v);
    },
    len2: function() {
        return len2(this);
    },
    len: function() {
        return len(this);
    },
    recip: function() {
        return recip(this);
    },
    mult: function(a) {
        return mult(this, a);
    },
    add: function(v) {
        return add(this, v);
    },
    sub: function(v) {
        return sub(this, v);
    },
    scale: function(a) {
        return scale(this, a);
    },
    incr: function(a) {
        return incr(this, a);
    },
    decr: function(a) {
        return decr(this, a);
    },
    rotate: function(v) {
        return rotate(this, v);
    },
    cross: function(u) {
        return cross(this, u);
    },
    dir: function() {
        return dir(this);
    }
};

function cross(v, u) {
    return rot90(v).dot(u);
}

function rot90(v) {
    return vec(-v.y, v.x);
}

function f2vec(a) {
    // convert float to vec, if it isn't already
    if (isaVec(a)) return a;
    return vec(a, a);
}

function isaVec(v) {
    return v != null && typeof v === 'object' && v.constructor.name === 'Vec';
}

function dot(u, v) {
    return u.x * v.x + u.y * v.y;
}

function len2(v) {
    return dot(v, v);
}

function len(v) {
    return Math.sqrt(len2(v));
}

function recip(v) {
    return vec(1/v.x, 1/v.y);
}

function mult(v, a) {
    var u = f2vec(a);
    return vec(v.x * u.x, v.y * u.y);
}

function add(u, v) {
    return vec(u.x + v.x, u.y + v.y);
}

function sub(u, v) {
    return vec(u.x - v.x, u.y - v.y);
}

function scale(v, a) {
    var u = f2vec(a);
    v.x *= u.x;
    v.y *= u.y;
    return v;
}

function incr(u, v) {
    u.x += v.x;
    u.y += v.y;
    return u;
}

function decr(u, v) {
    u.x -= v.x;
    u.y -= v.y;
    return u;
}

function dir(v) {
    var a = len(v);
    return a > 1e-7 ? mult(v, 1 / a) : v;
}

function rotate(v, a) {
    var t = trig(-a);
    return vec(t.dot(v), t.cross(v));
}

// The angle to rotate from u to v.
function angleBetween(u, v) {
    return Math.asin(cross(u.dir(), v.dir()));
}

function rand(a, b) {
    return Math.random() * (b - a) + a;
}

function randv(a, b) {
    a = a == null ? 0 : a;
    b = b == null ? 1 : b;
    return vec(rand(a, b), rand(a, b));
}

function trig(a) {
    return vec(Math.cos(a), Math.sin(a));
}

function transform(v, offset, rot, scalev) {
    return v.add(offset).rotate(rot).scale(scalev || 1);
}

function inverseTransform(v, offset, rot, scalev) {
    return v.scale(scalev ? vec(1/scalev.x, 1/scalev.y) : 1).rotate(-rot).sub(offset);
}

function approx(a, numdigits) {
    numdigits = numdigits || 5;
    var f = Math.abs(a);
    if (f < 1e-18) return 0;
    var c = Math.pow(10, Math.round(Math.log10(f)));
    var m = (a / c).toFixed(numdigits) * c;
    return m;
}

// Converts from degrees to radians.
function radians(degrees) {
    return degrees * Math.PI / 180;
}

// Converts from radians to degrees.
function degrees(radians) {
    return radians * 180 / Math.PI;
}


// the end



//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//  testing
function testv() {
    var v = randv(1, 5);

    var u = randv();

    var g = new Vec(3, 4);

    document.getElementById('res').innerHTML = '';

    function log(msg) {
        document.getElementById('res').innerHTML += msg + '\n';
    }

    /*    log(v);
        log(u);
        log(g);
        log(g.mult(2));
        log(g.add(v));
        log(add(g, v));
        log(mult(g, v));
        log(dir(g));
        log(g.dir());
        log(v.len());
        log(len(v));
        log(g.dot(v));
        log(v.dot(g));
        log(trig(1));
        log(cross(vec(1,0),vec(0,-1)));
        log(rotate(g, 0));
        log(rotate(g, Math.PI / 2));
        log(rotate(g, -Math.PI / 2));
        log(rotate(g, Math.PI));
        log(rotate(g, Math.PI / 6));
        */

    var t = angleBetween(g, vec(5, 0));
    log(t);
    log(g.rotate(t));

}