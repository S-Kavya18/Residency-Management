const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('../models/Room');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-residency';

const buildRooms = () => {
  const rooms = [];

  const rateMap = {
    1: { ac: 700, nonac: 500 },
    2: { ac: 1200, nonac: 1000 },
    3: { ac: 2000, nonac: 1500 },
    4: { ac: 3000, nonac: 2500 }
  };

  // Custom single-room rates for specific floors
  const singleRateOverrides = {
    1: { ac: 800, nonac: 600 },
    2: { ac: 800, nonac: 600 }
  };

  const addGroup = (startNumber, roomType, capacity, floor) => {
    for (let i = 0; i < 5; i += 1) {
      const roomNumber = String(startNumber + i);
      const isAc = i < 3;
      const rate = rateMap[capacity];
      const rent = rate ? (isAc ? rate.ac : rate.nonac) : 0;
      const label = isAc ? 'AC' : 'Non-AC';
      rooms.push({
        roomNumber,
        roomType,
        floor,
        capacity,
        currentOccupancy: 0,
        amenities: isAc ? ['AC'] : [],
        rent,
        isAvailable: true,
        status: 'available',
        description: `${capacity}-member ${label} room (rate ${rent}/day)`
      });
    }
  };

  const addFloor = (floorNumber, baseNumber) => {
    addGroup(baseNumber + 1, 'double', 2, floorNumber);
    addGroup(baseNumber + 6, 'triple', 3, floorNumber);
    addGroup(baseNumber + 11, 'quad', 4, floorNumber);
    
    // Add single cot room
    const singleRoomNumber = String(baseNumber + 16);
    const rate = singleRateOverrides[floorNumber] || rateMap[1];
    rooms.push({
      roomNumber: singleRoomNumber,
      roomType: 'single',
      floor: floorNumber,
      capacity: 1,
      currentOccupancy: 0,
      amenities: ['AC', 'Single Cot'],
      rent: rate.ac,
      isAvailable: true,
      status: 'available',
      description: `1-member AC single cot room (rate ${rate.ac}/day)`
    });

    const singleRoomNonAcNumber = String(baseNumber + 17);
    rooms.push({
      roomNumber: singleRoomNonAcNumber,
      roomType: 'single',
      floor: floorNumber,
      capacity: 1,
      currentOccupancy: 0,
      amenities: ['Single Cot'],
      rent: rate.nonac,
      isAvailable: true,
      status: 'available',
      description: `1-member Non-AC single cot room (rate ${rate.nonac}/day)`
    });
  };

  addFloor(1, 100);
  addFloor(2, 200);
  addFloor(3, 300);
  addFloor(4, 400);
  addFloor(5, 500);

  return rooms;
};

const seedRooms = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await Room.deleteMany({ floor: { $in: [1, 2, 3, 4, 5] } });

    const rooms = buildRooms();
    await Room.insertMany(rooms);

    console.log(`Inserted ${rooms.length} rooms for floors 1-5 including single cot rooms.`);
  } catch (error) {
    console.error('Room seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedRooms();
