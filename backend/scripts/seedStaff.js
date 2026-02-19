const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-residency';

const staffSeed = [
  
  { name: 'Karthik', department: 'electrical', address: 'Tirunelveli' },
  { name: 'Suresh', department: 'electrical', address: 'Thiruchendur, Thoothukudi' },
  { name: 'Mahesh', department: 'plumbing', address: 'Tirunelveli' },

  { name: 'Latha', department: 'cleaning', address: 'Tirunelveli' },
  { name: 'Meena', department: 'cleaning', address: 'Thoothukudi' },
  { name: 'Prakash', department: 'maintenance', address: 'Thoothukudi' },
  { name: 'Dinesh', department: 'maintenance', address: 'Tirunelveli' },
  { name: 'Rajesh', department: 'maintenance', address: 'Trichendur, Thoothukudi' },
  { name: 'Kumar', department: 'security', address: 'Thoothukudi' },
  { name: 'Selvam', department: 'security', address: 'Tirunelveli' },
  
];

const normalizeName = (name) => name.trim();
const toEmail = (name) => `${name.toLowerCase()}@gmail.com`;
const toPassword = (name) => {
  const base = name.toLowerCase();
  return base.length >= 6 ? base : `${base}123`;
};

const seedStaff = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    let created = 0;
    let updated = 0;

    for (const staff of staffSeed) {
      const cleanName = normalizeName(staff.name);
      const email = toEmail(cleanName);
      const password = toPassword(cleanName);
      const existing = await User.findOne({ email });
      if (existing) {
        existing.name = cleanName;
        existing.role = 'staff';
        existing.staffDepartment = staff.department;
        existing.address = staff.address;
        existing.isActive = true;
        existing.password = password;
        await existing.save();
        updated += 1;
      } else {
        await User.create({
          name: cleanName,
          email,
          password,
          role: 'staff',
          staffDepartment: staff.department,
          address: staff.address,
          isActive: true
        });
        created += 1;
      }
    }

    console.log(`Staff seed completed. Created: ${created}, Updated: ${updated}`);
  } catch (error) {
    console.error('Staff seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedStaff();
