const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/hopcare')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections in hopcare database:');
    collections.forEach(col => console.log('  -', col.name));
    
    // Check doctors collection
    const Doctor = mongoose.model('Doctor', new mongoose.Schema({}, { strict: false, collection: 'doctors' }));
    const doctors = await Doctor.find();
    console.log('\n👨‍⚕️ Doctors in database:', doctors.length);
    doctors.forEach(doc => {
      console.log(`  - ${doc.name} (${doc.email})`);
    });
    
    // Check patients collection
    const Patient = mongoose.model('Patient', new mongoose.Schema({}, { strict: false, collection: 'patients' }));
    const patients = await Patient.find();
    console.log('\n🧑 Patients in database:', patients.length);
    patients.forEach(pat => {
      console.log(`  - ${pat.name} (${pat.email})`);
    });
    
    // Check appointments collection
    const Appointment = mongoose.model('Appointment', new mongoose.Schema({}, { strict: false, collection: 'appointments' }));
    const appointments = await Appointment.find();
    console.log('\n📅 Appointments in database:', appointments.length);
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });
