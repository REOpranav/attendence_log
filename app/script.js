ZOHO.embeddedApp.on("PageLoad", async function (data) {
    // getting Current User

    let currentUser = await getCurrentUser()
    let toggleSwitch = document.getElementById("toggleSwitch");
    const checkInButton = document.getElementById('toggleText');
    const CheckInType = document.getElementById("CheckInStatus")
    const tableBody = document.getElementById("tableBody");
    const timers = document.getElementById('timer')
    const moduleAPIName = "attendancelog__Attendence_Log";

    // dark mode toggle functionality
    document.getElementById('toggleSwitch_darkMode')?.addEventListener('click', () => {
        if (document.getElementById('toggleSwitch_darkMode').checked) {
            toggleSwitch_darkMode.checked = true
            document.body.classList = 'darkMode'
            document.getElementById('tableHead').className = 'headDark'
            document.getElementById('expanding_subrow').classList.add('darkMode');
            let ele = document.getElementById('expanding_table')            
            ele.forEach(element => {
                element.classList.add('darkMode')
            });

        } else {
            toggleSwitch_darkMode.checked = false
            document.body.classList = 'lightMode'
            document.getElementById('tableHead').className = 'headLigth'
            document.getElementById('expanding_subrow').classList.remove('darkMode')
            document.getElementById('expanding_subrow').classList.add('lightMode')

            let ele = document.getElementById('expanding_table')
            ele.forEach(element => {
                element.classList.remove('darkMode')
                element.classList.add('lightMode')
            });
        }
    });

    let getAllRecords = await getAllData(currentUser)
    await tableData(tableBody, currentUser);
    getAllRecords.length > 0 && timer(timers, getAllRecords) // call the timer
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
        CheckInType.style.color = '#ff2e57'
    }

    window.addEventListener('offline', (e) => {
        showToast('Take deep breaths till the Internet reconnects', false)
    })

    window.addEventListener('online', () => {
        showToast('Internet reconnected', true);

    })

    document.getElementById('toggleSwitch')?.addEventListener('click', async () => {
        showLoading()
        let currentAddress = getAddress().then(async (val) => { // getting current location addressLa
            hideLoading()
            let currentTime = new Date().toLocaleString();
            let getAllRecords = await getAllData(currentUser)
            let recordId = getAllRecords.length > 0 ? getAllRecords[0].id : null;
            getAllRecords.length > 0 && timer(timers, getAllRecords) // call the timer

            if (checkInButton.textContent === "Check out") {
                checkInButton.innerText = "Check in"
                CheckInType.innerText = "Out"
                timers.style.visibility = 'hidden'
                CheckInType.style.color = '#ff2e57'

                const updateTheRecord = await updateCheckOut(recordId, await getAllRecords[0].attendancelog__Initail_Check_In) // If the user is checking out, we need to update the last created record            
                if (updateTheRecord.code === "SUCCESS") {
                    await addNotes(moduleAPIName, recordId, "Check Out", `${currentTime} from ${val?.loc}`)
                } else {
                    console.error("Error updating record:", updateTheRecord.message);
                }
            } else {
                await CheckInOutType(CheckInType); // checking if the user is in office or remote
                CheckInType.style.color = '#0EBC6B'
                timers.style.visibility = 'visible'

                if (getAllRecords.length > 0) {
                    if (await compareDate(getAllRecords) == false) { // checking if the last record is not from today
                        let recordCreation = await createRecord(val, currentTime, CheckInType?.textContent) // creating a new record
                        if (recordCreation.code == "SUCCESS") {
                            await addNotes(moduleAPIName, recordCreation?.details.id, "Check In", `${currentTime} from ${val?.loc}`)
                        }
                    } else {
                        const CheckInUpdate = await updateCheckIn(recordId) // updating the last created record;
                        if (CheckInUpdate.code === "SUCCESS") {
                            await addNotes(moduleAPIName, recordId, "Check In", `${currentTime} from ${val?.loc}`)
                        } else {
                            console.error("Error updating check-in time:", CheckInUpdate.message);
                        }
                    }
                } else {
                    const creatingRecord = await createRecord(val, currentTime, CheckInType?.textContent) // creating a new record
                    if (await creatingRecord.code == "SUCCESS") {
                        await addNotes(moduleAPIName, creatingRecord?.details?.id, "Check In", `${currentTime} from ${val?.loc}`)
                    }
                }
                checkInButton.innerText = "Check out"
            }
            await tableData(tableBody);
        }).catch(val => {
            hideLoading()
            toggleSwitch.checked = false
            showToast("Location access failed on this network. Kindly switch to a different network and try again.", false)
        })
    })
})

ZOHO.embeddedApp.init();