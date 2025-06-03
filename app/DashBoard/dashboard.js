const tableData = async (tableBody) => {
    let getAllRecords = await getAllData()
    if (getAllRecords.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='10'>No records found</td></tr>";
        return;
    } else {
        tableBody.innerHTML = ""; // Clear existing table data
        getAllRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="arrow">▶</span></td>
                <td>${record.Name}</td>
                <td>${record.attendancelog__Initail_Check_In}</td>
                <td>${record.attendancelog__Last_Check_Out}</td>
                <td>${record.attendancelog__Total_Worked_Hours}</td>
                <td>8 Hours</td>
                <td>${record.attendancelog__Office_In_Hours}</td>
                <td>${record.attendancelog__Remote_In_Hours}</td>
                <td>${record.attendancelog__CheckIn_Type}</td>
                <td>Day</td>
            `;

            const subRow = document.createElement('tr'); // creating the table row for sub detail of the records
            subRow.id = `details-${record.id}`;
            subRow.classList.add('sub-row');
            tableBody.appendChild(row);
            tableBody.appendChild(subRow)


            const arrow = row.querySelector('.arrow');
            arrow.addEventListener('click', async e => {
                e.stopPropagation();
                const expandedRow = document.getElementById(`details-${record.id}`);
                let notes = await getnotes('attendancelog__Attendence_Log', record.id, 'Notes')
                notes?.data ? await subTable(notes.data, expandedRow) : 'No logs'
                const expandableContent = subRow.querySelector('.expandable-content')
                expandableContent.style.maxHeight = "0px"

                if (expandableContent.classList.contains('open')) {
                    expandableContent.style.maxHeight = '0px'
                    expandableContent.classList.remove('open')
                    arrow.classList.remove('rotate');
                } else {
                    expandableContent.classList.add('open');
                    expandableContent.style.maxHeight = expandableContent.scrollHeight + 'px'
                    arrow.classList.add('rotate');
                }
            });
        });
    }
}

const subTable = async (notesData, tr) => {

    let checkIn = []
    let checkout = []
    notesData.forEach(element => {
        if (element.Note_Title == 'Check In') {
            checkIn.push(element)
        } else {
            checkout.push(element)
        }
    })

    if (checkIn.length > checkout.length) {
        let hifenObject = {
            Created_Time: '-'
        }
        checkout.unshift(hifenObject)
    }

    const td = document.createElement('td');
    td.colSpan = '10'
    td.style.padding = 0;
    td.style.border = 'none';
    const rows = await Promise.all(checkIn.map(async (rec, index) => {
        return `
    <tr class="subRow_Details">
      <td>${rec.Created_Time}</td>
      <td>${checkout[index]?.Created_Time || ''}</td>
      <td>Remote In</td>
      <td>${await calculateInterWorkedhours(rec.Created_Time, checkout[index]?.Created_Time)}</td>
      <td>${rec.Note_Content.split(',')[1] || ''}</td>
    </tr>
  `;
    }));

    td.innerHTML = `<div class="expandable-content">
                        <table class="session-table" style="margin-top: 10px;">
                            <thead>
                                <tr>
                                    <th>Check-In Time</th>
                                    <th>Check-Out Time</th>
                                    <th>Mode</th>
                                    <th>Worked Hours</th>
                                    <th>Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows.join('')}
                            </tbody>
                        </table>
                    </div>`
    tr.appendChild(td)
    return true
}

// timer for showing time current checkIn Hours
function timer(timer, getReocrds) {
    getReocrds.length > 0 && setInterval(() => {
        let currentTime = new Date();
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        let initialLogin = new Date(getReocrds[0].Created_Time);
        let diffMs = currentTime - initialLogin;
        let hours = Math.floor(diffMs / (1000 * 60 * 60));
        let minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        timer.innerHTML = `${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}