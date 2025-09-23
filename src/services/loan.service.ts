import pool from "../database/connection"
import type { Loan, ApproveLoanRequest, LoanWithClient } from "../models/loan.model"
import type { Client, CreateClientRequest, UpdateClientRequest } from "../models/client.model"
import { LOAN_STATUS, PAYMENT_MODE } from "../common/constants"
import NotificationService from ".//notification.service"

class LoanService {
  // Phase 1: Registration
  async registerLoan(clientData: CreateClientRequest, userId: number): Promise<{ client: Client; loan: Loan }> {
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      // Create client
      const clientResult = await client.query(
        `INSERT INTO clients (fullname, contact, email, location, landmark, business, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          clientData.fullname,
          clientData.contact,
          clientData.email,
          clientData.location,
          clientData.landmark,
          clientData.business,
          userId,
        ],
      )

      const newClient = clientResult.rows[0]

      // Create loan in registration phase
      const loanResult = await client.query(
        `INSERT INTO loans (client_id, requested_amount, status, phase, registered_by, registration_date)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         RETURNING *`,
        [newClient.id, clientData.requested_amount, LOAN_STATUS.REGISTRATION, 1, userId],
      )

      const loan = loanResult.rows[0]

      await client.query("COMMIT")

      return { client: newClient, loan }
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  // Phase 2: Capturing (detailed information collection)
  async captureLoanDetails(loanId: number, clientDetails: UpdateClientRequest, userId: number): Promise<Loan> {
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      // Get loan and verify it's in registration phase
      const loanResult = await client.query("SELECT * FROM loans WHERE id = $1 AND phase = 1", [loanId])

      if (loanResult.rows.length === 0) {
        throw new Error("Loan not found or not in registration phase")
      }

      const loan = loanResult.rows[0]

      // Update client with detailed information
      const updateFields = []
      const updateValues = []
      let paramIndex = 1

      if (clientDetails.dob) {
        updateFields.push(`dob = $${paramIndex++}`)
        updateValues.push(clientDetails.dob)
      }
      if (clientDetails.marital_status) {
        updateFields.push(`marital_status = $${paramIndex++}`)
        updateValues.push(clientDetails.marital_status)
      }
      if (clientDetails.profile_image) {
        updateFields.push(`profile_image = $${paramIndex++}`)
        updateValues.push(clientDetails.profile_image)
      }
      if (clientDetails.occupation) {
        updateFields.push(`occupation = $${paramIndex++}`)
        updateValues.push(clientDetails.occupation)
      }
      if (clientDetails.id_type) {
        updateFields.push(`id_type = $${paramIndex++}`)
        updateValues.push(clientDetails.id_type)
      }
      if (clientDetails.id_number) {
        updateFields.push(`id_number = $${paramIndex++}`)
        updateValues.push(clientDetails.id_number)
      }

      if (updateFields.length > 0) {
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`)
        const updateQuery = `UPDATE clients SET ${updateFields.join(", ")} WHERE id = $${paramIndex}`
        updateValues.push(loan.client_id)
        await client.query(updateQuery, updateValues)
      }

      // Add witnesses
      if (clientDetails.witnesses && clientDetails.witnesses.length > 0) {
        for (const witness of clientDetails.witnesses) {
          await client.query(
            `INSERT INTO client_witnesses (client_id, fullname, contact, marital_status, email, occupation, residence_address, residence_gps)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              loan.client_id,
              witness.fullname,
              witness.contact,
              witness.marital_status,
              witness.email,
              witness.occupation,
              witness.residence_address,
              witness.residence_gps,
            ],
          )
        }
      }

      // Add business locations
      if (clientDetails.business_locations && clientDetails.business_locations.length > 0) {
        for (const location of clientDetails.business_locations) {
          await client.query(
            `INSERT INTO business_locations (client_id, name, address, gps_address, region)
             VALUES ($1, $2, $3, $4, $5)`,
            [loan.client_id, location.name, location.address, location.gps_address, location.region],
          )
        }
      }

      // Add residences
      if (clientDetails.residences && clientDetails.residences.length > 0) {
        for (const residence of clientDetails.residences) {
          await client.query(
            `INSERT INTO residences (client_id, name, address, gps_address, region)
             VALUES ($1, $2, $3, $4, $5)`,
            [loan.client_id, residence.name, residence.address, residence.gps_address, residence.region],
          )
        }
      }

      // Update loan to capturing phase
      const updatedLoanResult = await client.query(
        `UPDATE loans SET status = $1, phase = $2, captured_by = $3, capturing_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 RETURNING *`,
        [LOAN_STATUS.CAPTURING, 2, userId, loanId],
      )

      await client.query("COMMIT")

      return updatedLoanResult.rows[0]
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  // Phase 3: Approval
  async approveLoan(loanId: number, approvalData: ApproveLoanRequest, userId: number): Promise<Loan> {
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      // Get loan and verify it's in capturing phase
      const loanResult = await client.query("SELECT * FROM loans WHERE id = $1 AND phase = 2", [loanId])

      if (loanResult.rows.length === 0) {
        throw new Error("Loan not found or not in capturing phase")
      }

      // Calculate payment schedule start date
      const paymentScheduleStart = new Date()
      if (approvalData.payment_mode === PAYMENT_MODE.WEEKLY) {
        paymentScheduleStart.setDate(paymentScheduleStart.getDate() + 7)
      } else {
        paymentScheduleStart.setMonth(paymentScheduleStart.getMonth() + 1)
      }

      // Update loan to approval phase
      const updatedLoanResult = await client.query(
        `UPDATE loans SET 
         status = $1, phase = $2, approved_amount = $3, loan_duration = $4, 
         payment_mode = $5, payment_schedule_start = $6, approved_by = $7, 
         approval_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 RETURNING *`,
        [
          LOAN_STATUS.APPROVAL,
          3,
          approvalData.approved_amount,
          approvalData.loan_duration,
          approvalData.payment_mode,
          paymentScheduleStart,
          userId,
          loanId,
        ],
      )

      // Generate repayment schedule
      await this.generateRepaymentSchedule(loanId, approvalData, paymentScheduleStart, client)

      await client.query("COMMIT")

      await NotificationService.sendLoanApprovalNotification(loanId)

      return updatedLoanResult.rows[0]
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  // Phase 4: Disbursement
  async disburseLoan(loanId: number, userId: number): Promise<Loan> {
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      // Get loan and verify it's in approval phase
      const loanResult = await client.query("SELECT * FROM loans WHERE id = $1 AND phase = 3", [loanId])

      if (loanResult.rows.length === 0) {
        throw new Error("Loan not found or not in approval phase")
      }

      // Update loan to disbursement phase and active status
      const updatedLoanResult = await client.query(
        `UPDATE loans SET 
         status = $1, phase = $2, disbursed_by = $3, 
         disbursement_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 RETURNING *`,
        [LOAN_STATUS.ACTIVE, 4, userId, loanId],
      )

      await client.query("COMMIT")

      await NotificationService.sendLoanDisbursementNotification(loanId)

      return updatedLoanResult.rows[0]
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  private async generateRepaymentSchedule(
    loanId: number,
    approvalData: ApproveLoanRequest,
    startDate: Date,
    client: any,
  ): Promise<void> {
    const { approved_amount, loan_duration, payment_mode } = approvalData
    const installmentAmount = approved_amount / loan_duration

    for (let i = 0; i < loan_duration; i++) {
      const dueDate = new Date(startDate)

      if (payment_mode === PAYMENT_MODE.WEEKLY) {
        dueDate.setDate(startDate.getDate() + i * 7)
      } else {
        dueDate.setMonth(startDate.getMonth() + i)
      }

      await client.query(
        `INSERT INTO loan_repayments (loan_id, amount, due_date, status)
         VALUES ($1, $2, $3, $4)`,
        [loanId, installmentAmount, dueDate, "pending"],
      )
    }
  }

  async getLoansWithFilters(filters: {
    status?: string
    phase?: number
    page?: number
    limit?: number
    search?: string
    userId?: number
    userRole?: string
  }): Promise<{ loans: LoanWithClient[]; total: number; totalPages: number }> {
    const { status, phase, page = 1, limit = 10, search, userId, userRole } = filters
    const offset = (page - 1) * limit

    let query = `
      SELECT l.*, c.fullname as client_name, c.contact as client_contact, c.email as client_email,
             c.location as client_location, c.business as client_business,
             u1.fullname as registered_by_name, u2.fullname as captured_by_name,
             u3.fullname as approved_by_name, u4.fullname as disbursed_by_name
      FROM loans l
      JOIN clients c ON l.client_id = c.id
      LEFT JOIN users u1 ON l.registered_by = u1.id
      LEFT JOIN users u2 ON l.captured_by = u2.id
      LEFT JOIN users u3 ON l.approved_by = u3.id
      LEFT JOIN users u4 ON l.disbursed_by = u4.id
      WHERE 1=1
    `

    let countQuery = `
      SELECT COUNT(*) FROM loans l
      JOIN clients c ON l.client_id = c.id
      WHERE 1=1
    `

    const queryParams: any[] = []
    let paramIndex = 1

    // Role-based filtering
    if (userRole === "Call Center") {
      query += ` AND l.phase = 1`
      countQuery += ` AND l.phase = 1`
    } else if (userRole === "Sales Executive" || userRole === "Loan Officer") {
      query += ` AND l.phase IN (1, 2)`
      countQuery += ` AND l.phase IN (1, 2)`
    } else if (userRole === "Credit Risk Analyst") {
      query += ` AND l.phase = 2`
      countQuery += ` AND l.phase = 2`
    } else if (userRole === "Manager") {
      query += ` AND l.phase = 3`
      countQuery += ` AND l.phase = 3`
    }

    if (status) {
      query += ` AND l.status = $${paramIndex}`
      countQuery += ` AND l.status = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    if (phase) {
      query += ` AND l.phase = $${paramIndex}`
      countQuery += ` AND l.phase = $${paramIndex}`
      queryParams.push(phase)
      paramIndex++
    }

    if (search) {
      query += ` AND (c.fullname ILIKE $${paramIndex} OR c.contact ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex})`
      countQuery += ` AND (c.fullname ILIKE $${paramIndex} OR c.contact ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex})`
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    query += ` ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    queryParams.push(limit, offset)

    const [loansResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)),
    ])

    const total = Number.parseInt(countResult.rows[0].count)
    const totalPages = Math.ceil(total / limit)

    return {
      loans: loansResult.rows,
      total,
      totalPages,
    }
  }

  async getLoanById(loanId: number): Promise<LoanWithClient | null> {
    const result = await pool.query(
      `
      SELECT l.*, c.fullname as client_name, c.contact as client_contact, c.email as client_email,
             c.location as client_location, c.business as client_business, c.dob, c.marital_status,
             c.profile_image, c.occupation, c.id_type, c.id_number,
             u1.fullname as registered_by_name, u2.fullname as captured_by_name,
             u3.fullname as approved_by_name, u4.fullname as disbursed_by_name,
             COALESCE(
               json_agg(
                 DISTINCT jsonb_build_object(
                   'id', cw.id,
                   'fullname', cw.fullname,
                   'contact', cw.contact,
                   'marital_status', cw.marital_status,
                   'email', cw.email,
                   'occupation', cw.occupation,
                   'residence_address', cw.residence_address,
                   'residence_gps', cw.residence_gps
                 )
               ) FILTER (WHERE cw.id IS NOT NULL), 
               '[]'
             ) as witnesses,
             COALESCE(
               json_agg(
                 DISTINCT jsonb_build_object(
                   'id', bl.id,
                   'name', bl.name,
                   'address', bl.address,
                   'gps_address', bl.gps_address,
                   'region', bl.region
                 )
               ) FILTER (WHERE bl.id IS NOT NULL), 
               '[]'
             ) as business_locations,
             COALESCE(
               json_agg(
                 DISTINCT jsonb_build_object(
                   'id', r.id,
                   'name', r.name,
                   'address', r.address,
                   'gps_address', r.gps_address,
                   'region', r.region
                 )
               ) FILTER (WHERE r.id IS NOT NULL), 
               '[]'
             ) as residences
      FROM loans l
      JOIN clients c ON l.client_id = c.id
      LEFT JOIN users u1 ON l.registered_by = u1.id
      LEFT JOIN users u2 ON l.captured_by = u2.id
      LEFT JOIN users u3 ON l.approved_by = u3.id
      LEFT JOIN users u4 ON l.disbursed_by = u4.id
      LEFT JOIN client_witnesses cw ON c.id = cw.client_id
      LEFT JOIN business_locations bl ON c.id = bl.client_id
      LEFT JOIN residences r ON c.id = r.client_id
      WHERE l.id = $1
      GROUP BY l.id, c.id, u1.fullname, u2.fullname, u3.fullname, u4.fullname
    `,
      [loanId],
    )

    return result.rows.length > 0 ? result.rows[0] : null
  }

  async recordRepayment(loanId: number, amount: number, paymentDate: Date, userId: number): Promise<void> {
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      // Find the next pending repayment
      const repaymentResult = await client.query(
        `SELECT * FROM loan_repayments 
         WHERE loan_id = $1 AND status = 'pending' 
         ORDER BY due_date ASC LIMIT 1`,
        [loanId],
      )

      if (repaymentResult.rows.length === 0) {
        throw new Error("No pending repayments found for this loan")
      }

      const repayment = repaymentResult.rows[0]

      // Update repayment status
      await client.query(
        `UPDATE loan_repayments 
         SET status = 'paid', payment_date = $1, received_by = $2
         WHERE id = $3`,
        [paymentDate, userId, repayment.id],
      )

      // Check if all repayments are completed
      const pendingCount = await client.query(
        `SELECT COUNT(*) FROM loan_repayments 
         WHERE loan_id = $1 AND status = 'pending'`,
        [loanId],
      )

      if (Number.parseInt(pendingCount.rows[0].count) === 0) {
        // Mark loan as completed
        await client.query(
          `UPDATE loans SET status = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2`,
          [LOAN_STATUS.COMPLETED, loanId],
        )
      }

      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  async getLoanRepayments(loanId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT lr.*, u.fullname as received_by_name
       FROM loan_repayments lr
       LEFT JOIN users u ON lr.received_by = u.id
       WHERE lr.loan_id = $1
       ORDER BY lr.due_date ASC`,
      [loanId],
    )

    return result.rows
  }
}

export default new LoanService()
