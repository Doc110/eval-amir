window.onload = function() {
    const table = document.getElementById('dataTable');
    const exportButton = document.getElementById('exportButton');
    const loadDataButton = document.getElementById('loadDataButton');
    const communeSelect = document.getElementById('communeSelect');
    const recapButton = document.getElementById('recapButton');
    const backButton = document.getElementById('backButton');
    const generateReportButton = document.getElementById('generateReportButton');
    const yearSelect = document.getElementById('yearSelect');

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const vaccines = ['BCG', 'HBV', 'VPO1', 'Hexa1', 'Pneumo1', 'VPO2', 'Hexa2', 'Pneumo2', 'VPO3', 'Hexa3', 'Pneumo3', 'ROR1', 'ROR2'];

    let quarterlyData = [];
    let totals = {
        births: 0,
        deaths: 0,
        population: 0
    };
    vaccines.forEach(vaccine => totals[vaccine] = 0);

    loadDataButton.onclick = function() {
        const year = yearSelect.value;
        const commune = communeSelect.value;
        if (commune === 'all') {
            loadRecapData(year);
        } else {
            loadData(year, commune);
        }
    };

    recapButton.onclick = function() {
        const year = yearSelect.value;
        loadRecapData(year);
    };

    backButton.onclick = function() {
        window.location.href = 'index.html';
    };

    generateReportButton.onclick = function() {
        const year = yearSelect.value;
        const commune = communeSelect.value;
        window.location.href = `graphiques.html?year=${year}&commune=${commune}`;
    };

    exportButton.onclick = function() {
        exportTableToExcel('dataTable', 'tableau_donnees');
    };

    function loadData(year, commune) {
        resetTable();
        quarterlyData = [];
        totals = {
            births: 0,
            deaths: 0,
            population: 0
        };
        vaccines.forEach(vaccine => totals[vaccine] = 0);

        months.forEach((month, index) => {
            const data = JSON.parse(localStorage.getItem(`data_${year}_${commune}_${month}`)) || {};
            const row = table.insertRow();
            row.insertCell().innerText = month;
            const births = parseInt(data[`births_${month}`]) || 0;
            const deaths = parseInt(data[`deaths_${month}`]) || 0;
            const population = births - deaths;

            row.insertCell().innerText = births;
            row.insertCell().innerText = deaths;
            row.insertCell().innerText = population;

            totals.births += births;
            totals.deaths += deaths;
            totals.population += population;

            vaccines.forEach(vaccine => {
                const value = parseInt(data[`${vaccine}_${month}`]) || 0;
                row.insertCell().innerText = value;
                totals[vaccine] += value;
            });

            quarterlyData.push({ month, births, deaths, population, data });

            if ((index + 1) % 3 === 0) {
                addQuarterlyRow(quarterlyData);
                quarterlyData = [];
            }
        });

        addTotalsRow(totals);
        addAnnualCoverageRow(totals);
    }

    function loadRecapData(year) {
        resetTable();
        quarterlyData = [];
        totals = {
            births: 0,
            deaths: 0,
            population: 0
        };
        vaccines.forEach(vaccine => totals[vaccine] = 0);

        const communes = ["Tighennif", "Sehailia", "Sidi Kada"];

        communes.forEach(commune => {
            months.forEach((month, index) => {
                const data = JSON.parse(localStorage.getItem(`data_${year}_${commune}_${month}`)) || {};
                const row = table.insertRow();
                row.insertCell().innerText = `${commune} - ${month}`;
                const births = parseInt(data[`births_${month}`]) || 0;
                const deaths = parseInt(data[`deaths_${month}`]) || 0;
                const population = births - deaths;

                row.insertCell().innerText = births;
                row.insertCell().innerText = deaths;
                row.insertCell().innerText = population;

                totals.births += births;
                totals.deaths += deaths;
                totals.population += population;

                vaccines.forEach(vaccine => {
                    const value = parseInt(data[`${vaccine}_${month}`]) || 0;
                    row.insertCell().innerText = value;
                    totals[vaccine] += value;
                });

                quarterlyData.push({ month, births, deaths, population, data });

                if ((index + 1) % 3 === 0) {
                    addQuarterlyRow(quarterlyData);
                    quarterlyData = [];
                }
            });
        });

        addTotalsRow(totals);
        addAnnualCoverageRow(totals);
    }

    function resetTable() {
        table.querySelector('tbody').innerHTML = '';
    }

    function addQuarterlyRow(quarterlyData) {
        const row = table.insertRow();
        row.insertCell().innerText = "Quarter";
        let quarterlyBirths = 0, quarterlyDeaths = 0, quarterlyPopulation = 0;
        let quarterlyVaccines = {};
        vaccines.forEach(vaccine => quarterlyVaccines[vaccine] = 0);

        quarterlyData.forEach(data => {
            quarterlyBirths += data.births;
            quarterlyDeaths += data.deaths;
            quarterlyPopulation += data.population;
            vaccines.forEach(vaccine => {
                quarterlyVaccines[vaccine] += parseInt(data.data[`${vaccine}_${data.month}`]) || 0;
            });
        });

        row.insertCell().innerText = quarterlyBirths;
        row.insertCell().innerText = quarterlyDeaths;
        row.insertCell().innerText = quarterlyPopulation;

        vaccines.forEach(vaccine => {
            const value = quarterlyVaccines[vaccine];
            const coverageRate = quarterlyPopulation ? ((value / quarterlyPopulation) * 100).toFixed(2) : 0;
            const cell = row.insertCell();
            cell.innerText = `${value} (${coverageRate}%)`;
            applyCoverageRateColor(cell, coverageRate);
        });
    }

    function addTotalsRow(totals) {
        const row = table.insertRow();
        row.insertCell().innerText = "Total";
        row.insertCell().innerText = totals.births;
        row.insertCell().innerText = totals.deaths;
        row.insertCell().innerText = totals.population;

        vaccines.forEach(vaccine => {
            row.insertCell().innerText = totals[vaccine];
        });
    }

    function addAnnualCoverageRow(totals) {
        const row = table.insertRow();
        row.insertCell().innerText = "Couverture annuelle";
        row.insertCell().innerText = "";
        row.insertCell().innerText = "";
        row.insertCell().innerText = totals.population;

        vaccines.forEach(vaccine => {
            const value = totals[vaccine];
            const coverageRate = totals.population ? ((value / totals.population) * 100).toFixed(2) : 0;
            const cell = row.insertCell();
            cell.innerText = `${value} (${coverageRate}%)`;
            applyCoverageRateColor(cell, coverageRate);
        });
    }

    function applyCoverageRateColor(cell, rate) {
        if (rate < 50) {
            cell.style.backgroundColor = 'red';
        } else if (rate >= 50 && rate < 80) {
            cell.style.backgroundColor = 'yellow';
        } else if (rate >= 80 && rate < 90) {
            cell.style.backgroundColor = 'pink';
        } else if (rate >= 90) {
            cell.style.backgroundColor = 'green';
        }
    }
};

function exportTableToExcel(tableID, filename = '') {
    var downloadLink;
    var dataType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    var tableSelect = document.getElementById(tableID);
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

    var worksheet = XLSX.utils.table_to_sheet(tableSelect);
    var workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    var excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    var blob = new Blob([excelBuffer], { type: dataType });

    downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename ? filename + '.xlsx' : 'excel_data.xlsx';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
