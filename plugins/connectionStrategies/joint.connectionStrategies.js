(function(joint, util) {

    function abs2rel(value, max) {

        if (max === 0) return '0%';
        return Math.round(value / max * 100) + '%';
    }

    function pin(relative) {

        return function(end, view, magnet, coords) {
            var fn = (view.isNodeConnection(magnet)) ? pinnedLinkEnd : pinnedElementEnd;
            return fn(relative, end, view, magnet, coords);
        };
    }

    function pinnedElementEnd(relative, end, view, magnet, coords) {

        var angle = view.model.angle();
        var bbox = view.getNodeUnrotatedBBox(magnet);
        var origin = view.model.getBBox().center();
        coords.rotate(origin, angle);
        var dx = coords.x - bbox.x;
        var dy = coords.y - bbox.y;

        if (relative) {
            dx = abs2rel(dx, bbox.width);
            dy = abs2rel(dy, bbox.height);
        }

        end.anchor = {
            name: 'topLeft',
            args: {
                dx: dx,
                dy: dy,
                rotate: true
            }
        };

        return end;
    }

    function pinnedLinkEnd(relative, end, view, _magnet, coords) {

        var connection = view.getConnection();
        if (!connection) return end;
        var length = connection.closestPointLength(coords);
        if (relative) {
            var totalLength = connection.length();
            end.anchor = {
                name: 'connectionRatio',
                args: {
                    ratio: length / totalLength
                }
            };
        } else {
            end.anchor = {
                name: 'connectionLength',
                args: {
                    length: length
                }
            };
        }
        return end;
    }

    joint.connectionStrategies = {
        useDefaults: util.noop,
        pinAbsolute: pin(false),
        pinRelative: pin(true)
    };

})(joint, joint.util);
