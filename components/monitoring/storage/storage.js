/*
*    StatusPilatus: Monitor your PC like never before!
*    Copyright (C) 2017 PilatusDevs
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";

/*
* Config for the usage chart
*/
var configDiskUsage = {
    type: "line",
    data: {
        datasets: [{
            label: "Total disk usage (Mb/sec)",
            backgroundColor: "#c1cc66",
            borderColor: "#c1cc66",
            fill: false,
        }]
    },
    options: {
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: "Usage"
                }
            }],
            yAxes: [{
                ticks:{
                    suggestedMin: 0,
                    beginAtZero: true
                },
                display: true,
                scaleLabel: {
                    display: false,
                    labelString: "Value"
                }
            }]
        }
    }
};

/**
* Called once to initiate the page
*/
function initStorage() {
    initStorageUsage();

    /* make the chart */
    var ctx1 = document.getElementById("canvasDiskUsage").getContext("2d");
    window.diskUsage = new Chart(ctx1, configDiskUsage);
}

/**
* Called from app.js
*/
function refreshStorage() {
    console.log("HDD refresh call");
    refreshDiskUsage();
}

function refreshDiskUsage(){
  si.fsStats()
  .then((data) => {
    var usageMb = ((data.tx_sec / (1024*1024)).toFixed(2));
    console.log(data);
    /* update the graph */
    configDiskUsage.data.labels.push("");
    configDiskUsage.data.datasets.forEach(function(dataset) {
        dataset.data.push(usageMb);
        /* Delete a value at the beginning of the graph to make it 30 items */
        if (dataset.data.length > graphWidth()) {
            dataset.data.splice(0, 1);
            configDiskUsage.data.labels.splice(0, 1);
        }
    });
    window.diskUsage.update();
  });
}

/**
* Make all the progess-bars for all the drives.
* it explains itself
*/
function initStorageUsage() {
    si.fsSize()
    .then(data => {
        data.forEach(drive => {
            let size = formatSize(drive.size);
            let used = formatSize(drive.size-drive.used);
            let html = `<h3>Disk ${drive.mount}<small> ${used[0].toFixed(2)+used[1]} free of ${size[0].toFixed(2)+size[1]}</small></h3>`;
            let status;
            if(drive.use < 60){
                status = "progress-bar-success";
            }else if(drive.use > 60 && drive.use < 90){
                status = "progress-bar-warning";
            }else{
                status = "progress-bar-danger";
            }

            /* generate the html and append it*/
            html += `<div class="progress">
            <div class="progress-bar ${status} role="progressbar" aria-valuenow="${drive.use}" aria-valuemin="0" aria-valuemax="100" style="width: ${drive.use}%">
            ${parseInt(drive.use)}%
            </div>
            </div>`;
            $("#storage-bars").append(html);
        });
    });
}
