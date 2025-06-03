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

// checking Office In or Remote In
async function CheckInOutType(CheckInStatus) {
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

// Get all records from the ZOHO CRM
async function getAllData() {
    try {
        let response = await ZOHO.CRM.API.getAllRecords({ Entity: "attendancelog__Attendence_Log", page: 1 });
        if (!response?.data) {
            if (response?.status === 204) return [];
            throw new Error(`${response.status}`);
        }
        return response?.data;
    } catch (error) {
        console.error(error)
        throw new Error(error);
    }
}

// conmpare the date of the last record with the current date
async function compareDate(getAllRecords) {
    let lastRecordDate = getAllRecords[0].Created_Time.split("T")[0];
    let currentDate = new Date().toLocaleString().split(",")[0];

    const date1 = new Date(lastRecordDate)
    const date2Parts = currentDate.split("/")

    const date2 = new Date(`${date2Parts[2]}-${date2Parts[1]}-${date2Parts[0]}`)
    // Compare them
    if (date1.getTime() === date2.getTime()) {
        return true;
    } else {
        return false;
    }
}

// adding notes while checking in or checking out
const addNotes = async (moduleName, recordID, notesTitle, notesContent) => {
    try {
        let addingNotes = await ZOHO.CRM.API.addNotes({
            Entity: moduleName,
            RecordID: recordID,
            Title: notesTitle,
            Content: notesContent
        })
        return addingNotes;
    } catch (erre) {
        throw new Error(erre);
    }
}

// get notes from the record
const getnotes = async (moduleName, recordID, relatedList) => {    
    try {
        const getNotes = await ZOHO.CRM.API.getRelatedRecords({
            Entity: moduleName,
            RecordID: recordID,
            RelatedList: relatedList,
            page: 1, per_page: 200
        })

        return getNotes;
    } catch (err) {
        return err
    }
}

// calculate worked hours from start and end time
const calculateWorkedHours = async (start, end) => {    
    const toSeconds = time => {
        const [h, m, s] = time.split(":").map(Number);
        return h * 3600 + m * 60 + s;
    };

    const totalSeconds = toSeconds(end) - toSeconds(start);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    return `${hours}h ${minutes}m`;
}