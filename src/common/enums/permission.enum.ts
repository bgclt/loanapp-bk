export enum Permission {
  // User permissions
  CAN_CREATE_USERS = "canCreateUsers",
  CAN_DELETE_USERS = "canDeleteUsers",
  CAN_UPDATE_USERS = "canUpdateUsers",
  CAN_VIEW_USERS = "canViewUsers",
  CAN_LIST_USERS = "canListUsers",
  CAN_GET_USERS = "canGetUsers",

  // Role permissions
  CAN_CREATE_ROLES = "canCreateRoles",
  CAN_DELETE_ROLES = "canDeleteRoles",
  CAN_UPDATE_ROLES = "canUpdateRoles",
  CAN_VIEW_ROLES = "canViewRoles",
  CAN_LIST_ROLES = "canListRoles",
  CAN_GET_ROLES = "canGetRoles",

  // Loan permissions
  CAN_CREATE_LOANS = "canCreateLoans",
  CAN_DELETE_LOANS = "canDeleteLoans",
  CAN_UPDATE_LOANS = "canUpdateLoans",
  CAN_VIEW_LOANS = "canViewLoans",
  CAN_LIST_LOANS = "canListLoans",
  CAN_GET_LOANS = "canGetLoans",
  CAN_APPROVE_LOANS = "canApproveLoans",
  CAN_DISBURSE_LOANS = "canDisburseLoans",

  // Payment permissions
  CAN_CREATE_PAYMENTS = "canCreatePayments",
  CAN_DELETE_PAYMENTS = "canDeletePayments",
  CAN_UPDATE_PAYMENTS = "canUpdatePayments",
  CAN_VIEW_PAYMENTS = "canViewPayments",
  CAN_LIST_PAYMENTS = "canListPayments",
  CAN_GET_PAYMENTS = "canGetPayments",

  // Log permissions
  CAN_DELETE_LOGS = "canDeleteLogs",
  CAN_VIEW_LOGS = "canViewLogs",
  CAN_LIST_LOGS = "canListLogs",

  // Report permissions
  CAN_VIEW_REPORTS = "canViewReports",
  CAN_EXPORT_REPORTS = "canExportReports",

  // Settings permissions
  CAN_UPDATE_SETTINGS = "canUpdateSettings",
  CAN_VIEW_SETTINGS = "canViewSettings",

  // All permissions
  ALL = "all",
}
