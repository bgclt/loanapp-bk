import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ResetTokenDto } from "./dto/reset-token.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "User login" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    schema: {
      type: "object",
      properties: {
        access_token: { type: "string" },
        reset_token: { type: "string" },
        reset_token_expires: { type: "string", format: "date-time" },
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            fullname: { type: "string" },
            phone: { type: "string" },
            companyName: { type: "string" },
            roles: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: "User registration" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: "User registered successfully",
    schema: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            fullname: { type: "string" },
            phone: { type: "string" },
            companyName: { type: "string" },
            roles: { type: "array", items: { type: "string" } },
          },
        },
        message: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: "Forgot password" })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: "Password reset email sent",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 404, description: "User not found" })
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @ApiOperation({ summary: "Reset password" })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: "Password reset successful",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid or expired token" })
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }

  @ApiOperation({ summary: "Reset access token" })
  @ApiBody({ type: ResetTokenDto })
  @ApiResponse({
    status: 200,
    description: "New access token generated successfully",
    schema: {
      type: "object",
      properties: {
        access_token: { type: "string" },
        reset_token: { type: "string" },
        reset_token_expires: { type: "string", format: "date-time" },
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            fullname: { type: "string" },
            phone: { type: "string" },
            companyName: { type: "string" },
            roles: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid or expired reset token" })
  @Post("reset-token")
  @HttpCode(HttpStatus.OK)
  async resetToken(@Body() resetTokenDto: ResetTokenDto) {
    return this.authService.resetToken(resetTokenDto.reset_token);
  }

  @ApiOperation({ summary: "Verify email address" })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 200,
    description: "Email verified successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid or expired token" })
  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @ApiOperation({ summary: "Test JWT token (for debugging)" })
  @ApiResponse({ status: 200, description: "Token info" })
  @Post("test-token")
  @HttpCode(HttpStatus.OK)
  async testToken(@Request() req) {
    console.log('Test endpoint - Headers:', req.headers);
    console.log('Test endpoint - Authorization header:', req.headers.authorization);
    console.log('Test endpoint - User:', req.user);
    
    return {
      headers: req.headers,
      authorization: req.headers.authorization,
      user: req.user,
      message: "Check server logs for detailed info"
    };
  }

  @ApiOperation({ summary: "Check user permissions (for debugging)" })
  @ApiResponse({ status: 200, description: "User permissions" })
  @Post("check-permissions")
  @HttpCode(HttpStatus.OK)
  async checkPermissions(@Request() req) {
    if (!req.user) {
      return { error: "No user found" };
    }

    const userWithRoles = await this.authService.getUserWithRoles(req.user.id);
    
    return {
      user: {
        id: userWithRoles.id,
        email: userWithRoles.email,
        roles: userWithRoles.roles.map(role => ({
          name: role.name,
          permissions: role.permissions.map(permission => permission.name)
        }))
      }
    };
  }

  @ApiOperation({ summary: "Verify JWT token (for debugging)" })
  @ApiResponse({ status: 200, description: "Token verification result" })
  @Post("verify-token")
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Request() req) {
    const authHeader = req.headers.authorization;
    console.log('Verify token - Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: "No valid authorization header" };
    }

    const token = authHeader.substring(7);
    console.log('Verify token - Token:', token.substring(0, 50) + '...');
    
    try {
      const decoded = this.authService.verifyJwtToken(token);
      return { 
        success: true, 
        decoded,
        message: "Token is valid" 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        message: "Token is invalid" 
      };
    }
  }
}
