const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const RequestType = require('./models/RequestType');

const vendorsData = [
  { name: 'Rajesh Kumar', mobile: '9876543210', email: 'rajesh@example.com', area: 'Koramangala', state: 'Karnataka', platformName: 'MagicBricks' },
  { name: 'Priya Sharma', mobile: '9876543211', email: 'priya@example.com', area: 'Indiranagar', state: 'Karnataka', platformName: '99acres' },
  { name: 'Amit Patel', mobile: '9876543212', email: 'amit@example.com', area: 'Whitefield', state: 'Karnataka', platformName: 'Housing.com' },
  { name: 'Sneha Reddy', mobile: '9876543213', email: 'sneha@example.com', area: 'HSR Layout', state: 'Karnataka', platformName: 'NoBroker' },
  { name: 'Vikram Singh', mobile: '9876543214', email: 'vikram@example.com', area: 'Marathahalli', state: 'Karnataka', platformName: 'MagicBricks' },
];

const customersData = [
  // Rajesh's customers (index 0)
  { customerName: 'Ananya Iyer', mobile: '9123456780', area: 'Jayanagar', typeOfRequest: 'Buy - 2BHK', status: 'IN_PROGRESS', vendorIdx: 0 },
  { customerName: 'Karthik Nair', mobile: '9123456781', area: 'JP Nagar', typeOfRequest: 'Rent - 3BHK', status: 'NEW', vendorIdx: 0 },
  { customerName: 'Meera Das', mobile: '9123456782', area: 'Koramangala', typeOfRequest: 'Buy - Villa', status: 'BOOKED', vendorIdx: 0 },
  // Priya's customers (index 1)
  { customerName: 'Rohit Gupta', mobile: '9123456783', area: 'Indiranagar', typeOfRequest: 'Buy - 3BHK', status: 'IN_PROGRESS', vendorIdx: 1 },
  { customerName: 'Sanya Malhotra', mobile: '9123456784', area: 'MG Road', typeOfRequest: 'Rent - 1BHK', status: 'COMPLETED', vendorIdx: 1 },
  // Amit's customers (index 2)
  { customerName: 'Deepak Joshi', mobile: '9123456785', area: 'Whitefield', typeOfRequest: 'Buy - Plot', status: 'CANCELLED', vendorIdx: 2 },
  { customerName: 'Lakshmi Menon', mobile: '9123456786', area: 'ITPL', typeOfRequest: 'Rent - 2BHK', status: 'IN_PROGRESS', vendorIdx: 2 },
  // Sneha's customers (index 3)
  { customerName: 'Arjun Rao', mobile: '9123456787', area: 'HSR Layout', typeOfRequest: 'Buy - 2BHK', status: 'NEW', vendorIdx: 3 },
  { customerName: 'Pooja Verma', mobile: '9123456788', area: 'BTM Layout', typeOfRequest: 'Rent - Studio', status: 'BOOKED', vendorIdx: 3 },
  // Vikram's customers (index 4)
  { customerName: 'Suresh Babu', mobile: '9123456789', area: 'Marathahalli', typeOfRequest: 'Buy - 1BHK', status: 'NEW', vendorIdx: 4 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...\n');

    // --- Admin ---
    const adminMobile = process.env.ADMIN_MOBILE || '9999999999';
    const adminEmail = process.env.ADMIN_EMAIL || 'niju@gmail.com';
    const existingAdmin = await User.findOne({ mobile: adminMobile });
    if (existingAdmin) {
      console.log('Admin already exists. Skipping.');
    } else {
      await User.create({ name: 'Admin', mobile: adminMobile, email: adminEmail, password: 'admin@123', role: 'ADMIN' });
      console.log('Admin seeded  →  mobile: ' + adminMobile + '  password: admin@123');
    }

    // --- Vendors ---
    const createdVendors = [];
    for (const v of vendorsData) {
      let vendor = await User.findOne({ mobile: v.mobile });
      if (!vendor) {
        vendor = await User.create({ ...v, password: 'vendor123', role: 'VENDOR' });
        console.log(`Vendor seeded →  ${vendor.name} (${vendor.mobile})  password: vendor123`);
      } else {
        console.log(`Vendor exists →  ${vendor.name} (${vendor.mobile}). Skipping.`);
      }
      createdVendors.push(vendor);
    }

    // --- Customers ---
    const existingCustomers = await Customer.countDocuments();
    if (existingCustomers > 0) {
      console.log(`\n${existingCustomers} customers already exist. Skipping customer seed.`);
    } else {
      for (const c of customersData) {
        const { vendorIdx, ...data } = c;
        await Customer.create({ ...data, vendorId: createdVendors[vendorIdx]._id });
      }
      console.log(`\n${customersData.length} customers seeded successfully.`);
    }

    // --- Request Types ---
    const defaultTypes = [
      'Buy - 1BHK', 'Buy - 2BHK', 'Buy - 3BHK', 'Buy - 4BHK',
      'Buy - Villa', 'Buy - Plot',
      'Rent - Studio', 'Rent - 1BHK', 'Rent - 2BHK', 'Rent - 3BHK',
    ];
    let addedTypes = 0;
    for (const name of defaultTypes) {
      const exists = await RequestType.findOne({ name });
      if (!exists) {
        await RequestType.create({ name });
        addedTypes++;
      }
    }
    if (addedTypes > 0) {
      console.log(`\n${addedTypes} request types seeded.`);
    } else {
      console.log('\nRequest types already exist. Skipping.');
    }

    console.log('\nSeeding complete!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
