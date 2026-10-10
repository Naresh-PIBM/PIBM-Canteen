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


async function onScanSuccess(decodedText) {

    const studentId = String(decodedText).trim();
    const result = document.getElementById("result");
    const now = Date.now();

    // Remove old entries (>15 seconds)
    for (let code in recentScans) {
        if (now - recentScans[code] > 15000) {
            delete recentScans[code];
        }
    }

    // Duplicate check
    if (recentScans[studentId]) {
        result.innerHTML =
            "<span style='color:red;font-size:28px;font-weight:bold;'>⚠ DUPLICATE SCAN</span><br><br>" +
            studentId;

        new Audio(
            "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
        ).play();

        return;
    }

    // Prevent repeated callbacks while lookup is in progress
    recentScans[studentId] = now;

    result.innerHTML =
        "<span style='font-size:24px;font-weight:bold;'>🔎 Checking student...</span><br><br>" +
        studentId;

    try {

        const student = await lookupStudent(studentId);

        // Student not found
        if (!student) {
            delete recentScans[studentId];

            result.innerHTML =
                "<span style='color:red;font-size:28px;font-weight:bold;'>❌ STUDENT NOT FOUND</span><br><br>" +
                studentId;

            new Audio(
                "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
            ).play();

            return;
        }

        // Display student details
        result.innerHTML =
            "<span style='color:green;font-size:26px;font-weight:bold;'>✅ STUDENT IDENTIFIED</span><br><br>" +
            "<b>Name:</b> " + escapeHtml(student.name) + "<br>" +
            "<b>Student ID:</b> " + escapeHtml(student.borrowerId) + "<br>" +
            "<b>Section:</b> " + escapeHtml(student.section);

        // Success beep
        new Audio(
            "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
        ).play();

        // Prepare meal record
        const scanData = {
            counter: document.getElementById("counter").value,
            barcode: studentId,
            device: navigator.userAgent
        };

        // Save only after student is found
        saveScan(scanData);

    } catch (error) {

        // Allow retry after a temporary lookup error
        delete recentScans[studentId];

        result.innerHTML =
            "<span style='color:red;font-size:24px;font-weight:bold;'>⚠ LOOKUP FAILED</span><br><br>" +
            "Check the internet connection and try again.";

        console.error("Student lookup failed:", error);
    }
}


// Safely display values returned by the student master
function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}
