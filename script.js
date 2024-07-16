let currentMonthIndex = 0;
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = Array.from({ length: 41 }, (_, i) => 2020 + i);

document.addEventListener('DOMContentLoaded', function() {
    const yearSelect = document.getElementById('year');
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    document.getElementById('dataForm').addEventListener('submit', function(event) {
        event.preventDefault();
        saveCurrentMonthData();
        alert('Données enregistrées avec succès !');
        window.location.href = 'table.html';
    });

    document.getElementById('month').addEventListener('change', showFields);
    showFields();
});

function showFields() {
    const month = document.getElementById('month').value;
    const dynamicFields = document.getElementById('dynamicFields');
    dynamicFields.innerHTML = '';

    if (month) {
        const fields = [
            { label: 'Naissances', name: `births_${month}` },
            { label: 'Décès', name: `deaths_${month}` },
            { label: 'BCG', name: `BCG_${month}` },
            { label: 'HBV', name: `HBV_${month}` },
            { label: 'VPO1', name: `VPO1_${month}` },
            { label: 'Hexa1', name: `Hexa1_${month}` },
            { label: 'Pneumo1', name: `Pneumo1_${month}` },
            { label: 'VPO2', name: `VPO2_${month}` },
            { label: 'Hexa2', name: `Hexa2_${month}` },
            { label: 'Pneumo2', name: `Pneumo2_${month}` },
            { label: 'VPO3', name: `VPO3_${month}` },
            { label: 'Hexa3', name: `Hexa3_${month}` },
            { label: 'Pneumo3', name: `Pneumo3_${month}` },
            { label: 'ROR1', name: `ROR1_${month}` },
            { label: 'ROR2', name: `ROR2_${month}` }
        ];

        fields.forEach(field => {
            const div = document.createElement('div');
            div.innerHTML = `<label for="${field.name}">${field.label}:</label>
                             <input type="text" id="${field.name}" name="${field.name}">`;
            dynamicFields.appendChild(div);
        });

        updateNavigationButtons();
    }
}

function updateNavigationButtons() {
    const navigationButtons = document.getElementById('navigationButtons');
    navigationButtons.innerHTML = '';

    if (currentMonthIndex < months.length - 1) {
        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        nextButton.onclick = function(event) {
            event.preventDefault(); // Prevent form submission
            saveCurrentMonthData();
            currentMonthIndex++;
            document.getElementById('month').value = months[currentMonthIndex];
            showFields();
        };
        navigationButtons.appendChild(nextButton);
    }
    
    if (currentMonthIndex > 0) {
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Previous';
        prevButton.onclick = function(event) {
            event.preventDefault(); // Prevent form submission
            currentMonthIndex--;
            document.getElementById('month').value = months[currentMonthIndex];
            showFields();
        };
        navigationButtons.appendChild(prevButton);
    }
    
    const submitButton = document.createElement('button');
    submitButton.innerText = 'Submit';
    submitButton.type = 'submit';
    submitButton.onclick = function(event) {
        event.preventDefault(); // Prevent form submission
        saveCurrentMonthData();
        alert('Données enregistrées avec succès !');
        window.location.href = 'table.html';
    };
    navigationButtons.appendChild(submitButton);
}

function saveCurrentMonthData() {
    const month = months[currentMonthIndex];
    const year = document.getElementById('year').value;
    const commune = document.getElementById('commune').value;
    const fields = [
        `births_${month}`,
        `deaths_${month}`,
        `BCG_${month}`,
        `HBV_${month}`,
        `VPO1_${month}`,
        `Hexa1_${month}`,
        `Pneumo1_${month}`,
        `VPO2_${month}`,
        `Hexa2_${month}`,
        `Pneumo2_${month}`,
        `VPO3_${month}`,
        `Hexa3_${month}`,
        `Pneumo3_${month}`,
        `ROR1_${month}`,
        `ROR2_${month}`
    ];

    const data = { year, commune };
    fields.forEach(field => {
        data[field] = document.getElementById(field).value;
    });

    localStorage.setItem(`data_${year}_${commune}_${month}`, JSON.stringify(data));
}
