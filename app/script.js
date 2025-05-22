ZOHO.embeddedApp.on("PageLoad", async function (data) {
    const checkInButton = document.getElementById('checkInButton');
    const CheckInType = document.getElementById("CheckInStatus")

    document.getElementById('checkInButton')?.addEventListener('click', async () => {
        let currentAddress = await getAddress(); // getting current location addressL
        let currentTime = new Date().toLocaleString();
        let getAllRecords = await getAllData()
 
        Boolean(checkInButton.textContent == "Check out") ? (
            checkInButton.innerText = "Check in",
            CheckInType.innerText = "out"
        ) : (
            await CheckInOutType(CheckInType),
            await createRecord(currentAddress, currentTime, CheckInType?.textContent),
            checkInButton.innerText = "Check out"
        )
    })
})

ZOHO.embeddedApp.init();