// create the new Check-In record (Initial Check-In)
async function createRecord(fetchedLocation, time, checkINOutStatus) {

    let CheckIn_time = time.split(",")[1];
    let date = time.split(",")[0]

    const recordData = {
        "Name": date,
        "attendancelog__Initail_Check_In": CheckIn_time,
        "attendancelog__Last_Check_Out": "-",
        "attendancelog__Check_In_Time": CheckIn_time,
        "attendancelog__Check_out_Time": "-",
        "attendancelog__CheckIn_Type": checkINOutStatus,
        "attendancelog__Total_Worked_Hours": "-",
    }

    try {
        let response = await ZOHO.CRM.API.insertRecord({ Entity: "attendancelog__Attendence_Log", APIData: recordData, Trigger: ["workflow"] });
        return response.data[0]
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// Update the record (check-in)
async function updateCheckIn(lastCreatedRecordID) {
    let currentTime = new Date().toLocaleString();
    let CheckIn_time = currentTime.split(",")[1];
    let date = currentTime.split(",")[0];

    const recordData = {
        "id": lastCreatedRecordID,
        "Name": date,
        "attendancelog__Check_In_Time": CheckIn_time,
        "attendancelog__Check_out_Time": "-",
        "attendancelog__Last_Check_Out": "-",
        "attendancelog__Total_Worked_Hours": '-',
    }

    try {
        let response = await ZOHO.CRM.API.updateRecord({ Entity: "attendancelog__Attendence_Log", APIData: recordData, Trigger: ["workflow"] });
        if (response.data[0].code !== "SUCCESS") {
            throw new Error(`Error updating record: ${response.message}`);
        }
        return response.data[0]
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// update the record (check out)
async function updateCheckOut(lastCreatedRecordID, Initial_Check_In) {    
    
    let currentTime = new Date().toLocaleString();
    let CheckOut_time = currentTime.split(",")[1];
    let date = currentTime.split(",")[0];

    // Check if the lastCreatedRecord has a Tag property, if not, initialize it
    let workedHours = await calculateWorkedHours(Initial_Check_In, CheckOut_time);
    const recordData = {
        "id": lastCreatedRecordID,
        "Name": date,
        "attendancelog__Check_out_Time": CheckOut_time, // Check Out Time
        "attendancelog__Last_Check_Out": CheckOut_time, // Lasrt Check Out Time
        "attendancelog__Total_Worked_Hours": workedHours, // Total Worked Hours
    }

    console.log(recordData);
    
    try {
        let response = await ZOHO.CRM.API.updateRecord({ Entity: "attendancelog__Attendence_Log", APIData: recordData, Trigger: ["workflow"] })        
        if (response.data[0].code !== "SUCCESS") {
            throw new Error(`Error updating record: ${response.message}`);
        }
        return response.data[0]
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}