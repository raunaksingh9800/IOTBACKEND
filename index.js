const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/iot-fan', { useNewUrlParser: true, useUnifiedTopology: true });

const FanScheduleSchema = new mongoose.Schema({
    startTime: String,
    endTime: String,
    fanState: Boolean
});

const FanSchedule = mongoose.model('FanSchedule', FanScheduleSchema);

// API to set schedule
app.get('/', async (req ,res)=> {
    res.send("Working")
})
app.post('/set-schedule', async (req, res) => {
    const { startTime, endTime, fanState } = req.body;
    await FanSchedule.deleteMany({});
    const schedule = new FanSchedule({ startTime, endTime, fanState });
    await schedule.save();
    res.send({ message: "Schedule updated" });
});

// API for ESP32 to get the latest fan state
app.get('/get-schedule', async (req, res) => {
    const schedule = await FanSchedule.findOne();
    if (!schedule) {
        return res.json({ fanState: false });
    }

    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    const fanShouldBeOn = (currentTime >= schedule.startTime && currentTime <= schedule.endTime);
    
    res.json({ fanState: fanShouldBeOn });
});

app.listen(3000, () => console.log('Server running on port 3000'));
