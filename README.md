# Loan Management System API

A comprehensive NestJS-based loan management system with role-based access control, built with PostgreSQL and Amazon SES integration.

## 🚀 Features

### Core Functionality
- **4-Phase Loan Management**: Registration → Capturing → Approval → Disbursement
- **Role-Based Access Control**: 7 predefined roles with granular permissions
- **Payment Tracking**: Complete payment lifecycle with automated balance calculations
- **Email Notifications**: Amazon SES integration for automated communications
- **Activity Logging**: Comprehensive audit trail for all system operations
- **Advanced Reporting**: Dashboard statistics, trends, and export capabilities

### Loan Phases
1. **Registration Phase** - Initial loan application (Call Center)
2. **Capturing Phase** - Detailed information collection (Sales Executive/Loan Officer)
3. **Approval Phase** - Loan assessment and approval (Credit Risk Analyst)
4. **Disbursement Phase** - Fund distribution (Manager)

### Predefined Roles
- **Owner** - Full system access
- **Admin** - All permissions except log deletion
- **Viewer** - Read-only access to all data
- **Manager** - Loan disbursement and reporting
- **Call Center** - Loan registration
- **Sales Executive/Loan Officer** - Loan capturing
- **Credit Risk Analyst** - Loan approval

## 🛠️ Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Email Service**: Amazon SES
- **Documentation**: Swagger/OpenAPI
- **Validation**: Class Validator & Class Transformer

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- AWS Account (for SES)

## 🔧 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd nestjs-loans
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Update the `.env` file with your configuration:
   \`\`\`env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=nestjs_loans

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d

   # AWS SES
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   SES_FROM_EMAIL=noreply@yourcompany.com

   # Frontend URL (for email links)
   FRONTEND_URL=http://localhost:3000

   # App
   PORT=3000
   NODE_ENV=development
   \`\`\`

4. **Database Setup**
   \`\`\`bash
   # Create database
   createdb nestjs_loans

   # Run migrations (if using migrations)
   npm run typeorm:migration:run
   \`\`\`

5. **Seed Default Data**
   \`\`\`bash
   # Seed permissions and roles
   npm run seed:permissions-roles
   \`\`\`

## 🚀 Running the Application

\`\`\`bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
\`\`\`

The application will be available at:
- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api/docs

## 📚 API Documentation

### Authentication
All endpoints (except auth) require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### Key Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

#### Loan Management
- `POST /loans` - Create loan (Registration Phase)
- `PATCH /loans/:id/capturing` - Update capturing phase
- `PATCH /loans/:id/approve` - Approve loan
- `PATCH /loans/:id/disburse` - Disburse loan
- `GET /loans` - List all loans
- `GET /loans/:id/statement` - Get loan statement

#### Payments
- `POST /loans/payments` - Record payment
- `GET /loans/payments` - List payments
- `GET /loans/payments/date-range` - Payments by date range

#### Reports
- `GET /reports/dashboard` - Dashboard statistics
- `GET /reports/defaulters` - Defaulter report
- `GET /reports/loans/trends` - Loan trends
- `GET /reports/export` - Export reports

#### User & Role Management
- `GET /users` - List users
- `POST /roles` - Create role
- `POST /roles/:id/permissions` - Assign permissions

## 🔐 Permission System

The system uses a granular permission system with the following pattern:
- `CAN_CREATE_<RESOURCE>` - Create new records
- `CAN_UPDATE_<RESOURCE>` - Update existing records
- `CAN_DELETE_<RESOURCE>` - Delete records
- `CAN_VIEW_<RESOURCE>` - View individual records
- `CAN_LIST_<RESOURCE>` - List multiple records
- `CAN_GET_<RESOURCE>` - Get specific record details

Special permissions:
- `CAN_APPROVE_LOANS` - Approve loan applications
- `CAN_DISBURSE_LOANS` - Disburse approved loans
- `CAN_EXPORT_REPORTS` - Export system reports
- `ALL` - All permissions (Owner role only)

## 📊 Reporting Features

### Dashboard Statistics
- Total loans by status
- User statistics
- Financial summaries (disbursed, collected, outstanding)

### Trend Analysis
- Monthly loan creation trends
- Payment collection trends
- Performance metrics

### Specialized Reports
- **Defaulter Report** - Clients with overdue payments
- **Collection Report** - Payments within date range
- **Loan Statement** - Individual loan payment history

## 📧 Email Notifications

Automated email notifications for:
- Welcome emails for new users
- Password reset requests
- Loan status updates
- Payment reminders
- Payment confirmations

## 🔍 Activity Logging

All system activities are logged including:
- User actions (CREATE, UPDATE, DELETE)
- Resource changes with before/after data
- User information and timestamps
- IP addresses and user agents

## 🧪 Testing

\`\`\`bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
\`\`\`

## 📦 Deployment

### Using Docker
\`\`\`bash
# Build image
docker build -t loan-management-api .

# Run container
docker run -p 3000:3000 --env-file .env loan-management-api
\`\`\`

### Environment Variables for Production
Ensure all environment variables are properly set in your production environment, especially:
- Database connection details
- JWT secret (use a strong, unique secret)
- AWS credentials for SES
- Frontend URL for email links

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [API Documentation](http://localhost:3000/api/docs)
- Review the codebase and comments
- Create an issue in the repository

## 🔄 Version History

- **v1.0.0** - Initial release with complete loan management system
  - 4-phase loan processing
  - Role-based access control
  - Payment tracking
  - Email notifications
  - Comprehensive reporting
  - Activity logging
