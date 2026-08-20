/**
 * Ray-casting algorithm to determine if a point is inside a polygon
 * @param {Object} point {lat, lng}
 * @param {Array} vs Polygon points [{lat, lng}, ...]
 */
function isInside(point, vs) {
    const x = point.lat, y = point.lng;
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i].lat, yi = vs[i].lng;
        const xj = vs[j].lat, yj = vs[j].lng;

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

/**
 * Resolves which zone a GPS point belongs to from a list of zones.
 * @param {Number} latitude
 * @param {Number} longitude
 * @param {Array} zones List of Zone objects from DB
 * @returns {Object|null} The zone object if found
 */
const resolveZone = (latitude, longitude, zones) => {
    if (!latitude || !longitude || !zones || zones.length === 0) return null;

    for (const zone of zones) {
        if (isInside({ lat: latitude, lng: longitude }, zone.polygon)) {
            return zone;
        }
    }

    return null;
};

module.exports = { resolveZone, isInside };
