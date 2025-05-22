ZOHO.embeddedApp.on("PageLoad", async function (data) {
    let currentAddress = await  getAddress();
    
     
})
ZOHO.embeddedApp.init();