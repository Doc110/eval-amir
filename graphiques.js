document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('backButton');
    const communeSelect = document.getElementById('communeSelect');
    const ctxQuarterly = document.getElementById('quarterlyVaccinationChart').getContext('2d');
    const ctxAnnual = document.getElementById('annualVaccinationChart').getContext('2d');

    let quarterlyVaccinationChart, annualVaccinationChart;

    backButton.onclick = function() {
        window.location.href = 'table.html';
    };

    communeSelect.onchange = function() {
        loadChartData(communeSelect.value);
    };

    loadChartData("all");

    function loadChartData(selectedCommune) {
        const year = new URLSearchParams(window.location.search).get('year');
        const communes = ["Tighennif", "Sehailia", "Sidi Kada"];
        const vaccines = ['BCG', 'HBV', 'VPO1', 'Hexa1', 'Pneumo1', 'VPO2', 'Hexa2', 'Pneumo2', 'VPO3', 'Hexa3', 'Pneumo3', 'ROR1', 'ROR2'];
        const quarterlyLabels = ["Q1", "Q2", "Q3", "Q4"];
        const monthsPerQuarter = [
            ["January", "February", "March"],
            ["April", "May", "June"],
            ["July", "August", "September"],
            ["October", "November", "December"]
        ];

        let quarterlyVaccineData = {};
        let annualVaccineData = {};
        let totalPopulation = 0;
        vaccines.forEach(vaccine => {
            quarterlyVaccineData[vaccine] = [0, 0, 0, 0];
            annualVaccineData[vaccine] = 0;
        });

        (selectedCommune === "all" ? communes : [selectedCommune]).forEach(commune => {
            monthsPerQuarter.forEach((quarter, qIndex) => {
                quarter.forEach(month => {
                    const data = JSON.parse(localStorage.getItem(`data_${year}_${commune}_${month}`)) || {};
                    const population = parseInt(data[`births_${month}`]) - parseInt(data[`deaths_${month}`]) || 0;
                    totalPopulation += population;
                    vaccines.forEach(vaccine => {
                        const value = parseInt(data[`${vaccine}_${month}`]) || 0;
                        quarterlyVaccineData[vaccine][qIndex] += value;
                        annualVaccineData[vaccine] += value;
                    });
                });
            });
        });

        let quarterlyPercentageData = {};
        let annualPercentageData = {};
        vaccines.forEach(vaccine => {
            quarterlyPercentageData[vaccine] = quarterlyVaccineData[vaccine].map(value => ((value / totalPopulation) * 100).toFixed(2));
            annualPercentageData[vaccine] = ((annualVaccineData[vaccine] / totalPopulation) * 100).toFixed(2);
        });

        if (quarterlyVaccinationChart) {
            quarterlyVaccinationChart.destroy();
        }
        if (annualVaccinationChart) {
            annualVaccinationChart.destroy();
        }

        const vaccineColors = vaccines.map(vaccine => getRandomColor());

        quarterlyVaccinationChart = new Chart(ctxQuarterly, {
            type: 'bar',
            data: {
                labels: quarterlyLabels,
                datasets: vaccines.map((vaccine, index) => ({
                    label: vaccine,
                    data: quarterlyPercentageData[vaccine],
                    backgroundColor: vaccineColors[index]
                }))
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        annualVaccinationChart = new Chart(ctxAnnual, {
            type: 'bar',
            data: {
                labels: vaccines,
                datasets: [{
                    label: 'TCV Annuel (%)',
                    data: Object.values(annualPercentageData),
                    backgroundColor: vaccineColors
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: false
                    },
                    y: {
                        stacked: false,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
});
