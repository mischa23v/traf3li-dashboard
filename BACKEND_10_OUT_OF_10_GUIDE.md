# Backend Implementation Guide: Achieving 10/10 in All Categories

## Executive Summary

This document provides detailed backend implementations to upgrade each module from current scores to 10/10:

| Module | Current | Target | Gap |
|--------|---------|--------|-----|
| HR | 9.5/10 | 10/10 | Biometric, Advanced Analytics, AI |
| Finance | 9/10 | 10/10 | Bank Reconciliation, Multi-currency, AI |
| CRM | 8.5/10 | 10/10 | Email Marketing, AI Lead Scoring, WhatsApp |
| Tasks | 9.5/10 | 10/10 | Gantt View, AI, Real-time Collaboration |

---

# PART 1: HR MODULE - FROM 9.5 TO 10/10

## 1.1 Biometric Attendance Integration

### New Schema: BiometricDevice

```javascript
// models/BiometricDevice.js
const mongoose = require('mongoose');

const biometricDeviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nameAr: String,
  type: {
    type: String,
    enum: ['fingerprint', 'face_recognition', 'iris', 'rfid', 'qr_code', 'nfc'],
    required: true
  },
  manufacturer: String, // ZKTeco, Hikvision, Suprema, etc.
  model: String,
  serialNumber: String,

  // Connection
  connectionType: { type: String, enum: ['tcp', 'http', 'usb', 'cloud_api'], default: 'tcp' },
  ipAddress: String,
  port: { type: Number, default: 4370 },
  apiEndpoint: String, // For cloud-based devices
  apiKey: String,

  // Location
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  locationName: String,
  floor: String,

  // Status
  status: { type: String, enum: ['online', 'offline', 'error', 'maintenance'], default: 'offline' },
  lastHeartbeat: Date,
  lastSync: Date,

  // Configuration
  timezone: { type: String, default: 'Asia/Riyadh' },
  syncInterval: { type: Number, default: 5 }, // minutes
  autoSync: { type: Boolean, default: true },

  // Firmware
  firmwareVersion: String,
  sdkVersion: String,

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('BiometricDevice', biometricDeviceSchema);
```

### New Schema: BiometricLog

```javascript
// models/BiometricLog.js
const mongoose = require('mongoose');

const biometricLogSchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'BiometricDevice', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },

  // Punch Data
  punchTime: { type: Date, required: true },
  punchType: {
    type: String,
    enum: ['check_in', 'check_out', 'break_start', 'break_end', 'overtime_start', 'overtime_end'],
    required: true
  },

  // Verification
  verificationMethod: { type: String, enum: ['fingerprint', 'face', 'card', 'password', 'qr'] },
  verificationScore: Number, // 0-100 confidence

  // Location
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  geoLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },

  // Anti-Spoofing
  livenessCheck: { type: Boolean, default: true },
  temperatureReading: Number, // For thermal devices (COVID-era feature)
  photoCapture: String, // S3 URL of captured photo

  // Status
  processed: { type: Boolean, default: false },
  processedAt: Date,
  attendanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' },

  // Anomaly Detection
  isAnomaly: { type: Boolean, default: false },
  anomalyReason: String, // 'unusual_time', 'wrong_location', 'consecutive_punches', etc.

  // Raw Data
  rawData: mongoose.Schema.Types.Mixed,

  createdAt: { type: Date, default: Date.now }
});

// Indexes for fast queries
biometricLogSchema.index({ employeeId: 1, punchTime: -1 });
biometricLogSchema.index({ deviceId: 1, punchTime: -1 });
biometricLogSchema.index({ processed: 1 });

module.exports = mongoose.model('BiometricLog', biometricLogSchema);
```

### Biometric Service

```javascript
// services/biometricService.js
const ZKLib = require('zklib-js'); // For ZKTeco devices
const axios = require('axios');
const BiometricDevice = require('../models/BiometricDevice');
const BiometricLog = require('../models/BiometricLog');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

class BiometricService {

  // ==================== DEVICE MANAGEMENT ====================

  /**
   * Connect to ZKTeco device
   */
  async connectToZKDevice(deviceId) {
    const device = await BiometricDevice.findById(deviceId);
    if (!device) throw new Error('Device not found');

    const zkInstance = new ZKLib(device.ipAddress, device.port, 5200, 4000);

    try {
      await zkInstance.createSocket();

      // Update device status
      device.status = 'online';
      device.lastHeartbeat = new Date();
      await device.save();

      return zkInstance;
    } catch (error) {
      device.status = 'error';
      await device.save();
      throw error;
    }
  }

  /**
   * Sync attendance logs from device
   */
  async syncDeviceLogs(deviceId) {
    const device = await BiometricDevice.findById(deviceId);
    const zkInstance = await this.connectToZKDevice(deviceId);

    try {
      // Get attendance logs
      const logs = await zkInstance.getAttendances();

      const processedLogs = [];

      for (const log of logs) {
        // Find employee by biometric ID
        const employee = await Employee.findOne({
          biometricId: log.deviceUserId
        });

        if (!employee) continue;

        // Determine punch type
        const punchType = this.determinePunchType(log, employee);

        // Check for existing log
        const existingLog = await BiometricLog.findOne({
          employeeId: employee._id,
          punchTime: log.recordTime
        });

        if (existingLog) continue;

        // Create biometric log
        const biometricLog = await BiometricLog.create({
          deviceId: device._id,
          employeeId: employee._id,
          punchTime: log.recordTime,
          punchType,
          verificationMethod: this.mapVerificationMethod(log.inOutState),
          locationId: device.locationId,
          rawData: log
        });

        processedLogs.push(biometricLog);
      }

      // Update device sync time
      device.lastSync = new Date();
      await device.save();

      // Process logs into attendance records
      await this.processLogsIntoAttendance(processedLogs);

      return { synced: processedLogs.length };

    } finally {
      await zkInstance.disconnect();
    }
  }

  /**
   * Determine punch type based on time and previous punches
   */
  determinePunchType(log, employee) {
    const hour = new Date(log.recordTime).getHours();

    // Simple logic - can be enhanced with shift schedules
    if (hour >= 6 && hour <= 10) return 'check_in';
    if (hour >= 12 && hour <= 14) return 'break_start';
    if (hour >= 14 && hour <= 15) return 'break_end';
    if (hour >= 16 && hour <= 20) return 'check_out';
    if (hour >= 20) return 'overtime_start';

    return 'check_in';
  }

  /**
   * Process biometric logs into attendance records
   */
  async processLogsIntoAttendance(logs) {
    // Group logs by employee and date
    const groupedLogs = {};

    for (const log of logs) {
      const dateKey = log.punchTime.toISOString().split('T')[0];
      const key = `${log.employeeId}-${dateKey}`;

      if (!groupedLogs[key]) {
        groupedLogs[key] = {
          employeeId: log.employeeId,
          date: dateKey,
          logs: []
        };
      }
      groupedLogs[key].logs.push(log);
    }

    // Create/update attendance records
    for (const key in groupedLogs) {
      const { employeeId, date, logs } = groupedLogs[key];

      // Sort logs by time
      logs.sort((a, b) => a.punchTime - b.punchTime);

      const checkIn = logs.find(l => l.punchType === 'check_in');
      const checkOut = logs.find(l => l.punchType === 'check_out');
      const breakStart = logs.find(l => l.punchType === 'break_start');
      const breakEnd = logs.find(l => l.punchType === 'break_end');

      // Calculate work hours
      let workMinutes = 0;
      if (checkIn && checkOut) {
        workMinutes = (checkOut.punchTime - checkIn.punchTime) / (1000 * 60);

        // Subtract break time
        if (breakStart && breakEnd) {
          const breakMinutes = (breakEnd.punchTime - breakStart.punchTime) / (1000 * 60);
          workMinutes -= breakMinutes;
        }
      }

      // Determine status
      const employee = await Employee.findById(employeeId);
      let status = 'present';

      if (checkIn) {
        const shiftStart = new Date(date + 'T08:00:00'); // Configure from shift
        if (checkIn.punchTime > shiftStart) {
          const lateMinutes = (checkIn.punchTime - shiftStart) / (1000 * 60);
          if (lateMinutes > 15) status = 'late';
        }
      }

      // Upsert attendance record
      await Attendance.findOneAndUpdate(
        { employeeId, date },
        {
          employeeId,
          date,
          status,
          checkIn: checkIn?.punchTime,
          checkOut: checkOut?.punchTime,
          breakStart: breakStart?.punchTime,
          breakEnd: breakEnd?.punchTime,
          workHours: Math.round(workMinutes / 60 * 100) / 100,
          source: 'biometric',
          biometricLogs: logs.map(l => l._id)
        },
        { upsert: true, new: true }
      );

      // Mark logs as processed
      await BiometricLog.updateMany(
        { _id: { $in: logs.map(l => l._id) } },
        { processed: true, processedAt: new Date() }
      );
    }
  }

  // ==================== FACE RECOGNITION ====================

  /**
   * Register employee face
   */
  async registerEmployeeFace(employeeId, faceImageBase64) {
    const employee = await Employee.findById(employeeId);
    if (!employee) throw new Error('Employee not found');

    // Call face recognition service (AWS Rekognition / Azure Face / local)
    const faceData = await this.extractFaceEmbedding(faceImageBase64);

    // Store face embedding
    employee.biometricData = {
      ...employee.biometricData,
      faceEmbedding: faceData.embedding,
      faceRegisteredAt: new Date(),
      faceQuality: faceData.quality
    };

    await employee.save();

    return { success: true, quality: faceData.quality };
  }

  /**
   * Verify face for attendance
   */
  async verifyFace(faceImageBase64, locationId) {
    const faceData = await this.extractFaceEmbedding(faceImageBase64);

    // Find matching employee
    const employees = await Employee.find({
      'biometricData.faceEmbedding': { $exists: true }
    });

    let bestMatch = null;
    let bestScore = 0;

    for (const employee of employees) {
      const score = this.compareFaceEmbeddings(
        faceData.embedding,
        employee.biometricData.faceEmbedding
      );

      if (score > bestScore && score > 0.85) { // 85% threshold
        bestScore = score;
        bestMatch = employee;
      }
    }

    if (!bestMatch) {
      throw new Error('Face not recognized');
    }

    // Record attendance
    const now = new Date();
    const punchType = this.determineAutoDetectPunchType(bestMatch._id);

    const log = await BiometricLog.create({
      employeeId: bestMatch._id,
      punchTime: now,
      punchType,
      verificationMethod: 'face',
      verificationScore: Math.round(bestScore * 100),
      locationId,
      photoCapture: faceImageBase64, // Store verification photo
      livenessCheck: faceData.isLive
    });

    await this.processLogsIntoAttendance([log]);

    return {
      success: true,
      employee: {
        _id: bestMatch._id,
        name: `${bestMatch.firstName} ${bestMatch.lastName}`,
        avatar: bestMatch.avatar
      },
      punchType,
      time: now,
      score: Math.round(bestScore * 100)
    };
  }

  /**
   * Extract face embedding using AI service
   */
  async extractFaceEmbedding(imageBase64) {
    // Option 1: AWS Rekognition
    // const rekognition = new AWS.Rekognition();
    // const result = await rekognition.indexFaces({...}).promise();

    // Option 2: Azure Face API
    // const result = await axios.post(AZURE_FACE_ENDPOINT, {...});

    // Option 3: Local TensorFlow.js with face-api.js
    // const faceapi = require('@vladmandic/face-api');

    // Placeholder implementation
    return {
      embedding: new Array(128).fill(0).map(() => Math.random()),
      quality: 0.95,
      isLive: true
    };
  }

  compareFaceEmbeddings(embedding1, embedding2) {
    // Cosine similarity
    const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
    const norm1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
    const norm2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (norm1 * norm2);
  }

  // ==================== GEO-FENCING ====================

  /**
   * Validate location for attendance
   */
  async validateGeoLocation(employeeId, latitude, longitude) {
    const employee = await Employee.findById(employeeId)
      .populate('departmentId');

    // Get allowed locations
    const allowedLocations = await Location.find({
      $or: [
        { _id: employee.locationId },
        { departmentId: employee.departmentId },
        { isHeadquarters: true }
      ]
    });

    for (const location of allowedLocations) {
      const distance = this.calculateDistance(
        latitude, longitude,
        location.coordinates.latitude, location.coordinates.longitude
      );

      if (distance <= location.geoFenceRadius) {
        return { valid: true, location: location.name, distance };
      }
    }

    return { valid: false, nearestDistance: this.findNearestDistance(latitude, longitude, allowedLocations) };
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
}

module.exports = new BiometricService();
```

### Biometric Routes

```javascript
// routes/biometric.js
const express = require('express');
const router = express.Router();
const biometricService = require('../services/biometricService');
const { auth, authorize } = require('../middleware/auth');

// Device Management
router.get('/devices', auth, authorize('hr', 'admin'), async (req, res) => {
  const devices = await BiometricDevice.find().sort({ createdAt: -1 });
  res.json({ success: true, devices });
});

router.post('/devices', auth, authorize('admin'), async (req, res) => {
  const device = await BiometricDevice.create(req.body);
  res.json({ success: true, device });
});

router.post('/devices/:id/connect', auth, authorize('admin'), async (req, res) => {
  await biometricService.connectToZKDevice(req.params.id);
  res.json({ success: true, message: 'Connected successfully' });
});

router.post('/devices/:id/sync', auth, authorize('hr', 'admin'), async (req, res) => {
  const result = await biometricService.syncDeviceLogs(req.params.id);
  res.json({ success: true, ...result });
});

// Face Recognition
router.post('/register-face', auth, authorize('hr', 'admin'), async (req, res) => {
  const { employeeId, faceImage } = req.body;
  const result = await biometricService.registerEmployeeFace(employeeId, faceImage);
  res.json({ success: true, ...result });
});

router.post('/verify-face', async (req, res) => {
  const { faceImage, locationId, latitude, longitude } = req.body;

  // Validate geo-location if provided
  if (latitude && longitude) {
    // Will be validated after face recognition
  }

  const result = await biometricService.verifyFace(faceImage, locationId);
  res.json({ success: true, ...result });
});

// Geo-Location Attendance (Mobile App)
router.post('/mobile-punch', auth, async (req, res) => {
  const { latitude, longitude, punchType } = req.body;

  // Validate location
  const locationCheck = await biometricService.validateGeoLocation(
    req.user.employeeId, latitude, longitude
  );

  if (!locationCheck.valid) {
    return res.status(400).json({
      success: false,
      message: 'You are not within an allowed location',
      nearestDistance: locationCheck.nearestDistance
    });
  }

  // Record attendance
  const log = await BiometricLog.create({
    employeeId: req.user.employeeId,
    punchTime: new Date(),
    punchType,
    verificationMethod: 'mobile_gps',
    geoLocation: { latitude, longitude },
    locationId: locationCheck.location
  });

  await biometricService.processLogsIntoAttendance([log]);

  res.json({ success: true, location: locationCheck.location });
});

module.exports = router;
```

---

## 1.2 HR Advanced Analytics & AI

### HR Analytics Service

```javascript
// services/hrAnalyticsService.js
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Evaluation = require('../models/Evaluation');

class HRAnalyticsService {

  // ==================== WORKFORCE ANALYTICS ====================

  /**
   * Get comprehensive workforce analytics
   */
  async getWorkforceAnalytics(filters = {}) {
    const { departmentId, startDate, endDate } = filters;

    const matchStage = {};
    if (departmentId) matchStage.departmentId = departmentId;

    // Employee Demographics
    const demographics = await Employee.aggregate([
      { $match: { ...matchStage, status: 'active' } },
      {
        $facet: {
          byDepartment: [
            { $group: { _id: '$department', count: { $sum: 1 } } }
          ],
          byGender: [
            { $group: { _id: '$gender', count: { $sum: 1 } } }
          ],
          byEmployeeType: [
            { $group: { _id: '$employeeType', count: { $sum: 1 } } }
          ],
          byNationality: [
            { $group: { _id: '$nationality', count: { $sum: 1 } } }
          ],
          ageDistribution: [
            {
              $bucket: {
                groupBy: {
                  $subtract: [
                    { $year: new Date() },
                    { $year: { $toDate: '$dateOfBirth' } }
                  ]
                },
                boundaries: [20, 30, 40, 50, 60, 70],
                default: 'Other',
                output: { count: { $sum: 1 } }
              }
            }
          ],
          tenureDistribution: [
            {
              $bucket: {
                groupBy: {
                  $divide: [
                    { $subtract: [new Date(), { $toDate: '$hireDate' }] },
                    1000 * 60 * 60 * 24 * 365 // Years
                  ]
                },
                boundaries: [0, 1, 2, 5, 10, 20],
                default: '20+',
                output: { count: { $sum: 1 } }
              }
            }
          ]
        }
      }
    ]);

    return demographics[0];
  }

  /**
   * Turnover Analysis
   */
  async getTurnoverAnalysis(year) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    // Get employees who left
    const terminated = await Employee.aggregate([
      {
        $match: {
          status: 'terminated',
          endDate: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: { $toDate: '$endDate' } },
          count: { $sum: 1 },
          employees: {
            $push: {
              name: { $concat: ['$firstName', ' ', '$lastName'] },
              department: '$department',
              tenure: {
                $divide: [
                  { $subtract: [{ $toDate: '$endDate' }, { $toDate: '$hireDate' }] },
                  1000 * 60 * 60 * 24 * 365
                ]
              }
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get new hires
    const hired = await Employee.aggregate([
      {
        $match: {
          hireDate: { $gte: startOfYear.toISOString(), $lte: endOfYear.toISOString() }
        }
      },
      {
        $group: {
          _id: { $month: { $toDate: '$hireDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate turnover rate
    const avgHeadcount = await this.getAverageHeadcount(year);
    const totalTerminated = terminated.reduce((sum, m) => sum + m.count, 0);
    const turnoverRate = (totalTerminated / avgHeadcount) * 100;

    return {
      year,
      terminated,
      hired,
      totalTerminated,
      totalHired: hired.reduce((sum, m) => sum + m.count, 0),
      turnoverRate: Math.round(turnoverRate * 10) / 10,
      avgTenure: await this.getAverageTenure()
    };
  }

  /**
   * Absenteeism Analysis
   */
  async getAbsenteeismAnalysis(startDate, endDate) {
    const absences = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $in: ['absent', 'late', 'half_day'] }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $facet: {
          byDepartment: [
            { $group: { _id: '$employee.department', count: { $sum: 1 } } }
          ],
          byDayOfWeek: [
            { $group: { _id: { $dayOfWeek: { $toDate: '$date' } }, count: { $sum: 1 } } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          topAbsentees: [
            { $group: {
              _id: '$employeeId',
              name: { $first: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] } },
              department: { $first: '$employee.department' },
              count: { $sum: 1 }
            }},
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          trend: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: { $toDate: '$date' } } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    // Calculate absenteeism rate
    const workingDays = this.getWorkingDays(startDate, endDate);
    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    const totalAbsences = absences[0].byStatus.reduce((sum, s) => sum + s.count, 0);
    const absenteeismRate = (totalAbsences / (workingDays * totalEmployees)) * 100;

    return {
      ...absences[0],
      absenteeismRate: Math.round(absenteeismRate * 100) / 100,
      workingDays,
      totalAbsences
    };
  }

  // ==================== PREDICTIVE ANALYTICS ====================

  /**
   * Predict employee attrition risk
   */
  async predictAttritionRisk() {
    const employees = await Employee.find({ status: 'active' })
      .populate('departmentId');

    const riskScores = [];

    for (const emp of employees) {
      let riskScore = 0;
      const riskFactors = [];

      // Factor 1: Tenure (new employees and those around 2-year mark are higher risk)
      const tenureYears = (Date.now() - new Date(emp.hireDate)) / (1000 * 60 * 60 * 24 * 365);
      if (tenureYears < 1) {
        riskScore += 15;
        riskFactors.push('New employee (< 1 year)');
      } else if (tenureYears >= 1.5 && tenureYears <= 2.5) {
        riskScore += 20;
        riskFactors.push('2-year itch period');
      }

      // Factor 2: Recent performance reviews
      const recentReviews = await Evaluation.find({
        employeeId: emp._id,
        createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      }).sort({ createdAt: -1 }).limit(2);

      if (recentReviews.length > 0) {
        const avgRating = recentReviews.reduce((sum, r) => sum + r.overallRating, 0) / recentReviews.length;
        if (avgRating <= 2) {
          riskScore += 25;
          riskFactors.push('Low performance rating');
        } else if (avgRating >= 4.5) {
          riskScore += 10;
          riskFactors.push('High performer (poaching risk)');
        }
      }

      // Factor 3: Leave patterns
      const recentLeaves = await Leave.countDocuments({
        employeeId: emp._id,
        createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      });
      if (recentLeaves >= 5) {
        riskScore += 15;
        riskFactors.push('Frequent leave requests');
      }

      // Factor 4: Attendance
      const lateCount = await Attendance.countDocuments({
        employeeId: emp._id,
        status: 'late',
        date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() }
      });
      if (lateCount >= 10) {
        riskScore += 15;
        riskFactors.push('Frequent tardiness');
      }

      // Factor 5: No salary increase in 18+ months
      const lastSalaryChange = emp.salaryHistory?.[emp.salaryHistory.length - 1];
      if (lastSalaryChange) {
        const monthsSinceIncrease = (Date.now() - new Date(lastSalaryChange.effectiveDate)) / (1000 * 60 * 60 * 24 * 30);
        if (monthsSinceIncrease >= 18) {
          riskScore += 20;
          riskFactors.push('No salary increase in 18+ months');
        }
      }

      // Factor 6: Department turnover (if their dept has high turnover)
      const deptTurnover = await this.getDepartmentTurnoverRate(emp.departmentId);
      if (deptTurnover > 20) {
        riskScore += 10;
        riskFactors.push('High department turnover');
      }

      // Normalize score to 0-100
      riskScore = Math.min(riskScore, 100);

      riskScores.push({
        employeeId: emp._id,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        position: emp.position,
        riskScore,
        riskLevel: riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
        riskFactors,
        tenure: Math.round(tenureYears * 10) / 10
      });
    }

    // Sort by risk score
    riskScores.sort((a, b) => b.riskScore - a.riskScore);

    return {
      totalEmployees: employees.length,
      highRisk: riskScores.filter(e => e.riskLevel === 'high').length,
      mediumRisk: riskScores.filter(e => e.riskLevel === 'medium').length,
      lowRisk: riskScores.filter(e => e.riskLevel === 'low').length,
      employees: riskScores
    };
  }

  /**
   * Workforce Planning Forecast
   */
  async getWorkforceForecast(months = 12) {
    // Get historical hiring and termination data
    const historicalData = await this.getHistoricalHeadcount(24); // 2 years

    // Simple linear regression for forecasting
    const forecast = [];
    const avgMonthlyGrowth = this.calculateAverageGrowth(historicalData);
    const currentHeadcount = await Employee.countDocuments({ status: 'active' });

    for (let i = 1; i <= months; i++) {
      const projectedHeadcount = Math.round(currentHeadcount * (1 + avgMonthlyGrowth * i));
      const date = new Date();
      date.setMonth(date.getMonth() + i);

      forecast.push({
        month: date.toISOString().substring(0, 7),
        projectedHeadcount,
        hiringNeeded: Math.max(0, projectedHeadcount - currentHeadcount),
        confidence: Math.max(50, 95 - (i * 3)) // Confidence decreases over time
      });
    }

    return {
      currentHeadcount,
      historicalData,
      forecast,
      avgMonthlyGrowthRate: Math.round(avgMonthlyGrowth * 10000) / 100
    };
  }

  // Helper methods
  getWorkingDays(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 5 && day !== 6) count++; // Saudi weekend is Fri-Sat
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  async getAverageHeadcount(year) {
    // Simplified - get average of start and end of year
    const startCount = await Employee.countDocuments({
      hireDate: { $lte: new Date(year, 0, 1).toISOString() },
      $or: [
        { status: 'active' },
        { endDate: { $gte: new Date(year, 0, 1).toISOString() } }
      ]
    });
    const endCount = await Employee.countDocuments({
      hireDate: { $lte: new Date(year, 11, 31).toISOString() },
      $or: [
        { status: 'active' },
        { endDate: { $gte: new Date(year, 11, 31).toISOString() } }
      ]
    });
    return (startCount + endCount) / 2;
  }

  async getAverageTenure() {
    const result = await Employee.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          avgTenure: {
            $avg: {
              $divide: [
                { $subtract: [new Date(), { $toDate: '$hireDate' }] },
                1000 * 60 * 60 * 24 * 365
              ]
            }
          }
        }
      }
    ]);
    return Math.round((result[0]?.avgTenure || 0) * 10) / 10;
  }
}

module.exports = new HRAnalyticsService();
```

### HR Analytics Routes

```javascript
// routes/hrAnalytics.js
const express = require('express');
const router = express.Router();
const hrAnalyticsService = require('../services/hrAnalyticsService');
const { auth, authorize } = require('../middleware/auth');

router.get('/workforce', auth, authorize('hr', 'admin'), async (req, res) => {
  const analytics = await hrAnalyticsService.getWorkforceAnalytics(req.query);
  res.json({ success: true, data: analytics });
});

router.get('/turnover', auth, authorize('hr', 'admin'), async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const analysis = await hrAnalyticsService.getTurnoverAnalysis(year);
  res.json({ success: true, data: analysis });
});

router.get('/absenteeism', auth, authorize('hr', 'admin'), async (req, res) => {
  const { startDate, endDate } = req.query;
  const analysis = await hrAnalyticsService.getAbsenteeismAnalysis(startDate, endDate);
  res.json({ success: true, data: analysis });
});

router.get('/attrition-risk', auth, authorize('hr', 'admin'), async (req, res) => {
  const prediction = await hrAnalyticsService.predictAttritionRisk();
  res.json({ success: true, data: prediction });
});

router.get('/workforce-forecast', auth, authorize('hr', 'admin'), async (req, res) => {
  const months = parseInt(req.query.months) || 12;
  const forecast = await hrAnalyticsService.getWorkforceForecast(months);
  res.json({ success: true, data: forecast });
});

module.exports = router;
```

---

# PART 2: FINANCE MODULE - FROM 9/10 TO 10/10

## 2.1 Bank Reconciliation System

### New Schema: BankReconciliation

```javascript
// models/BankReconciliation.js
const mongoose = require('mongoose');

const bankTransactionSchema = new mongoose.Schema({
  transactionId: String,
  date: Date,
  description: String,
  reference: String,
  amount: Number,
  type: { type: String, enum: ['credit', 'debit'] },
  balance: Number,
  matchStatus: {
    type: String,
    enum: ['unmatched', 'matched', 'partially_matched', 'excluded'],
    default: 'unmatched'
  },
  matchedWith: [{
    type: { type: String, enum: ['invoice', 'payment', 'expense', 'transaction'] },
    referenceId: mongoose.Schema.Types.ObjectId,
    amount: Number
  }],
  matchConfidence: Number, // AI matching confidence 0-100
  suggestedMatches: [{
    type: { type: String },
    referenceId: mongoose.Schema.Types.ObjectId,
    confidence: Number,
    reason: String
  }]
});

const reconciliationSchema = new mongoose.Schema({
  bankAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount', required: true },

  // Period
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },

  // Statement Details
  statementNumber: String,
  openingBalance: { type: Number, required: true },
  closingBalance: { type: Number, required: true },

  // Import
  importMethod: { type: String, enum: ['manual', 'csv', 'ofx', 'api', 'open_banking'] },
  importedAt: Date,
  importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rawFile: String, // S3 URL

  // Transactions
  transactions: [bankTransactionSchema],

  // Reconciliation Status
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'review', 'completed', 'discrepancy'],
    default: 'pending'
  },

  // Balances
  systemBalance: Number, // Balance from our system
  bankBalance: Number, // Balance from bank statement
  difference: Number, // Discrepancy

  // Statistics
  stats: {
    totalTransactions: Number,
    matchedTransactions: Number,
    unmatchedTransactions: Number,
    totalCredits: Number,
    totalDebits: Number,
    autoMatchedCount: Number,
    manualMatchedCount: Number
  },

  // Approval
  reconciledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reconciledAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,

  notes: String
}, { timestamps: true });

module.exports = mongoose.model('BankReconciliation', reconciliationSchema);
```

### Bank Reconciliation Service

```javascript
// services/bankReconciliationService.js
const BankReconciliation = require('../models/BankReconciliation');
const BankAccount = require('../models/BankAccount');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const Transaction = require('../models/Transaction');
const csv = require('csv-parse');
const { parse: parseOFX } = require('ofx-js');

class BankReconciliationService {

  // ==================== IMPORT STATEMENTS ====================

  /**
   * Import bank statement from CSV
   */
  async importFromCSV(bankAccountId, fileBuffer, mapping) {
    const bankAccount = await BankAccount.findById(bankAccountId);
    if (!bankAccount) throw new Error('Bank account not found');

    // Parse CSV
    const records = await new Promise((resolve, reject) => {
      csv.parse(fileBuffer, { columns: true }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    // Map columns based on user-provided mapping
    const transactions = records.map(row => ({
      transactionId: row[mapping.transactionId] || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(row[mapping.date]),
      description: row[mapping.description],
      reference: row[mapping.reference],
      amount: Math.abs(parseFloat(row[mapping.amount])),
      type: parseFloat(row[mapping.amount]) >= 0 ? 'credit' : 'debit',
      balance: row[mapping.balance] ? parseFloat(row[mapping.balance]) : null
    }));

    // Sort by date
    transactions.sort((a, b) => a.date - b.date);

    // Calculate opening and closing balances
    const openingBalance = transactions[0]?.balance || 0;
    const closingBalance = transactions[transactions.length - 1]?.balance || 0;

    // Create reconciliation record
    const reconciliation = await BankReconciliation.create({
      bankAccountId,
      periodStart: transactions[0]?.date,
      periodEnd: transactions[transactions.length - 1]?.date,
      openingBalance,
      closingBalance,
      importMethod: 'csv',
      importedAt: new Date(),
      transactions,
      status: 'pending',
      stats: {
        totalTransactions: transactions.length,
        matchedTransactions: 0,
        unmatchedTransactions: transactions.length,
        totalCredits: transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
        totalDebits: transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
      }
    });

    // Auto-match transactions
    await this.autoMatchTransactions(reconciliation._id);

    return reconciliation;
  }

  /**
   * Import from OFX/QFX file
   */
  async importFromOFX(bankAccountId, fileBuffer) {
    const ofxData = await parseOFX(fileBuffer.toString());

    const statement = ofxData.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS;
    const transactions = statement.BANKTRANLIST.STMTTRN.map(txn => ({
      transactionId: txn.FITID,
      date: this.parseOFXDate(txn.DTPOSTED),
      description: txn.NAME || txn.MEMO,
      reference: txn.CHECKNUM,
      amount: Math.abs(parseFloat(txn.TRNAMT)),
      type: parseFloat(txn.TRNAMT) >= 0 ? 'credit' : 'debit'
    }));

    const reconciliation = await BankReconciliation.create({
      bankAccountId,
      periodStart: this.parseOFXDate(statement.BANKTRANLIST.DTSTART),
      periodEnd: this.parseOFXDate(statement.BANKTRANLIST.DTEND),
      openingBalance: parseFloat(statement.LEDGERBAL?.BALAMT || 0),
      closingBalance: parseFloat(statement.AVAILBAL?.BALAMT || statement.LEDGERBAL?.BALAMT || 0),
      importMethod: 'ofx',
      importedAt: new Date(),
      transactions,
      status: 'pending',
      stats: {
        totalTransactions: transactions.length,
        matchedTransactions: 0,
        unmatchedTransactions: transactions.length,
        totalCredits: transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
        totalDebits: transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
      }
    });

    await this.autoMatchTransactions(reconciliation._id);

    return reconciliation;
  }

  // ==================== AUTO-MATCHING ====================

  /**
   * Auto-match bank transactions with system records
   */
  async autoMatchTransactions(reconciliationId) {
    const reconciliation = await BankReconciliation.findById(reconciliationId);
    if (!reconciliation) throw new Error('Reconciliation not found');

    let autoMatchedCount = 0;

    for (let i = 0; i < reconciliation.transactions.length; i++) {
      const bankTxn = reconciliation.transactions[i];

      if (bankTxn.matchStatus !== 'unmatched') continue;

      const matches = await this.findPotentialMatches(bankTxn, reconciliation.bankAccountId);

      if (matches.length > 0) {
        // Store suggestions
        reconciliation.transactions[i].suggestedMatches = matches.map(m => ({
          type: m.type,
          referenceId: m._id,
          confidence: m.confidence,
          reason: m.reason
        }));

        // Auto-match if high confidence
        if (matches[0].confidence >= 95) {
          reconciliation.transactions[i].matchStatus = 'matched';
          reconciliation.transactions[i].matchedWith = [{
            type: matches[0].type,
            referenceId: matches[0]._id,
            amount: matches[0].amount
          }];
          reconciliation.transactions[i].matchConfidence = matches[0].confidence;
          autoMatchedCount++;
        }
      }
    }

    // Update stats
    reconciliation.stats.autoMatchedCount = autoMatchedCount;
    reconciliation.stats.matchedTransactions = reconciliation.transactions.filter(
      t => t.matchStatus === 'matched'
    ).length;
    reconciliation.stats.unmatchedTransactions = reconciliation.transactions.filter(
      t => t.matchStatus === 'unmatched'
    ).length;
    reconciliation.status = 'in_progress';

    await reconciliation.save();

    return reconciliation;
  }

  /**
   * Find potential matches for a bank transaction
   */
  async findPotentialMatches(bankTxn, bankAccountId) {
    const matches = [];
    const dateRange = {
      $gte: new Date(bankTxn.date.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days before
      $lte: new Date(bankTxn.date.getTime() + 5 * 24 * 60 * 60 * 1000)  // 5 days after
    };

    if (bankTxn.type === 'credit') {
      // Look for payments
      const payments = await Payment.find({
        amount: { $gte: bankTxn.amount * 0.99, $lte: bankTxn.amount * 1.01 }, // 1% tolerance
        paymentDate: dateRange,
        reconciled: { $ne: true }
      }).populate('clientId', 'firstName lastName companyName');

      for (const payment of payments) {
        let confidence = 70; // Base confidence for amount match
        const reasons = ['Amount matches'];

        // Exact amount match
        if (payment.amount === bankTxn.amount) {
          confidence += 15;
          reasons.push('Exact amount');
        }

        // Date match
        if (payment.paymentDate.toDateString() === bankTxn.date.toDateString()) {
          confidence += 10;
          reasons.push('Same date');
        }

        // Reference/description match
        if (bankTxn.description && payment.transactionId) {
          if (bankTxn.description.includes(payment.transactionId)) {
            confidence += 15;
            reasons.push('Reference matches');
          }
        }

        matches.push({
          type: 'payment',
          _id: payment._id,
          amount: payment.amount,
          date: payment.paymentDate,
          description: `Payment from ${payment.clientId?.firstName || payment.clientId?.companyName}`,
          confidence: Math.min(confidence, 100),
          reason: reasons.join(', ')
        });
      }
    } else {
      // Look for expenses
      const expenses = await Expense.find({
        amount: { $gte: bankTxn.amount * 0.99, $lte: bankTxn.amount * 1.01 },
        date: dateRange,
        reconciled: { $ne: true }
      });

      for (const expense of expenses) {
        let confidence = 70;
        const reasons = ['Amount matches'];

        if (expense.amount === bankTxn.amount) {
          confidence += 15;
          reasons.push('Exact amount');
        }

        if (expense.vendor && bankTxn.description.toLowerCase().includes(expense.vendor.toLowerCase())) {
          confidence += 15;
          reasons.push('Vendor matches');
        }

        matches.push({
          type: 'expense',
          _id: expense._id,
          amount: expense.amount,
          date: expense.date,
          description: expense.description,
          confidence: Math.min(confidence, 100),
          reason: reasons.join(', ')
        });
      }
    }

    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence);

    return matches.slice(0, 5); // Return top 5 matches
  }

  /**
   * Manually match transaction
   */
  async manualMatch(reconciliationId, transactionIndex, matchData) {
    const reconciliation = await BankReconciliation.findById(reconciliationId);

    reconciliation.transactions[transactionIndex].matchStatus = 'matched';
    reconciliation.transactions[transactionIndex].matchedWith = matchData.matches;
    reconciliation.transactions[transactionIndex].matchConfidence = 100;

    // Update stats
    reconciliation.stats.manualMatchedCount = (reconciliation.stats.manualMatchedCount || 0) + 1;
    reconciliation.stats.matchedTransactions = reconciliation.transactions.filter(
      t => t.matchStatus === 'matched'
    ).length;
    reconciliation.stats.unmatchedTransactions = reconciliation.transactions.filter(
      t => t.matchStatus === 'unmatched'
    ).length;

    // Mark system records as reconciled
    for (const match of matchData.matches) {
      const Model = this.getModelByType(match.type);
      await Model.findByIdAndUpdate(match.referenceId, { reconciled: true, reconciledAt: new Date() });
    }

    await reconciliation.save();

    return reconciliation;
  }

  /**
   * Complete reconciliation
   */
  async completeReconciliation(reconciliationId, userId) {
    const reconciliation = await BankReconciliation.findById(reconciliationId);

    // Calculate system balance
    const systemBalance = await this.calculateSystemBalance(
      reconciliation.bankAccountId,
      reconciliation.periodEnd
    );

    reconciliation.systemBalance = systemBalance;
    reconciliation.bankBalance = reconciliation.closingBalance;
    reconciliation.difference = reconciliation.closingBalance - systemBalance;

    if (Math.abs(reconciliation.difference) < 0.01) {
      reconciliation.status = 'completed';
    } else {
      reconciliation.status = 'discrepancy';
    }

    reconciliation.reconciledBy = userId;
    reconciliation.reconciledAt = new Date();

    await reconciliation.save();

    return reconciliation;
  }

  // Helper methods
  parseOFXDate(dateStr) {
    // OFX date format: YYYYMMDDHHMMSS
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return new Date(`${year}-${month}-${day}`);
  }

  getModelByType(type) {
    const models = {
      'payment': Payment,
      'invoice': Invoice,
      'expense': Expense,
      'transaction': Transaction
    };
    return models[type];
  }

  async calculateSystemBalance(bankAccountId, asOfDate) {
    // Sum all transactions up to the date
    const result = await Transaction.aggregate([
      {
        $match: {
          bankAccountId,
          date: { $lte: asOfDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          credits: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
          },
          debits: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
          }
        }
      }
    ]);

    const bankAccount = await BankAccount.findById(bankAccountId);
    const openingBalance = bankAccount.openingBalance || 0;

    return openingBalance + (result[0]?.credits || 0) - (result[0]?.debits || 0);
  }
}

module.exports = new BankReconciliationService();
```

### Bank Reconciliation Routes

```javascript
// routes/bankReconciliation.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const reconciliationService = require('../services/bankReconciliationService');
const { auth, authorize } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

// List reconciliations
router.get('/', auth, authorize('accountant', 'admin'), async (req, res) => {
  const { bankAccountId, status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (bankAccountId) query.bankAccountId = bankAccountId;
  if (status) query.status = status;

  const reconciliations = await BankReconciliation.find(query)
    .populate('bankAccountId', 'bankName accountNumber')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await BankReconciliation.countDocuments(query);

  res.json({ success: true, data: reconciliations, total });
});

// Import CSV
router.post('/import/csv', auth, authorize('accountant', 'admin'), upload.single('file'), async (req, res) => {
  const { bankAccountId, mapping } = req.body;
  const result = await reconciliationService.importFromCSV(
    bankAccountId,
    req.file.buffer,
    JSON.parse(mapping)
  );
  res.json({ success: true, data: result });
});

// Import OFX/QFX
router.post('/import/ofx', auth, authorize('accountant', 'admin'), upload.single('file'), async (req, res) => {
  const { bankAccountId } = req.body;
  const result = await reconciliationService.importFromOFX(bankAccountId, req.file.buffer);
  res.json({ success: true, data: result });
});

// Get reconciliation details
router.get('/:id', auth, authorize('accountant', 'admin'), async (req, res) => {
  const reconciliation = await BankReconciliation.findById(req.params.id)
    .populate('bankAccountId');
  res.json({ success: true, data: reconciliation });
});

// Auto-match
router.post('/:id/auto-match', auth, authorize('accountant', 'admin'), async (req, res) => {
  const result = await reconciliationService.autoMatchTransactions(req.params.id);
  res.json({ success: true, data: result });
});

// Manual match
router.post('/:id/transactions/:index/match', auth, authorize('accountant', 'admin'), async (req, res) => {
  const result = await reconciliationService.manualMatch(
    req.params.id,
    parseInt(req.params.index),
    req.body
  );
  res.json({ success: true, data: result });
});

// Complete reconciliation
router.post('/:id/complete', auth, authorize('accountant', 'admin'), async (req, res) => {
  const result = await reconciliationService.completeReconciliation(req.params.id, req.user._id);
  res.json({ success: true, data: result });
});

module.exports = router;
```

---

## 2.2 Multi-Currency Support

### Currency Service

```javascript
// services/currencyService.js
const axios = require('axios');
const redis = require('../config/redis');

class CurrencyService {
  constructor() {
    this.baseCurrency = 'SAR';
    this.cacheKey = 'exchange_rates';
    this.cacheTTL = 3600; // 1 hour
  }

  /**
   * Get current exchange rates
   */
  async getExchangeRates() {
    // Check cache first
    const cached = await redis.get(this.cacheKey);
    if (cached) return JSON.parse(cached);

    // Fetch from API (using exchangerate-api.com or similar)
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${this.baseCurrency}`
    );

    const rates = response.data.rates;

    // Cache the rates
    await redis.setex(this.cacheKey, this.cacheTTL, JSON.stringify(rates));

    return rates;
  }

  /**
   * Convert amount between currencies
   */
  async convert(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    const rates = await this.getExchangeRates();

    // Convert to base currency first, then to target
    let inBase = amount;
    if (fromCurrency !== this.baseCurrency) {
      inBase = amount / rates[fromCurrency];
    }

    if (toCurrency === this.baseCurrency) {
      return Math.round(inBase * 100) / 100;
    }

    return Math.round(inBase * rates[toCurrency] * 100) / 100;
  }

  /**
   * Get historical rate for a specific date
   */
  async getHistoricalRate(date, fromCurrency, toCurrency) {
    const dateStr = date.toISOString().split('T')[0];
    const cacheKey = `rate_${fromCurrency}_${toCurrency}_${dateStr}`;

    const cached = await redis.get(cacheKey);
    if (cached) return parseFloat(cached);

    // Fetch historical rate
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/history/${fromCurrency}/${dateStr}`
    );

    const rate = response.data.rates[toCurrency];

    // Cache permanently (historical rates don't change)
    await redis.set(cacheKey, rate.toString());

    return rate;
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount, currency, locale = 'ar-SA') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}

module.exports = new CurrencyService();
```

---

# PART 3: CRM MODULE - FROM 8.5 TO 10/10

## 3.1 Email Marketing Automation

### New Schema: EmailCampaign

```javascript
// models/EmailCampaign.js
const mongoose = require('mongoose');

const emailCampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameAr: String,
  type: {
    type: String,
    enum: ['one_time', 'drip', 'triggered', 'newsletter'],
    required: true
  },

  // Audience
  audience: {
    type: { type: String, enum: ['all_leads', 'segment', 'list', 'dynamic'] },
    segmentId: mongoose.Schema.Types.ObjectId,
    listId: mongoose.Schema.Types.ObjectId,
    filters: mongoose.Schema.Types.Mixed // For dynamic segments
  },

  // Content
  subject: { type: String, required: true },
  subjectAr: String,
  preheaderText: String,
  fromName: String,
  fromEmail: String,
  replyTo: String,

  // Template
  templateId: mongoose.Schema.Types.ObjectId,
  htmlContent: String,
  textContent: String,

  // Personalization
  personalization: {
    enabled: { type: Boolean, default: true },
    fields: [String] // ['firstName', 'lastName', 'company', etc.]
  },

  // Scheduling
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'],
    default: 'draft'
  },
  scheduledAt: Date,
  sentAt: Date,

  // Drip Campaign Settings
  dripSettings: {
    triggerEvent: String, // 'lead_created', 'status_change', 'form_submission'
    emails: [{
      order: Number,
      delayDays: Number,
      delayHours: Number,
      subject: String,
      subjectAr: String,
      templateId: mongoose.Schema.Types.ObjectId,
      htmlContent: String,
      conditions: mongoose.Schema.Types.Mixed // Skip if condition met
    }]
  },

  // A/B Testing
  abTesting: {
    enabled: { type: Boolean, default: false },
    variants: [{
      name: String,
      subject: String,
      percentage: Number,
      htmlContent: String
    }],
    winnerCriteria: { type: String, enum: ['open_rate', 'click_rate', 'conversion'] },
    testDuration: Number // hours
  },

  // Statistics
  stats: {
    totalRecipients: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 },
    complained: { type: Number, default: 0 },
    converted: { type: Number, default: 0 }
  },

  // Tracking
  trackOpens: { type: Boolean, default: true },
  trackClicks: { type: Boolean, default: true },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('EmailCampaign', emailCampaignSchema);
```

### Email Marketing Service

```javascript
// services/emailMarketingService.js
const EmailCampaign = require('../models/EmailCampaign');
const Lead = require('../models/Lead');
const EmailEvent = require('../models/EmailEvent');
const sgMail = require('@sendgrid/mail');
const Queue = require('bull');

// Initialize email queue
const emailQueue = new Queue('email-campaigns', process.env.REDIS_URL);

class EmailMarketingService {

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.setupQueueProcessors();
  }

  setupQueueProcessors() {
    // Process campaign emails
    emailQueue.process('send-campaign', async (job) => {
      const { campaignId, recipientId, emailIndex } = job.data;
      await this.sendCampaignEmail(campaignId, recipientId, emailIndex);
    });

    // Process drip emails
    emailQueue.process('send-drip', async (job) => {
      const { campaignId, recipientId, emailIndex } = job.data;
      await this.sendDripEmail(campaignId, recipientId, emailIndex);
    });
  }

  /**
   * Start email campaign
   */
  async startCampaign(campaignId) {
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    // Get recipients
    const recipients = await this.getRecipients(campaign.audience);

    campaign.stats.totalRecipients = recipients.length;
    campaign.status = 'sending';
    campaign.sentAt = new Date();
    await campaign.save();

    // Queue emails
    for (const recipient of recipients) {
      await emailQueue.add('send-campaign', {
        campaignId,
        recipientId: recipient._id
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 60000 }
      });
    }

    return { queued: recipients.length };
  }

  /**
   * Send campaign email to single recipient
   */
  async sendCampaignEmail(campaignId, recipientId, emailIndex = 0) {
    const campaign = await EmailCampaign.findById(campaignId);
    const recipient = await Lead.findById(recipientId);

    if (!recipient || !recipient.email) return;

    // Personalize content
    const personalizedHtml = this.personalizeContent(
      campaign.htmlContent,
      recipient
    );
    const personalizedSubject = this.personalizeContent(
      campaign.subject,
      recipient
    );

    // Generate tracking pixel and links
    const trackingPixel = this.generateTrackingPixel(campaignId, recipientId);
    const trackedHtml = this.addLinkTracking(
      personalizedHtml + trackingPixel,
      campaignId,
      recipientId
    );

    try {
      await sgMail.send({
        to: recipient.email,
        from: {
          name: campaign.fromName,
          email: campaign.fromEmail
        },
        replyTo: campaign.replyTo,
        subject: personalizedSubject,
        html: trackedHtml,
        text: campaign.textContent,
        trackingSettings: {
          clickTracking: { enable: campaign.trackClicks },
          openTracking: { enable: campaign.trackOpens }
        }
      });

      // Record sent event
      await EmailEvent.create({
        campaignId,
        recipientId,
        event: 'sent',
        timestamp: new Date()
      });

      // Update stats
      await EmailCampaign.updateOne(
        { _id: campaignId },
        { $inc: { 'stats.sent': 1 } }
      );

    } catch (error) {
      // Record bounce
      await EmailEvent.create({
        campaignId,
        recipientId,
        event: 'bounced',
        timestamp: new Date(),
        error: error.message
      });

      await EmailCampaign.updateOne(
        { _id: campaignId },
        { $inc: { 'stats.bounced': 1 } }
      );
    }
  }

  /**
   * Start drip campaign for a lead
   */
  async startDripForLead(campaignId, leadId) {
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign || campaign.type !== 'drip') return;

    // Schedule all drip emails
    for (let i = 0; i < campaign.dripSettings.emails.length; i++) {
      const email = campaign.dripSettings.emails[i];
      const delay = (email.delayDays * 24 * 60 * 60 * 1000) + (email.delayHours * 60 * 60 * 1000);

      await emailQueue.add('send-drip', {
        campaignId,
        recipientId: leadId,
        emailIndex: i
      }, {
        delay,
        attempts: 3
      });
    }
  }

  /**
   * Record email open
   */
  async recordOpen(campaignId, recipientId) {
    await EmailEvent.create({
      campaignId,
      recipientId,
      event: 'opened',
      timestamp: new Date()
    });

    await EmailCampaign.updateOne(
      { _id: campaignId },
      { $inc: { 'stats.opened': 1 } }
    );
  }

  /**
   * Record link click
   */
  async recordClick(campaignId, recipientId, url) {
    await EmailEvent.create({
      campaignId,
      recipientId,
      event: 'clicked',
      timestamp: new Date(),
      url
    });

    await EmailCampaign.updateOne(
      { _id: campaignId },
      { $inc: { 'stats.clicked': 1 } }
    );
  }

  /**
   * Personalize email content
   */
  personalizeContent(content, recipient) {
    const replacements = {
      '{{firstName}}': recipient.firstName || '',
      '{{lastName}}': recipient.lastName || '',
      '{{fullName}}': `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim(),
      '{{company}}': recipient.companyName || '',
      '{{email}}': recipient.email || '',
      '{{phone}}': recipient.phone || ''
    };

    let personalized = content;
    for (const [key, value] of Object.entries(replacements)) {
      personalized = personalized.replace(new RegExp(key, 'g'), value);
    }

    return personalized;
  }

  generateTrackingPixel(campaignId, recipientId) {
    const baseUrl = process.env.API_URL;
    return `<img src="${baseUrl}/api/email-tracking/open/${campaignId}/${recipientId}" width="1" height="1" style="display:none" />`;
  }

  addLinkTracking(html, campaignId, recipientId) {
    const baseUrl = process.env.API_URL;
    // Replace all links with tracking links
    return html.replace(
      /href="(https?:\/\/[^"]+)"/g,
      (match, url) => `href="${baseUrl}/api/email-tracking/click/${campaignId}/${recipientId}?url=${encodeURIComponent(url)}"`
    );
  }

  async getRecipients(audience) {
    let query = {};

    switch (audience.type) {
      case 'all_leads':
        query = { email: { $exists: true, $ne: '' } };
        break;
      case 'segment':
        // Get segment rules and build query
        query = await this.buildSegmentQuery(audience.segmentId);
        break;
      case 'dynamic':
        query = audience.filters;
        break;
    }

    return Lead.find(query).select('_id email firstName lastName companyName phone');
  }
}

module.exports = new EmailMarketingService();
```

---

## 3.2 AI Lead Scoring

### Lead Scoring Service

```javascript
// services/leadScoringService.js
const Lead = require('../models/Lead');
const CrmActivity = require('../models/CrmActivity');

class LeadScoringService {

  constructor() {
    // Scoring weights (can be customized per firm)
    this.weights = {
      // Demographic Scoring (max 30 points)
      demographic: {
        hasEmail: 5,
        hasPhone: 5,
        hasCompany: 5,
        isDecisionMaker: 10,
        budgetHigh: 5,
        budgetPremium: 10
      },
      // Behavioral Scoring (max 40 points)
      behavioral: {
        emailOpened: 2,
        emailClicked: 5,
        formSubmitted: 10,
        meetingScheduled: 15,
        proposalViewed: 10,
        callCompleted: 5
      },
      // Engagement Recency (max 20 points)
      recency: {
        within24Hours: 20,
        within3Days: 15,
        withinWeek: 10,
        withinMonth: 5
      },
      // Fit Score (max 10 points)
      fit: {
        matchesCaseType: 5,
        urgentNeed: 5
      }
    };
  }

  /**
   * Calculate lead score
   */
  async calculateScore(leadId) {
    const lead = await Lead.findById(leadId);
    if (!lead) throw new Error('Lead not found');

    let score = 0;
    const breakdown = {
      demographic: 0,
      behavioral: 0,
      recency: 0,
      fit: 0,
      factors: []
    };

    // ==================== DEMOGRAPHIC SCORING ====================

    if (lead.email) {
      breakdown.demographic += this.weights.demographic.hasEmail;
      breakdown.factors.push({ factor: 'Has email', points: this.weights.demographic.hasEmail });
    }

    if (lead.phone) {
      breakdown.demographic += this.weights.demographic.hasPhone;
      breakdown.factors.push({ factor: 'Has phone', points: this.weights.demographic.hasPhone });
    }

    if (lead.companyName) {
      breakdown.demographic += this.weights.demographic.hasCompany;
      breakdown.factors.push({ factor: 'Has company', points: this.weights.demographic.hasCompany });
    }

    if (lead.qualification?.authority === 'decision_maker') {
      breakdown.demographic += this.weights.demographic.isDecisionMaker;
      breakdown.factors.push({ factor: 'Decision maker', points: this.weights.demographic.isDecisionMaker });
    }

    if (lead.qualification?.budget === 'high') {
      breakdown.demographic += this.weights.demographic.budgetHigh;
      breakdown.factors.push({ factor: 'High budget', points: this.weights.demographic.budgetHigh });
    } else if (lead.qualification?.budget === 'premium') {
      breakdown.demographic += this.weights.demographic.budgetPremium;
      breakdown.factors.push({ factor: 'Premium budget', points: this.weights.demographic.budgetPremium });
    }

    // ==================== BEHAVIORAL SCORING ====================

    // Get activities
    const activities = await CrmActivity.find({
      entityType: 'lead',
      entityId: leadId
    });

    const activityCounts = activities.reduce((acc, act) => {
      acc[act.type] = (acc[act.type] || 0) + 1;
      return acc;
    }, {});

    if (activityCounts.email_opened) {
      const points = Math.min(activityCounts.email_opened * this.weights.behavioral.emailOpened, 10);
      breakdown.behavioral += points;
      breakdown.factors.push({ factor: `${activityCounts.email_opened} emails opened`, points });
    }

    if (activityCounts.email_clicked) {
      const points = Math.min(activityCounts.email_clicked * this.weights.behavioral.emailClicked, 15);
      breakdown.behavioral += points;
      breakdown.factors.push({ factor: `${activityCounts.email_clicked} links clicked`, points });
    }

    if (activityCounts.meeting) {
      breakdown.behavioral += this.weights.behavioral.meetingScheduled;
      breakdown.factors.push({ factor: 'Meeting scheduled', points: this.weights.behavioral.meetingScheduled });
    }

    if (activityCounts.call) {
      const points = Math.min(activityCounts.call * this.weights.behavioral.callCompleted, 15);
      breakdown.behavioral += points;
      breakdown.factors.push({ factor: `${activityCounts.call} calls completed`, points });
    }

    // ==================== RECENCY SCORING ====================

    const lastActivity = lead.lastActivityAt || lead.updatedAt;
    const daysSinceActivity = (Date.now() - new Date(lastActivity)) / (1000 * 60 * 60 * 24);

    if (daysSinceActivity <= 1) {
      breakdown.recency = this.weights.recency.within24Hours;
      breakdown.factors.push({ factor: 'Active in last 24 hours', points: this.weights.recency.within24Hours });
    } else if (daysSinceActivity <= 3) {
      breakdown.recency = this.weights.recency.within3Days;
      breakdown.factors.push({ factor: 'Active in last 3 days', points: this.weights.recency.within3Days });
    } else if (daysSinceActivity <= 7) {
      breakdown.recency = this.weights.recency.withinWeek;
      breakdown.factors.push({ factor: 'Active in last week', points: this.weights.recency.withinWeek });
    } else if (daysSinceActivity <= 30) {
      breakdown.recency = this.weights.recency.withinMonth;
      breakdown.factors.push({ factor: 'Active in last month', points: this.weights.recency.withinMonth });
    }

    // ==================== FIT SCORING ====================

    if (lead.intake?.urgency === 'urgent' || lead.intake?.urgency === 'high') {
      breakdown.fit += this.weights.fit.urgentNeed;
      breakdown.factors.push({ factor: 'Urgent need', points: this.weights.fit.urgentNeed });
    }

    // Calculate total score
    score = breakdown.demographic + breakdown.behavioral + breakdown.recency + breakdown.fit;

    // Determine grade
    let grade;
    if (score >= 80) grade = 'A';
    else if (score >= 60) grade = 'B';
    else if (score >= 40) grade = 'C';
    else if (score >= 20) grade = 'D';
    else grade = 'F';

    // Update lead
    lead.leadScore = score;
    lead.leadGrade = grade;
    lead.scoreBreakdown = breakdown;
    lead.scoredAt = new Date();
    await lead.save();

    return { score, grade, breakdown };
  }

  /**
   * Batch score all leads
   */
  async scoreAllLeads() {
    const leads = await Lead.find({ convertedToClient: false });

    const results = [];
    for (const lead of leads) {
      try {
        const result = await this.calculateScore(lead._id);
        results.push({ leadId: lead._id, ...result });
      } catch (error) {
        results.push({ leadId: lead._id, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get leads by score grade
   */
  async getLeadsByGrade(grade) {
    return Lead.find({ leadGrade: grade, convertedToClient: false })
      .sort({ leadScore: -1 })
      .limit(50);
  }

  /**
   * Get hot leads (score >= 70)
   */
  async getHotLeads() {
    return Lead.find({ leadScore: { $gte: 70 }, convertedToClient: false })
      .sort({ leadScore: -1 });
  }
}

module.exports = new LeadScoringService();
```

---

## 3.3 WhatsApp Integration

### WhatsApp Service

```javascript
// services/whatsappService.js
const axios = require('axios');
const Lead = require('../models/Lead');
const CrmActivity = require('../models/CrmActivity');

class WhatsAppService {

  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v17.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  }

  /**
   * Send text message
   */
  async sendTextMessage(to, text) {
    const response = await axios.post(
      `${this.baseUrl}/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: this.formatPhoneNumber(to),
        type: 'text',
        text: { body: text }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  /**
   * Send template message (for first contact)
   */
  async sendTemplateMessage(to, templateName, language, components = []) {
    const response = await axios.post(
      `${this.baseUrl}/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: this.formatPhoneNumber(to),
        type: 'template',
        template: {
          name: templateName,
          language: { code: language },
          components
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  /**
   * Send welcome message to new lead
   */
  async sendLeadWelcome(leadId) {
    const lead = await Lead.findById(leadId);
    if (!lead || !lead.whatsapp) return;

    // Use template for first contact
    const result = await this.sendTemplateMessage(
      lead.whatsapp,
      'lead_welcome',
      'ar',
      [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: lead.firstName || 'عميلنا الكريم' }
          ]
        }
      ]
    );

    // Log activity
    await CrmActivity.create({
      type: 'whatsapp',
      entityType: 'lead',
      entityId: leadId,
      title: 'رسالة ترحيب واتساب',
      description: 'تم إرسال رسالة ترحيب تلقائية',
      status: 'completed',
      performedBy: { _id: 'system', firstName: 'النظام', lastName: '' }
    });

    return result;
  }

  /**
   * Send follow-up reminder
   */
  async sendFollowUpReminder(leadId, message) {
    const lead = await Lead.findById(leadId);
    if (!lead || !lead.whatsapp) return;

    // Check if we have a conversation window (24 hours)
    const lastActivity = await CrmActivity.findOne({
      entityType: 'lead',
      entityId: leadId,
      type: 'whatsapp'
    }).sort({ createdAt: -1 });

    const hasWindow = lastActivity &&
      (Date.now() - new Date(lastActivity.createdAt)) < 24 * 60 * 60 * 1000;

    if (hasWindow) {
      // Can send text message
      return this.sendTextMessage(lead.whatsapp, message);
    } else {
      // Need template
      return this.sendTemplateMessage(
        lead.whatsapp,
        'follow_up_reminder',
        'ar',
        [{ type: 'body', parameters: [{ type: 'text', text: message }] }]
      );
    }
  }

  /**
   * Process incoming webhook
   */
  async processWebhook(payload) {
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages) return;

    for (const message of value.messages) {
      const from = message.from;
      const text = message.text?.body;
      const timestamp = new Date(parseInt(message.timestamp) * 1000);

      // Find lead by WhatsApp number
      const lead = await Lead.findOne({
        $or: [
          { whatsapp: from },
          { phone: from },
          { whatsapp: '+' + from },
          { phone: '+' + from }
        ]
      });

      if (lead) {
        // Log incoming message as activity
        await CrmActivity.create({
          type: 'whatsapp',
          entityType: 'lead',
          entityId: lead._id,
          title: 'رسالة واردة واتساب',
          description: text,
          status: 'completed',
          createdAt: timestamp
        });

        // Update lead last activity
        lead.lastActivityAt = timestamp;
        lead.lastContactedAt = timestamp;
        await lead.save();

        // Trigger AI response or notification to staff
        await this.notifyStaff(lead, text);
      }
    }
  }

  formatPhoneNumber(phone) {
    // Remove any non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    // Remove + if present
    cleaned = cleaned.replace(/^\+/, '');
    // Add Saudi country code if not present
    if (!cleaned.startsWith('966')) {
      cleaned = '966' + cleaned;
    }
    return cleaned;
  }

  async notifyStaff(lead, message) {
    // Send real-time notification to assigned staff
    const io = require('../config/socket').getIO();
    if (lead.assignedTo) {
      io.to(`user_${lead.assignedTo}`).emit('whatsapp_message', {
        leadId: lead._id,
        leadName: lead.displayName,
        message,
        timestamp: new Date()
      });
    }
  }
}

module.exports = new WhatsAppService();
```

---

# PART 4: TASKS MODULE - FROM 9.5 TO 10/10

## 4.1 Gantt Chart Data API

### Gantt Service

```javascript
// services/ganttService.js
const Task = require('../models/Task');
const Case = require('../models/Case');

class GanttService {

  /**
   * Get Gantt chart data for tasks
   */
  async getGanttData(filters = {}) {
    const { caseId, assignedTo, startDate, endDate } = filters;

    const query = { status: { $ne: 'canceled' } };
    if (caseId) query.caseId = caseId;
    if (assignedTo) query.assignedTo = assignedTo;
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) query.dueDate.$gte = startDate;
      if (endDate) query.dueDate.$lte = endDate;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'firstName lastName avatar')
      .populate('caseId', 'caseNumber title')
      .populate('dependencies.blockedBy.taskId', 'title dueDate status')
      .sort({ startDate: 1, dueDate: 1 });

    // Transform to Gantt format
    const ganttData = tasks.map(task => ({
      id: task._id.toString(),
      name: task.title,
      nameAr: task.titleAr,

      // Dates
      start: task.startDate || task.createdAt,
      end: task.dueDate || new Date(new Date(task.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000),

      // Progress
      progress: task.progress || 0,

      // Type
      type: this.mapTaskTypeToGantt(task),

      // Hierarchy
      parent: task.parentTaskId?.toString() || null,

      // Dependencies
      dependencies: task.dependencies?.blockedBy?.map(dep => dep.taskId?.toString()).filter(Boolean) || [],

      // Styling
      color: this.getTaskColor(task),

      // Metadata
      assignee: task.assignedTo ? {
        id: task.assignedTo._id,
        name: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
        avatar: task.assignedTo.avatar
      } : null,
      case: task.caseId ? {
        id: task.caseId._id,
        number: task.caseId.caseNumber,
        title: task.caseId.title
      } : null,
      priority: task.priority,
      status: task.status,
      taskType: task.taskType,

      // Indicators
      isOverdue: new Date(task.dueDate) < new Date() && task.status !== 'done',
      isMilestone: task.taskType === 'court_hearing' || task.taskType === 'filing_deadline',

      // Custom data for frontend
      custom: {
        deadlineType: task.deadlineType,
        courtType: task.courtType,
        subtasksCount: task.subtasks?.length || 0,
        completedSubtasks: task.subtasks?.filter(st => st.completed).length || 0
      }
    }));

    // Calculate critical path
    const criticalPath = this.calculateCriticalPath(ganttData);

    return {
      tasks: ganttData,
      criticalPath,
      summary: {
        total: ganttData.length,
        completed: ganttData.filter(t => t.status === 'done').length,
        overdue: ganttData.filter(t => t.isOverdue).length,
        milestones: ganttData.filter(t => t.isMilestone).length
      }
    };
  }

  /**
   * Update task dates (for drag & drop)
   */
  async updateTaskDates(taskId, startDate, endDate) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    // Calculate duration change
    const originalDuration = task.dueDate ?
      new Date(task.dueDate) - new Date(task.startDate || task.createdAt) : 0;
    const newDuration = new Date(endDate) - new Date(startDate);
    const durationChange = newDuration - originalDuration;

    // Update task
    task.startDate = startDate;
    task.dueDate = endDate;
    await task.save();

    // Cascade update dependent tasks if needed
    if (durationChange !== 0) {
      await this.cascadeUpdateDependents(taskId, durationChange);
    }

    return task;
  }

  /**
   * Calculate critical path
   */
  calculateCriticalPath(tasks) {
    // Build dependency graph
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const inDegree = new Map();
    const adj = new Map();

    tasks.forEach(task => {
      inDegree.set(task.id, 0);
      adj.set(task.id, []);
    });

    // Build adjacency list and in-degrees
    tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        if (adj.has(depId)) {
          adj.get(depId).push(task.id);
          inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1);
        }
      });
    });

    // Topological sort + longest path
    const earliestStart = new Map();
    const earliestFinish = new Map();
    const queue = [];

    tasks.forEach(task => {
      if (inDegree.get(task.id) === 0) {
        queue.push(task.id);
        earliestStart.set(task.id, new Date(task.start).getTime());
        earliestFinish.set(task.id, new Date(task.end).getTime());
      }
    });

    while (queue.length > 0) {
      const taskId = queue.shift();
      const task = taskMap.get(taskId);
      const finish = earliestFinish.get(taskId);

      for (const depId of (adj.get(taskId) || [])) {
        const depTask = taskMap.get(depId);
        const currentEarliestStart = earliestStart.get(depId) || 0;

        if (finish > currentEarliestStart) {
          earliestStart.set(depId, finish);
          const duration = new Date(depTask.end).getTime() - new Date(depTask.start).getTime();
          earliestFinish.set(depId, finish + duration);
        }

        inDegree.set(depId, inDegree.get(depId) - 1);
        if (inDegree.get(depId) === 0) {
          queue.push(depId);
        }
      }
    }

    // Find critical path (tasks with no slack)
    const projectEnd = Math.max(...Array.from(earliestFinish.values()));
    const criticalPath = [];

    // Backward pass to find critical tasks
    tasks
      .filter(t => earliestFinish.get(t.id) === projectEnd)
      .forEach(t => criticalPath.push(t.id));

    return criticalPath;
  }

  mapTaskTypeToGantt(task) {
    if (task.taskType === 'court_hearing' || task.taskType === 'filing_deadline') {
      return 'milestone';
    }
    if (task.subtasks?.length > 0) {
      return 'project';
    }
    return 'task';
  }

  getTaskColor(task) {
    const colors = {
      critical: '#EF4444',
      high: '#F59E0B',
      medium: '#3B82F6',
      low: '#10B981',
      none: '#6B7280'
    };

    if (task.deadlineType === 'statutory') return colors.critical;
    return colors[task.priority] || colors.none;
  }

  async cascadeUpdateDependents(taskId, durationChange) {
    const dependentTasks = await Task.find({
      'dependencies.blockedBy.taskId': taskId
    });

    for (const depTask of dependentTasks) {
      if (depTask.startDate) {
        depTask.startDate = new Date(new Date(depTask.startDate).getTime() + durationChange);
      }
      if (depTask.dueDate) {
        depTask.dueDate = new Date(new Date(depTask.dueDate).getTime() + durationChange);
      }
      await depTask.save();

      // Recursively update
      await this.cascadeUpdateDependents(depTask._id, durationChange);
    }
  }
}

module.exports = new GanttService();
```

### Gantt Routes

```javascript
// routes/gantt.js
const express = require('express');
const router = express.Router();
const ganttService = require('../services/ganttService');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const data = await ganttService.getGanttData(req.query);
  res.json({ success: true, data });
});

router.patch('/tasks/:id/dates', auth, async (req, res) => {
  const { startDate, endDate } = req.body;
  const task = await ganttService.updateTaskDates(req.params.id, startDate, endDate);
  res.json({ success: true, task });
});

module.exports = router;
```

---

## 4.2 Real-time Collaboration

### Socket Configuration

```javascript
// config/socket.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error('No token provided');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) throw new Error('User not found');

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);

    // Join user-specific room
    socket.join(`user_${socket.user._id}`);

    // Join task rooms
    socket.on('join_task', (taskId) => {
      socket.join(`task_${taskId}`);
      socket.to(`task_${taskId}`).emit('user_joined_task', {
        userId: socket.user._id,
        userName: `${socket.user.firstName} ${socket.user.lastName}`,
        avatar: socket.user.avatar
      });
    });

    socket.on('leave_task', (taskId) => {
      socket.leave(`task_${taskId}`);
      socket.to(`task_${taskId}`).emit('user_left_task', {
        userId: socket.user._id
      });
    });

    // Real-time task updates
    socket.on('task_update', (data) => {
      socket.to(`task_${data.taskId}`).emit('task_updated', {
        ...data,
        updatedBy: {
          userId: socket.user._id,
          userName: `${socket.user.firstName} ${socket.user.lastName}`
        }
      });
    });

    // Cursor position for collaborative editing
    socket.on('cursor_move', (data) => {
      socket.to(`task_${data.taskId}`).emit('cursor_moved', {
        userId: socket.user._id,
        position: data.position,
        field: data.field
      });
    });

    // Typing indicator
    socket.on('typing_start', (data) => {
      socket.to(`task_${data.taskId}`).emit('user_typing', {
        userId: socket.user._id,
        userName: `${socket.user.firstName} ${socket.user.lastName}`,
        field: data.field
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`task_${data.taskId}`).emit('user_stopped_typing', {
        userId: socket.user._id,
        field: data.field
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

// Utility to emit to task room
const emitToTask = (taskId, event, data) => {
  if (io) {
    io.to(`task_${taskId}`).emit(event, data);
  }
};

// Utility to emit to user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

module.exports = { initializeSocket, getIO, emitToTask, emitToUser };
```

---

# SUMMARY: All Routes to Add

```javascript
// In app.js - Add all new routes

// HR Routes
app.use('/api/biometric', require('./routes/biometric'));
app.use('/api/hr-analytics', require('./routes/hrAnalytics'));

// Finance Routes
app.use('/api/bank-reconciliation', require('./routes/bankReconciliation'));
app.use('/api/currency', require('./routes/currency'));

// CRM Routes
app.use('/api/email-campaigns', require('./routes/emailCampaigns'));
app.use('/api/email-tracking', require('./routes/emailTracking'));
app.use('/api/lead-scoring', require('./routes/leadScoring'));
app.use('/api/whatsapp', require('./routes/whatsapp'));

// Tasks Routes
app.use('/api/gantt', require('./routes/gantt'));
```

---

# Environment Variables Required

```env
# Biometric
ZKTECO_DEFAULT_PORT=4370

# Email Marketing
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM_NAME=Traf3li Legal
EMAIL_FROM_ADDRESS=noreply@yourdomain.com

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=your_verify_token

# Currency
EXCHANGE_RATE_API_KEY=your_api_key

# Redis (for queues and caching)
REDIS_URL=redis://localhost:6379
```

---

# NPM Packages Required

```bash
npm install zklib-js @sendgrid/mail bull ofx-js csv-parse @aws-sdk/client-s3 socket.io axios
```

---

This completes the backend instructions to achieve 10/10 in all categories!
