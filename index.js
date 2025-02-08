const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const DATA_FILE = path.join(__dirname, "schedule.json");

// Helper function to read the JSON file
function readSchedule() {
    try {
        const data = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(data);
    } catch (err) {
        return { startTime: null, endTime: null, fanState: false };
    }
}

// Helper function to write to the JSON file
function writeSchedule(schedule) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(schedule, null, 2), "utf8");
}

// API to set the fan schedule
app.post("/set-schedule", (req, res) => {
    const { startTime, endTime } = req.body;
    const newSchedule = { startTime, endTime, fanState: false }; // Fan starts OFF

    writeSchedule(newSchedule);
    res.json({ message: "Schedule saved!", schedule: newSchedule });
});
app.get("/", (req, res) => {
    res.send("working")
})
// API for ESP32 to fetch schedule and check fan state
app.get("/get-schedule", (req, res) => {
    const schedule = readSchedule();
    const currentTime = new Date().toLocaleTimeString("en-US", { hour12: false }).slice(0, 5);

    // Check if current time is within the scheduled range
    if (schedule.startTime && schedule.endTime) {
        if (schedule.startTime <= currentTime && currentTime <= schedule.endTime) {
            schedule.fanState = true;  // Turn fan ON
        } else {
            schedule.fanState = false; // Turn fan OFF
        }
    } else {
        schedule.fanState = false; // Default OFF if no schedule is set
    }

    res.json(schedule);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
