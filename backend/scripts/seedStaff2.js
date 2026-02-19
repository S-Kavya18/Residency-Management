const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Staff = require('../models/Staff');

// Database connection URI
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-residency';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const staffData = [
  { name: 'Arun', email: 'arun@gmail.com', password: 'arun', phone: '9876543210', address: 'Trichendur, Tirunelveli', department: 'electrical' },
  { name: 'Karthik', email: 'karthik@gmail.com', password: 'karthik', phone: '9876543211', address: 'Thoothukudi, Tirunelveli', department: 'electrical' },
  { name: 'Suresh', email: 'suresh@gmail.com', password: 'suresh', phone: '9876543212', address: 'Trichendur, Tirunelveli', department: 'electrical' },
  { name: 'Mahesh', email: 'mahesh@gmail.com', password: 'mahesh', phone: '9876543213', address: 'Thoothukudi, Tirunelveli', department: 'plumbing' },
  { name: 'Ramesh', email: 'ramesh@gmail.com', password: 'ramesh', phone: '9876543214', address: 'Trichendur, Tirunelveli', department: 'plumbing' },
  { name: 'Ganesh', email: 'ganesh@gmail.com', password: 'ganesh', phone: '9876543215', address: 'Thoothukudi, Tirunelveli', department: 'plumbing' },
  { name: 'Latha', email: 'latha@gmail.com', password: 'latha', phone: '9876543216', address: 'Trichendur, Tirunelveli', department: 'cleaning' },
  { name: 'Meena', email: 'meena@gmail.com', password: 'meena', phone: '9876543217', address: 'Thoothukudi, Tirunelveli', department: 'cleaning' },
  { name: 'Kavitha', email: 'kavitha@gmail.com', password: 'kavitha', phone: '9876543218', address: 'Trichendur, Tirunelveli', department: 'cleaning' },
  { name: 'Prakash', email: 'prakash@gmail.com', password: 'prakash', phone: '9876543219', address: 'Thoothukudi, Tirunelveli', department: 'maintenance' },
  { name: 'Dinesh', email: 'dinesh@gmail.com', password: 'dinesh', phone: '9876543220', address: 'Trichendur, Tirunelveli', department: 'maintenance' },
  { name: 'Rajesh', email: 'rajesh@gmail.com', password: 'rajesh', phone: '9876543221', address: 'Thoothukudi, Tirunelveli', department: 'maintenance' },
  { name: 'Kumar', email: 'kumar@gmail.com', password: 'kumar', phone: '9876543222', address: 'Trichendur, Tirunelveli', department: 'security' },
  { name: 'Selvam', email: 'selvam@gmail.com', password: 'selvam', phone: '9876543223', address: 'Thoothukudi, Tirunelveli', department: 'security' },
  { name: 'Anand', email: 'anand@gmail.com', password: 'anand', phone: '9876543224', address: 'Trichendur, Tirunelveli', department: 'security' }
];

async function seedStaff() {
  try {
    console.log('Seeding staff data...');

    for (const data of staffData) {
      const existingStaff = await Staff.findOne({ email: data.email });
      if (existingStaff) {
        console.log(`Skipped: Staff with email ${data.email} already exists`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      const staff = await Staff.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        address: data.address,
        staffDepartment: data.department,
        isActive: true
      });

      console.log(`✓ Created staff: ${staff.name} (${staff.staffDepartment})`);
    }

    console.log('\n✅ Staff seeding completed!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

seedStaff();
