import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { MailService } from "../../core/mail/mail.service";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const userWithRoles = await this.usersService.findByIdWithRoles(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userWithRoles.id,
        email: userWithRoles.email,
        fullname: userWithRoles.fullname,
        phone: userWithRoles.phone,
        companyName: userWithRoles.companyName,
        roles: userWithRoles.roles.map(role => role.name),
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Assign Owner role to new user
    const userWithRoles = await this.usersService.assignRole(user.id, "Owner");

    // Generate JWT token
    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userWithRoles.id,
        email: userWithRoles.email,
        fullname: userWithRoles.fullname,
        phone: userWithRoles.phone,
        companyName: userWithRoles.companyName,
        roles: userWithRoles.roles.map(role => role.name),
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException("User with this email does not exist");
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    await this.usersService.updateResetToken(user.id, resetToken, resetTokenExpires);

    // Send reset email
    await this.mailService.sendPasswordResetEmail(user.email, user.fullname, resetToken);

    return {
      message: "Password reset email sent successfully",
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);

    // Ensure token exists and is not expired
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await this.usersService.updatePassword(user.id, hashedPassword);

    return {
      message: "Password reset successful",
    };
  }
}
