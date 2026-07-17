// backend/server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campuscare';
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

// Set global JSON conversion transform to map _id -> id for 100% React compatibility
mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Disable command buffering globally so Mongoose fails fast instead of hanging when offline
mongoose.set('bufferCommands', false);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully.');
    seedDefaults();
  })
  .catch(err => {
    console.error('==================================================');
    console.error('MONGO CONNECTION ERROR:', err.message);
    console.error('Please verify:');
    console.error('1. Your MONGODB_URI in backend/.env is correct.');
    console.error('2. Your current IP is added to the MongoDB Atlas Network Whitelist.');
    console.error('==================================================');
  });

// ================= SCHEMAS & MODELS =================

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rollNo: { type: String, required: true },
  phoneNo: { type: String, required: true },
  roomNo: { type: String, required: true },
  block: { type: String, required: true },
  password: { type: String, required: true },
  profilePhoto: { type: String, default: null }
});
const Student = mongoose.model('Student', StudentSchema);

const WardenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rollNo: { type: String, required: true },
  phoneNo: { type: String, required: true },
  roomNo: { type: String, required: true },
  block: { type: String, required: true },
  password: { type: String, required: true },
  profilePhoto: { type: String, default: null }
});
const Warden = mongoose.model('Warden', WardenSchema);

const ManagementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rollNo: { type: String, required: true },
  phoneNo: { type: String, required: true },
  roomNo: { type: String, required: true },
  block: { type: String, required: true },
  password: { type: String, required: true },
  profilePhoto: { type: String, default: null }
});
const Management = mongoose.model('Management', ManagementSchema);

const ComplaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, required: true, default: 'Open' },
  time: { type: String, default: 'Just now' },
  priority: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  studentName: { type: String, default: 'Unknown Student' },
  studentPhone: { type: String, default: 'N/A' },
  studentRoll: { type: String, default: 'N/A' },
  studentRoom: { type: String, default: 'N/A' },
  studentBlock: { type: String, default: 'N/A' },
  studentEmail: { type: String, default: null },
  proof: { type: String, default: null },
  proofName: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});
const Complaint = mongoose.model('Complaint', ComplaintSchema);

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, default: 'General Announcement' },
  text: { type: String, required: true },
  attachment: { type: String, default: null },
  attachmentName: { type: String, default: null },
  important: { type: Boolean, default: false },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Announcement = mongoose.model('Announcement', AnnouncementSchema);

const EventBannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  active: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});
const EventBanner = mongoose.model('EventBanner', EventBannerSchema);

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true },
  studentEmail: { type: String, default: 'student@gmail.com' },
  studentName: { type: String, default: 'Student' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

const WorkerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  tasks: { type: Number, default: 0 },
  avatar: { type: String, required: true },
  color: { type: String, required: true }
});
const Worker = mongoose.model('Worker', WorkerSchema);

const FeedbackRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const FeedbackRequest = mongoose.model('FeedbackRequest', FeedbackRequestSchema);

const FeedbackResponseSchema = new mongoose.Schema({
  feedbackRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedbackRequest', required: true },
  studentEmail: { type: String, required: true },
  studentName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const FeedbackResponse = mongoose.model('FeedbackResponse', FeedbackResponseSchema);

// Seeding Default Credentials
const seedDefaults = async () => {
  try {
    const defaultWarden = {
      name: 'Warden Console',
      email: 'warden@gmail.com',
      rollNo: 'EMP-001',
      phoneNo: '9999999999',
      roomNo: 'Office-A',
      block: 'Main',
      password: 'warden123'
    };

    const defaultStudent = {
      name: 'Arun Kumar',
      email: 'student@gmail.com',
      rollNo: '2021CS101',
      phoneNo: '9876543210',
      roomNo: '305',
      block: 'C',
      password: 'student123'
    };

    const defaultManagement = {
      name: 'Dr. R. Krishnan',
      email: 'managemant@gmail.com',
      rollNo: 'MGT-101',
      phoneNo: '9876543222',
      roomNo: 'Admin-101',
      block: 'Main',
      password: 'management123'
    };

    const wardenCount = await Warden.countDocuments({ email: defaultWarden.email });
    if (wardenCount === 0) {
      await Warden.create(defaultWarden);
      console.log('Seeded default Warden.');
    }

    const studentCount = await Student.countDocuments({ email: defaultStudent.email });
    if (studentCount === 0) {
      await Student.create(defaultStudent);
      console.log('Seeded default Student.');
    }

    const mgtCount = await Management.countDocuments({ email: defaultManagement.email });
    if (mgtCount === 0) {
      await Management.create(defaultManagement);
      console.log('Seeded default Management.');
    }
  } catch (err) {
    console.error('Error seeding default data:', err);
  }
};

// Middleware to verify database connection before handling API routes
const checkDbConnected = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database connection is not established. Please check that your MongoDB Atlas URI is configured correctly in backend/.env, and your local IP address is added to your MongoDB Atlas Network Access settings (IP Whitelist).'
    });
  }
  next();
};

app.use('/api', checkDbConnected);

// ================= API ENDPOINTS =================

// 1. SIGNUP ENDPOINT
app.post('/api/signup', async (req, res) => {
  const { name, email, rollNo, phoneNo, roomNo, block, password, role } = req.body;

  if (!name || !email || !rollNo || !phoneNo || !roomNo || !block || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const signupRole = role || 'student';

  if (signupRole === 'warden' || signupRole === 'management') {
    return res.status(403).json({ error: 'Registration is restricted for Warden and Management roles.' });
  }

  try {
    const existing = await Student.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Official Mail ID is already registered!' });
    }
    const newStudent = await Student.create({ name, email: email.toLowerCase(), rollNo, phoneNo, roomNo, block, password });
    return res.status(201).json({ success: true, user: { name, email: newStudent.email, rollNo, phoneNo, roomNo, block, role: signupRole } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database signup error' });
  }
});

// 2. LOGIN ENDPOINT
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    if (role === 'warden') {
      if (email.toLowerCase() !== 'warden@gmail.com' || password !== 'warden123') {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const matched = await Warden.findOne({ email: 'warden@gmail.com' });
      if (matched) {
        const { password: _password, ...userWithoutPassword } = matched.toJSON();
        return res.json({ success: true, user: { ...userWithoutPassword, role: 'warden' } });
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    } else if (role === 'student') {
      const matched = await Student.findOne({ email: email.toLowerCase(), password });
      if (matched) {
        const { password: _password, ...userWithoutPassword } = matched.toJSON();
        return res.json({ success: true, user: { ...userWithoutPassword, role: 'student' } });
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    } else if (role === 'management') {
      const isMgtEmail = email.toLowerCase() === 'managemant@gmail.com' || email.toLowerCase() === 'management@gmail.com';
      if (!isMgtEmail || password !== 'management123') {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const matched = await Management.findOne({
        $or: [{ email: 'managemant@gmail.com' }, { email: 'management@gmail.com' }]
      });
      if (matched) {
        const { password: _password, ...userWithoutPassword } = matched.toJSON();
        return res.json({ success: true, user: { ...userWithoutPassword, role: 'management' } });
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    } else {
      // Mock profiles for other roles (Worker)
      return res.json({
        success: true,
        user: {
          name: 'Staff Profile',
          email,
          role,
          block: 'A',
          roomNo: '101'
        }
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database login error' });
  }
});

// 3. COMPLAINTS API
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    const students = await Student.find();
    const resolved = complaints.map(c => {
      const obj = c.toJSON();

      // Dynamically resolve legacy 'Just now' timestamps to their actual creation date/time
      const formattedTime = (obj.time && obj.time !== 'Just now')
        ? obj.time
        : new Date(obj.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + 
          ' - ' + 
          new Date(obj.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Find matching student
      let matched = null;
      if (obj.studentEmail) {
        matched = students.find(s => s.email.toLowerCase() === obj.studentEmail.toLowerCase());
      }
      if (!matched) {
        const locLower = obj.location ? obj.location.toLowerCase() : '';
        matched = students.find(s => {
          if (!s.roomNo) return false;
          const room = s.roomNo.toLowerCase();
          return locLower.includes(room) || room.includes(locLower);
        });
      }

      if (matched) {
        return {
          ...obj,
          time: formattedTime,
          studentName: matched.name,
          studentPhone: matched.phoneNo,
          studentRoll: matched.rollNo,
          studentRoom: matched.roomNo,
          studentBlock: matched.block,
          studentPhoto: matched.profilePhoto || null
        };
      }

      const defaultStudent = students.find(s => s.email === 'student@gmail.com') || {
        name: 'Arun Kumar',
        phoneNo: '9876543210',
        rollNo: '2021CS101',
        roomNo: '305',
        block: 'C',
        profilePhoto: null
      };

      return {
        ...obj,
        time: formattedTime,
        studentName: defaultStudent.name,
        studentPhone: defaultStudent.phoneNo,
        studentRoll: defaultStudent.rollNo,
        studentRoom: defaultStudent.roomNo,
        studentBlock: defaultStudent.block,
        studentPhoto: defaultStudent.profilePhoto || null
      };
    });
    res.json(resolved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

app.post('/api/complaints', async (req, res) => {
  const { title, category, priority, description, location, studentName, studentPhone, studentRoll, studentRoom, studentBlock, studentEmail, proof, proofName } = req.body;

  if (!title || !category || !priority || !description || !location) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + 
                    ' - ' + 
                    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newComplaint = await Complaint.create({
      title,
      location,
      status: priority === 'High' ? 'High Priority' : 'Open',
      time: dateStr,
      priority,
      category,
      description,
      studentName: studentName || 'Unknown Student',
      studentPhone: studentPhone || 'N/A',
      studentRoll: studentRoll || 'N/A',
      studentRoom: studentRoom || 'N/A',
      studentBlock: studentBlock || 'N/A',
      studentEmail: studentEmail || null,
      proof: proof || null,
      proofName: proofName || null
    });
    res.status(201).json({ success: true, complaint: newComplaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

app.patch('/api/complaints/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    let complaint = null;
    
    // 1. Try to update using Mongoose ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      complaint = await Complaint.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
    }

    // 2. Try to update treating id as a string _id
    if (!complaint) {
      complaint = await Complaint.findOneAndUpdate({ _id: id }, { status }, { returnDocument: 'after' });
    }

    // 3. Try to update treating id as a numerical _id
    if (!complaint) {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        complaint = await Complaint.findOneAndUpdate({ _id: parsedId }, { status }, { returnDocument: 'after' });
      }
    }

    // 4. Try to update treating id as a numerical legacy 'id' attribute
    if (!complaint) {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        complaint = await Complaint.findOneAndUpdate({ id: parsedId }, { status }, { returnDocument: 'after' });
      }
    }

    if (complaint) {
      return res.json({ success: true, complaint });
    } else {
      return res.status(404).json({ error: 'Complaint not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a specific complaint by ID
app.delete('/api/complaints/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let deleted = null;
    
    // 1. Try to delete using Mongoose ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Complaint.findByIdAndDelete(id);
    }
    
    // 2. Try to delete treating id as a string _id
    if (!deleted) {
      deleted = await Complaint.findOneAndDelete({ _id: id });
    }

    // 3. Try to delete treating id as a numerical _id
    if (!deleted) {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        deleted = await Complaint.findOneAndDelete({ _id: parsedId });
      }
    }

    // 4. Try to delete treating id as a numerical legacy 'id' attribute
    if (!deleted) {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        deleted = await Complaint.findOneAndDelete({ id: parsedId });
      }
    }

    if (deleted) {
      res.json({ success: true, message: 'Complaint deleted successfully' });
    } else {
      res.status(404).json({ error: 'Complaint not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Clear all resolved complaints (History clear)
app.delete('/api/complaints/history/clear', async (req, res) => {
  try {
    await Complaint.deleteMany({ status: 'Resolved' });
    res.json({ success: true, message: 'History cleared successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profile', async (req, res) => {
  const { email, role, name, phoneNo, roomNo, block, profilePhoto, rollNo } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: 'Email and role are required' });
  }

  try {
    let updatedUser = null;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phoneNo !== undefined) updateData.phoneNo = phoneNo;
    if (roomNo !== undefined) updateData.roomNo = roomNo;
    if (block !== undefined) updateData.block = block;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (rollNo !== undefined) updateData.rollNo = rollNo;

    if (role === 'student') {
      updatedUser = await Student.findOneAndUpdate({ email: email.toLowerCase() }, updateData, { returnDocument: 'after' });
      if (!updatedUser) {
        updatedUser = await Student.create({
          email: email.toLowerCase(),
          password: 'student123',
          name: name || 'Student Resident',
          rollNo: rollNo || '2021CS101',
          phoneNo: phoneNo || '9876543210',
          roomNo: roomNo || '305',
          block: block || 'C',
          profilePhoto: profilePhoto || null
        });
      }
    } else if (role === 'warden') {
      updatedUser = await Warden.findOneAndUpdate({ email: email.toLowerCase() }, updateData, { returnDocument: 'after' });
      if (!updatedUser) {
        updatedUser = await Warden.create({
          email: email.toLowerCase(),
          password: 'warden123',
          name: name || 'Warden Console',
          rollNo: rollNo || 'EMP-001',
          phoneNo: phoneNo || '9999999999',
          roomNo: roomNo || 'Office-A',
          block: block || 'Main',
          profilePhoto: profilePhoto || null
        });
      }
    } else if (role === 'management') {
      const isMgtEmail = email.toLowerCase() === 'managemant@gmail.com' || email.toLowerCase() === 'management@gmail.com';
      updatedUser = await Management.findOneAndUpdate(
        { $or: [{ email: 'managemant@gmail.com' }, { email: 'management@gmail.com' }, { email: email.toLowerCase() }] },
        updateData,
        { returnDocument: 'after' }
      );
      if (!updatedUser) {
        updatedUser = await Management.create({
          email: isMgtEmail ? 'managemant@gmail.com' : email.toLowerCase(),
          password: 'management123',
          name: name || 'Dr. R. Krishnan',
          rollNo: rollNo || 'MGT-101',
          phoneNo: phoneNo || '9876543222',
          roomNo: roomNo || 'Admin-101',
          block: block || 'Main',
          profilePhoto: profilePhoto || null
        });
      }
    }

    if (updatedUser) {
      const { password: _password, ...userWithoutPassword } = updatedUser.toJSON();
      return res.json({ success: true, user: { ...userWithoutPassword, role } });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// 4. ANNOUNCEMENTS API
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

app.post('/api/announcements', async (req, res) => {
  const { title, text, attachment, attachmentName, important } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + 
                    ' - ' + 
                    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newAnnouncement = await Announcement.create({
      title: title || 'General Announcement',
      text,
      attachment: attachment || null,
      attachmentName: attachmentName || null,
      important: !!important,
      date: dateStr
    });
    res.status(201).json({ success: true, announcement: newAnnouncement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Announcement.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Announcement.findOneAndDelete({ _id: id });
    }
    if (!deleted) {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        deleted = await Announcement.findOneAndDelete({ _id: parsedId });
      }
    }
    if (!deleted) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// Event Banner API
app.get('/api/event-banner', async (req, res) => {
  try {
    const banner = await EventBanner.findOne().sort({ updatedAt: -1 });
    res.json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

app.post('/api/event-banner', async (req, res) => {
  const { title, description, date, bannerImage, active } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    let banner = await EventBanner.findOne();
    if (banner) {
      banner.title = title;
      banner.description = description || '';
      banner.date = date || '';
      banner.bannerImage = bannerImage || '';
      banner.active = active !== undefined ? active : true;
      banner.updatedAt = new Date();
      await banner.save();
    } else {
      banner = await EventBanner.create({
        title,
        description: description || '',
        date: date || '',
        bannerImage: bannerImage || '',
        active: active !== undefined ? active : true
      });
    }
    res.json({ success: true, banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

app.delete('/api/event-banner', async (req, res) => {
  try {
    await EventBanner.deleteMany();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// 5. WORKERS API
app.get('/api/workers', async (req, res) => {
  try {
    const workers = await Worker.find();
    res.json(workers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

app.post('/api/workers/request', async (req, res) => {
  const { workerName } = req.body;

  if (!workerName) {
    return res.status(400).json({ error: 'Worker name is required' });
  }

  try {
    const worker = await Worker.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${workerName}$`, 'i') } },
      { $inc: { tasks: 1 } },
      { returnDocument: 'after' }
    );

    if (worker) {
      return res.json({ success: true, worker });
    } else {
      return res.status(404).json({ error: 'Worker not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database update error' });
  }
});

app.post('/api/workers', async (req, res) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required' });
  }

  try {
    const count = await Worker.countDocuments();
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const color = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'][count % 6];

    const newWorker = await Worker.create({
      name,
      role,
      tasks: 0,
      avatar,
      color
    });
    res.status(201).json({ success: true, worker: newWorker });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// 6. MESSAGES API
app.get('/api/messages', async (req, res) => {
  const { studentEmail } = req.query;
  try {
    let query = {};
    if (studentEmail) {
      query.studentEmail = studentEmail.toLowerCase();
    }
    const messages = await Message.find(query).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

app.post('/api/messages', async (req, res) => {
  const { text, sender, studentEmail, studentName } = req.body;

  if (!text || !sender) {
    return res.status(400).json({ error: 'Text and sender are required' });
  }

  try {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newMessage = await Message.create({ 
      text, 
      sender, 
      time: timeStr,
      studentEmail: (studentEmail || 'student@gmail.com').toLowerCase(),
      studentName: studentName || 'Student'
    });
    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// Update / Edit Message
app.put('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required for editing' });
  }
  try {
    const updated = await Message.findByIdAndUpdate(
      id,
      { text },
      { returnDocument: 'after' }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ success: true, message: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// Delete Message
app.delete('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// Mark Messages as Read
app.put('/api/messages/read', async (req, res) => {
  const { studentEmail, sender } = req.body;
  if (!studentEmail || !sender) {
    return res.status(400).json({ error: 'studentEmail and sender are required' });
  }
  try {
    await Message.updateMany(
      { studentEmail: studentEmail.toLowerCase(), sender },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// 7. STUDENTS LIST API
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find({}, { password: 0 });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

// 8. WARDENS LIST API
app.get('/api/wardens', async (req, res) => {
  try {
    const wardens = await Warden.find({}, { password: 0 });
    res.json(wardens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

// ==========================================
// FEEDBACK SYSTEM APIs
// ==========================================

// Create a new feedback request (Warden)
app.post('/api/feedback-requests', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  try {
    // Automatically deactivate other active feedback requests so only one is active at a time
    await FeedbackRequest.updateMany({}, { active: false });

    const newRequest = new FeedbackRequest({
      title,
      description,
      active: true
    });
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// Get all feedback requests (Warden)
app.get('/api/feedback-requests', async (req, res) => {
  try {
    const requests = await FeedbackRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

// Get active feedback request(s) (Student)
app.get('/api/feedback-requests/active', async (req, res) => {
  try {
    const activeRequests = await FeedbackRequest.find({ active: true });
    res.json(activeRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

// Close a feedback request
app.put('/api/feedback-requests/:id/close', async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await FeedbackRequest.findByIdAndUpdate(
      id,
      { active: false },
      { returnDocument: 'after' }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Feedback request not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// Delete a feedback request
app.delete('/api/feedback-requests/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await FeedbackRequest.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Feedback request not found' });
    }
    // Delete all associated feedback responses
    await FeedbackResponse.deleteMany({ feedbackRequestId: id });
    res.json({ success: true, message: 'Feedback request and responses deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// Submit a feedback response (Student)
app.post('/api/feedback-responses', async (req, res) => {
  const { feedbackRequestId, studentEmail, studentName, rating, comments } = req.body;
  if (!feedbackRequestId) {
    return res.status(400).json({ error: 'feedbackRequestId is required' });
  }
  if (!studentEmail) {
    return res.status(400).json({ error: 'studentEmail is required' });
  }
  if (!studentName) {
    return res.status(400).json({ error: 'studentName is required' });
  }
  if (!rating) {
    return res.status(400).json({ error: 'rating is required' });
  }
  try {
    const response = new FeedbackResponse({
      feedbackRequestId,
      studentEmail,
      studentName,
      rating,
      comments: comments || ''
    });
    await response.save();
    res.status(201).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// Get all responses for a feedback request (Warden)
app.get('/api/feedback-responses', async (req, res) => {
  const { feedbackRequestId, studentEmail } = req.query;
  try {
    let query = {};
    if (feedbackRequestId) {
      if (mongoose.Types.ObjectId.isValid(feedbackRequestId)) {
        query.feedbackRequestId = feedbackRequestId;
      } else {
        return res.status(400).json({ error: 'Invalid feedbackRequestId format' });
      }
    }
    if (studentEmail) query.studentEmail = studentEmail.toLowerCase();
    const responses = await FeedbackResponse.find(query).sort({ createdAt: -1 });
    res.json(responses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running dynamically on port ${PORT}`);
});
