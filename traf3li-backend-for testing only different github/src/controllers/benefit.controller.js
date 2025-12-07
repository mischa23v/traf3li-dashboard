const { EmployeeBenefit, User } = require('../models');
const { CustomException } = require('../utils');
const asyncHandler = require('../utils/asyncHandler');

// ==================== CREATE BENEFIT ====================
const createBenefit = asyncHandler(async (req, res) => {
    const {
        employeeId,
        employeeName,
        employeeNameAr,
        employeeNumber,
        department,
        benefitType,
        benefitCategory,
        benefitName,
        benefitNameAr,
        benefitDescription,
        benefitDescriptionAr,
        planId,
        planCode,
        planName,
        planNameAr,
        providerType,
        providerName,
        providerNameAr,
        providerContact,
        enrollmentType,
        enrollmentDate,
        effectiveDate,
        coverageEndDate,
        coverageLevel,
        coveredDependents,
        beneficiaries,
        employerCost,
        employeeCost,
        currency,
        costBreakdown,
        healthInsurance,
        lifeInsurance,
        allowance,
        cchiCompliant,
        cchiRegistrationNumber,
        gosiReported,
        notes
    } = req.body;

    try {
        // Validate required fields
        if (!employeeId) {
            throw CustomException('معرف الموظف مطلوب', 400);
        }

        if (!employeeName) {
            throw CustomException('اسم الموظف مطلوب', 400);
        }

        if (!benefitType) {
            throw CustomException('نوع الميزة مطلوب', 400);
        }

        if (!benefitCategory) {
            throw CustomException('فئة الميزة مطلوبة', 400);
        }

        if (!benefitName) {
            throw CustomException('اسم الميزة مطلوب', 400);
        }

        if (!enrollmentType) {
            throw CustomException('نوع التسجيل مطلوب', 400);
        }

        if (!enrollmentDate) {
            throw CustomException('تاريخ التسجيل مطلوب', 400);
        }

        if (!effectiveDate) {
            throw CustomException('تاريخ السريان مطلوب', 400);
        }

        if (employerCost === undefined || employerCost < 0) {
            throw CustomException('تكلفة صاحب العمل غير صالحة', 400);
        }

        if (employeeCost === undefined || employeeCost < 0) {
            throw CustomException('تكلفة الموظف غير صالحة', 400);
        }

        const benefit = await EmployeeBenefit.create({
            employeeId,
            employeeName,
            employeeNameAr,
            employeeNumber,
            department,
            benefitType,
            benefitCategory,
            benefitName,
            benefitNameAr,
            benefitDescription,
            benefitDescriptionAr,
            planId,
            planCode,
            planName,
            planNameAr,
            providerType,
            providerName,
            providerNameAr,
            providerContact,
            enrollmentType,
            enrollmentDate,
            effectiveDate,
            coverageEndDate,
            coverageLevel,
            coveredDependents,
            beneficiaries,
            employerCost,
            employeeCost,
            currency: currency || 'SAR',
            costBreakdown,
            healthInsurance,
            lifeInsurance,
            allowance,
            cchiCompliant,
            cchiRegistrationNumber,
            gosiReported,
            notes,
            createdBy: req.userID
        });

        const populatedBenefit = await EmployeeBenefit.findById(benefit._id)
            .populate('employeeId', 'username email')
            .populate('createdBy', 'username email');

        return res.status(201).json({
            success: true,
            message: 'تم إضافة الميزة بنجاح',
            data: populatedBenefit
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل إنشاء الميزة', error.status || 500);
    }
});

// ==================== GET ALL BENEFITS ====================
const getBenefits = asyncHandler(async (req, res) => {
    const {
        search,
        employeeId,
        benefitType,
        benefitCategory,
        status,
        enrollmentType,
        providerName,
        fromDate,
        toDate,
        page = 1,
        limit = 20,
        sortBy = 'createdOn',
        sortOrder = 'desc'
    } = req.query;

    try {
        const filters = { createdBy: req.userID };

        if (search) {
            filters.$or = [
                { benefitName: { $regex: search, $options: 'i' } },
                { benefitNameAr: { $regex: search, $options: 'i' } },
                { employeeName: { $regex: search, $options: 'i' } },
                { employeeNameAr: { $regex: search, $options: 'i' } },
                { enrollmentNumber: { $regex: search, $options: 'i' } },
                { benefitEnrollmentId: { $regex: search, $options: 'i' } }
            ];
        }

        if (employeeId) filters.employeeId = employeeId;
        if (benefitType) filters.benefitType = benefitType;
        if (benefitCategory) filters.benefitCategory = benefitCategory;
        if (status) filters.status = status;
        if (enrollmentType) filters.enrollmentType = enrollmentType;
        if (providerName) filters.providerName = { $regex: providerName, $options: 'i' };

        if (fromDate || toDate) {
            filters.effectiveDate = {};
            if (fromDate) filters.effectiveDate.$gte = new Date(fromDate);
            if (toDate) filters.effectiveDate.$lte = new Date(toDate);
        }

        const benefits = await EmployeeBenefit.find(filters)
            .populate('employeeId', 'username email')
            .populate('createdBy', 'username email')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await EmployeeBenefit.countDocuments(filters);

        return res.json({
            success: true,
            data: benefits,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            message: benefits.length === 0 ? 'لا توجد مزايا' : undefined
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل جلب المزايا', error.status || 500);
    }
});

// ==================== GET BENEFIT STATS ====================
const getBenefitStats = asyncHandler(async (req, res) => {
    const { employeeId, benefitType, benefitCategory, fromDate, toDate } = req.query;

    try {
        const filters = { createdBy: req.userID };

        if (employeeId) filters.employeeId = employeeId;
        if (benefitType) filters.benefitType = benefitType;
        if (benefitCategory) filters.benefitCategory = benefitCategory;
        if (fromDate) filters.fromDate = fromDate;
        if (toDate) filters.toDate = toDate;

        const stats = await EmployeeBenefit.getBenefitStats(filters);

        return res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل جلب إحصائيات المزايا', error.status || 500);
    }
});

// ==================== GET EMPLOYEE BENEFITS ====================
const getEmployeeBenefits = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    const { status, benefitType, benefitCategory } = req.query;

    try {
        const filters = {
            employeeId,
            createdBy: req.userID
        };

        if (status) filters.status = status;
        if (benefitType) filters.benefitType = benefitType;
        if (benefitCategory) filters.benefitCategory = benefitCategory;

        const benefits = await EmployeeBenefit.find(filters)
            .populate('employeeId', 'username email')
            .sort({ effectiveDate: -1 });

        return res.json({
            success: true,
            data: benefits,
            total: benefits.length
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل جلب مزايا الموظف', error.status || 500);
    }
});

// ==================== GET SINGLE BENEFIT ====================
const getBenefit = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const benefit = await EmployeeBenefit.findById(id)
            .populate('employeeId', 'username email')
            .populate('createdBy', 'username email')
            .populate('updatedBy', 'username email')
            .populate('documents.uploadedBy', 'username email')
            .populate('documents.verifiedBy', 'username email');

        if (!benefit) {
            throw CustomException('الميزة غير موجودة', 404);
        }

        // Check access
        if (benefit.createdBy._id.toString() !== req.userID) {
            throw CustomException('ليس لديك صلاحية لعرض هذه الميزة', 403);
        }

        return res.json({
            success: true,
            data: benefit
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل جلب الميزة', error.status || 500);
    }
});

// ==================== UPDATE BENEFIT ====================
const updateBenefit = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const benefit = await EmployeeBenefit.findById(id);

        if (!benefit) {
            throw CustomException('الميزة غير موجودة', 404);
        }

        // Check access
        if (benefit.createdBy.toString() !== req.userID) {
            throw CustomException('ليس لديك صلاحية لتعديل هذه الميزة', 403);
        }

        const updatedBenefit = await EmployeeBenefit.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...req.body,
                    updatedBy: req.userID
                }
            },
            { new: true, runValidators: true }
        )
            .populate('employeeId', 'username email')
            .populate('createdBy', 'username email')
            .populate('updatedBy', 'username email');

        return res.json({
            success: true,
            message: 'تم تحديث الميزة بنجاح',
            data: updatedBenefit
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل تحديث الميزة', error.status || 500);
    }
});

// ==================== DELETE BENEFIT ====================
const deleteBenefit = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const benefit = await EmployeeBenefit.findById(id);

        if (!benefit) {
            throw CustomException('الميزة غير موجودة', 404);
        }

        // Check access
        if (benefit.createdBy.toString() !== req.userID) {
            throw CustomException('ليس لديك صلاحية لحذف هذه الميزة', 403);
        }

        await EmployeeBenefit.findByIdAndDelete(id);

        return res.json({
            success: true,
            message: 'تم حذف الميزة بنجاح'
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل حذف الميزة', error.status || 500);
    }
});

// ==================== BULK DELETE BENEFITS ====================
const bulkDeleteBenefits = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    try {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw CustomException('يجب تحديد المزايا للحذف', 400);
        }

        // Verify all benefits belong to user
        const benefits = await EmployeeBenefit.find({
            _id: { $in: ids },
            createdBy: req.userID
        });

        if (benefits.length !== ids.length) {
            throw CustomException('بعض المزايا غير موجودة أو ليس لديك صلاحية لحذفها', 403);
        }

        await EmployeeBenefit.deleteMany({
            _id: { $in: ids },
            createdBy: req.userID
        });

        return res.json({
            success: true,
            message: `تم حذف ${ids.length} ميزة بنجاح`,
            deletedCount: ids.length
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل حذف المزايا', error.status || 500);
    }
});

// ==================== ACTIVATE BENEFIT ====================
const activateBenefit = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    try {
        const benefit = await EmployeeBenefit.findById(id);

        if (!benefit) {
            throw CustomException('الميزة غير موجودة', 404);
        }

        // Check access
        if (benefit.createdBy.toString() !== req.userID) {
            throw CustomException('ليس لديك صلاحية لتفعيل هذه الميزة', 403);
        }

        if (benefit.status === 'active') {
            throw CustomException('الميزة مفعلة بالفعل', 400);
        }

        benefit.status = 'active';
        benefit.statusDate = new Date();
        benefit.statusReason = notes || 'تم التفعيل';
        benefit.updatedBy = req.userID;
        await benefit.save();

        const populatedBenefit = await EmployeeBenefit.findById(benefit._id)
            .populate('employeeId', 'username email')
            .populate('createdBy', 'username email')
            .populate('updatedBy', 'username email');

        return res.json({
            success: true,
            message: 'تم تفعيل الميزة بنجاح',
            data: populatedBenefit
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل تفعيل الميزة', error.status || 500);
    }
});

// ==================== SUSPEND BENEFIT ====================
const suspendBenefit = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        const benefit = await EmployeeBenefit.findById(id);

        if (!benefit) {
            throw CustomException('الميزة غير موجودة', 404);
        }

        // Check access
        if (benefit.createdBy.toString() !== req.userID) {
            throw CustomException('ليس لديك صلاحية لإيقاف هذه الميزة', 403);
        }

        if (benefit.status === 'suspended') {
            throw CustomException('الميزة موقفة بالفعل', 400);
        }

        if (!reason) {
            throw CustomException('سبب الإيقاف مطلوب', 400);
        }

        benefit.status = 'suspended';
        benefit.statusDate = new Date();
        benefit.statusReason = reason;
        benefit.updatedBy = req.userID;
        await benefit.save();

        const populatedBenefit = await EmployeeBenefit.findById(benefit._id)
            .populate('employeeId', 'username email')
            .populate('createdBy', 'username email')
            .populate('updatedBy', 'username email');

        return res.json({
            success: true,
            message: 'تم إيقاف الميزة بنجاح',
            data: populatedBenefit
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل إيقاف الميزة', error.status || 500);
    }
});

// ==================== TERMINATE BENEFIT ====================
const terminateBenefit = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason, terminationDate } = req.body;

    try {
        const benefit = await EmployeeBenefit.findById(id);

        if (!benefit) {
            throw CustomException('الميزة غير موجودة', 404);
        }

        // Check access
        if (benefit.createdBy.toString() !== req.userID) {
            throw CustomException('ليس لديك صلاحية لإنهاء هذه الميزة', 403);
        }

        if (benefit.status === 'terminated') {
            throw CustomException('الميزة منتهية بالفعل', 400);
        }

        if (!reason) {
            throw CustomException('سبب الإنهاء مطلوب', 400);
        }

        benefit.status = 'terminated';
        benefit.statusDate = new Date();
        benefit.statusReason = reason;
        benefit.coverageEndDate = terminationDate ? new Date(terminationDate) : new Date();
        benefit.updatedBy = req.userID;
        await benefit.save();

        const populatedBenefit = await EmployeeBenefit.findById(benefit._id)
            .populate('employeeId', 'username email')
            .populate('createdBy', 'username email')
            .populate('updatedBy', 'username email');

        return res.json({
            success: true,
            message: 'تم إنهاء الميزة بنجاح',
            data: populatedBenefit
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل إنهاء الميزة', error.status || 500);
    }
});

// ==================== ADD DEPENDENT ====================
const addDependent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const dependentData = req.body;

    try {
        const benefit = await EmployeeBenefit.findById(id);

        if (!benefit) {
            throw CustomException('الميزة غير موجودة', 404);
        }

        // Check access
        if (benefit.createdBy.toString() !== req.userID) {
            throw CustomException('ليس لديك صلاحية لتعديل هذه الميزة', 403);
        }

        if (!dependentData.name) {
            throw CustomException('اسم المعال مطلوب', 400);
        }

        if (!dependentData.relationship) {
            throw CustomException('صلة القرابة مطلوبة', 400);
        }

        // Generate member ID
        dependentData.memberId = `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        dependentData.startDate = dependentData.startDate || new Date();
        dependentData.active = true;

        benefit.coveredDependents.push(dependentData);
        benefit.updatedBy = req.userID;
        await benefit.save();

        return res.json({
            success: true,
            message: 'تم إضافة المعال بنجاح',
            data: benefit.coveredDependents[benefit.coveredDependents.length - 1]
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل إضافة المعال', error.status || 500);
    }
});

// ==================== REMOVE DEPENDENT ====================
const removeDependent = asyncHandler(async (req, res) => {
    const { id, memberId } = req.params;

    try {
        const benefit = await EmployeeBenefit.findById(id);

        if (!benefit) {
            throw CustomException('الميزة غير موجودة', 404);
        }

        // Check access
        if (benefit.createdBy.toString() !== req.userID) {
            throw CustomException('ليس لديك صلاحية لتعديل هذه الميزة', 403);
        }

        const dependentIndex = benefit.coveredDependents.findIndex(
            d => d.memberId === memberId
        );

        if (dependentIndex === -1) {
            throw CustomException('المعال غير موجود', 404);
        }

        benefit.coveredDependents.splice(dependentIndex, 1);
        benefit.updatedBy = req.userID;
        await benefit.save();

        return res.json({
            success: true,
            message: 'تم إزالة المعال بنجاح'
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل إزالة المعال', error.status || 500);
    }
});

// ==================== UPDATE BENEFICIARY ====================
const updateBeneficiary = asyncHandler(async (req, res) => {
    const { id, beneficiaryId } = req.params;
    const beneficiaryData = req.body;

    try {
        const benefit = await EmployeeBenefit.findById(id);

        if (!benefit) {
            throw CustomException('الميزة غير موجودة', 404);
        }

        // Check access
        if (benefit.createdBy.toString() !== req.userID) {
            throw CustomException('ليس لديك صلاحية لتعديل هذه الميزة', 403);
        }

        const beneficiaryIndex = benefit.beneficiaries.findIndex(
            b => b.beneficiaryId === beneficiaryId
        );

        if (beneficiaryIndex === -1) {
            throw CustomException('المستفيد غير موجود', 404);
        }

        // Update beneficiary fields
        Object.assign(benefit.beneficiaries[beneficiaryIndex], beneficiaryData);
        benefit.updatedBy = req.userID;
        await benefit.save();

        return res.json({
            success: true,
            message: 'تم تحديث بيانات المستفيد بنجاح',
            data: benefit.beneficiaries[beneficiaryIndex]
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل تحديث المستفيد', error.status || 500);
    }
});

// ==================== ADD BENEFICIARY ====================
const addBeneficiary = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const beneficiaryData = req.body;

    try {
        const benefit = await EmployeeBenefit.findById(id);

        if (!benefit) {
            throw CustomException('الميزة غير موجودة', 404);
        }

        // Check access
        if (benefit.createdBy.toString() !== req.userID) {
            throw CustomException('ليس لديك صلاحية لتعديل هذه الميزة', 403);
        }

        if (!beneficiaryData.name) {
            throw CustomException('اسم المستفيد مطلوب', 400);
        }

        if (!beneficiaryData.beneficiaryType) {
            throw CustomException('نوع المستفيد مطلوب', 400);
        }

        if (beneficiaryData.percentage === undefined || beneficiaryData.percentage < 0 || beneficiaryData.percentage > 100) {
            throw CustomException('نسبة الاستفادة غير صالحة', 400);
        }

        // Generate beneficiary ID
        beneficiaryData.beneficiaryId = `BENF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        benefit.beneficiaries.push(beneficiaryData);
        benefit.updatedBy = req.userID;
        await benefit.save();

        return res.json({
            success: true,
            message: 'تم إضافة المستفيد بنجاح',
            data: benefit.beneficiaries[benefit.beneficiaries.length - 1]
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل إضافة المستفيد', error.status || 500);
    }
});

// ==================== REMOVE BENEFICIARY ====================
const removeBeneficiary = asyncHandler(async (req, res) => {
    const { id, beneficiaryId } = req.params;

    try {
        const benefit = await EmployeeBenefit.findById(id);

        if (!benefit) {
            throw CustomException('الميزة غير موجودة', 404);
        }

        // Check access
        if (benefit.createdBy.toString() !== req.userID) {
            throw CustomException('ليس لديك صلاحية لتعديل هذه الميزة', 403);
        }

        const beneficiaryIndex = benefit.beneficiaries.findIndex(
            b => b.beneficiaryId === beneficiaryId
        );

        if (beneficiaryIndex === -1) {
            throw CustomException('المستفيد غير موجود', 404);
        }

        benefit.beneficiaries.splice(beneficiaryIndex, 1);
        benefit.updatedBy = req.userID;
        await benefit.save();

        return res.json({
            success: true,
            message: 'تم إزالة المستفيد بنجاح'
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل إزالة المستفيد', error.status || 500);
    }
});

// ==================== GET BENEFITS BY TYPE ====================
const getBenefitsByType = asyncHandler(async (req, res) => {
    const { status } = req.query;

    try {
        const filters = { createdBy: req.userID };
        if (status) filters.status = status;

        const byType = await EmployeeBenefit.getBenefitsByType(filters);

        return res.json({
            success: true,
            data: byType
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل جلب المزايا حسب النوع', error.status || 500);
    }
});

// ==================== ADD DOCUMENT ====================
const addDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const documentData = req.body;

    try {
        const benefit = await EmployeeBenefit.findById(id);

        if (!benefit) {
            throw CustomException('الميزة غير موجودة', 404);
        }

        // Check access
        if (benefit.createdBy.toString() !== req.userID) {
            throw CustomException('ليس لديك صلاحية لتعديل هذه الميزة', 403);
        }

        if (!documentData.documentType) {
            throw CustomException('نوع المستند مطلوب', 400);
        }

        if (!documentData.fileUrl) {
            throw CustomException('رابط الملف مطلوب', 400);
        }

        documentData.uploadedOn = new Date();
        documentData.uploadedBy = req.userID;

        benefit.documents.push(documentData);
        benefit.updatedBy = req.userID;
        await benefit.save();

        return res.json({
            success: true,
            message: 'تم إضافة المستند بنجاح',
            data: benefit.documents[benefit.documents.length - 1]
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل إضافة المستند', error.status || 500);
    }
});

// ==================== EXPORT BENEFITS ====================
const exportBenefits = asyncHandler(async (req, res) => {
    const { format = 'json', status, benefitType, benefitCategory } = req.query;

    try {
        const filters = { createdBy: req.userID };

        if (status) filters.status = status;
        if (benefitType) filters.benefitType = benefitType;
        if (benefitCategory) filters.benefitCategory = benefitCategory;

        const benefits = await EmployeeBenefit.find(filters)
            .populate('employeeId', 'username email')
            .sort({ createdOn: -1 });

        if (format === 'csv') {
            // Generate CSV
            const headers = [
                'Enrollment ID', 'Employee Name', 'Employee Name (AR)',
                'Benefit Type', 'Benefit Category', 'Benefit Name',
                'Status', 'Employer Cost', 'Employee Cost', 'Total Cost',
                'Enrollment Date', 'Effective Date'
            ].join(',');

            const rows = benefits.map(b => [
                b.benefitEnrollmentId,
                `"${b.employeeName}"`,
                `"${b.employeeNameAr || ''}"`,
                b.benefitType,
                b.benefitCategory,
                `"${b.benefitName}"`,
                b.status,
                b.employerCost,
                b.employeeCost,
                b.totalCost,
                b.enrollmentDate?.toISOString().split('T')[0] || '',
                b.effectiveDate?.toISOString().split('T')[0] || ''
            ].join(','));

            const csv = [headers, ...rows].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=benefits-export.csv');
            return res.send(csv);
        }

        return res.json({
            success: true,
            data: benefits,
            total: benefits.length
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل تصدير المزايا', error.status || 500);
    }
});

module.exports = {
    createBenefit,
    getBenefits,
    getBenefitStats,
    getEmployeeBenefits,
    getBenefit,
    updateBenefit,
    deleteBenefit,
    bulkDeleteBenefits,
    activateBenefit,
    suspendBenefit,
    terminateBenefit,
    addDependent,
    removeDependent,
    addBeneficiary,
    updateBeneficiary,
    removeBeneficiary,
    getBenefitsByType,
    addDocument,
    exportBenefits
};
