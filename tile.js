/*
TileSet is a set of TileType.  The Tile is an instance of a TileType
*/

function Tile(type, pos) { // constructor
    this.pos = pos || vec();// randv(-100, 100);
    this.ang = Math.random() * Math.PI * 2;
    this.type = type;
    this.touches = [];
    this.update();
}

Tile.prototype.update = function() {
    var a = this.ang;
    var p = this.pos;
    this.pointList = [];
    //this.points = '';
    for (var i = 0; i < this.type.turns.length; ++i) {
        a += this.type.turns[i] * this.config.angleUnit;
        p = trig(a).scale(this.type.moves[i] * this.type.scale).incr(p);
        this.pointList.push(p);
        //this.points += ' ' + p.x.toFixed(4) + ',' + p.y.toFixed(4);
    }
    this.transform = 'translate(' + this.pos.x.toFixed(1) + ' ' + this.pos.y.toFixed(1) + ')' +
                    ' rotate(' + degrees(this.ang).toFixed(1) + ')';
                // + ' scale(3)';
}

// Return true if this overlaps with given tile.
Tile.prototype.overlaps = function(tile) {
    return false;
}


// vector of edge
Tile.prototype.edgeVec = function(i) {
    return this.pointList[i].sub(this.edgeBase(i));
}

// base point of edge
Tile.prototype.edgeBase = function(i) {
    var n = this.pointList.length;
    return this.pointList[(i + n - 1) % n];
}

// midpoint of edge
Tile.prototype.edgeMid = function(i) {
    return this.pointList[i].add(this.edgeBase(i)).mult(0.5);
}

function TileSet() { // constructor
    var cos = Math.cos;
    var pi = Math.PI;
    this.allowRotation = true;
    this.allowReflection = false;
    this.matchSign = -1;
    this.config = {
        matchSign: -1,
        angleUnit: pi / 10
    };
    this.tileTypes = [
        new TileType('p1', [2, 8, 4, 6], [cos(pi / 5), 1, 1, 1], [2, -2, -1, 1], this.config),
        new TileType('p2', [1, 9, 2, 8], [cos(pi / 10), 1, 1, 1], [2, -1, 1, -2], this.config),
    ];
}

TileSet.prototype.pickAny = function() {
    var i = Math.floor(Math.random() * this.tileTypes.length);
    return this.tileTypes[i];
};


function TileType(nam, tur, mov, mat, conf) { // constructor
    this.scale = 20;
    this.name = '#' + nam;
    this.turns = tur;
    this.moves = mov;
    this.matches = mat;
    this.config = conf;
}
