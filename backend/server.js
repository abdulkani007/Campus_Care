import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

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
  role: { type: String, default: 'warden' },
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

// Block Assignment model mapping Wardens to Hostel Blocks
const BlockAssignmentSchema = new mongoose.Schema({
  wardenEmail: { type: String, required: true, unique: true },
  wardenName: { type: String, required: true },
  blocks: [{ type: String, required: true }],
  role: { type: String, default: 'warden' },
  createdAt: { type: Date, default: Date.now }
});
const BlockAssignment = mongoose.model('BlockAssignment', BlockAssignmentSchema);

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
  assignedWardenEmail: { type: String, default: null },
  assignedWardenName: { type: String, default: null },
  assignedWorkerId: { type: String, default: null },
  assignedWorkerName: { type: String, default: null },
  assignedWorkerCategory: { type: String, default: null },
  assignedWorkerPhone: { type: String, default: null },
  workerStatus: { type: String, default: null },
  workerNotes: { type: String, default: null },
  workerProofImage: { type: String, default: null },
  completionDate: { type: Date, default: null },
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
  postedBy: { type: String, default: 'Warden' },
  authorName: { type: String, default: 'Hostel Administration' },
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
  studentBlock: { type: String, default: 'N/A' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

const WorkerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Electrician', 'Plumber', 'Carpenter', 'Housekeeping', 'Network Technician', 'Painter', 'Mess Staff', 'Other'], 
    required: true 
  },
  experience: { type: String, default: '' },
  address: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdBy: { type: String, default: 'Warden' },
  role: { type: String }, // Backward compatibility (defaults to category)
  tasks: { type: Number, default: 0 },
  avatar: { type: String },
  color: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Worker = mongoose.model('Worker', WorkerSchema);

const WorkerTaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true },
  complaintId: { type: String, required: true },
  workerId: { type: String },
  workerEmail: { type: String, default: 'workers@campuscare.com' },
  workerName: { type: String, required: true },
  workerCategory: { type: String, default: 'General' },
  assignedBy: { type: String, default: 'Block Warden' },
  assignedDate: { type: Date, default: Date.now },
  acceptedDate: { type: Date },
  completedDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Assigned', 'Accepted', 'In Progress', 'Completed', 'Verified', 'Closed', 'Rejected'], 
    default: 'Assigned' 
  },
  completionNotes: { type: String, default: '' },
  proofImage: { type: String, default: '' }
});
const WorkerTask = mongoose.model('WorkerTask', WorkerTaskSchema);

const FeedbackRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  active: { type: Boolean, default: true },
  postedBy: { type: String, default: 'Warden' },
  authorName: { type: String, default: 'Hostel Administration' },
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

// Dynamic Block Warden Assignment helper
const getAssignedWardenForBlock = async (studentBlock) => {
  if (!studentBlock) {
    const headW = await BlockAssignment.findOne({ role: 'headwarden' });
    return {
      wardenEmail: headW ? headW.wardenEmail : 'headwarden@campuscare.com',
      wardenName: headW ? headW.wardenName : 'Head Warden'
    };
  }

  let cleanBlock = studentBlock.trim().toUpperCase();
  const match = cleanBlock.match(/\b([A-F])\b/);
  if (match) {
    cleanBlock = match[1];
  } else if (cleanBlock.length > 0) {
    cleanBlock = cleanBlock.charAt(0);
  }

  // Find block assignment in DB dynamically
  let assignment = await BlockAssignment.findOne({
    blocks: cleanBlock,
    role: 'warden'
  });

  if (!assignment) {
    assignment = await BlockAssignment.findOne({ blocks: cleanBlock });
  }

  if (assignment) {
    return {
      wardenEmail: assignment.wardenEmail,
      wardenName: assignment.wardenName,
      assignedBlock: cleanBlock
    };
  }

  const headW = await BlockAssignment.findOne({ role: 'headwarden' });
  return {
    wardenEmail: headW ? headW.wardenEmail : 'headwarden@campuscare.com',
    wardenName: headW ? headW.wardenName : 'Head Warden',
    assignedBlock: cleanBlock
  };
};

// Seeding Predefined Warden Credentials & Block Assignments
const seedDefaults = async () => {
  try {
    // Purge legacy test accounts so ONLY official @campuscare.com accounts can authenticate
    await Warden.deleteMany({ email: { $in: ['warden@gmail.com', 'managemant@gmail.com'] } });
    await BlockAssignment.deleteMany({ wardenEmail: { $in: ['warden@gmail.com', 'managemant@gmail.com'] } });
    await Management.deleteMany({ email: { $in: ['managemant@gmail.com', 'management@gmail.com'] } });

    const defaultWardens = [
      {
        name: 'ABC Block Warden',
        email: 'abcwarden@campuscare.com',
        rollNo: 'EMP-ABC',
        phoneNo: '9876543211',
        roomNo: 'Office-ABC',
        block: 'A, B, C',
        password: 'sece123',
        role: 'warden',
        blocks: ['A', 'B', 'C']
      },
      {
        name: 'D Block Warden',
        email: 'dwarden@campuscare.com',
        rollNo: 'EMP-D01',
        phoneNo: '9876543212',
        roomNo: 'Office-D',
        block: 'D',
        password: 'sece123',
        role: 'warden',
        blocks: ['D']
      },
      {
        name: 'E Block Warden',
        email: 'ewarden@campuscare.com',
        rollNo: 'EMP-E01',
        phoneNo: '9876543213',
        roomNo: 'Office-E',
        block: 'E',
        password: 'sece123',
        role: 'warden',
        blocks: ['E']
      },
      {
        name: 'F Block Warden',
        email: 'fwarden@campuscare.com',
        rollNo: 'EMP-F01',
        phoneNo: '9876543214',
        roomNo: 'Office-F',
        block: 'F',
        password: 'sece123',
        role: 'warden',
        blocks: ['F']
      },
      {
        name: 'Head Warden',
        email: 'headwarden@campuscare.com',
        rollNo: 'EMP-HEAD',
        phoneNo: '9876543215',
        roomNo: 'Head-Office',
        block: 'A, B, C, D, E, F',
        password: 'sece123',
        role: 'headwarden',
        blocks: ['A', 'B', 'C', 'D', 'E', 'F']
      }
    ];

    for (const w of defaultWardens) {
      const existingWarden = await Warden.findOne({ email: w.email.toLowerCase() });
      if (!existingWarden) {
        await Warden.create({
          name: w.name,
          email: w.email.toLowerCase(),
          rollNo: w.rollNo,
          phoneNo: w.phoneNo,
          roomNo: w.roomNo,
          block: w.block,
          password: w.password,
          role: w.role
        });
        console.log(`Seeded Warden: ${w.email}`);
      } else {
        existingWarden.password = w.password;
        existingWarden.role = w.role;
        await existingWarden.save();
      }

      const existingAssignment = await BlockAssignment.findOne({ wardenEmail: w.email.toLowerCase() });
      if (!existingAssignment) {
        await BlockAssignment.create({
          wardenEmail: w.email.toLowerCase(),
          wardenName: w.name,
          blocks: w.blocks,
          role: w.role
        });
        console.log(`Seeded BlockAssignment for ${w.email}`);
      } else {
        existingAssignment.blocks = w.blocks;
        existingAssignment.role = w.role;
        await existingAssignment.save();
      }
    }

    const defaultManagements = [
      {
        name: 'Management Executive',
        email: 'management@campuscare.com',
        rollNo: 'MGT-001',
        phoneNo: '9876543220',
        roomNo: 'Admin-01',
        block: 'All Blocks',
        password: 'sece123'
      }
    ];

    for (const m of defaultManagements) {
      const existingMgt = await Management.findOne({ email: m.email.toLowerCase() });
      if (!existingMgt) {
        await Management.create({
          name: m.name,
          email: m.email.toLowerCase(),
          rollNo: m.rollNo,
          phoneNo: m.phoneNo,
          roomNo: m.roomNo,
          block: m.block,
          password: m.password
        });
        console.log(`Seeded Management: ${m.email}`);
      } else {
        existingMgt.password = m.password;
        await existingMgt.save();
      }
    }

    const defaultStudent = {
      name: 'Arun Kumar',
      email: 'student@gmail.com',
      rollNo: '2021CS101',
      phoneNo: '9876543210',
      roomNo: '305',
      block: 'C',
      password: 'student123'
    };

    const existingStudent = await Student.findOne({ email: defaultStudent.email.toLowerCase() });
    if (!existingStudent) {
      await Student.create(defaultStudent);
      console.log('Seeded default Student.');
    }

    // Clean out default system-seeded workers so only warden-added workers appear
    await Worker.deleteMany({ createdBy: 'System' });
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

  const cleanEmail = email.toLowerCase().trim();

  try {
    // 1. Warden or Head Warden login
    if (role === 'warden' || role === 'headwarden') {
      const matched = await Warden.findOne({ email: cleanEmail, password });
      if (matched) {
        const { password: _password, ...userWithoutPassword } = matched.toJSON();
        const assignment = await BlockAssignment.findOne({ wardenEmail: cleanEmail });
        return res.json({
          success: true,
          user: {
            ...userWithoutPassword,
            role: matched.role || (assignment ? assignment.role : 'warden'),
            assignedBlocks: assignment ? assignment.blocks : (matched.block ? matched.block.split(',').map(b => b.trim()) : [])
          }
        });
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    // 2. Student login
    if (role === 'student') {
      const matched = await Student.findOne({ email: cleanEmail, password });
      if (matched) {
        const { password: _password, ...userWithoutPassword } = matched.toJSON();
        return res.json({ success: true, user: { ...userWithoutPassword, role: 'student' } });
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    // 3. Management login
    if (role === 'management') {
      const matched = await Management.findOne({ email: cleanEmail, password });
      if (matched) {
        const { password: _password, ...userWithoutPassword } = matched.toJSON();
        return res.json({ success: true, user: { ...userWithoutPassword, role: 'management' } });
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    // 4. Worker login
    if (role === 'worker' || cleanEmail === 'workers@campuscare.com') {
      if (cleanEmail === 'workers@campuscare.com' && password === 'sece123') {
        return res.json({
          success: true,
          user: {
            name: 'CampusCare Worker Staff',
            email: 'workers@campuscare.com',
            role: 'worker',
            category: 'General Maintenance'
          }
        });
      }
      const matchedWorker = await Worker.findOne({ email: cleanEmail });
      if (matchedWorker && password === 'sece123') {
        return res.json({
          success: true,
          user: {
            _id: matchedWorker._id,
            name: matchedWorker.name,
            email: matchedWorker.email || 'workers@campuscare.com',
            phone: matchedWorker.phone,
            category: matchedWorker.category,
            role: 'worker'
          }
        });
      }
      if (role === 'worker') {
        return res.status(401).json({ error: 'Invalid worker credentials' });
      }
    }

    // 4. Dynamic role lookup fallback across Warden, Management, Student
    let matchedWarden = await Warden.findOne({ email: cleanEmail, password });
    if (matchedWarden) {
      const { password: _password, ...userWithoutPassword } = matchedWarden.toJSON();
      const assignment = await BlockAssignment.findOne({ wardenEmail: cleanEmail });
      return res.json({
        success: true,
        user: {
          ...userWithoutPassword,
          role: matchedWarden.role || (assignment ? assignment.role : 'warden'),
          assignedBlocks: assignment ? assignment.blocks : (matchedWarden.block ? matchedWarden.block.split(',').map(b => b.trim()) : [])
        }
      });
    }

    let matchedMgt = await Management.findOne({ email: cleanEmail, password });
    if (matchedMgt) {
      const { password: _password, ...userWithoutPassword } = matchedMgt.toJSON();
      return res.json({ success: true, user: { ...userWithoutPassword, role: 'management' } });
    }

    let matchedStudent = await Student.findOne({ email: cleanEmail, password });
    if (matchedStudent) {
      const { password: _password, ...userWithoutPassword } = matchedStudent.toJSON();
      return res.json({ success: true, user: { ...userWithoutPassword, role: 'student' } });
    }

    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database login error' });
  }
});

// 3. COMPLAINTS API
app.get('/api/complaints', async (req, res) => {
  const { userEmail, userRole, studentEmail } = req.query;

  try {
    let filter = {};
    const effectiveEmail = (userEmail || studentEmail || '').toLowerCase().trim();
    const effectiveRole = (userRole || '').toLowerCase().trim();

    if (effectiveRole === 'student') {
      if (effectiveEmail) {
        filter = { studentEmail: effectiveEmail };
      }
    } else if (effectiveRole === 'warden') {
      const assignment = await BlockAssignment.findOne({ wardenEmail: effectiveEmail });
      if (assignment) {
        if (assignment.role === 'headwarden' || assignment.blocks.length >= 6) {
          filter = {}; // Head Warden views all complaints across all blocks
        } else {
          // Block Warden views only assigned blocks (e.g., A, B, C for ABC Warden)
          const blockRegexes = assignment.blocks.map(b => new RegExp(`^(${b}|${b}\\s*Block|Block\\s*${b})$`, 'i'));
          filter = {
            $or: [
              { studentBlock: { $in: assignment.blocks } },
              { studentBlock: { $in: blockRegexes } },
              { assignedWardenEmail: effectiveEmail }
            ]
          };
        }
      }
    } else if (effectiveRole === 'headwarden' || effectiveRole === 'management') {
      filter = {}; // Head Warden & Management view all complaints
    } else if (effectiveEmail) {
      // Automatic lookup if role query string is omitted
      const studentMatch = await Student.findOne({ email: effectiveEmail });
      if (studentMatch) {
        filter = { studentEmail: effectiveEmail };
      } else {
        const assignment = await BlockAssignment.findOne({ wardenEmail: effectiveEmail });
        if (assignment && assignment.role !== 'headwarden' && assignment.blocks.length < 6) {
          const blockRegexes = assignment.blocks.map(b => new RegExp(`^(${b}|${b}\\s*Block|Block\\s*${b})$`, 'i'));
          filter = {
            $or: [
              { studentBlock: { $in: assignment.blocks } },
              { studentBlock: { $in: blockRegexes } },
              { assignedWardenEmail: effectiveEmail }
            ]
          };
        }
      }
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    const students = await Student.find();
    
    const resolved = complaints.map(c => {
      const obj = c.toJSON();

      const formattedTime = (obj.time && obj.time !== 'Just now')
        ? obj.time
        : new Date(obj.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + 
          ' - ' + 
          new Date(obj.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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
          studentPhoto: matched.profilePhoto || null,
          assignedWardenEmail: obj.assignedWardenEmail || null,
          assignedWardenName: obj.assignedWardenName || null
        };
      }

      return {
        ...obj,
        time: formattedTime,
        studentName: obj.studentName || 'Student',
        studentPhone: obj.studentPhone || 'N/A',
        studentRoll: obj.studentRoll || 'N/A',
        studentRoom: obj.studentRoom || 'N/A',
        studentBlock: obj.studentBlock || 'N/A',
        studentPhoto: null,
        assignedWardenEmail: obj.assignedWardenEmail || null,
        assignedWardenName: obj.assignedWardenName || null
      };
    });

    res.json(resolved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

app.post('/api/complaints', async (req, res) => {
  let { title, category, priority, description, location, studentName, studentPhone, studentRoll, studentRoom, studentBlock, studentEmail, proof, proofName } = req.body;

  if (!title || !category || !priority || !description || !location) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    if ((!studentBlock || studentBlock === 'N/A') && studentEmail) {
      const studentDoc = await Student.findOne({ email: studentEmail.toLowerCase() });
      if (studentDoc && studentDoc.block) {
        studentBlock = studentDoc.block;
      }
    }

    // Automatically assign the correct Block Warden via DB BlockAssignment
    const wardenInfo = await getAssignedWardenForBlock(studentBlock);

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
      assignedWardenEmail: wardenInfo.wardenEmail,
      assignedWardenName: wardenInfo.wardenName,
      proof: proof || null,
      proofName: proofName || null
    });
    res.status(201).json({ success: true, complaint: newComplaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// BLOCK ASSIGNMENTS API
app.get('/api/block-assignments', async (req, res) => {
  try {
    const assignments = await BlockAssignment.find();
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch block assignments' });
  }
});

app.post('/api/block-assignments', async (req, res) => {
  const { wardenEmail, wardenName, blocks, role } = req.body;
  if (!wardenEmail || !blocks || !Array.isArray(blocks)) {
    return res.status(400).json({ error: 'wardenEmail and blocks array are required' });
  }
  try {
    const cleanEmail = wardenEmail.toLowerCase().trim();
    const updated = await BlockAssignment.findOneAndUpdate(
      { wardenEmail: cleanEmail },
      { wardenEmail: cleanEmail, wardenName: wardenName || 'Warden', blocks, role: role || 'warden' },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ success: true, assignment: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update block assignment' });
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
  const { title, text, attachment, attachmentName, important, postedBy, authorName } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text content is required for announcement' });
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
      date: dateStr,
      postedBy: postedBy || 'Warden',
      authorName: authorName || 'Hostel Administration'
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

// 5. WORKERS API & TASK MANAGEMENT
app.get('/api/workers', async (req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: 'Database read error' });
  }
});

app.post('/api/workers', async (req, res) => {
  const { name, email, phone, category, experience, address, status, createdBy } = req.body;

  if (!name || !phone || !category) {
    return res.status(400).json({ error: 'Full Name, Phone Number, and Worker Category are required' });
  }

  try {
    const count = await Worker.countDocuments();
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const color = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'][count % 6];

    const newWorker = await Worker.create({
      name,
      email: email || 'workers@campuscare.com',
      phone,
      category,
      role: category,
      experience: experience || '',
      address: address || '',
      status: status || 'Active',
      createdBy: createdBy || 'Warden',
      tasks: 0,
      avatar,
      color
    });
    res.status(201).json({ success: true, worker: newWorker });
  } catch (err) {
    res.status(500).json({ error: 'Error creating worker', details: err.message });
  }
});

app.put('/api/workers/:id', async (req, res) => {
  const { name, email, phone, category, experience, address, status } = req.body;
  try {
    const updated = await Worker.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        category,
        role: category,
        experience,
        address,
        status
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Worker not found' });
    res.json({ success: true, worker: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error updating worker' });
  }
});

app.delete('/api/workers/:id', async (req, res) => {
  try {
    // Prevent deletion if worker has active tasks
    const activeTasks = await WorkerTask.find({
      workerId: req.params.id,
      status: { $in: ['Assigned', 'Accepted', 'In Progress'] }
    });

    if (activeTasks.length > 0) {
      return res.status(400).json({
        error: `Cannot delete worker with ${activeTasks.length} active task(s). Please reassign their active tasks or set status to Inactive instead.`
      });
    }

    const deleted = await Worker.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Worker not found' });
    res.json({ success: true, message: 'Worker removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting worker' });
  }
});

// ASSIGN WORKER TO COMPLAINT
app.post('/api/complaints/:id/assign-worker', async (req, res) => {
  const { workerId, workerName, workerCategory, workerPhone, assignedBy } = req.body;

  if (!workerId || !workerName) {
    return res.status(400).json({ error: 'Worker ID and Worker Name are required' });
  }

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const worker = await Worker.findById(workerId);

    // Update complaint model
    complaint.assignedWorkerId = workerId;
    complaint.assignedWorkerName = workerName;
    complaint.assignedWorkerCategory = workerCategory || (worker ? worker.category : 'General');
    complaint.assignedWorkerPhone = workerPhone || (worker ? worker.phone : 'N/A');
    complaint.workerStatus = 'Assigned';
    complaint.status = 'In Progress';
    await complaint.save();

    // Create or update WorkerTask
    const taskId = `WT-${Date.now()}`;
    const task = await WorkerTask.create({
      taskId,
      complaintId: complaint._id.toString(),
      workerId,
      workerEmail: (worker && worker.email) ? worker.email : 'workers@campuscare.com',
      workerName,
      workerCategory: workerCategory || (worker ? worker.category : 'General'),
      assignedBy: assignedBy || 'Block Warden',
      assignedDate: new Date(),
      status: 'Assigned'
    });

    // Increment worker task count
    if (worker) {
      worker.tasks = (worker.tasks || 0) + 1;
      await worker.save();
    }

    res.json({ success: true, complaint, task });
  } catch (err) {
    res.status(500).json({ error: 'Error assigning worker', details: err.message });
  }
});

// GET WORKER TASKS
app.get('/api/worker-tasks', async (req, res) => {
  const { workerEmail, workerId, complaintId } = req.query;
  try {
    let filter = {};
    if (complaintId) {
      filter.complaintId = complaintId;
    } else if (workerId) {
      filter.workerId = workerId;
    } else if (workerEmail) {
      filter.$or = [
        { workerEmail: workerEmail.toLowerCase().trim() },
        { workerEmail: 'workers@campuscare.com' }
      ];
    }
    const tasks = await WorkerTask.find(filter).sort({ assignedDate: -1 });

    // Populate associated complaint details for each task
    const complaintIds = tasks.map(t => t.complaintId).filter(Boolean);
    const complaints = await Complaint.find({ _id: { $in: complaintIds } });
    const complaintMap = {};
    complaints.forEach(c => { complaintMap[c._id.toString()] = c; });

    const enrichedTasks = tasks.map(t => ({
      ...t.toJSON(),
      complaint: complaintMap[t.complaintId] || null
    }));

    res.json(enrichedTasks);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching worker tasks' });
  }
});

// UPDATE WORKER TASK STATUS
app.put('/api/worker-tasks/:taskId/status', async (req, res) => {
  const { status, completionNotes, proofImage } = req.body;
  try {
    const task = await WorkerTask.findOne({ taskId: req.params.taskId });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.status = status;
    if (status === 'Accepted') {
      task.acceptedDate = new Date();
    } else if (status === 'Completed') {
      task.completedDate = new Date();
      if (completionNotes) task.completionNotes = completionNotes;
      if (proofImage) task.proofImage = proofImage;
    }
    await task.save();

    // Sync status to Complaint model
    const complaint = await Complaint.findById(task.complaintId);
    if (complaint) {
      complaint.workerStatus = status;
      if (status === 'Accepted') {
        complaint.status = 'In Progress';
      } else if (status === 'Completed') {
        complaint.status = 'Completed';
        complaint.workerNotes = completionNotes || complaint.workerNotes;
        complaint.workerProofImage = proofImage || complaint.workerProofImage;
        complaint.completionDate = new Date();
      } else if (status === 'Verified' || status === 'Closed') {
        complaint.status = 'Closed';
        complaint.workerStatus = 'Closed';
      } else if (status === 'Rejected') {
        complaint.status = 'Open';
        complaint.assignedWorkerId = null;
        complaint.assignedWorkerName = null;
        complaint.workerStatus = null;
      }
      await complaint.save();
    }

    res.json({ success: true, task, complaint });
  } catch (err) {
    res.status(500).json({ error: 'Error updating task status' });
  }
});

// 6. MESSAGES API
app.get('/api/messages', async (req, res) => {
  const { studentEmail, userEmail, userRole } = req.query;
  try {
    let query = {};
    const effectiveEmail = (userEmail || '').toLowerCase().trim();
    const effectiveRole = (userRole || '').toLowerCase().trim();

    if (studentEmail) {
      query.studentEmail = studentEmail.toLowerCase().trim();
    } else if (effectiveRole === 'warden' && effectiveEmail) {
      const assignment = await BlockAssignment.findOne({ wardenEmail: effectiveEmail });
      if (assignment) {
        if (assignment.role === 'headwarden' || assignment.blocks.length >= 6) {
          query = {}; // Head warden can see all messages across all blocks
        } else {
          // Block warden sees messages ONLY from students in their assigned blocks
          const blockRegexes = assignment.blocks.map(b => new RegExp(`^(${b}|${b}\\s*Block|Block\\s*${b})$`, 'i'));
          const studentsInBlock = await Student.find({
            $or: [
              { block: { $in: assignment.blocks } },
              { block: { $in: blockRegexes } }
            ]
          });
          const studentEmails = studentsInBlock.map(s => s.email.toLowerCase());
          query = {
            $or: [
              { studentEmail: { $in: studentEmails } },
              { studentEmail: effectiveEmail },
              { studentBlock: { $in: assignment.blocks } },
              { studentBlock: { $in: blockRegexes } }
            ]
          };
        }
      }
    } else if (effectiveEmail && effectiveRole !== 'headwarden' && effectiveRole !== 'management') {
      const assignment = await BlockAssignment.findOne({ wardenEmail: effectiveEmail });
      if (assignment && assignment.role !== 'headwarden' && assignment.blocks.length < 6) {
        const blockRegexes = assignment.blocks.map(b => new RegExp(`^(${b}|${b}\\s*Block|Block\\s*${b})$`, 'i'));
        const studentsInBlock = await Student.find({
          $or: [
            { block: { $in: assignment.blocks } },
            { block: { $in: blockRegexes } }
          ]
        });
        const studentEmails = studentsInBlock.map(s => s.email.toLowerCase());
        query = {
          $or: [
            { studentEmail: { $in: studentEmails } },
            { studentBlock: { $in: assignment.blocks } },
            { studentBlock: { $in: blockRegexes } }
          ]
        };
      }
    }

    const messages = await Message.find(query).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

app.post('/api/messages', async (req, res) => {
  let { text, sender, studentEmail, studentName, studentBlock } = req.body;

  if (!text || !sender) {
    return res.status(400).json({ error: 'Text and sender are required' });
  }

  const cleanEmail = (studentEmail || 'student@gmail.com').toLowerCase().trim();

  try {
    if ((!studentBlock || studentBlock === 'N/A') && cleanEmail) {
      const studentDoc = await Student.findOne({ email: cleanEmail });
      if (studentDoc && studentDoc.block) {
        studentBlock = studentDoc.block;
      }
    }

    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newMessage = await Message.create({ 
      text, 
      sender, 
      time: timeStr,
      studentEmail: cleanEmail,
      studentName: studentName || 'Student',
      studentBlock: studentBlock || 'N/A'
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

// 7. STUDENTS LIST API (Filtered by Warden's assigned blocks)
app.get('/api/students', async (req, res) => {
  const { userEmail, userRole } = req.query;

  try {
    let filter = {};
    const effectiveEmail = (userEmail || '').toLowerCase().trim();
    const effectiveRole = (userRole || '').toLowerCase().trim();

    if (effectiveRole === 'headwarden' || effectiveRole === 'management') {
      filter = {}; // Head warden and Management see ALL students across ALL blocks (A, B, C, D, E, F)
    } else if (effectiveEmail) {
      const assignment = await BlockAssignment.findOne({ wardenEmail: effectiveEmail });
      if (assignment) {
        if (assignment.role === 'headwarden' || (assignment.blocks && assignment.blocks.length >= 6)) {
          filter = {}; // Head warden can view all residents across all blocks
        } else if (assignment.blocks && assignment.blocks.length > 0) {
          // Block warden sees ONLY residents belonging to their assigned blocks (e.g. D Block for D Warden)
          const blockRegexes = assignment.blocks.map(b => new RegExp(`^(${b}|${b}\\s*Block|Block\\s*${b})$`, 'i'));
          filter = {
            $or: [
              { block: { $in: assignment.blocks } },
              { block: { $in: blockRegexes } }
            ]
          };
        }
      } else {
        // Fallback if no BlockAssignment record: match by user's profile block if present
        const userDoc = await User.findOne({ email: effectiveEmail });
        if (userDoc && userDoc.block && userDoc.block !== 'All') {
          const b = userDoc.block;
          const blockRegex = new RegExp(`^(${b}|${b}\\s*Block|Block\\s*${b})$`, 'i');
          filter = {
            $or: [
              { block: b },
              { block: blockRegex }
            ]
          };
        }
      }
    }

    const students = await Student.find(filter, { password: 0 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
});

// 8. WARDENS LIST API (With Assigned Blocks)
app.get('/api/wardens', async (req, res) => {
  try {
    const wardens = await Warden.find({}, { password: 0 });
    const assignments = await BlockAssignment.find({});
    
    const wardensWithAssignments = wardens.map(w => {
      const assign = assignments.find(a => a.wardenEmail.toLowerCase() === w.email.toLowerCase());
      return {
        ...w.toObject(),
        blocks: assign ? assign.blocks : (w.block ? w.block.split(',').map(b => b.trim()) : ['A', 'B', 'C', 'D', 'E', 'F'])
      };
    });

    res.json(wardensWithAssignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

// ==========================================
// FEEDBACK SYSTEM APIs
// ==========================================

// Create a new feedback request (Warden or Management)
app.post('/api/feedback-requests', async (req, res) => {
  const { title, description, postedBy, authorName } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  try {
    // Automatically deactivate other active feedback requests so only one is active at a time
    await FeedbackRequest.updateMany({}, { active: false });

    const newRequest = new FeedbackRequest({
      title,
      description,
      active: true,
      postedBy: postedBy || 'Warden',
      authorName: authorName || 'Hostel Administration'
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
