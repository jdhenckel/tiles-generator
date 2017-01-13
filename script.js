// Code goes here

angular.module('myApp', []).controller('myCtrl', myCtrl);

function myCtrl($scope) {
    var grab = null;
    var mousePos = null;
    var snap = null;
    var viewAngle = 0;
    var viewOffset = vec(150, 150);
    var viewScale = vec(20, -20);
    var lastv = vec();
    var firstBorderTile = 0;

    $scope.name = 'hello';
    $scope.tileList = [];
    $scope.frame = 0;
    $scope.tileSet = new TileSet();
    $scope.lines = []; // pairs of points for debugging
    $scope.edgeLines = []; // pairs of points for debugging

    setViewTransform();

    for (var i = 0; i < 2; ++i) {
        var t = new Tile($scope.tileSet.pickAny());
        $scope.tileList.push(t);
    }
    setInterval(animate, 20);

    // ****   MAIN LOOP    ****
    function animate() {
        var list = $scope.tileList;
        $scope.frame++;

        if (snap && !grab) {
            var d = snap.targetPos.sub(snap.tile1.pos);
            if (d.len() > 3) {
                snap.tile1.pos.incr(d.mult(.5));
                snap.tile1.ang += (snap.targetAng - snap.tile1.ang) * .5;
                snap.tile1.update();
            } else {
                placeTile(snap);
                snap = null;
            }
            $scope.lines = [];
        }
        $scope.$apply();
    }


    function addBorderTile() {
        var match = firstBorderEdge();
        if (match) {
            if (!createMatchTile(match) || !placeTile(match)) {
                firstBorderTile++;
                $scope.tileList.pop();
            }
            else {
                placeTile(match);
            }
        }
    }

    function createMatchTile(match) {
        var t = match.tile1.type.matches[match.edge1] * $scope.tileSet.matchSign;
        var typ = $scope.tileSet.tileTypes;
        for (var i = 0; i < typ.length; ++i) {
            for (var j = 0; j < typ[i].matches.length; ++j) {
                if (typ[i].matches[j] == t) {
                    match.tile2 = new Tile(typ);
                    $scope.tileList.push(match.tile2);
                    match.edge2 = j;
                    match.tile2.update();
                    var v1 = match.tile1.edgeVec(match.edge1);
                    match.m1 = match.tile1.edgeMid(match.edge1)
                    var v2 = match.tile2.edgeVec(j);
                    match.m2 = match.tile2.edgeMid(j)
                    var a = angleBetween(v1, v2);
                    var p1 = match.m2.sub(match.m1.rotate(a));
                    match.targetAng = a;
                    match.targetPos = p1;
                    return true;
                }
            }
        }
        return false;
    }

    function firstBorderEdge() {
        for (; firstBorderTile < $scope.tileList.length; firstBorderTile++) {
            for (var j = 0; j < $scope.tileList[firstBorderTile].pointList.length; ++j) {
                if ($scope.tileList[firstBorderTile].touches[j] == null) {
                    return {
                        tile1: $scope.tileList[firstBorderTile],
                        edge1: j
                    };
                }
            }
        }
        return null;
    }

    function placeTile(match) {
        match.tile1.pos = match.targetPos;
        match.tile1.ang = match.targetAng;
        match.tile1.update();

        // resolve any edge touches
        match.tile1.touches[match.edge1] = match.tile2;
        match.tile2.touches[match.edge2] = match.tile1;

        for (var i = 0; i < $scope.tileList.length; ++i) {
            var tt = $scope.tileList[i];
            if (tt != match.tile1 && tt != match.tile2) {
                // TODO -- test distance to centers. for efficiency..
                // Test tile overlaps with any others
                if (overlapShape(match.tile1.pointList, tt.pointList))
                    return; // DO NOT PLACE
                // Test any illegal touches
                if (illegalTouch(match.tile1, tt))
                // tODO - what to do if illegal touch?!?
                    match.tile1.pos = vrand(50, 350);
                match.tile1.update();
                return; // DO NOT PLACE
            }
        }

        // todo - add edgelines for all touching edges
        $scope.edgeLines = [];
        for (var i = 0; i < $scope.tileList.length; ++i) {
            var t1 = $scope.tileList[i];
            var lastp = t1.pointList[t1.pointList.length - 1];
            for (var j = 0; j < t1.pointList.length; ++j) {
                if (t1.touches[j]) {
                    var m = lastp.add(t1.pointList[j].sub(lastp).mult(.4));
                    $scope.edgeLines.push([lastp, m]);
                }
                lastp = t1.pointList[j];
            }
        }
    }

    function overlapShape(list1, list2) {
        return false;
    }

    function illegalTouch(t1, t2) {
        // this ADDS touches if any are found
        var small = .01;
        var lasti = t1.pointList[t1.pointList.length - 1];
        for (var i = 0; i < t1.pointList.length; ++i) {
            var match1 = t1.type.matches[i] * $scope.tileSet.matchSign;
            var lastj = t2.pointList[t2.pointList.length - 1];
            for (var j = 0; j < t2.pointList.length; ++j) {
                if (lasti.sub(t2.pointList[j]).len2() < small &&
                    lastj.sub(t1.pointList[i]).len2() < small) {
                    if (match1 != t2.type.matches[j])
                        return true;
                    // legal touch
                    t1.touches[i] = t2;
                    t2.touches[j] = t1;
                }
                lastj = t2.pointList[j];
            }
            lasti = t1.pointList[i];
        }
        return false;
    }

    $scope.keyDown = function(ev) {
        if (ev.key == 'a' && grab) {
            grab.ang += .1;
            grab.update();
        } else if (ev.key == 'd' && grab) {
            grab.ang -= .1;
            grab.update();
        } else if (ev.key == 'r') {
            // This will open the debugger in chrome
            debugger;
        } else if (ev.key == 'w') {
            viewOffset.y += 10;
        } else if (ev.key == 'a') {
            viewOffset.x += 10;
        } else if (ev.key == 's') {
            viewOffset.y -= 10;
        } else if (ev.key == 'd') {
            viewOffset.x -= 10;
        } else if (ev.key == 'z') {
            viewScale.scale(1.18920712);
        } else if (ev.key == 'x') {
            viewScale.scale(1 / 1.18920712);
        } else if (ev.key == 'q') {
            viewAngle -= .1;
        } else if (ev.key == 'e') {
            viewAngle += .1;
        } else if (ev.key >= '1' && ev.key <= '9') {
            var i = ev.key - '1';
            var typeList = $scope.tileSet.tileTypes;
            if (i < typeList.length) {
                if (grab) {
                    grab.type = typeList[i];
                } else {
                    grab = new Tile(typeList[i]);
                    $scope.tileList.push(grab);
                    grab.update();
                }
            }
        }
        setViewTransform();
    };

    $scope.keyUp = function(ev) {};

    $scope.mouseDown = function(ev) {
        mousePos = getWorldPos(vec(ev.offsetX, ev.offsetY));
        setFlags(ev);
        var dist = 20;
        grab = null
        for (var i = 0; i < $scope.tileList.length; ++i) {
            var v = mousePos.sub($scope.tileList[i].pos);
            var d = v.len();
            if (d < dist) {
                dist = d;
                grab = $scope.tileList[i];
                lastv = v.dir();
            }
        }
        removeTouches(grab);
        $scope.mouseMove(ev);
    };

    function setFlags(ev) {
        mouseFlags = ev.buttons;   // 1,2,4,8,16
        mouseFlags += ev.shiftKey ? 32 : 0;
        mouseFlags += ev.ctrlKey ? 64 : 0;
        mouseFlags += ev.altKey ? 128 : 0;
        mouseFlags += ev.metaKey ? 256 : 0;
        $scope.msg = mousePos + ' ' + mouseFlags;
    }

    function getWorldPos(pos) {
        return pos.sub(viewOffset).rotate(-viewAngle).scale(viewScale.recip());
    }

    function getDevicePos(pos) {
        return pos.scale(viewScale).rotate(viewAngle).add(viewOffset);
    }

    function setViewTransform() {
        $scope.viewTransform = 'translate(' + approx(viewOffset.x) + ', ' + approx(viewOffset.y) + ')';
        if (Math.abs(viewAngle) > 0.02) {
            $scope.viewTransform += ' rotate(' + degrees(viewAngle).toFixed(1) + ')';
        }
        $scope.viewTransform += ' scale(' + approx(viewScale.x) + ', ' + approx(viewScale.y) + ')';
    }

    function removeTouches(tile) {
        if (!tile) return;
        for (var i = 0; i < tile.touches.length; ++i) {
            if (tile.touches[i]) {
                arrayReplaceAll(tile.touches[i].touches, tile, null);
                tile.touches[i] = null;
            }
        }
    }


    function arrayReplaceAll(arr, oldval, newval) {
        for (var i = 0; i < arr.length; ++i) {
            if (arr[i] === oldval) arr[i] = newval;
        }
    }


    $scope.mouseUp = function(ev) {
        setFlags(ev);
        grab = null;
        $scope.edgeLines = [];
        document.getElementById("mysvg").focus();
    };


    $scope.mouseMove = function(ev) {
        mousePos = getWorldPos(vec(ev.offsetX, ev.offsetY));
        $scope.msg = mousePos + ' ' + mouseFlags;
        if (grab) {
            var v = mousePos.sub(grab.pos);
            var n = v.len();
            v = v.dir();
            grab.pos.incr(v.scale(Math.min(10, 0.7 * n)));
            grab.ang += lastv.cross(v) * .01;
            grab.update();
            lastv = v;
            snapToNearest(grab);
        }
    };


    function snapToNearest(tile) {
        var bestMatch = {
            dist: 50
        };

        for (var i = 0; i < $scope.tileList.length; ++i) {
            var other = $scope.tileList[i];
            if (tile !== other) {
                var match = findMatch(tile, other, bestMatch.dist);
                if (match) {
                    bestMatch = match;
                }
            }
        }
        snap = null;

        // Snap the tile to the best match
        $scope.lines = [];
        if (bestMatch.tile1) {
            $scope.lines.push([bestMatch.m1, bestMatch.m2]);
            //$scope.lines.push([bestMatch.tile1.pos, bestMatch.targetPos]);
            snap = bestMatch;
            //  $scope.msg = bestMatch.tile1.type.matches[bestMatch.edge1] + ' ' + bestMatch.tile2.type.matches[bestMatch.edge2];

        }
    }


    function findMatch(t1, t2, bestd) {
        var result = null;
        var lasti = t1.pointList[t1.pointList.length - 1];
        for (var i = 0; i < t1.pointList.length; ++i) {
            var v1 = lasti.sub(t1.pointList[i]);
            var m1 = lasti.add(v1.mult(-0.5));
            var match1 = t1.type.matches[i] * $scope.tileSet.matchSign;
            var lastj = t2.pointList[t2.pointList.length - 1];
            for (var j = 0; j < t2.pointList.length; ++j) {
                var v2 = t2.pointList[j].sub(lastj);
                if (v1.dot(v2) > 0 && match1 == t2.type.matches[j] && !t2.touches[j]) {
                    var m2 = lastj.add(v2.mult(0.5));
                    var d = (m1.sub(m2)).len();
                    if (d < bestd) {
                        bestd = d;
                        var a = angleBetween(v1, v2);
                        var p1 = m2.add(t1.pos.sub(m1).rotate(a));
                        result = {
                            dist: d,
                            edge1: i,
                            edge2: j,
                            m1: m1,
                            m2: m2,
                            tile1: t1,
                            tile2: t2,
                            targetAng: t1.ang + a,
                            targetPos: p1
                        };
                    }
                }
                lastj = t2.pointList[j];
            }
            lasti = t1.pointList[i];
        }
        return result;
    }


}
