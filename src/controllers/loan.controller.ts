import type { Response } from "express";
import LoanService from "../services/loan.service";
import type { AuthenticatedRequest, PaginatedResponse } from "../common/types";
import type {
  CreateClientRequest,
  UpdateClientRequest,
} from "../models/client.model";
import type { ApproveLoanRequest } from "../models/loan.model";
import { logSystemActivity } from "../middlewares/logger.middleware";
import pool from "../database/connection";

class LoanController {
  // Phase 1: Registration
  async registerLoan(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const clientData: CreateClientRequest = req.body;
      const result = await LoanService.registerLoan(clientData, req.user.id);

      await logSystemActivity(
        req.user.id,
        "Loan registered",
        "Loan",
        result.loan.id,
        {
          client_name: result.client.fullname,
          requested_amount: clientData.requested_amount,
        },
        req
      );

      res.status(201).json({
        success: true,
        message: "Loan registered successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to register loan",
      });
    }
  }

  // Phase 2: Capturing
  async captureLoanDetails(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const { loanId } = req.params;
      const clientDetails: UpdateClientRequest = req.body;

      const loan = await LoanService.captureLoanDetails(
        Number.parseInt(loanId),
        clientDetails,
        req.user.id
      );

      await logSystemActivity(
        req.user.id,
        "Loan details captured",
        "Loan",
        loan.id,
        { phase: "capturing" },
        req
      );

      res.json({
        success: true,
        message: "Loan details captured successfully",
        data: loan,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to capture loan details",
      });
    }
  }

  // Phase 3: Approval
  async approveLoan(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const { loanId } = req.params;
      const approvalData: ApproveLoanRequest = req.body;

      const loan = await LoanService.approveLoan(
        Number.parseInt(loanId),
        approvalData,
        req.user.id
      );

      await logSystemActivity(
        req.user.id,
        "Loan approved",
        "Loan",
        loan.id,
        {
          approved_amount: approvalData.approved_amount,
          loan_duration: approvalData.loan_duration,
        },
        req
      );

      res.json({
        success: true,
        message: "Loan approved successfully",
        data: loan,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to approve loan",
      });
    }
  }

  // Phase 4: Disbursement
  async disburseLoan(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const { loanId } = req.params;

      const loan = await LoanService.disburseLoan(
        Number.parseInt(loanId),
        req.user.id
      );

      await logSystemActivity(
        req.user.id,
        "Loan disbursed",
        "Loan",
        loan.id,
        { disbursement_date: loan.disbursement_date },
        req
      );

      res.json({
        success: true,
        message: "Loan disbursed successfully",
        data: loan,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to disburse loan",
      });
    }
  }

  async getAllLoans(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const phase = req.query.phase
        ? Number.parseInt(req.query.phase as string)
        : undefined;
      const search = req.query.search as string;

      // Get user role for filtering
      const userRole = await this.getUserRole(req.user.id);

      const result = await LoanService.getLoansWithFilters({
        status,
        phase,
        page,
        limit,
        search,
        userId: req.user.id,
        userRole,
      });

      const response: PaginatedResponse<any> = {
        success: true,
        message: "Loans retrieved successfully",
        data: result.loans,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve loans",
      });
    }
  }

  async getLoanById(req: AuthenticatedRequest, res: Response) {
    try {
      const { loanId } = req.params;

      const loan = await LoanService.getLoanById(Number.parseInt(loanId));

      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      res.json({
        success: true,
        message: "Loan retrieved successfully",
        data: loan,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve loan",
      });
    }
  }

  async recordRepayment(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const { loanId } = req.params;
      const { amount, payment_date } = req.body;

      await LoanService.recordRepayment(
        Number.parseInt(loanId),
        amount,
        new Date(payment_date),
        req.user.id
      );

      await logSystemActivity(
        req.user.id,
        "Repayment recorded",
        "Loan",
        Number.parseInt(loanId),
        { amount, payment_date },
        req
      );

      res.json({
        success: true,
        message: "Repayment recorded successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to record repayment",
      });
    }
  }

  async getLoanRepayments(req: AuthenticatedRequest, res: Response) {
    try {
      const { loanId } = req.params;

      const repayments = await LoanService.getLoanRepayments(
        Number.parseInt(loanId)
      );

      res.json({
        success: true,
        message: "Loan repayments retrieved successfully",
        data: repayments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve loan repayments",
      });
    }
  }

  private async getUserRole(userId: number): Promise<string> {
    try {
      const result = await pool.query(
        "SELECT r.name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1",
        [userId]
      );
      return result.rows.length > 0 ? result.rows[0].name : "Viewer";
    } catch (error) {
      return "Viewer";
    }
  }
}

export default new LoanController();
