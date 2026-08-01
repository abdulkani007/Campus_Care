import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campuscare';
const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
  profilePhoto: { type: String, default: null },
  status: { type: String, default: 'Active' },
  deleted: { type: Boolean, default: false }
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
  authorEmail: { type: String, default: '' },
  targetBlock: { type: String, default: 'All' },
  createdAt: { type: Date, default: Date.now }
});
const FeedbackRequest = mongoose.model('FeedbackRequest', FeedbackRequestSchema);

const FeedbackResponseSchema = new mongoose.Schema({
  feedbackRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedbackRequest', required: true },
  studentEmail: { type: String, required: true },
  studentName: { type: String, required: true },
  studentBlock: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const FeedbackResponse = mongoose.model('FeedbackResponse', FeedbackResponseSchema);

// Helper to extract clean array of block letters (e.g. "A, B, C", "D Block", "Block E" -> ["A", "B", "C"], ["D"], ["E"])
const extractBlockLetters = (blockStr) => {
  if (!blockStr) return [];
  const clean = blockStr.toString().toUpperCase().replace(/BLOCK/g, '');
  const letters = clean.match(/[A-Z0-9]+/g) || [];
  return letters.filter(l => l !== 'ALL');
};

// Helper to check if targetBlock matches userBlock/studentBlock
const matchesBlock = (targetBlock, userBlock) => {
  if (!targetBlock || targetBlock === 'All' || targetBlock === 'ALL') return true;
  if (!userBlock || userBlock === 'All' || userBlock === 'ALL') return true;
  
  const targetLetters = extractBlockLetters(targetBlock);
  const userLetters = extractBlockLetters(userBlock);
  
  if (targetLetters.length === 0 || userLetters.length === 0) return true;
  return userLetters.some(ul => targetLetters.includes(ul));
};

const IncidentGroupMessageSchema = new mongoose.Schema({
  blockGroup: { type: String, required: true }, // 'ABC', 'D', 'E', 'F'
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  senderRole: { type: String, required: true },
  senderRoomNo: { type: String }, // optional for student
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
const IncidentGroupMessage = mongoose.model('IncidentGroupMessage', IncidentGroupMessageSchema);

const GroupInsightSchema = new mongoose.Schema({
  blockGroup: { type: String, required: true, unique: true }, // 'ABC', 'D', 'E', 'F'
  summary: { type: String, required: true },
  mostDiscussedTopic: { type: String },
  mostMentionedCategory: { type: String },
  lastUpdated: { type: Date, default: Date.now },
  messageCount: { type: Number, default: 0 },
  activeStudentsCount: { type: Number, default: 0 }
});
const GroupInsight = mongoose.model('GroupInsight', GroupInsightSchema);


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

    const defaultStudents = [
      {
        name: 'Veera',
        email: 'veera@gmail.com',
        rollNo: '24IT001',
        phoneNo: '9876543210',
        roomNo: '302',
        block: 'A',
        password: 'student123'
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul@gmail.com',
        rollNo: '24CS005',
        phoneNo: '9876543219',
        roomNo: '204',
        block: 'B',
        password: 'student123'
      },
      {
        name: 'Arun Kumar',
        email: 'student@gmail.com',
        rollNo: '2021CS101',
        phoneNo: '9876543210',
        roomNo: '305',
        block: 'C',
        password: 'student123'
      },
      {
        name: 'Abbu',
        email: 'abdulkani.b2024it@sece.ac.in',
        rollNo: '24IT002',
        phoneNo: '8072924468',
        roomNo: '402-B',
        block: 'D2',
        password: 'abbu007'
      },
      {
        name: 'Haris',
        email: 'haris@gmail.com',
        rollNo: '24ME012',
        phoneNo: '9876543218',
        roomNo: '105',
        block: 'E',
        password: 'student123'
      },
      {
        name: 'Vikas',
        email: 'vikas@gmail.com',
        rollNo: '24EC030',
        phoneNo: '9876543217',
        roomNo: '401',
        block: 'F',
        password: 'student123'
      }
    ];

    for (const st of defaultStudents) {
      const existingStudent = await Student.findOne({ email: st.email.toLowerCase() });
      if (!existingStudent) {
        await Student.create(st);
      } else {
        existingStudent.block = st.block;
        await existingStudent.save();
      }
    }
    console.log('Seeded default students for all blocks.');

    // Clean out default system-seeded workers so only warden-added workers appear
    await Worker.deleteMany({ createdBy: 'System' });

    // Clean up default mock messages if they exist in the database
    await IncidentGroupMessage.deleteMany({
      text: {
        $in: [
          'Hi everyone, is the water working on the 4th floor of D block?',
          'It is working here on 3rd floor but the pressure is very low.',
          'Warden here. I have informed the maintenance team. Plumber will check the pumps in 10 minutes.',
          'Thanks for the quick response, sir!',
          'Hey guys, the Wi-Fi speed in C block is extremely slow today. Anyone face this internet issue?',
          'Yes, same in Block A as well. Can barely load study materials.',
          'Warden here. The internet provider is performing line maintenance today. It should be resolved by evening.'
        ]
      }
    });
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

  if (!email || !email.trim().toLowerCase().endsWith('@sece.ac.in')) {
    return res.status(400).json({
      success: false,
      message: "Only official Sri Eshwar College email addresses (@sece.ac.in) are allowed."
    });
  }

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

  if (role === 'student' && (!email || !email.trim().toLowerCase().endsWith('@sece.ac.in'))) {
    return res.status(400).json({
      success: false,
      message: "Only official Sri Eshwar College email addresses (@sece.ac.in) are allowed."
    });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // 1. Warden or Head Warden login
    if (role === 'warden' || role === 'headwarden') {
      const matched = await Warden.findOne({ email: cleanEmail, password });
      if (matched) {
        if (matched.deleted === true) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
        if (matched.status === 'Inactive') {
          return res.status(403).json({ error: 'Your account has been deactivated. Please contact the Head Warden.' });
        }
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
      if (matchedWarden.deleted === true) {
        // Skip this match, treat as not found
      } else if (matchedWarden.status === 'Inactive') {
        return res.status(403).json({ error: 'Your account has been deactivated. Please contact the Head Warden.' });
      } else {
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

    const msgObj = newMessage.toJSON();
    io.emit('receive_direct_message', msgObj);
    io.emit('global_activity_notification', msgObj);

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

// Clear Entire Direct Message Conversation (Must be before /:id route)
app.delete('/api/messages/conversation', async (req, res) => {
  const { studentEmail } = req.query;
  if (!studentEmail) {
    return res.status(400).json({ error: 'studentEmail query param is required' });
  }
  try {
    const cleanEmail = studentEmail.trim().toLowerCase();
    const regex = new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
    await Message.deleteMany({ studentEmail: regex });
    res.json({ success: true, message: 'Conversation cleared successfully' });
  } catch (err) {
    console.error('Error clearing conversation:', err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// Delete Single Message
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
  const { studentEmail, sender } = req.body || {};
  if (!studentEmail) {
    return res.status(400).json({ error: 'studentEmail is required' });
  }
  try {
    const filter = { studentEmail: studentEmail.toLowerCase() };
    if (sender) filter.sender = sender;
    await Message.updateMany(filter, { read: true });
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
          // Block warden sees ONLY residents belonging to their assigned blocks (e.g. A, B, C for ABC Warden)
          const conditions = [];
          assignment.blocks.forEach(b => {
            const cleanB = b.trim();
            conditions.push({ block: new RegExp(`^(${cleanB}|${cleanB}\\s*Block|Block\\s*${cleanB}|${cleanB}.*)$`, 'i') });
            conditions.push({ block: cleanB });
          });

          // If assigned blocks contain A, B, C or ABC, match A, B, C, ABC
          const hasABC = assignment.blocks.some(b => ['A', 'B', 'C', 'ABC'].includes(b.toUpperCase()));
          if (hasABC) {
            conditions.push(
              { block: { $regex: '^(ABC|A|B|C)', $options: 'i' } },
              { block: 'A' }, { block: 'B' }, { block: 'C' }, { block: 'ABC' }
            );
          }

          filter = { $or: conditions };
        }
      } else {
        // Fallback if no BlockAssignment record: match by user's profile block if present
        const userDoc = await User.findOne({ email: effectiveEmail });
        if (userDoc && userDoc.block && userDoc.block !== 'All') {
          const b = userDoc.block.trim();
          filter = {
            $or: [
              { block: b },
              { block: new RegExp(`^(${b}|${b}\\s*Block|Block\\s*${b}|${b}.*)$`, 'i') }
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
    const wardens = await Warden.find({ deleted: { $ne: true } });
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

const isAdmin = (req, res, next) => {
  const userEmail = (req.headers['x-user-email'] || req.query.userEmail || '').toLowerCase().trim();
  const userRole = (req.headers['x-user-role'] || req.query.userRole || '').toLowerCase().trim();
  
  if (userEmail === 'headwarden@campuscare.com' || userRole === 'headwarden') {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized. Only the Head Warden can manage wardens.' });
  }
};

// Create Warden (Admin access)
app.post('/api/admin/wardens', isAdmin, async (req, res) => {
  const { name, phoneNo, email, block, password, status } = req.body;

  if (!name || !phoneNo || !email || !block || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (phoneNo.length !== 10) {
    return res.status(400).json({ error: 'Phone number must be exactly 10 digits.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const existingEmail = await Warden.findOne({ email: cleanEmail, deleted: { $ne: true } });
    if (existingEmail) {
      return res.status(400).json({ error: 'This official email ID is already registered.' });
    }

    const existingPhone = await Warden.findOne({ phoneNo, deleted: { $ne: true } });
    if (existingPhone) {
      return res.status(400).json({ error: 'This phone number is already registered.' });
    }

    const selectStatus = status || 'Active';
    if (selectStatus === 'Active') {
      const activeWardenForBlock = await Warden.findOne({ block, status: 'Active', deleted: { $ne: true } });
      if (activeWardenForBlock) {
        return res.status(400).json({ error: 'This hostel block already has an active warden.' });
      }
    }

    const rollNo = `EMP-${block.split(' ')[0]}-${Date.now().toString().slice(-4)}`;
    const roomNo = `Office-${block.split(' ')[0]}`;

    const newWarden = await Warden.create({
      name,
      email: cleanEmail,
      rollNo,
      phoneNo,
      roomNo,
      block,
      password,
      status: selectStatus,
      role: 'warden'
    });

    let blocksArr = [];
    if (block === 'ABC Block') blocksArr = ['A', 'B', 'C'];
    else if (block === 'D Block') blocksArr = ['D'];
    else if (block === 'E Block') blocksArr = ['E'];
    else if (block === 'F Block') blocksArr = ['F'];

    await BlockAssignment.findOneAndUpdate(
      { wardenEmail: cleanEmail },
      { wardenEmail: cleanEmail, wardenName: name, blocks: blocksArr, role: 'warden' },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, warden: newWarden });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create warden.' });
  }
});

// Update Warden (Admin access)
app.put('/api/admin/wardens/:id', isAdmin, async (req, res) => {
  const { name, phoneNo, email, block, password, status } = req.body;
  const wardenId = req.params.id;

  if (!name || !phoneNo || !email || !block) {
    return res.status(400).json({ error: 'All fields except password are required' });
  }

  if (phoneNo.length !== 10) {
    return res.status(400).json({ error: 'Phone number must be exactly 10 digits.' });
  }

  if (password && password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const warden = await Warden.findById(wardenId);
    if (!warden || warden.deleted === true) {
      return res.status(404).json({ error: 'Warden not found.' });
    }

    if (cleanEmail !== warden.email) {
      const existingEmail = await Warden.findOne({ email: cleanEmail, deleted: { $ne: true } });
      if (existingEmail) {
        return res.status(400).json({ error: 'This official email ID is already registered.' });
      }
    }

    if (phoneNo !== warden.phoneNo) {
      const existingPhone = await Warden.findOne({ phoneNo, deleted: { $ne: true } });
      if (existingPhone) {
        return res.status(400).json({ error: 'This phone number is already registered.' });
      }
    }

    const selectStatus = status || 'Active';
    if (selectStatus === 'Active') {
      const activeWardenForBlock = await Warden.findOne({ 
        _id: { $ne: wardenId },
        block, 
        status: 'Active', 
        deleted: { $ne: true } 
      });
      if (activeWardenForBlock) {
        return res.status(400).json({ error: 'This hostel block already has an active warden.' });
      }
    }

    const oldEmail = warden.email;

    warden.name = name;
    warden.email = cleanEmail;
    warden.phoneNo = phoneNo;
    warden.block = block;
    warden.status = selectStatus;
    if (password) {
      warden.password = password;
    }
    await warden.save();

    let blocksArr = [];
    if (block === 'ABC Block') blocksArr = ['A', 'B', 'C'];
    else if (block === 'D Block') blocksArr = ['D'];
    else if (block === 'E Block') blocksArr = ['E'];
    else if (block === 'F Block') blocksArr = ['F'];

    if (oldEmail !== cleanEmail) {
      await BlockAssignment.deleteOne({ wardenEmail: oldEmail });
    }

    await BlockAssignment.findOneAndUpdate(
      { wardenEmail: cleanEmail },
      { wardenEmail: cleanEmail, wardenName: name, blocks: blocksArr, role: 'warden' },
      { upsert: true, new: true }
    );

    res.json({ success: true, warden });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update warden.' });
  }
});

// Soft Delete Warden (Admin access)
app.delete('/api/admin/wardens/:id', isAdmin, async (req, res) => {
  const wardenId = req.params.id;

  try {
    const warden = await Warden.findById(wardenId);
    if (!warden) {
      return res.status(404).json({ error: 'Warden not found.' });
    }

    warden.deleted = true;
    warden.status = 'Inactive';
    await warden.save();

    await BlockAssignment.deleteOne({ wardenEmail: warden.email });

    res.json({ success: true, message: 'Warden soft-deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete warden.' });
  }
});

// Toggle Status Warden (Admin access)
app.put('/api/admin/wardens/:id/status', isAdmin, async (req, res) => {
  const wardenId = req.params.id;
  const { status } = req.body;

  if (!status || !['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Active or Inactive' });
  }

  try {
    const warden = await Warden.findById(wardenId);
    if (!warden || warden.deleted === true) {
      return res.status(404).json({ error: 'Warden not found.' });
    }

    if (status === 'Active') {
      const activeWardenForBlock = await Warden.findOne({ 
        _id: { $ne: wardenId },
        block: warden.block, 
        status: 'Active', 
        deleted: { $ne: true } 
      });
      if (activeWardenForBlock) {
        return res.status(400).json({ error: 'This hostel block already has an active warden.' });
      }

      let blocksArr = [];
      if (warden.block === 'ABC Block') blocksArr = ['A', 'B', 'C'];
      else if (warden.block === 'D Block') blocksArr = ['D'];
      else if (warden.block === 'E Block') blocksArr = ['E'];
      else if (warden.block === 'F Block') blocksArr = ['F'];

      await BlockAssignment.findOneAndUpdate(
        { wardenEmail: warden.email },
        { wardenEmail: warden.email, wardenName: warden.name, blocks: blocksArr, role: 'warden' },
        { upsert: true, new: true }
      );
    } else {
      await BlockAssignment.deleteOne({ wardenEmail: warden.email });
    }

    warden.status = status;
    await warden.save();

    res.json({ success: true, status: warden.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update warden status.' });
  }
});

// ==========================================
// FEEDBACK SYSTEM APIs
// ==========================================

// Create a new feedback request (Warden or Management)
app.post('/api/feedback-requests', async (req, res) => {
  const { title, description, postedBy, authorName, targetBlock, authorEmail } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  try {
    const cleanTarget = targetBlock || 'All';

    // Deactivate previous active feedback requests for matching target block
    const allActive = await FeedbackRequest.find({ active: true });
    for (const reqItem of allActive) {
      if (matchesBlock(reqItem.targetBlock, cleanTarget) || cleanTarget === 'All') {
        reqItem.active = false;
        await reqItem.save();
      }
    }

    const newRequest = new FeedbackRequest({
      title,
      description,
      active: true,
      postedBy: postedBy || 'Warden',
      authorName: authorName || 'Hostel Administration',
      authorEmail: authorEmail || '',
      targetBlock: cleanTarget
    });
    await newRequest.save();

    if (io) {
      io.emit('new_feedback_campaign', newRequest.toJSON());
    }

    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database write error' });
  }
});

// Get all feedback requests (Warden / Management)
app.get('/api/feedback-requests', async (req, res) => {
  const { targetBlock, wardenBlock } = req.query;
  const blockToFilter = targetBlock || wardenBlock;
  try {
    let requests = await FeedbackRequest.find().sort({ createdAt: -1 });

    if (blockToFilter && blockToFilter !== 'All' && blockToFilter !== 'ALL') {
      requests = requests.filter(r => matchesBlock(r.targetBlock, blockToFilter));
    }

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

// Get active feedback request(s) (Student)
app.get('/api/feedback-requests/active', async (req, res) => {
  const { studentBlock } = req.query;
  try {
    const activeRequests = await FeedbackRequest.find({ active: true });

    if (!studentBlock) {
      return res.json(activeRequests);
    }

    const matching = activeRequests.filter(reqItem => matchesBlock(reqItem.targetBlock, studentBlock));

    res.json(matching);
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
  const { feedbackRequestId, studentEmail, studentName, rating, comments, studentBlock } = req.body;
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
    let resolvedBlock = studentBlock || '';
    if (!resolvedBlock && studentEmail) {
      const student = await Student.findOne({ email: studentEmail.toLowerCase() });
      if (student) resolvedBlock = student.block;
    }

    const response = new FeedbackResponse({
      feedbackRequestId,
      studentEmail: studentEmail.toLowerCase(),
      studentName,
      studentBlock: resolvedBlock,
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
  const { feedbackRequestId, studentEmail, targetBlock, wardenBlock } = req.query;
  const blockToFilter = targetBlock || wardenBlock;
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
    let responses = await FeedbackResponse.find(query).sort({ createdAt: -1 });

    if (blockToFilter && blockToFilter !== 'All' && blockToFilter !== 'ALL') {
      const requests = await FeedbackRequest.find();
      const requestMap = new Map(requests.map(r => [r._id.toString(), r]));

      responses = responses.filter(resp => {
        if (resp.studentBlock && matchesBlock(blockToFilter, resp.studentBlock)) {
          return true;
        }
        const parentReq = requestMap.get(resp.feedbackRequestId?.toString());
        if (parentReq && matchesBlock(parentReq.targetBlock, blockToFilter)) {
          return true;
        }
        return false;
      });
    }

    res.json(responses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database read error' });
  }
});

// AI Analysis & Categorization of Feedback Responses using Google Gemini API
app.post('/api/feedback-requests/:id/analyze', async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid feedbackRequestId' });
    }

    const responses = await FeedbackResponse.find({ feedbackRequestId: id });
    if (responses.length === 0) {
      return res.json({ positive: [], negative: [], common: [] });
    }

    const groqApiKey = (process.env.GROQ_API_KEY || '').trim();
    const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (groqApiKey) {
      try {
        const formattedSubmissions = responses.map(r => ({
          studentName: r.studentName,
          rating: r.rating,
          comments: r.comments
        }));

        const prompt = `Analyze the following list of student feedback submissions.
Submissions:
${JSON.stringify(formattedSubmissions, null, 2)}

Group and categorize them into:
1. Positive Feedbacks (list of studentName, rating, and comments)
2. Negative Feedbacks (list of studentName, rating, and comments)
3. Common / Duplicate Feedbacks (grouped by common complaints/issues, showing the common summary/issue description, a list of student names affected by it, and the count of students). For example, if two students complain "chapati is too hard" and "chappati is not perfect", group them under one common issue like "chappati is not perfect" showing 2 students affected.

Return the response STRICTLY as a valid JSON object matching the following structure:
{
  "positive": [
    { "studentName": "...", "comments": "...", "rating": 5 }
  ],
  "negative": [
    { "studentName": "...", "comments": "...", "rating": 2 }
  ],
  "common": [
    { "issue": "chappati is not perfect", "count": 2, "students": ["Rahul", "Vikas"] }
  ]
}`;

        let groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.2
          })
        });

        // Fallback model if primary model is unavailable
        if (!groqResponse.ok) {
          groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.1-8b-instant',
              messages: [{ role: 'user', content: prompt }],
              response_format: { type: 'json_object' },
              temperature: 0.2
            })
          });
        }

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          const content = groqData.choices[0].message.content.trim();
          const analysis = JSON.parse(content);
          return res.json(analysis);
        } else {
          const errText = await groqResponse.text();
          console.error('[Groq AI Error]:', errText);
        }
      } catch (groqErr) {
        console.error('[Groq AI Call Failed]:', groqErr);
      }
    } else {
      console.log('[Groq AI Warning]: GROQ_API_KEY is not defined in process.env. Add GROQ_API_KEY to Render Environment Variables.');
    }

    if (geminiApiKey) {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const formattedSubmissions = responses.map(r => ({
          studentName: r.studentName,
          rating: r.rating,
          comments: r.comments
        }));

        const prompt = `Analyze the following list of student feedback submissions.
Submissions:
${JSON.stringify(formattedSubmissions, null, 2)}

Group and categorize them into:
1. Positive Feedbacks (list of studentName, rating, and comments)
2. Negative Feedbacks (list of studentName, rating, and comments)
3. Common / Duplicate Feedbacks (grouped by common complaints/issues, showing the common summary/issue description, a list of student names affected by it, and the count of students). For example, if two students complain "chapati is too hard" and "chappati is not perfect", group them under one common issue like "chappati is not perfect" showing 2 students affected.

Return the response STRICTLY as a valid JSON object matching the following structure (no markdown, no backticks, no wrap, just clean JSON):
{
  "positive": [
    { "studentName": "...", "comments": "...", "rating": 5 }
  ],
  "negative": [
    { "studentName": "...", "comments": "...", "rating": 2 }
  ],
  "common": [
    { "issue": "chappati is not perfect", "count": 2, "students": ["Rahul", "Vikas"] }
  ]
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonText = text.replace(/```json/i, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(jsonText);
        return res.json(analysis);
      } catch (geminiErr) {
        console.error('Gemini API call failed, falling back:', geminiErr);
      }
    }

    // Local Fallback analysis if API key is missing or failed
    const positive = [];
    const negative = [];
    const commonMap = {};

    responses.forEach(resp => {
      const text = (resp.comments || '').trim();
      if (!text) return;

      const rating = resp.rating || 3;
      const item = { studentName: resp.studentName || 'Student', comments: text, rating };

      // Sentiment classification
      if (rating >= 4 || /good|perfect|great|nice|love|excellent|delicious|best/i.test(text)) {
        positive.push(item);
      } else {
        negative.push(item);
      }

      // Basic keyword clustering
      const cleanText = text.toLowerCase();
      let matchedKey = null;
      const keywords = ['chapati', 'chappati', 'wifi', 'internet', 'water', 'food', 'cleaning', 'electricity', 'power', 'bathroom'];
      
      for (const kw of keywords) {
        if (cleanText.includes(kw)) {
          matchedKey = kw;
          break;
        }
      }

      const key = matchedKey || cleanText.split(' ').slice(0, 3).join(' ');
      if (key.length > 2) {
        if (!commonMap[key]) {
          commonMap[key] = {
            issue: matchedKey ? `${matchedKey.charAt(0).toUpperCase() + matchedKey.slice(1)} issues` : text,
            students: [],
            count: 0
          };
        }
        commonMap[key].students.push(resp.studentName || 'Student');
        commonMap[key].count++;
      }
    });

    const common = Object.values(commonMap)
      .sort((a, b) => b.count - a.count);

    res.json({ positive, negative, common });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Feedback analysis failed' });
  }
});

// ==================== INCIDENT GROUPS MODULE ====================

const getUserBlockGroup = (block) => {
  if (!block) return 'ABC';
  const b = block.trim().toUpperCase();
  if (b === 'ABC' || b === 'A' || b === 'B' || b === 'C') return 'ABC';
  if (b.startsWith('D')) return 'D';
  if (b.startsWith('E')) return 'E';
  if (b.startsWith('F')) return 'F';
  return 'ABC'; // fallback
};

// 1. Get accessible Incident Groups for user
app.get('/api/incident-groups', async (req, res) => {
  const { userEmail, userRole, userBlock } = req.query;
  try {
    const role = (userRole || '').toLowerCase().trim();
    const email = (userEmail || '').toLowerCase().trim();
    const block = (userBlock || '').trim().toUpperCase();

    const allGroups = [
      { id: 'ABC', name: 'ABC Block Group', description: 'Discussion group for ABC Block residents' },
      { id: 'D', name: 'D Block Group', description: 'Discussion group for D Block residents' },
      { id: 'E', name: 'E Block Group', description: 'Discussion group for E Block residents' },
      { id: 'F', name: 'F Block Group', description: 'Discussion group for F Block residents' }
    ];

    let accessibleGroups = [];

    if (role === 'management' || role === 'headwarden') {
      accessibleGroups = allGroups;
    } else if (role === 'student') {
      const studentGroup = getUserBlockGroup(block);
      if (studentGroup) {
        accessibleGroups = allGroups.filter(g => g.id === studentGroup);
      }
    } else if (role === 'warden') {
      const assignment = await BlockAssignment.findOne({ wardenEmail: email });
      if (assignment) {
        if (assignment.role === 'headwarden' || assignment.blocks.length >= 6) {
          accessibleGroups = allGroups;
        } else {
          const wardenGroups = new Set();
          assignment.blocks.forEach(b => {
            const grp = getUserBlockGroup(b);
            if (grp) wardenGroups.add(grp);
          });
          accessibleGroups = allGroups.filter(g => wardenGroups.has(g.id));
        }
      } else {
        const wardenGroup = getUserBlockGroup(block);
        if (wardenGroup) {
          accessibleGroups = allGroups.filter(g => g.id === wardenGroup);
        }
      }
    }

    const result = [];
    for (const group of accessibleGroups) {
      // Member count
      let memberCount = 0;
      if (group.id === 'ABC') {
        memberCount = await Student.countDocuments({
          block: { $in: ['ABC', 'A', 'B', 'C', 'abc', 'a', 'b', 'c'] }
        });
      } else {
        const regex = new RegExp(`^${group.id}`, 'i');
        memberCount = await Student.countDocuments({ block: regex });
      }

      // Last message
      const lastMsg = await IncidentGroupMessage.findOne({ blockGroup: group.id })
        .sort({ timestamp: -1 });

      // Message count
      const totalMessages = await IncidentGroupMessage.countDocuments({ blockGroup: group.id });

      result.push({
        ...group,
        memberCount,
        lastMessage: lastMsg ? {
          text: lastMsg.text,
          senderName: lastMsg.senderName,
          timestamp: lastMsg.timestamp
        } : null,
        messageCount: totalMessages
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching incident groups:', err);
    res.status(500).json({ error: 'Failed to fetch incident groups' });
  }
});

// 2. Get messages for a specific group
app.get('/api/incident-groups/messages', async (req, res) => {
  const { blockGroup, search } = req.query;
  try {
    if (!blockGroup) {
      return res.status(400).json({ error: 'blockGroup is required' });
    }

    const query = { blockGroup };
    if (search) {
      const cleanSearch = search.trim();
      if (cleanSearch) {
        query.$or = [
          { text: { $regex: cleanSearch, $options: 'i' } },
          { senderName: { $regex: cleanSearch, $options: 'i' } }
        ];
      }
    }

    const messages = await IncidentGroupMessage.find(query).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// 3. Post a message to a group
app.post('/api/incident-groups/messages', async (req, res) => {
  const { blockGroup, senderName, senderEmail, senderRole, senderRoomNo, text } = req.body;
  try {
    if (!blockGroup || !senderName || !senderEmail || !senderRole || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMessage = await IncidentGroupMessage.create({
      blockGroup,
      senderName,
      senderEmail,
      senderRole,
      senderRoomNo,
      text,
      timestamp: new Date()
    });

    const msgObj = newMessage.toJSON();
    io.to(`group_${blockGroup}`).emit('receive_group_message', msgObj);
    io.emit('global_activity_notification', msgObj);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error posting message:', err);
    res.status(500).json({ error: 'Failed to post message' });
  }
});

// Clear all messages for an incident group
app.delete('/api/incident-groups/messages/clear', async (req, res) => {
  const { blockGroup } = req.query;
  if (!blockGroup) {
    return res.status(400).json({ error: 'blockGroup is required' });
  }
  try {
    await IncidentGroupMessage.deleteMany({ blockGroup });
    io.to(`group_${blockGroup}`).emit('clear_group_messages', { blockGroup });
    res.json({ success: true, message: 'Group chat cleared successfully' });
  } catch (err) {
    console.error('Error clearing group chat:', err);
    res.status(500).json({ error: 'Failed to clear group chat' });
  }
});

// 4. Summarize messages for a group using Groq API
app.post('/api/incident-groups/summarize', async (req, res) => {
  const { blockGroup } = req.body;
  try {
    if (!blockGroup) {
      return res.status(400).json({ error: 'blockGroup is required' });
    }

    const messages = await IncidentGroupMessage.find({ blockGroup }).sort({ timestamp: 1 });
    const messageCount = messages.length;
    const activeStudents = [...new Set(messages.filter(m => m.senderRole === 'student').map(m => m.senderEmail))];
    const activeStudentsCount = activeStudents.length;

    let summaryText = "No discussions today.";
    let mostDiscussedTopic = "None";
    let mostMentionedCategory = "General";

    if (messageCount > 0) {
      const groqApiKey = (process.env.GROQ_API_KEY || '').trim();
      if (groqApiKey) {
        try {
          const formattedMessages = messages.map(m => ({
            sender: `${m.senderName} (${m.senderRole}${m.senderRoomNo ? `, Room ${m.senderRoomNo}` : ''})`,
            text: m.text,
            time: m.timestamp
          }));

          const prompt = `Analyze the following hostel block group chat messages from the "${blockGroup} Block Group".
Messages:
${JSON.stringify(formattedMessages, null, 2)}

Provide:
1. A concise, professional, bullet-point summary of today's discussions (what issues were reported, what was resolved, what remains pending, etc.).
2. The most discussed topic (2-4 words, e.g. "Low Water Pressure" or "Wi-Fi Connectivity").
3. The most mentioned complaint category (exactly one of: Water, Electricity, Mess Food, Internet, Cleaning, Lift, Plumbing, or General).

Return the response STRICTLY as a valid JSON object matching the following structure:
{
  "summary": "Today's Discussion Summary\\n\\n• Issue 1 description\\n• Issue 2 description...",
  "mostDiscussedTopic": "...",
  "mostMentionedCategory": "..."
}`;

          let groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: prompt }],
              response_format: { type: 'json_object' },
              temperature: 0.3
            })
          });

          if (!groqResponse.ok) {
            groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
                temperature: 0.3
              })
            });
          }

          if (groqResponse.ok) {
            const groqData = await groqResponse.json();
            const analysis = JSON.parse(groqData.choices[0].message.content.trim());
            summaryText = analysis.summary;
            mostDiscussedTopic = analysis.mostDiscussedTopic;
            mostMentionedCategory = analysis.mostMentionedCategory;
          } else {
            const errText = await groqResponse.text();
            console.error('[Groq AI Summary Error]:', errText);
            throw new Error('Groq API error');
          }
        } catch (groqErr) {
          console.error('[Groq Summarization Failed, Fallback Active]:', groqErr);
          const counts = { Water: 0, Electricity: 0, Food: 0, Internet: 0, Cleaning: 0, Lift: 0, Plumbing: 0, General: 0 };
          messages.forEach(m => {
            const txt = m.text.toLowerCase();
            if (txt.includes('water')) counts.Water++;
            if (txt.includes('electricity') || txt.includes('light') || txt.includes('power')) counts.Electricity++;
            if (txt.includes('food') || txt.includes('mess')) counts.Food++;
            if (txt.includes('internet') || txt.includes('wifi') || txt.includes('net')) counts.Internet++;
            if (txt.includes('clean') || txt.includes('sweep') || txt.includes('washroom')) counts.Cleaning++;
            if (txt.includes('lift') || txt.includes('elevator')) counts.Lift++;
            if (txt.includes('plumb') || txt.includes('leak') || txt.includes('tap')) counts.Plumbing++;
          });

          let maxCat = 'General';
          let maxVal = 0;
          Object.entries(counts).forEach(([cat, val]) => {
            if (val > maxVal) {
              maxVal = val;
              maxCat = cat;
            }
          });

          mostMentionedCategory = maxCat;
          mostDiscussedTopic = maxCat !== 'General' ? `${maxCat} issues` : 'General queries';
          summaryText = `Today's Discussion Summary (Local Fallback)\n\n• Total of ${messageCount} messages exchanged.\n• Senders talked about various block matters.\n• Most mentioned category was ${maxCat}.\n• Active participation from ${activeStudentsCount} students.`;
        }
      } else {
        const counts = { Water: 0, Electricity: 0, Food: 0, Internet: 0, Cleaning: 0, Lift: 0, Plumbing: 0, General: 0 };
        messages.forEach(m => {
          const txt = m.text.toLowerCase();
          if (txt.includes('water')) counts.Water++;
          if (txt.includes('electricity') || txt.includes('light') || txt.includes('power')) counts.Electricity++;
          if (txt.includes('food') || txt.includes('mess')) counts.Food++;
          if (txt.includes('internet') || txt.includes('wifi') || txt.includes('net')) counts.Internet++;
          if (txt.includes('clean') || txt.includes('sweep') || txt.includes('washroom')) counts.Cleaning++;
          if (txt.includes('lift') || txt.includes('elevator')) counts.Lift++;
          if (txt.includes('plumb') || txt.includes('leak') || txt.includes('tap')) counts.Plumbing++;
        });

        let maxCat = 'General';
        let maxVal = 0;
        Object.entries(counts).forEach(([cat, val]) => {
          if (val > maxVal) {
            maxVal = val;
            maxCat = cat;
          }
        });

        mostMentionedCategory = maxCat;
        mostDiscussedTopic = maxCat !== 'General' ? `${maxCat} issues` : 'General queries';
        summaryText = `Today's Discussion Summary (Local Fallback)\n\n• Total of ${messageCount} messages exchanged.\n• Senders talked about various block matters.\n• Most mentioned category was ${maxCat}.\n• Active participation from ${activeStudentsCount} students.`;
      }
    }

    const insight = await GroupInsight.findOneAndUpdate(
      { blockGroup },
      {
        summary: summaryText,
        mostDiscussedTopic,
        mostMentionedCategory,
        messageCount,
        activeStudentsCount,
        lastUpdated: new Date()
      },
      { new: true, upsert: true }
    );

    res.json(insight);
  } catch (err) {
    console.error('Error generating summary:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// 5. Get insights and summaries for all groups
app.get('/api/incident-groups/insights', async (req, res) => {
  try {
    const allGroups = ['ABC', 'D', 'E', 'F'];
    const result = [];

    for (const group of allGroups) {
      let insight = await GroupInsight.findOne({ blockGroup: group });
      
      const messages = await IncidentGroupMessage.find({ blockGroup: group });
      const messageCount = messages.length;
      const activeStudentsCount = [...new Set(messages.filter(m => m.senderRole === 'student').map(m => m.senderEmail))].length;

      if (!insight) {
        insight = new GroupInsight({
          blockGroup: group,
          summary: 'No summary generated yet. Click "Summarize Conversation" inside the group chat to generate one.',
          mostDiscussedTopic: 'None',
          mostMentionedCategory: 'None',
          messageCount,
          activeStudentsCount,
          lastUpdated: null
        });
      } else {
        insight.messageCount = messageCount;
        insight.activeStudentsCount = activeStudentsCount;
        await insight.save();
      }

      result.push(insight);
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching insights:', err);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// ==========================================================================
// REAL-TIME WEBSOCKET AGGREGATOR (SOCKET.IO)
// ==========================================================================
const activeOnlineUsers = new Map(); // email -> socketId

io.on('connection', (socket) => {
  let currentUserEmail = null;

  // 1. User Registration / Presence
  socket.on('register_user', ({ email, role }) => {
    if (!email) return;
    currentUserEmail = email.toLowerCase().trim();
    activeOnlineUsers.set(currentUserEmail, socket.id);
    
    // Join personal user room for direct messaging & notifications
    socket.join(`user:${currentUserEmail}`);

    // Broadcast updated online users list
    io.emit('online_users_list', Array.from(activeOnlineUsers.keys()));
  });

  // 2. Room Joining (Incident Groups)
  socket.on('join_room', (roomName) => {
    if (roomName) {
      socket.join(roomName);
    }
  });

  socket.on('leave_room', (roomName) => {
    if (roomName) {
      socket.leave(roomName);
    }
  });

  // 3. Typing Indicators ("Abdul is typing...")
  socket.on('typing_start', ({ room, recipientEmail, userName }) => {
    const payload = { userName, userEmail: currentUserEmail, room, recipientEmail };
    if (room) {
      socket.to(room).emit('user_typing', payload);
    } else if (recipientEmail) {
      socket.to(`user:${recipientEmail.toLowerCase()}`).emit('user_typing', payload);
    }
  });

  socket.on('typing_stop', ({ room, recipientEmail }) => {
    const payload = { userEmail: currentUserEmail, room, recipientEmail };
    if (room) {
      socket.to(room).emit('user_stopped_typing', payload);
    } else if (recipientEmail) {
      socket.to(`user:${recipientEmail.toLowerCase()}`).emit('user_stopped_typing', payload);
    }
  });

  // 4. Real-Time Messages Push
  socket.on('send_realtime_message', (msgData) => {
    if (msgData.blockGroup) {
      io.to(`group_${msgData.blockGroup}`).emit('receive_group_message', msgData);
    } else {
      io.emit('receive_direct_message', msgData);
    }
    io.emit('global_activity_notification', msgData);
  });

  // 5. Read Receipts (✓✓ Blue Ticks)
  socket.on('mark_messages_read', ({ studentEmail, sender }) => {
    if (studentEmail) {
      io.to(`user:${studentEmail.toLowerCase()}`).emit('messages_marked_read', { studentEmail, sender });
    }
  });

  // 6. Disconnect Handler
  socket.on('disconnect', () => {
    if (currentUserEmail) {
      activeOnlineUsers.delete(currentUserEmail);
      io.emit('online_users_list', Array.from(activeOnlineUsers.keys()));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running dynamically on port ${PORT} with WebSockets enabled.`);
});
