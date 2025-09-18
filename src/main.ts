import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./core/exceptions/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("Loan Management System API")
    .setDescription(
      `
      ## Complete Loan Management System with Role-Based Access Control

      This API provides comprehensive loan management functionality with four distinct phases:
      
      ### Loan Phases:
      1. **Registration Phase** - Initial loan application (Call Center role)
      2. **Capturing Phase** - Detailed information collection (Sales Executive/Loan Officer roles)
      3. **Approval Phase** - Loan assessment and approval (Credit Risk Analyst role)
      4. **Disbursement Phase** - Fund distribution (Manager role)

      ### Key Features:
      - **Authentication & Authorization** - JWT-based auth with role-based permissions
      - **User Management** - Complete user lifecycle with role assignments
      - **Role & Permission System** - Granular permission control for all operations
      - **Loan Management** - Full loan lifecycle from application to completion
      - **Payment Tracking** - Payment recording and loan balance management
      - **Email Notifications** - Amazon SES integration for automated communications
      - **Activity Logging** - Comprehensive audit trail for all system activities
      - **Reporting** - Due payments, defaulters, and loan statements

      ### Predefined Roles:
      - **Owner** - Full system access
      - **Admin** - All permissions except log deletion
      - **Viewer** - Read-only access to all data
      - **Manager** - Loan disbursement and reporting
      - **Call Center** - Loan registration
      - **Sales Executive/Loan Officer** - Loan capturing
      - **Credit Risk Analyst** - Loan approval

      ### Authentication:
      Most endpoints require authentication. Use the /auth/login endpoint to obtain a JWT token,
      then include it in the Authorization header as: \`Bearer <token>\`
    `,
    )
    .setVersion("1.0.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .addTag("Authentication", "User authentication and authorization endpoints")
    .addTag("Users", "User management operations")
    .addTag("Roles & Permissions", "Role and permission management")
    .addTag("Loans", "Loan management and payment operations")
    .addTag("Reports", "Reporting and analytics endpoints")
    .addTag("Mail", "Email notification services")
    .addTag("Logs", "Activity logging and audit trail")
    .addServer("http://localhost:3000", "Development server")
    .addServer("https://api.yourdomain.com", "Production server")
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  // Custom CSS for Swagger UI
  const customCss = `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #007bff; }
    .swagger-ui .scheme-container { background: #f8f9fa; padding: 15px; border-radius: 5px; }
    .swagger-ui .info .description p { margin: 10px 0; }
    .swagger-ui .info .description h3 { color: #28a745; margin-top: 20px; }
    .swagger-ui .info .description h2 { color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
  `;

  SwaggerModule.setup("api/docs", app, document, {
    customCss,
    customSiteTitle: "Loan Management System API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: "none",
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`📊 API JSON: http://localhost:${port}/api/docs-json`);
}

bootstrap();
