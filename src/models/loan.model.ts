import type { Client } from "./client.model";

export interface Loan {
  id: number;
  client_id: number;
  requested_amount: number;
  approved_amount?: number;
  loan_duration?: number;
  payment_mode?: "weekly" | "monthly";
  payment_schedule_start?: Date;
  status:
    | "registration"
    | "capturing"
    | "approval"
    | "disbursement"
    | "active"
    | "completed"
    | "defaulted";
  phase: 1 | 2 | 3 | 4;
  registered_by: number;
  captured_by?: number;
  approved_by?: number;
  disbursed_by?: number;
  registration_date: Date;
  capturing_date?: Date;
  approval_date?: Date;
  disbursement_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface LoanRepayment {
  id: number;
  loan_id: number;
  amount: number;
  payment_date: Date;
  due_date: Date;
  status: "pending" | "paid" | "overdue";
  received_by?: number;
  created_at: Date;
}

export interface CreateLoanRequest {
  client_id: number;
  requested_amount: number;
}

export interface ApproveLoanRequest {
  approved_amount: number;
  loan_duration: number;
  payment_mode: "weekly" | "monthly";
}

export interface LoanWithClient extends Loan {
  client: Client;
}
