// getting Current User
async function getCurrentUser() {
    let currentUserId = await ZOHO.CRM.CONFIG.getCurrentUser().then(function (data) {
        return data.users[0].id;
    })
    return currentUserId
}

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
                reject(geo.getStatus());
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
async function getAllData(id) {
    if (id) {
        var config = {
            "select_query": "select Name, Created_Time, attendancelog__Initail_Check_In, attendancelog__Last_Check_Out, attendancelog__Check_In_Time, attendancelog__Check_out_Time, attendancelog__CheckIn_Type, attendancelog__Total_Worked_Hours from attendancelog__Attendence_Log where Owner = '" + id + "'"
        };

        try {
            let response = await ZOHO.CRM.API.coql(config);
            if (!response?.data) {
                if (response?.status === 204) return [];
                throw new Error(`${response.status}`);
            }
            
            return response?.data?.reverse()
        } catch (error) {
            console.error(error)
            throw new Error(error);
        }
    }

}

// conmpare the date of the last record with the current date
async function compareDate(getAllRecords) {
    let lastRecordDate = getAllRecords[0].Created_Time.split("T")[0];
    let currentDate = new Date().toLocaleString().split(",")[0];

    const date1 = new Date(lastRecordDate).getDate()
    const date2Parts = currentDate.split("/")
    const date2 = new Date(`${date2Parts[2]}-${date2Parts[1]}-${date2Parts[0]}`).getDate()

    // Compare them
    if (date1 == date2) {
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

    if (end) {
        const totalSeconds = toSeconds(end) - toSeconds(start);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        return hours ? `${hours}h ${minutes}m` : `${minutes}m`
    } else {
        return '-'
    }

}

//  calculate Work hout betweeen check in and check out
const calculateInterWorkedhours = async (In, Out) => {
    const InTime = In.split('T')[1].split('+')[0];
    const outTime = Out !== '-' ? Out?.split('T')[1].split('+')[0] : false
    return await calculateWorkedHours(InTime, outTime);
}

// convert ISO time to human readable formate
const convertISOtoReadanle = (ISOtime) => {
    if (ISOtime !== '-') {
        const date = new Date(ISOtime);
        const hours = date.getHours();
        const period = hours < 12 ? 'AM' : 'PM';
        const readableTimeFormate = ISOtime?.split('T')[1].split('+')[0];
        return `${readableTimeFormate} ${period}`
    } else {
        return '-'
    }

}

// toast code
function showToast(message, isSuccess = false) {
    const toast = document.querySelector('.toast');
    toast.textContent = message;
    toast.style.color = isSuccess ? '#4CAF50' : '#f44949';
    toast.classList.remove('hide');
    toast.style.visibility = 'visible';

    void toast.offsetWidth;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            toast.style.visibility = 'hidden';
        }, 200);
    }, 5 * 1000);
}

function showLoading() {
    if (document.getElementById('toggleSwitch_darkMode').checked) {
        document.getElementById('headLoading').style.backgroundColor = '#131c26'
    } else {
        document.getElementById('headLoading').style.backgroundColor = '#fff'
    }
    
    document.getElementById('headLoading').style.display = 'block'
    document.getElementById('attendanceTableSection').style.display = 'none'
}

function hideLoading() { 
    document.getElementById('headLoading').style.display = 'none'
    document.getElementById('attendanceTableSection').style.display = 'block'
}