ZOHO.embeddedApp.on("PageLoad", async function (data) {
    let toggleSwitch = document.getElementById("toggleSwitch");
    const checkInButton = document.getElementById('toggleText');
    const CheckInType = document.getElementById("CheckInStatus")
    const tableBody = document.getElementById("tableBody");
    const timers = document.getElementById('timer')
    const moduleAPIName = "attendancelog__Attendence_Log";

    // dark mode toggle functionality
    document.getElementById('darkModeChecked')?.addEventListener('change', () => {
        if (document.getElementById('darkModeChecked').checked) {
            document.body.classList = 'darkMode'
            document.getElementById('tableHead').className = 'headDark'
        } else {
            document.body.classList = 'lightMode'
            document.getElementById('tableHead').className = 'headLigth'
        }
    });

    let getAllRecords = await getAllData()
    timer(timers) // call the timer
    let recordId = getAllRecords.length > 0 ? getAllRecords[0].id : null;

    // get notes from the record
    let notesData = await getnotes(moduleAPIName, recordId, "Notes");
    if (notesData.status !== 204 && notesData.code !== '500') {
        if (await notesData?.data[0]?.Note_Title === 'Check In') {
            toggleSwitch.checked = true
            checkInButton.innerText = "Check out"
            timers.style.visibility = 'visible'
            CheckInType.style.color = '#0EBC6B'
            await CheckInOutType(CheckInType);
        } else {
            checkInButton.innerText = "Check In";
            CheckInType.innerText = "Out";
            CheckInType.style.color = '#ff2e57'
            timers.style.visibility = 'hidden'
        }
    } else {
        checkInButton.innerText = "Check In";
        CheckInType.innerText = "Out";
    }

    await tableData(tableBody, getAllRecords);
    document.getElementById('toggleSwitch')?.addEventListener('click', async () => {
        let currentAddress = await getAddress(); // getting current location addressL
        let currentTime = new Date().toLocaleString();

        if (checkInButton.textContent === "Check out") {
            checkInButton.innerText = "Check in";
            CheckInType.innerText = "Out";
            timers.style.visibility = 'hidden'
            CheckInType.style.color = '#ff2e57'

            const updateTheRecord = await updateCheckOut(recordId, getAllRecords[0].attendancelog__Initail_Check_In) // If the user is checking out, we need to update the last created record
            if (updateTheRecord.code === "SUCCESS") {
                await addAndRetriveNotes([moduleAPIName, recordId, "Check Out", `${currentTime} from ${currentAddress?.loc}`], ["Notes"])
                console.log("Record updated successfully:");
            } else {
                console.error("Error updating record:", updateTheRecord.message);
            }
        } else {
            checkInButton.innerText = "Check out"
            await CheckInOutType(CheckInType); // checking if the user is in office or remote
            CheckInType.style.color = '#0EBC6B'
            timers.style.visibility = 'visible'

            if (getAllRecords.length > 0) {
                if (await compareDate(getAllRecords) === false) { // checking if the last record is not from today
                    let recordCreation = await createRecord(currentAddress, currentTime, CheckInType?.textContent) // creating a new record
                    if (recordCreation.code == "SUCCESS") {
                        await addAndRetriveNotes([moduleAPIName, recordCreation?.details.id, "Check In", `${currentTime} from ${currentAddress?.loc}`], ["Notes"])
                    }
                } else {
                    const CheckInUpdate = await updateCheckIn(recordId) // updating the last created record;
                    if (CheckInUpdate.code === "SUCCESS") {
                        await addAndRetriveNotes([moduleAPIName, recordId, "Check In", `${currentTime} from ${currentAddress?.loc}`], ["Notes"])
                        console.log("Check-in time updated successfully:");
                    } else {
                        console.error("Error updating check-in time:", CheckInUpdate.message);
                    }
                }
            } else {
                const creatingRecord = await createRecord(currentAddress, currentTime, CheckInType?.textContent) // creating a new record
                if (await creatingRecord.code == "SUCCESS") {
                    await addAndRetriveNotes([moduleAPIName, creatingRecord?.details?.id, "Check In", `${currentTime} from ${currentAddress?.loc}`], ["Notes"])
                }
            }
        }
        await tableData(tableBody);
    })
})

ZOHO.embeddedApp.init();