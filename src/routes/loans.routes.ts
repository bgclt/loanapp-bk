import { Router } from "express"
import LoanController from "../controllers/loan.controller"
import { authenticate, authorize, requireRole } from "../middlewares"
import { validate } from "../middlewares/validation.middleware"
import { PERMISSIONS, ROLES } from "../common/constants"
import Joi from "joi"

const router = Router()

// Validation schemas
const registerLoanSchema = Joi.object({
  fullname: Joi.string().min(2).max(255).required(),
  contact: Joi.string().min(10).max(20).required(),
  email: Joi.string().email().optional(),
  location: Joi.string().required(),
  landmark: Joi.string().optional(),
  business: Joi.string().optional(),
  requested_amount: Joi.number().positive().required(),
})

const captureLoanSchema = Joi.object({
  dob: Joi.date().optional(),
  marital_status: Joi.string().valid("single", "married", "divorced", "widowed").optional(),
  profile_image: Joi.string().optional(),
  occupation: Joi.string().optional(),
  id_type: Joi.string().valid("Ghana Card", "Voters ID", "Passport").optional(),
  id_number: Joi.string().optional(),
  witnesses: Joi.array()
    .items(
      Joi.object({
        fullname: Joi.string().required(),
        contact: Joi.string().required(),
        marital_status: Joi.string().optional(),
        email: Joi.string().email().optional(),
        occupation: Joi.string().optional(),
        residence_address: Joi.string().optional(),
        residence_gps: Joi.string().optional(),
      }),
    )
    .optional(),
  business_locations: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        address: Joi.string().required(),
        gps_address: Joi.string().optional(),
        region: Joi.string().optional(),
      }),
    )
    .optional(),
  residences: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        address: Joi.string().required(),
        gps_address: Joi.string().optional(),
        region: Joi.string().optional(),
      }),
    )
    .optional(),
})

const approveLoanSchema = Joi.object({
  approved_amount: Joi.number().positive().required(),
  loan_duration: Joi.number().integer().positive().required(),
  payment_mode: Joi.string().valid("weekly", "monthly").required(),
})

const recordRepaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  payment_date: Joi.date().required(),
})

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Get all loans with filters
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [registration, capturing, approval, disbursement, active, completed, defaulted]
 *       - in: query
 *         name: phase
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3, 4]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Loans retrieved successfully
 */
router.get("/", authenticate, authorize(PERMISSIONS.LOANS_LIST), LoanController.getAllLoans)

/**
 * @swagger
 * /api/loans/register:
 *   post:
 *     summary: Register a new loan (Phase 1)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - contact
 *               - location
 *               - requested_amount
 *             properties:
 *               fullname:
 *                 type: string
 *               contact:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               location:
 *                 type: string
 *               landmark:
 *                 type: string
 *               business:
 *                 type: string
 *               requested_amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Loan registered successfully
 */
router.post(
  "/register",
  authenticate,
  requireRole([ROLES.CALL_CENTER, ROLES.ADMIN, ROLES.OWNER]),
  validate(registerLoanSchema),
  LoanController.registerLoan,
)

/**
 * @swagger
 * /api/loans/{loanId}/capture:
 *   put:
 *     summary: Capture detailed loan information (Phase 2)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dob:
 *                 type: string
 *                 format: date
 *               marital_status:
 *                 type: string
 *                 enum: [single, married, divorced, widowed]
 *               profile_image:
 *                 type: string
 *               occupation:
 *                 type: string
 *               id_type:
 *                 type: string
 *                 enum: [Ghana Card, Voters ID, Passport]
 *               id_number:
 *                 type: string
 *               witnesses:
 *                 type: array
 *                 items:
 *                   type: object
 *               business_locations:
 *                 type: array
 *                 items:
 *                   type: object
 *               residences:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Loan details captured successfully
 */
router.put(
  "/:loanId/capture",
  authenticate,
  requireRole([ROLES.SALES_EXECUTIVE, ROLES.LOAN_OFFICER, ROLES.ADMIN, ROLES.OWNER]),
  validate(captureLoanSchema),
  LoanController.captureLoanDetails,
)

/**
 * @swagger
 * /api/loans/{loanId}/approve:
 *   put:
 *     summary: Approve loan (Phase 3)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved_amount
 *               - loan_duration
 *               - payment_mode
 *             properties:
 *               approved_amount:
 *                 type: number
 *               loan_duration:
 *                 type: integer
 *               payment_mode:
 *                 type: string
 *                 enum: [weekly, monthly]
 *     responses:
 *       200:
 *         description: Loan approved successfully
 */
router.put(
  "/:loanId/approve",
  authenticate,
  requireRole([ROLES.CREDIT_RISK_ANALYST, ROLES.ADMIN, ROLES.OWNER]),
  validate(approveLoanSchema),
  LoanController.approveLoan,
)

/**
 * @swagger
 * /api/loans/{loanId}/disburse:
 *   put:
 *     summary: Disburse loan (Phase 4)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Loan disbursed successfully
 */
router.put(
  "/:loanId/disburse",
  authenticate,
  requireRole([ROLES.MANAGER, ROLES.ADMIN, ROLES.OWNER]),
  LoanController.disburseLoan,
)

/**
 * @swagger
 * /api/loans/{loanId}:
 *   get:
 *     summary: Get loan by ID
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Loan retrieved successfully
 *       404:
 *         description: Loan not found
 */
router.get("/:loanId", authenticate, authorize(PERMISSIONS.LOANS_VIEW), LoanController.getLoanById)

/**
 * @swagger
 * /api/loans/{loanId}/repayments:
 *   get:
 *     summary: Get loan repayments
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Loan repayments retrieved successfully
 */
router.get("/:loanId/repayments", authenticate, authorize(PERMISSIONS.LOANS_VIEW), LoanController.getLoanRepayments)

/**
 * @swagger
 * /api/loans/{loanId}/repayments:
 *   post:
 *     summary: Record loan repayment
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - payment_date
 *             properties:
 *               amount:
 *                 type: number
 *               payment_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Repayment recorded successfully
 */
router.post(
  "/:loanId/repayments",
  authenticate,
  authorize(PERMISSIONS.LOANS_UPDATE),
  validate(recordRepaymentSchema),
  LoanController.recordRepayment,
)

export default router
