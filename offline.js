// ======================================
// PIBM Canteen Scanner
// Version 1.5
// Offline Queue Manager
// ======================================

const API_URL =
"https://script.google.com/macros/s/AKfycbz8tqy5R87nSMo-1t8W_t6liikSJrcDk87SFd8SkWdGFXm7KmGW20OLhMUae9B0-OEr5g/exec";

const STORAGE_KEY = "canteen_pending_scans";


//------------------------------------
// Save Scan
//------------------------------------

function saveScan(scanData){

    const now = new Date();

scanData.timestamp = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true
});

    sendToServer(scanData);

}



//------------------------------------
// Send to Server
//------------------------------------

function sendToServer(scanData){

    const formData = new URLSearchParams();

    formData.append("timestamp",scanData.timestamp);
    formData.append("counter",scanData.counter);
    formData.append("barcode",scanData.barcode);
    formData.append("device",scanData.device);

    fetch(API_URL,{

        method:"POST",

        body:formData

    })

    .then(response=>response.text())

    .then(data=>{

        document.getElementById("result").innerHTML =
        "<span style='color:green;font-size:28px;font-weight:bold;'>✅ SAVED</span><br><br>"
        + scanData.barcode;

        console.log("Saved :",scanData.barcode);

    })

    .catch(error=>{

        saveOffline(scanData);

        document.getElementById("result").innerHTML =
        "<span style='color:orange;font-size:28px;font-weight:bold;'>🟠 SAVED LOCALLY</span><br><br>"
        + scanData.barcode;

        console.log("Saved Offline");

    });

}



//------------------------------------
// Save Offline
//------------------------------------

function saveOffline(scanData){

    let queue =
    JSON.parse(localStorage.getItem(STORAGE_KEY))
    || [];

    queue.push(scanData);

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(queue)

    );

}



//------------------------------------
// Sync Queue
//------------------------------------

function syncOfflineData(){

    let queue =
    JSON.parse(localStorage.getItem(STORAGE_KEY))
    || [];

    if(queue.length===0){

        return;

    }

    console.log("Syncing",queue.length,"records");

    let remaining=[];

    Promise.all(

        queue.map(scan=>{

            const formData = new URLSearchParams();

            formData.append("timestamp",scan.timestamp);
            formData.append("counter",scan.counter);
            formData.append("barcode",scan.barcode);
            formData.append("device",scan.device);

            return fetch(API_URL,{

                method:"POST",

                body:formData

            })

            .then(()=>{

                console.log("Synced :",scan.barcode);

            })

            .catch(()=>{

                remaining.push(scan);

            });

        })

    )

    .then(()=>{

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(remaining)

        );

        if(remaining.length===0){

            document.getElementById("result").innerHTML =
            "<span style='color:green;font-size:28px;font-weight:bold;'>🔄 SYNC COMPLETE</span>";

        }

    });

}



//------------------------------------
// Internet Back
//------------------------------------

window.addEventListener("online",function(){

    syncOfflineData();

});



//------------------------------------
// Retry Every 30 Seconds
//------------------------------------

setInterval(syncOfflineData,30000);
async function lookupStudent(studentId) {
    const url =
        API_URL +
        "?action=lookup&id=" +
        encodeURIComponent(String(studentId).trim());

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Student lookup failed");
    }

    const data = await response.json();

    if (!data.success || !data.student) {
        return null;
    }

    return data.student;
}