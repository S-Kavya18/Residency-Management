const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('../models/Room');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-residency';

const rateMap = {
  2: { ac: 1200, nonac: 1000 },
  3: { ac: 2000, nonac: 1500 },
  4: { ac: 3000, nonac: 2500 }
};

const isAcRoom = (amenities = []) => amenities.includes('AC');

const buildDescription = (capacity, acLabel, rent) => {
  return `${capacity}-member ${acLabel} room (rate ${rent}/day)`;
};

const updateRoomRates = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const rooms = await Room.find({});
    let updatedCount = 0;

    for (const room of rooms) {
      const rate = rateMap[room.capacity];
      if (!rate) {
        continue;
      }

      const acLabel = isAcRoom(room.amenities) ? 'AC' : 'Non-AC';
      const rent = acLabel === 'AC' ? rate.ac : rate.nonac;

      room.rent = rent;
      room.description = buildDescription(room.capacity, acLabel, rent);
      await room.save();
      updatedCount += 1;
    }

    console.log(`Updated ${updatedCount} rooms with new rates.`);
  } catch (error) {
    console.error('Room rate update failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

updateRoomRates();
