const mongoose = require('mongoose');
const User = require('../models/User');
const Staff = require('../models/Staff');

// Database connection URI
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-residency';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateStaffData() {
  try {
    console.log('Starting staff migration from User table to Staff table...');

    // Find all users with staffDepartment (staff members)
    const staffUsers = await User.find({ role: 'staff', staffDepartment: { $exists: true } });
    console.log(`Found ${staffUsers.length} staff members to migrate`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const user of staffUsers) {
      try {
        // Check if staff record already exists for this user
        const existingStaff = await Staff.findOne({ userId: user._id });
        if (existingStaff) {
          console.log(`Skipped: Staff record already exists for ${user.name}`);
          skippedCount++;
          continue;
        }

        // Create staff record
        const staff = new Staff({
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          password: user.password,
          address: user.address || '',
          staffDepartment: user.staffDepartment,
          isActive: user.isActive !== undefined ? user.isActive : true,
        });

        await staff.save();
        console.log(`✓ Migrated: ${user.name} (${user.staffDepartment})`);
        createdCount++;
      } catch (error) {
        console.error(`✗ Error migrating ${user.name}:`, error.message);
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`Created: ${createdCount} staff records`);
    console.log(`Skipped: ${skippedCount} records`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Migration failed:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

migrateStaffData();
