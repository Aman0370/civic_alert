require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Station, User } = require('../models');
const { hashGovId, maskGovId } = require('../utils/govId');

async function seed() {
  await sequelize.sync();

  const [station] = await Station.findOrCreate({
    where: { name: 'Durgapur City Police Station' },
    defaults: {
      address: 'City Centre, Durgapur, West Bengal',
      lat: 23.5204,
      lng: 87.3119,
      jurisdictionRadiusKm: 6,
      contactPhone: '0343-2545555',
    },
  });

  const [station2] = await Station.findOrCreate({
    where: { name: 'Benachity Police Station' },
    defaults: {
      address: 'Benachity, Durgapur, West Bengal',
      lat: 23.5389,
      lng: 87.3247,
      jurisdictionRadiusKm: 5,
    },
  });

  const passwordHash = await bcrypt.hash('Password123!', 12);

  await User.findOrCreate({
    where: { email: 'citizen@demo.com' },
    defaults: {
      name: 'Demo Citizen',
      email: 'citizen@demo.com',
      passwordHash,
      phone: '9999999999',
      govIdHash: hashGovId('234123412346'),
      govIdMasked: maskGovId('234123412346'),
      role: 'citizen',
      emailVerified: true,
      liveLat: 23.522,
      liveLng: 87.313,
    },
  });

  await User.findOrCreate({
    where: { email: 'officer@demo.com' },
    defaults: {
      name: 'Demo Officer',
      email: 'officer@demo.com',
      passwordHash,
      phone: '8888888888',
      govIdHash: hashGovId('345234523458'),
      govIdMasked: maskGovId('345234523458'),
      role: 'authority',
      badgeNumber: 'WB-2201',
      stationId: station.id,
      emailVerified: true,
    },
  });

  await User.findOrCreate({
    where: { email: 'officer2@demo.com' },
    defaults: {
      name: 'Demo Officer 2',
      email: 'officer2@demo.com',
      passwordHash,
      phone: '8888888887',
      govIdHash: hashGovId('456345634569'),
      govIdMasked: maskGovId('456345634569'),
      role: 'authority',
      badgeNumber: 'WB-2202',
      stationId: station2.id,
      emailVerified: true,
    },
  });

  console.log('Seed complete.');
  console.log('  Citizen login: citizen@demo.com / Password123!');
  console.log(`  Officer login (${station.name}): officer@demo.com / Password123!`);
  console.log(`  Officer login (${station2.name}): officer2@demo.com / Password123!`);
  console.log(`  Stations: ${station.name}, ${station2.name}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});