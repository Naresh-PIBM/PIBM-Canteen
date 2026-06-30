let scanner = null;

// Store recent scans
let recentScans = {};

// Session Meal Count
let mealCount = 0;

// Counter Selection
document.getElementById("counter").addEventListener("change", function () {

    if (this.value === "") return;

    // Lock Counter
    document.getElementById("counter").disabled = true;

    document.getElementById("result").innerHTML =
        "📷 Opening Camera...";

    startScanner();

});

function startScanner() {

    if (scanner != null) return;

    scanner = new Html5Qrcode("reader");

    scanner.start(

        { facingMode: "environment" },

        {
            fps: 10,
            qrbox: 250
        },

        onScanSuccess,

        function (error) {}

    );

}

function onScanSuccess(decodedText) {

    let now = Date.now();

    // Remove old entries (>15 sec)
    for (let code in recentScans) {

        if (now - recentScans[code] > 15000) {

            delete recentScans[code];

        }

    }

    // Duplicate Found
    if (recentScans[decodedText]) {

        document.getElementById("result").innerHTML =
            "<span style='color:red;font-size:28px;font-weight:bold;'>⚠ DUPLICATE SCAN</span><br><br>" +
            decodedText;

        // Long Beep
        new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();

        return;

    }

    // Save in memory
    recentScans[decodedText] = now;

    // Short Success Beep
    new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg").play();

    document.getElementById("result").innerHTML =
        "<span style='color:green;font-size:28px;font-weight:bold;'>Saving...</span><br><br>" +
        decodedText;

    const scanData = {

    counter: document.getElementById("counter").value,

    barcode: decodedText,

    device: navigator.userAgent

};

saveScan(scanData);

}