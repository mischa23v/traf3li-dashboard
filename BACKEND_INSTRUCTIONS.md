# Backend Developer Instructions - Task Management System

## Overview
This document contains instructions for implementing new features and fixing existing issues in the Task Management API.

---

## PART 1: BUG FIXES (Existing Features Not Working)

### 1.1 Task Population - Case & Client Data Not Showing

**Problem:** When fetching a task, `caseId` and `clientId` return as string IDs instead of populated objects.

**Current Frontend Expectation:**
```typescript
// caseId should be populated with:
{
  _id: string
  caseNumber?: string
  title?: string
  court?: string
}

// clientId should be populated with:
{
  _id: string
  name?: string
  fullName?: string
  phone?: string
  email?: string
}

// assignedTo should be populated with:
{
  _id: string
  firstName: string
  lastName: string
  email?: string
  avatar?: string
  role?: string
}
```

**Backend Fix Required:**
```javascript
// In GET /tasks/:id endpoint
const task = await Task.findById(id)
  .populate('caseId', 'caseNumber title court')
  .populate('clientId', 'name fullName phone email')
  .populate('assignedTo', 'firstName lastName email avatar role')
  .populate('createdBy', 'firstName lastName');
```

---

### 1.2 Comments API Not Working

**Problem:** Comments cannot be added/displayed.

**Required Endpoints:**

#### POST /tasks/:id/comments
```javascript
// Request Body
{
  "text": "التعليق هنا",
  "mentions": ["userId1", "userId2"]  // optional
}

// Response - Return updated task with populated comments
{
  "success": true,
  "task": {
    // ... task data
    "comments": [
      {
        "_id": "commentId",
        "userId": "userId",
        "userName": "محمد أحمد",
        "userAvatar": "/avatars/user1.png",
        "text": "التعليق هنا",
        "mentions": [],
        "createdAt": "2025-12-02T10:00:00Z",
        "isEdited": false
      }
    ]
  }
}
```

#### PATCH /tasks/:id/comments/:commentId
```javascript
// Request Body
{ "text": "التعليق المعدل" }
```

#### DELETE /tasks/:id/comments/:commentId
```javascript
// Response
{ "success": true, "message": "تم حذف التعليق" }
```

**Backend Implementation:**
```javascript
// Add comment
router.post('/tasks/:id/comments', async (req, res) => {
  const { text, mentions } = req.body;
  const userId = req.user._id;

  const task = await Task.findById(req.params.id);

  task.comments.push({
    userId,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    userAvatar: req.user.avatar,
    text,
    mentions: mentions || [],
    createdAt: new Date()
  });

  // Add to history
  task.history.push({
    action: 'commented',
    userId,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    timestamp: new Date(),
    details: text.substring(0, 100)
  });

  await task.save();

  // Populate before returning
  await task.populate('comments.userId', 'firstName lastName avatar');

  res.json({ success: true, task });
});
```

---

### 1.3 Attachments/Documents API Not Working

**Problem:** Cannot upload or download documents.

**Required Endpoints:**

#### POST /tasks/:id/attachments
```javascript
// Request: multipart/form-data with 'file' field

// Response
{
  "success": true,
  "attachment": {
    "_id": "attachmentId",
    "fileName": "document.pdf",
    "fileUrl": "https://storage.example.com/tasks/123/document.pdf",
    "fileType": "application/pdf",
    "fileSize": 1024000,
    "uploadedBy": "userId",
    "uploadedAt": "2025-12-02T10:00:00Z",
    "thumbnailUrl": null
  }
}
```

#### DELETE /tasks/:id/attachments/:attachmentId
```javascript
// Response
{ "success": true, "message": "تم حذف المرفق" }
```

**Backend Implementation:**
```javascript
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configure storage (S3 or local)
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png'];
    cb(null, allowed.includes(file.mimetype));
  }
});

router.post('/tasks/:id/attachments', upload.single('file'), async (req, res) => {
  const task = await Task.findById(req.params.id);
  const file = req.file;

  // Upload to S3 or save locally
  const fileUrl = await uploadToStorage(file);

  const attachment = {
    fileName: file.originalname,
    fileUrl,
    fileType: file.mimetype,
    fileSize: file.size,
    uploadedBy: req.user._id,
    uploadedAt: new Date()
  };

  task.attachments.push(attachment);

  // Add to history
  task.history.push({
    action: 'attachment_added',
    userId: req.user._id,
    timestamp: new Date(),
    details: file.originalname
  });

  await task.save();

  res.json({ success: true, attachment: task.attachments[task.attachments.length - 1] });
});
```

---

### 1.4 Subtasks API Not Working

**Problem:** Cannot add subtasks when clicking "إضافة مهمة فرعية".

**Required Endpoints:**

#### POST /tasks/:id/subtasks
```javascript
// Request Body
{
  "title": "المهمة الفرعية",
  "completed": false
}

// Response - Return updated task
{
  "success": true,
  "task": {
    "subtasks": [
      {
        "_id": "subtaskId",
        "title": "المهمة الفرعية",
        "completed": false,
        "order": 0
      }
    ]
  }
}
```

#### PATCH /tasks/:id/subtasks/:subtaskId
```javascript
// Request Body
{ "title": "عنوان معدل", "completed": true }
```

#### POST /tasks/:id/subtasks/:subtaskId/toggle
```javascript
// Toggle completion status
// Response - Return updated task
```

#### DELETE /tasks/:id/subtasks/:subtaskId

**Backend Implementation:**
```javascript
router.post('/tasks/:id/subtasks', async (req, res) => {
  const { title } = req.body;
  const task = await Task.findById(req.params.id);

  const order = task.subtasks.length;

  task.subtasks.push({
    title,
    completed: false,
    order
  });

  // Recalculate progress
  const completedCount = task.subtasks.filter(st => st.completed).length;
  task.progress = task.subtasks.length > 0
    ? Math.round((completedCount / task.subtasks.length) * 100)
    : 0;

  await task.save();

  res.json({ success: true, task });
});
```

---

### 1.5 Timeline/History Not Showing

**Problem:** الجدول الزمني is empty.

**Current API Returns:**
```typescript
history: TaskHistory[] = [
  {
    action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'completed' | 'reopened' | 'commented' | 'attachment_added',
    userId: string,
    userName?: string,
    timestamp: string,
    oldValue?: any,
    newValue?: any,
    details?: string
  }
]
```

**Backend Requirements:**
1. **Ensure history is populated on task creation:**
```javascript
// When creating a task
const task = new Task({
  ...taskData,
  history: [{
    action: 'created',
    userId: req.user._id,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    timestamp: new Date(),
    details: 'تم إنشاء المهمة'
  }]
});
```

2. **Add history on every update:**
```javascript
// Helper function
function addHistoryEntry(task, action, userId, userName, details, oldValue, newValue) {
  task.history.push({
    action,
    userId,
    userName,
    timestamp: new Date(),
    oldValue,
    newValue,
    details
  });
}

// On status change
addHistoryEntry(task, 'status_changed', req.user._id, userName,
  `تم تغيير الحالة من ${oldStatus} إلى ${newStatus}`,
  oldStatus, newStatus);

// On completion
addHistoryEntry(task, 'completed', req.user._id, userName, 'تم إكمال المهمة');

// On assignment
addHistoryEntry(task, 'assigned', req.user._id, userName,
  `تم تعيين المهمة إلى ${assigneeName}`);
```

3. **Populate history.userId on GET:**
```javascript
const task = await Task.findById(id)
  .populate('history.userId', 'firstName lastName avatar');
```

---

## PART 2: NEW FEATURES

### 2.1 Task Dependencies

**Purpose:** Task B cannot start until Task A is completed.

**Schema Addition:**
```javascript
// Add to Task schema
dependencies: [{
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  type: {
    type: String,
    enum: ['blocks', 'blocked_by', 'related'],
    default: 'blocked_by'
  }
}],
blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
blocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
```

**API Endpoints:**

#### POST /tasks/:id/dependencies
```javascript
// Request Body
{
  "dependsOn": "taskId",  // This task depends on another task
  "type": "blocked_by"    // 'blocks', 'blocked_by', 'related'
}

// Response
{
  "success": true,
  "task": { /* updated task */ },
  "message": "لا يمكن بدء هذه المهمة حتى اكتمال المهمة المحددة"
}
```

#### DELETE /tasks/:id/dependencies/:dependencyTaskId

**Backend Logic:**
```javascript
// When trying to start a task (change status from backlog/todo to in_progress)
router.patch('/tasks/:id/status', async (req, res) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id).populate('blockedBy');

  // Check if moving to in_progress
  if (status === 'in_progress') {
    // Check if all blocking tasks are completed
    const incompleteBlockers = task.blockedBy.filter(t => t.status !== 'done');

    if (incompleteBlockers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'BLOCKED_BY_DEPENDENCIES',
        message: 'لا يمكن بدء هذه المهمة حتى اكتمال المهام التالية',
        blockingTasks: incompleteBlockers.map(t => ({
          _id: t._id,
          title: t.title,
          status: t.status
        }))
      });
    }
  }

  task.status = status;
  await task.save();

  res.json({ success: true, task });
});

// Add dependency
router.post('/tasks/:id/dependencies', async (req, res) => {
  const { dependsOn, type } = req.body;
  const task = await Task.findById(req.params.id);
  const dependentTask = await Task.findById(dependsOn);

  if (!dependentTask) {
    return res.status(404).json({ error: 'المهمة المحددة غير موجودة' });
  }

  // Prevent circular dependencies
  if (await hasCircularDependency(task._id, dependsOn)) {
    return res.status(400).json({ error: 'لا يمكن إنشاء تبعية دائرية' });
  }

  task.blockedBy.push(dependsOn);
  dependentTask.blocks.push(task._id);

  await task.save();
  await dependentTask.save();

  res.json({ success: true, task });
});
```

---

### 2.2 Conditional Workflows

**Purpose:** Automatically create follow-up tasks based on task outcomes.

**Schema Addition:**
```javascript
// Add to Task schema
workflowRules: [{
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  trigger: {
    type: { type: String, enum: ['status_change', 'completion', 'due_date_passed'] },
    fromStatus: String,  // optional
    toStatus: String     // e.g., 'done', 'canceled'
  },
  conditions: [{
    field: String,      // e.g., 'priority', 'taskType'
    operator: String,   // 'equals', 'not_equals', 'contains'
    value: String
  }],
  actions: [{
    type: { type: String, enum: ['create_task', 'update_field', 'send_notification', 'assign_user'] },
    // For create_task:
    taskTemplate: {
      title: String,
      description: String,
      taskType: String,
      priority: String,
      dueDateOffset: Number,  // Days from trigger
      assignedTo: String
    },
    // For update_field:
    field: String,
    value: mongoose.Schema.Types.Mixed,
    // For send_notification:
    notificationType: String,
    recipients: [String]
  }],
  isActive: { type: Boolean, default: true }
}],

// Workflow outcome tracking
outcome: {
  type: String,
  enum: ['successful', 'unsuccessful', 'appealed', 'settled', 'dismissed', null],
  default: null
},
outcomeNotes: String,
outcomeDate: Date
```

**API Endpoints:**

#### POST /tasks/:id/workflow-rules
```javascript
// Request Body - Example: Create appeal task if case is dismissed
{
  "name": "إنشاء مهمة استئناف عند الرفض",
  "trigger": {
    "type": "completion",
    "toStatus": "done"
  },
  "conditions": [
    { "field": "outcome", "operator": "equals", "value": "dismissed" }
  ],
  "actions": [
    {
      "type": "create_task",
      "taskTemplate": {
        "title": "تحضير صحيفة الاستئناف - ${caseNumber}",
        "taskType": "appeal_deadline",
        "priority": "high",
        "dueDateOffset": 30,  // 30 days from now
        "description": "استئناف للقضية ${caseTitle} بسبب رفض الحكم الابتدائي"
      }
    }
  ]
}
```

#### PATCH /tasks/:id/outcome
```javascript
// Request Body
{
  "outcome": "dismissed",
  "outcomeNotes": "رفضت المحكمة الدعوى لعدم الاختصاص"
}

// This triggers workflow rules evaluation
```

**Backend Logic:**
```javascript
// Workflow Engine
async function evaluateWorkflowRules(task, triggerType, context) {
  const rules = task.workflowRules.filter(r =>
    r.isActive && r.trigger.type === triggerType
  );

  for (const rule of rules) {
    // Check conditions
    const conditionsMet = rule.conditions.every(cond => {
      const fieldValue = task[cond.field];
      switch (cond.operator) {
        case 'equals': return fieldValue === cond.value;
        case 'not_equals': return fieldValue !== cond.value;
        case 'contains': return fieldValue?.includes(cond.value);
        default: return false;
      }
    });

    if (conditionsMet) {
      for (const action of rule.actions) {
        await executeWorkflowAction(task, action, context);
      }
    }
  }
}

async function executeWorkflowAction(task, action, context) {
  switch (action.type) {
    case 'create_task':
      const template = action.taskTemplate;
      const newTask = new Task({
        title: interpolateTemplate(template.title, task),
        description: interpolateTemplate(template.description, task),
        taskType: template.taskType,
        priority: template.priority,
        dueDate: addDays(new Date(), template.dueDateOffset),
        caseId: task.caseId,
        clientId: task.clientId,
        assignedTo: template.assignedTo || task.assignedTo,
        createdBy: context.userId,
        parentTaskId: task._id,  // Link to original task
        history: [{
          action: 'created',
          userId: context.userId,
          timestamp: new Date(),
          details: `تم إنشاء المهمة تلقائياً من قاعدة: ${context.ruleName}`
        }]
      });
      await newTask.save();
      break;

    case 'send_notification':
      // Send notification logic
      break;

    case 'assign_user':
      task.assignedTo = action.value;
      await task.save();
      break;
  }
}

// Hook into task completion
router.post('/tasks/:id/complete', async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.status = 'done';
  task.completedAt = new Date();

  await task.save();

  // Evaluate workflow rules
  await evaluateWorkflowRules(task, 'completion', {
    userId: req.user._id,
    ruleName: 'Task Completion'
  });

  res.json({ success: true, task });
});
```

---

### 2.3 Time Estimates vs Actual (Budget Forecasting)

**Purpose:** Track estimated vs actual time for billing and forecasting.

**Schema Addition:**
```javascript
// Add/Update in Task schema
timeTracking: {
  estimatedMinutes: Number,
  actualMinutes: { type: Number, default: 0 },
  sessions: [{
    _id: mongoose.Schema.Types.ObjectId,
    startedAt: Date,
    endedAt: Date,
    duration: Number,  // in minutes
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String,
    isBillable: { type: Boolean, default: true }
  }],
  isTracking: { type: Boolean, default: false },
  currentSessionStart: Date
},

// Budget tracking
budget: {
  estimatedHours: Number,
  hourlyRate: Number,        // in SAR
  estimatedCost: Number,     // calculated
  actualCost: Number,        // calculated from timeTracking
  variance: Number,          // estimatedCost - actualCost
  variancePercent: Number
}
```

**API Endpoints:**

#### PATCH /tasks/:id/estimate
```javascript
// Request Body
{
  "estimatedMinutes": 480,   // 8 hours
  "hourlyRate": 500          // 500 SAR/hour
}

// Response
{
  "success": true,
  "task": {
    "timeTracking": { "estimatedMinutes": 480 },
    "budget": {
      "estimatedHours": 8,
      "hourlyRate": 500,
      "estimatedCost": 4000  // 8 * 500
    }
  }
}
```

#### POST /tasks/:id/time-tracking/start
```javascript
// Response
{
  "success": true,
  "task": {
    "timeTracking": {
      "isTracking": true,
      "currentSessionStart": "2025-12-02T10:00:00Z"
    }
  }
}
```

#### POST /tasks/:id/time-tracking/stop
```javascript
// Request Body
{
  "notes": "مراجعة صحيفة الدعوى",
  "isBillable": true
}

// Response
{
  "success": true,
  "task": {
    "timeTracking": {
      "isTracking": false,
      "actualMinutes": 120,  // Total accumulated
      "sessions": [
        {
          "startedAt": "2025-12-02T10:00:00Z",
          "endedAt": "2025-12-02T12:00:00Z",
          "duration": 120,
          "notes": "مراجعة صحيفة الدعوى",
          "isBillable": true
        }
      ]
    },
    "budget": {
      "actualCost": 1000,      // 2 hours * 500
      "variance": 3000,        // 4000 - 1000
      "variancePercent": 75    // 75% under budget
    }
  }
}
```

#### POST /tasks/:id/time-tracking/manual
```javascript
// Add manual time entry
{
  "minutes": 60,
  "date": "2025-12-01",
  "notes": "اتصال هاتفي مع العميل",
  "isBillable": true
}
```

#### GET /tasks/:id/time-tracking/summary
```javascript
// Response
{
  "estimatedMinutes": 480,
  "actualMinutes": 180,
  "remainingMinutes": 300,
  "percentComplete": 37.5,
  "isOverBudget": false,
  "sessions": [...],
  "budget": {
    "estimated": 4000,
    "actual": 1500,
    "remaining": 2500,
    "variance": 2500,
    "variancePercent": 62.5
  },
  "byUser": [
    { "userId": "...", "name": "محمد", "minutes": 120, "cost": 1000 },
    { "userId": "...", "name": "أحمد", "minutes": 60, "cost": 500 }
  ]
}
```

**Backend Logic:**
```javascript
// Calculate budget on save
taskSchema.pre('save', function(next) {
  // Calculate actual minutes
  if (this.timeTracking?.sessions) {
    this.timeTracking.actualMinutes = this.timeTracking.sessions
      .reduce((sum, s) => sum + (s.duration || 0), 0);
  }

  // Calculate budget
  if (this.budget?.hourlyRate && this.timeTracking?.estimatedMinutes) {
    this.budget.estimatedHours = this.timeTracking.estimatedMinutes / 60;
    this.budget.estimatedCost = this.budget.estimatedHours * this.budget.hourlyRate;
  }

  if (this.budget?.hourlyRate && this.timeTracking?.actualMinutes) {
    const actualHours = this.timeTracking.actualMinutes / 60;
    this.budget.actualCost = actualHours * this.budget.hourlyRate;
    this.budget.variance = this.budget.estimatedCost - this.budget.actualCost;
    this.budget.variancePercent = this.budget.estimatedCost > 0
      ? (this.budget.variance / this.budget.estimatedCost) * 100
      : 0;
  }

  next();
});
```

---

## PART 3: API RESPONSE STRUCTURE

### Standard Response Format

```javascript
// Success
{
  "success": true,
  "data": { ... },  // or "task", "tasks", etc.
  "message": "تم بنجاح"  // optional
}

// Error
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "رسالة الخطأ بالعربية",
  "details": { ... }  // optional
}
```

### Task Object Structure (Full Response)

```javascript
{
  "_id": "taskId",
  "title": "عنوان المهمة",
  "description": "وصف المهمة",
  "taskType": "court_hearing",
  "status": "in_progress",
  "priority": "high",
  "dueDate": "2025-12-15T00:00:00Z",

  // Populated relationships
  "caseId": {
    "_id": "caseId",
    "caseNumber": "1442525145",
    "title": "قضية تجارية",
    "court": "المحكمة التجارية"
  },
  "clientId": {
    "_id": "clientId",
    "name": "محمد أحمد",
    "phone": "+966501234567",
    "email": "client@example.com"
  },
  "assignedTo": {
    "_id": "userId",
    "firstName": "أحمد",
    "lastName": "السعيد",
    "avatar": "/avatars/ahmed.png",
    "role": "محامي"
  },

  // Subtasks
  "subtasks": [
    {
      "_id": "subtaskId",
      "title": "مراجعة المستندات",
      "completed": true,
      "completedAt": "2025-12-01T10:00:00Z",
      "order": 0
    }
  ],

  // Comments
  "comments": [
    {
      "_id": "commentId",
      "userId": "userId",
      "userName": "أحمد السعيد",
      "userAvatar": "/avatars/ahmed.png",
      "text": "تم الانتهاء من المراجعة",
      "createdAt": "2025-12-01T10:00:00Z"
    }
  ],

  // Attachments
  "attachments": [
    {
      "_id": "attachmentId",
      "fileName": "document.pdf",
      "fileUrl": "https://storage.example.com/...",
      "fileType": "application/pdf",
      "fileSize": 1024000,
      "uploadedAt": "2025-12-01T10:00:00Z"
    }
  ],

  // History
  "history": [
    {
      "_id": "historyId",
      "action": "created",
      "userId": "userId",
      "userName": "أحمد السعيد",
      "timestamp": "2025-11-20T08:00:00Z",
      "details": "تم إنشاء المهمة"
    }
  ],

  // Dependencies (NEW)
  "blockedBy": [
    {
      "_id": "taskId",
      "title": "مراجعة العقد",
      "status": "done"
    }
  ],
  "blocks": [],

  // Time Tracking (NEW)
  "timeTracking": {
    "estimatedMinutes": 480,
    "actualMinutes": 180,
    "isTracking": false,
    "sessions": [...]
  },

  // Budget (NEW)
  "budget": {
    "estimatedHours": 8,
    "hourlyRate": 500,
    "estimatedCost": 4000,
    "actualCost": 1500,
    "variance": 2500,
    "variancePercent": 62.5
  },

  // Workflow (NEW)
  "workflowRules": [...],
  "outcome": null,

  "createdAt": "2025-11-20T08:00:00Z",
  "updatedAt": "2025-12-02T10:00:00Z"
}
```

---

## PART 4: DATABASE INDEXES

```javascript
// Recommended indexes for performance
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ caseId: 1 });
taskSchema.index({ clientId: 1 });
taskSchema.index({ 'blockedBy': 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });
```

---

## PART 5: TESTING CHECKLIST

- [ ] GET /tasks/:id returns populated caseId, clientId, assignedTo
- [ ] POST /tasks/:id/comments creates comment and returns updated task
- [ ] POST /tasks/:id/attachments uploads file and returns attachment
- [ ] POST /tasks/:id/subtasks creates subtask and updates progress
- [ ] GET /tasks/:id includes history array with user names
- [ ] POST /tasks/:id/dependencies creates dependency link
- [ ] PATCH /tasks/:id/status checks dependencies before allowing in_progress
- [ ] POST /tasks/:id/time-tracking/start begins tracking session
- [ ] POST /tasks/:id/time-tracking/stop calculates duration and budget
- [ ] Workflow rules trigger on task completion with outcome

---

## Questions for Backend Developer

1. What storage solution is used for file uploads? (S3, local, etc.)
2. Is there a notification system to integrate with workflow actions?
3. What authentication middleware is used? (for req.user)
4. Are there any rate limiting requirements for the API?
