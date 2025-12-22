const { BankTransfer, BankAccount, BillingActivity } = require('../models');
const { CustomException } = require('../utils');
const asyncHandler = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// ═══════════════════════════════════════════════════════════════
// CREATE TRANSFER (FIXED - Concurrent transfer protection)
// POST /api/bank-transfers
// ═══════════════════════════════════════════════════════════════
const createTransfer = asyncHandler(async (req, res) => {
  const {
    fromAccountId,
    toAccountId,
    amount,
    date,
    exchangeRate,
    fee,
    reference,
    description
  } = req.body;

  const lawyerId = req.userID;

  // Validate inputs
  if (!fromAccountId || !toAccountId) {
    throw CustomException('Source and destination accounts are required', 400);
  }

  if (fromAccountId === toAccountId) {
    throw CustomException('Source and destination accounts must be different', 400);
  }

  if (!amount || amount <= 0) {
    throw CustomException('Valid amount is required', 400);
  }

  // Pre-validate accounts exist and belong to user (outside transaction for performance)
  const [fromAccountCheck, toAccountCheck] = await Promise.all([
    BankAccount.findById(fromAccountId),
    BankAccount.findById(toAccountId)
  ]);

  if (!fromAccountCheck || fromAccountCheck.lawyerId.toString() !== lawyerId) {
    throw CustomException('Source account not found or access denied', 404);
  }

  if (!toAccountCheck || toAccountCheck.lawyerId.toString() !== lawyerId) {
    throw CustomException('Destination account not found or access denied', 404);
  }

  // Calculate total deduction
  const totalDeduction = amount + (fee || 0);

  // Start transaction for atomic balance update and transfer creation
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // CRITICAL: Use findOneAndUpdate to atomically check and deduct from source account
    // This prevents race conditions where multiple transfers try to use the same funds
    const fromAccount = await BankAccount.findOneAndUpdate(
      {
        _id: fromAccountId,
        lawyerId: lawyerId,
        availableBalance: { $gte: totalDeduction }, // Ensure sufficient balance
        isActive: true // Only active accounts
      },
      {
        $inc: {
          availableBalance: -totalDeduction, // Atomic decrement
          totalWithdrawals: totalDeduction
        }
      },
      {
        new: false, // Return original document to get currency info
        session,
        runValidators: true
      }
    );

    // If no account was found/updated, conditions weren't met
    if (!fromAccount) {
      await session.abortTransaction();

      // Provide detailed error message
      const recheckAccount = await BankAccount.findById(fromAccountId);
      if (!recheckAccount) {
        throw CustomException('Source account not found', 404);
      }
      if (recheckAccount.lawyerId.toString() !== lawyerId) {
        throw CustomException('Source account access denied', 403);
      }
      if (!recheckAccount.isActive) {
        throw CustomException('Source account is inactive', 400);
      }
      if (recheckAccount.availableBalance < totalDeduction) {
        throw CustomException(
          `Insufficient balance in source account. Available: ${recheckAccount.availableBalance}, Required: ${totalDeduction}`,
          400
        );
      }
      throw CustomException('Failed to process transfer', 400);
    }

    // CRITICAL: Atomically add to destination account
    const toAccount = await BankAccount.findOneAndUpdate(
      {
        _id: toAccountId,
        lawyerId: lawyerId,
        isActive: true
      },
      {
        $inc: {
          availableBalance: amount, // Add transferred amount (not including fee)
          totalDeposits: amount
        }
      },
      {
        new: false, // Return original document to get currency info
        session,
        runValidators: true
      }
    );

    if (!toAccount) {
      await session.abortTransaction();
      throw CustomException('Destination account not found or inactive', 404);
    }

    // Create transfer record
    const transfer = await BankTransfer.create([{
      fromAccountId,
      toAccountId,
      amount,
      fromCurrency: fromAccount.currency,
      toCurrency: toAccount.currency,
      exchangeRate: exchangeRate || 1,
      fee: fee || 0,
      date: date || new Date(),
      reference,
      description,
      status: 'completed', // Mark as completed immediately since funds are transferred
      executedAt: new Date(),
      createdBy: lawyerId,
      lawyerId
    }], { session });

    const transferDoc = transfer[0];

    // Log activity
    await BillingActivity.logActivity({
      activityType: 'bank_transfer_created',
      userId: lawyerId,
      relatedModel: 'BankTransfer',
      relatedId: transferDoc._id,
      description: `Transfer ${transferDoc.transferNumber} completed for ${amount} ${fromAccount.currency}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await session.commitTransaction();

    // Populate and return
    const populatedTransfer = await BankTransfer.findById(transferDoc._id)
      .populate('fromAccountId', 'name bankName accountNumber currency availableBalance')
      .populate('toAccountId', 'name bankName accountNumber currency availableBalance')
      .populate('createdBy', 'firstName lastName');

    return res.status(201).json({
      success: true,
      message: 'Transfer completed successfully',
      transfer: populatedTransfer
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// ═══════════════════════════════════════════════════════════════
// GET ALL TRANSFERS
// GET /api/bank-transfers
// ═══════════════════════════════════════════════════════════════
const getTransfers = asyncHandler(async (req, res) => {
  const {
    fromAccountId,
    toAccountId,
    status,
    startDate,
    endDate,
    page = 1,
    limit = 20
  } = req.query;

  const lawyerId = req.userID;
  const filters = { lawyerId };

  if (fromAccountId) filters.fromAccountId = fromAccountId;
  if (toAccountId) filters.toAccountId = toAccountId;
  if (status) filters.status = status;

  if (startDate || endDate) {
    filters.date = {};
    if (startDate) filters.date.$gte = new Date(startDate);
    if (endDate) filters.date.$lte = new Date(endDate);
  }

  const transfers = await BankTransfer.find(filters)
    .populate('fromAccountId', 'name bankName accountNumber')
    .populate('toAccountId', 'name bankName accountNumber')
    .populate('createdBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName')
    .sort({ date: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await BankTransfer.countDocuments(filters);

  return res.json({
    success: true,
    transfers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// GET SINGLE TRANSFER
// GET /api/bank-transfers/:id
// ═══════════════════════════════════════════════════════════════
const getTransfer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lawyerId = req.userID;

  const transfer = await BankTransfer.findById(id)
    .populate('fromAccountId', 'name bankName accountNumber currency')
    .populate('toAccountId', 'name bankName accountNumber currency')
    .populate('createdBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName');

  if (!transfer) {
    throw CustomException('Transfer not found', 404);
  }

  if (transfer.lawyerId.toString() !== lawyerId) {
    throw CustomException('You do not have access to this transfer', 403);
  }

  return res.json({
    success: true,
    transfer
  });
});

// ═══════════════════════════════════════════════════════════════
// CANCEL TRANSFER (FIXED - Race condition protection)
// POST /api/bank-transfers/:id/cancel
// ═══════════════════════════════════════════════════════════════
const cancelTransfer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const lawyerId = req.userID;

  // Start transaction for atomic reversal
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // CRITICAL: Use findOneAndUpdate to atomically check and update transfer status
    // This prevents double-cancellation race conditions
    const transfer = await BankTransfer.findOneAndUpdate(
      {
        _id: id,
        lawyerId: lawyerId,
        status: 'completed' // Only allow cancelling completed transfers
      },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: lawyerId,
          cancellationReason: reason || 'Transfer cancelled'
        }
      },
      {
        new: false, // Get original document to access account IDs and amounts
        session
      }
    );

    // If no transfer was found/updated, conditions weren't met
    if (!transfer) {
      await session.abortTransaction();

      // Provide detailed error message
      const transferCheck = await BankTransfer.findById(id);
      if (!transferCheck) {
        throw CustomException('Transfer not found', 404);
      }
      if (transferCheck.lawyerId.toString() !== lawyerId) {
        throw CustomException('You do not have access to this transfer', 403);
      }
      if (transferCheck.status === 'cancelled') {
        throw CustomException('Transfer already cancelled', 400);
      }
      if (transferCheck.status === 'pending') {
        throw CustomException('Cannot cancel pending transfer', 400);
      }
      throw CustomException('Failed to cancel transfer', 400);
    }

    // Calculate reversal amounts
    const totalDeduction = transfer.amount + (transfer.fee || 0);

    // CRITICAL: Atomically reverse the transfer - add back to source account
    const fromAccount = await BankAccount.findOneAndUpdate(
      {
        _id: transfer.fromAccountId,
        lawyerId: lawyerId
      },
      {
        $inc: {
          availableBalance: totalDeduction, // Return deducted amount
          totalWithdrawals: -totalDeduction // Reverse withdrawal accounting
        }
      },
      {
        session,
        runValidators: true
      }
    );

    if (!fromAccount) {
      await session.abortTransaction();
      throw CustomException('Source account not found', 404);
    }

    // CRITICAL: Atomically reverse the transfer - deduct from destination account
    const toAccount = await BankAccount.findOneAndUpdate(
      {
        _id: transfer.toAccountId,
        lawyerId: lawyerId,
        availableBalance: { $gte: transfer.amount } // Ensure destination has funds to reverse
      },
      {
        $inc: {
          availableBalance: -transfer.amount, // Remove transferred amount
          totalDeposits: -transfer.amount // Reverse deposit accounting
        }
      },
      {
        session,
        runValidators: true
      }
    );

    if (!toAccount) {
      await session.abortTransaction();
      throw CustomException(
        'Cannot cancel transfer: Insufficient funds in destination account to reverse transfer',
        400
      );
    }

    // Log activity
    await BillingActivity.logActivity({
      activityType: 'bank_transfer_cancelled',
      userId: lawyerId,
      relatedModel: 'BankTransfer',
      relatedId: transfer._id,
      description: `Transfer ${transfer.transferNumber} cancelled: ${reason || 'No reason provided'}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await session.commitTransaction();

    // Get updated transfer with populated fields
    const populatedTransfer = await BankTransfer.findById(id)
      .populate('fromAccountId', 'name bankName accountNumber availableBalance')
      .populate('toAccountId', 'name bankName accountNumber availableBalance')
      .populate('createdBy', 'firstName lastName')
      .populate('cancelledBy', 'firstName lastName');

    return res.json({
      success: true,
      message: 'Transfer cancelled and reversed successfully',
      transfer: populatedTransfer
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// ═══════════════════════════════════════════════════════════════
// GET TRANSFER STATISTICS
// GET /api/bank-transfers/stats
// ═══════════════════════════════════════════════════════════════
const getTransferStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, accountId } = req.query;
  const lawyerId = req.userID;

  const matchQuery = { lawyerId, status: 'completed' };

  if (accountId) {
    matchQuery.$or = [
      { fromAccountId: new mongoose.Types.ObjectId(accountId) },
      { toAccountId: new mongoose.Types.ObjectId(accountId) }
    ];
  }

  if (startDate || endDate) {
    matchQuery.date = {};
    if (startDate) matchQuery.date.$gte = new Date(startDate);
    if (endDate) matchQuery.date.$lte = new Date(endDate);
  }

  const stats = await BankTransfer.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalTransfers: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalFees: { $sum: '$fee' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);

  // Get transfers by month
  const byMonth = await BankTransfer.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  return res.json({
    success: true,
    data: {
      overall: stats[0] || {
        totalTransfers: 0,
        totalAmount: 0,
        totalFees: 0,
        avgAmount: 0
      },
      byMonth
    }
  });
});

module.exports = {
  createTransfer,
  getTransfers,
  getTransfer,
  cancelTransfer,
  getTransferStats
};
