ZOHO.embeddedApp.on("PageLoad", async function (data) {
    const checkInButton = document.getElementById('toggleText');
    const CheckInType = document.getElementById("CheckInStatus")
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

    document.getElementById('toggleSwitch')?.addEventListener('click', async () => {
        let currentAddress = await getAddress(); // getting current location addressL
        let currentTime = new Date().toLocaleString();
        let getAllRecords = await getAllData()

        if (checkInButton.textContent === "Check out") {
            checkInButton.innerText = "Check in";
            CheckInType.innerText = "out";

            // If the user is checking out, we need to update the last created record
            const updateTheRecord = await updateCheckOut(getAllRecords[0])
            if (updateTheRecord.code === "SUCCESS") {
                await addingNotes(moduleAPIName, getAllRecords[0].id, "Check Out", `Checked out at ${currentTime} from ${currentAddress}`);
                await getnotes(moduleAPIName, getAllRecords[0].id, "Notes").then((response) => {
                    return console.log(response);
                })
                console.log("Record updated successfully:", updateTheRecord.data[0]);
            } else {
                console.error("Error updating record:", updateTheRecord.message);
            }
        } else {
            checkInButton.innerText = "Check out";
            await CheckInOutType(CheckInType); // checking if the user is in office or remote

            if (getAllRecords.length > 0) {
                if (await compareDate(getAllRecords) === false) { // checking if the last record is not from today
                    let recordCreation = await createRecord(currentAddress, currentTime, CheckInType?.textContent) // creating a new record
                    if (recordCreation.code == "SUCCESS") {
                        await addingNotes(moduleAPIName, recordCreation?.details.id, "Check In", `Checked in at ${currentTime} from ${currentAddress}`);
                        await getnotes(moduleAPIName, recordCreation?.details.id, "Notes").then((response) => {
                            return console.log(response);
                        })
                    }
                } else {
                    const CheckInUpdate = await updateCheckIn(getAllRecords[0]);
                    if (CheckInUpdate.code === "SUCCESS") {
                        await addingNotes(moduleAPIName, getAllRecords[0].id, "Check In", `Checked in at ${currentTime} from ${currentAddress}`);
                        await getnotes(moduleAPIName, getAllRecords[0].id, "Notes").then((response) => {
                            return console.log(response);
                        })
                        console.log("Check-in time updated successfully:");
                    } else {
                        console.error("Error updating check-in time:", CheckInUpdate.message);
                    }
                }
            } else {
                const creatingRecord = await createRecord(currentAddress, currentTime, CheckInType?.textContent) // creating a new record
                if (await creatingRecord.code == "SUCCESS") {
                    await addingNotes(moduleAPIName, creatingRecord?.details?.id, "Check In", `Checked in at ${currentTime} from ${currentAddress}`);
                    await getnotes(moduleAPIName, creatingRecord?.details?.id, "Notes").then((response) => {
                        return console.log(response);
                    })
                }
            }
        }
    })
})

ZOHO.embeddedApp.init();