// create the new Check-In record

async function createRecord(fetchedLocation, time, checkINOutStatus) {  
    let CheckIn_time= time.split(",")[1];
    let date = time.split(",")[0]
    
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US'); // Adjust locale to match your needs

    const recordData = {
        "Name": date,
        "attendancelog__Check_In_Time": CheckIn_time,
        "attendancelog__Check_out_Time": "-",
        "attendancelog__CheckIn_Type": checkINOutStatus,
    }

    try {
        let response = await ZOHO.CRM.API.insertRecord({ Entity: "attendancelog__Attendence_Log", APIData: recordData, Trigger: ["workflow"] });
        return response.data[0].code
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}