import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Alert } from './models/Alert.js';
import { Incident } from './models/Incident.js';
import { HelpRequest } from './models/HelpRequest.js';

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed (wipes data) when NODE_ENV=production');
  process.exit(1);
}

await connectDB();
await Promise.all([User.deleteMany(), Alert.deleteMany(), Incident.deleteMany(), HelpRequest.deleteMany()]);

const [admin, responder, resident, resident2] = await User.create([
  { name: 'Asha Admin', email: 'admin@floodwatch.test', password: 'Admin@12345', role: 'admin' },
  { name: 'Ravi Responder', email: 'responder@floodwatch.test', password: 'Responder@123', role: 'responder' },
  { name: 'Riya Resident', email: 'resident@floodwatch.test', password: 'Resident@123', role: 'resident', phone: '9000000001' },
  { name: 'Kabir Kumar', email: 'kabir@floodwatch.test', password: 'Resident@123', role: 'resident', phone: '9000000002' },
]);

await Alert.create([
  { title: 'River level above danger mark', message: 'Move away from the riverbank. Avoid the old bridge until further notice.', severity: 'Severe', location: 'Riverbank Road', createdBy: admin._id },
  { title: 'Waterlogging on main roads', message: 'Expect traffic delays. Use alternate routes via the ring road.', severity: 'High', location: 'Station Road underpass', createdBy: admin._id },
  { title: 'Rain expected tonight', message: 'Keep a charged phone, torch and drinking water ready.', severity: 'Moderate', location: 'City-wide', createdBy: responder._id },
  { title: 'Relief camp opened', message: 'Shelter, food and basic medical aid available at the community hall.', severity: 'Low', location: 'Ward 7 Community Hall', active: false, createdBy: admin._id },
]);

const daysAgo = (d) => new Date(Date.now() - d * 864e5);
const inc = (reporter, category, loc, description, status, priority, d, extra = {}) => ({
  reporter: reporter._id, category, description, status, priority, createdAt: daysAgo(d),
  location: { text: loc },
  history: [{ status: 'Submitted', by: reporter._id, at: daysAgo(d) }],
  ...extra,
});

await Incident.create([
  inc(resident, 'river_flooding', 'Riverbank Road', 'Water has crossed the embankment near the pump house.', 'Under Review', 'High', 0, { waterLevelCm: 140 }),
  inc(resident, 'waterlogging', 'Station Road underpass', 'Underpass is knee-deep, vehicles are stuck.', 'Assigned', 'Medium', 1, { waterLevelCm: 45, assignedTo: responder._id }),
  inc(resident2, 'road_blocked', 'Old Bridge Colony', 'A fallen tree is blocking the only access road.', 'Submitted', 'Medium', 1),
  inc(resident2, 'river_flooding', 'Riverbank Road', 'Water entering ground-floor shops.', 'Submitted', 'High', 2, { waterLevelCm: 110 }),
  inc(resident, 'power_outage', 'Ward 7 Market', 'Power has been out since morning after transformer flooding.', 'Resolved', 'Low', 3),
  inc(resident2, 'waterlogging', 'North Embankment', 'Drain overflow on the service lane.', 'Resolved', 'Low', 4, { waterLevelCm: 25 }),
  inc(resident, 'landslide', 'Hill View Road', 'Mud and rocks on the road after heavy rain.', 'Under Review', 'High', 5),
  inc(resident2, 'waterlogging', 'Ward 7 Market', 'Stagnant water around the vegetable market.', 'Submitted', 'Low', 6),
]);

await HelpRequest.create([
  { requester: resident._id, need: 'rescue', peopleCount: 4, contactPhone: '9000000001', description: 'Family stuck on first floor, water rising.', location: { text: 'Riverbank Road, house 12' }, status: 'Assigned', priority: 'High', assignedTo: responder._id, history: [{ status: 'Submitted', by: resident._id }] },
  { requester: resident2._id, need: 'food_water', peopleCount: 6, contactPhone: '9000000002', description: 'No drinking water since yesterday.', location: { text: 'Old Bridge Colony' }, status: 'Submitted', priority: 'Medium', history: [{ status: 'Submitted', by: resident2._id }] },
  { requester: resident2._id, need: 'medical', peopleCount: 1, contactPhone: '9000000002', description: 'Elderly neighbour needs insulin and cannot leave the house.', location: { text: 'Old Bridge Colony, lane 3' }, status: 'Under Review', priority: 'High', history: [{ status: 'Submitted', by: resident2._id }] },
]);

console.log('Seeded. Demo logins:');
console.log('  admin@floodwatch.test     / Admin@12345');
console.log('  responder@floodwatch.test / Responder@123');
console.log('  resident@floodwatch.test  / Resident@123');
await mongoose.disconnect();
