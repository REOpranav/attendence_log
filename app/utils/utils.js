// This is Baidu map API 
function getAddress() { // getting the current location address
    return new Promise((resolve, reject) => {
        let geo = new BMap.Geolocation();
        let geoCoder = new BMap.Geocoder();

        geo.getCurrentPosition((data) => {
            if (geo.getStatus() === 0) {
                geoCoder.getLocation(data.point, (rs) => {
                    resolve({
                        lat: data.latitude,
                        lng: data.longitude,
                        loc: rs.address,
                        accuracy: data.accuracy
                    });
                });
            } else {
                reject(new Error("Failed to get current position"));
            }
        }, {
            enableHighAccuracy: true,
        });
    });
}

// check in check out status
async function CheckInOutStatus(CheckInStatus) {
    let fetchedGeoCoding = await getAddress()

    const lat = 12.500992;
    const lng = 80.1538048;

    // Calculate offsets for 50m x 50m box
    const latOffset = (25 / 111000); // ≈ 0.000225
    const lngOffset = (25 / (111000 * Math.cos(lat * Math.PI / 180)));

    const sw = new BMap.Point(lng - lngOffset, lat - latOffset);
    const ne = new BMap.Point(lng + lngOffset, lat + latOffset);
    const bounds = new BMap.Bounds(sw, ne);
    const point = new BMap.Point(fetchedGeoCoding.lng, fetchedGeoCoding.lat); // current point

    if (bounds.containsPoint(point)) { // check if your location is inside
        CheckInStatus.innerText = "Office In"
    } else {
        CheckInStatus.innerText = "Remote In";
    }
    let CheckInOutStatus = CheckInStatus.innerText === "Office In" ? "Office In" : "Remote In";
    return CheckInOutStatus;
}