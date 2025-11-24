/**
 * Password Hash Verification Script
 * Run this to verify if the password hash is correct
 */

const bcrypt = require('bcrypt');

// The password hash from your database
const hashFromDB = '$2b$10$N9qo8uLOickgx2ZMRZoMy.MQDkLNLpZ.qBqX.v5TqJh3aZn0q8S0O';

// Test passwords
const testPasswords = [
  'test123',
  'Test123',
  'TEST123',
  'test',
  '123456'
];

console.log('🔐 Testing Password Hash Verification\n');
console.log('Hash from database:', hashFromDB);
console.log('\nTesting passwords:\n');

testPasswords.forEach(password => {
  try {
    const isMatch = bcrypt.compareSync(password, hashFromDB);
    console.log(`Password: "${password}" → ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
  } catch (error) {
    console.log(`Password: "${password}" → ❌ ERROR: ${error.message}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n🔧 Generating NEW correct hash for "test123":\n');

const correctHash = bcrypt.hashSync('test123', 10);
console.log('New hash for "test123":', correctHash);
console.log('\nVerifying new hash:', bcrypt.compareSync('test123', correctHash) ? '✅ MATCH' : '❌ NO MATCH');

console.log('\n' + '='.repeat(60));
console.log('\n📝 UPDATE USER IN MONGODB:\n');
console.log('db.users.updateOne(');
console.log('  { username: "test" },');
console.log('  { $set: { password: "' + correctHash + '" } }');
console.log(')');
console.log('\n' + '='.repeat(60));
