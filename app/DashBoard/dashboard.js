const tableData = async (tableBody,) => {
    let getAllRecords = await getAllData()
    if (getAllRecords.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='10'>No records found</td></tr>";
        return;
    } else {
        tableBody.innerHTML = ""; // Clear existing table data
        getAllRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${record.Name}</td>
            <td>${record.attendancelog__Initail_Check_In}</td>
            <td>${record.attendancelog__Last_Check_Out}</td>
            <td>${record.attendancelog__Total_Worked_Hours}</td>
            <td>8 Hours</td>
            <td>${record.attendancelog__Check_out_Time}</td>
            <td>${record.attendancelog__Office_In_Hours}</td>
            <td>${record.attendancelog__Remote_In_Hours}</td>
            <td>${record.attendancelog__CheckIn_Type}</td>
            <td>Day</td>
        `;
            return tableBody.appendChild(row);
        });
    }
}