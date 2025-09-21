import { Controller, Get, Patch, Delete, Body, UseGuards, Post, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { SettingsService } from "./settings.service";
import { UpdateSettingDto } from "./dto/update-setting.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permission.decorators";
import { Permission } from "../../common/enums/permission.enum";

@ApiTags("Settings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiOperation({
    summary: "Get all system settings",
    description: "Retrieve all system configuration settings including company information and system preferences.",
  })
  @ApiResponse({
    status: 200,
    description: "Settings retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          key: { type: "string" },
          value: { type: "string" },
          description: { type: "string" },
          type: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_SETTINGS)
  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @ApiOperation({
    summary: "Get company information",
    description: "Retrieve formatted company information with parsed values based on their types.",
  })
  @ApiResponse({
    status: 200,
    description: "Company information retrieved successfully",
    schema: {
      type: "object",
      properties: {
        company_name: { type: "string" },
        company_address: { type: "string" },
        company_email: { type: "string" },
        company_phone: { type: "string" },
        company_logo: { type: "string" },
        currency: { type: "string" },
        default_loan_duration: { type: "number" },
        max_loan_amount: { type: "number" },
        min_loan_amount: { type: "number" },
        interest_rate: { type: "number" },
        enable_email_notifications: { type: "boolean" },
      },
    },
  })
  @Permissions(Permission.CAN_VIEW_SETTINGS)
  @Get("company")
  getCompanyInfo() {
    return this.settingsService.getCompanyInfo();
  }

  @ApiOperation({
    summary: "Get setting by key",
    description: "Retrieve a specific setting by its key.",
  })
  @ApiResponse({
    status: 200,
    description: "Setting retrieved successfully",
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        key: { type: "string" },
        value: { type: "string" },
        description: { type: "string" },
        type: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Setting not found" })
  @Permissions(Permission.CAN_VIEW_SETTINGS)
  @Get(":key")
  findOne(@Param("key") key: string) {
    return this.settingsService.findByKey(key);
  }

  @ApiOperation({
    summary: "Update or create setting",
    description: "Update an existing setting or create a new one if it doesn't exist.",
  })
  @ApiBody({ type: UpdateSettingDto })
  @ApiResponse({
    status: 200,
    description: "Setting updated successfully",
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        key: { type: "string" },
        value: { type: "string" },
        description: { type: "string" },
        type: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  })
  @Permissions(Permission.CAN_UPDATE_SETTINGS)
  @Patch(":key")
  update(@Param("key") key: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.updateSetting(key, updateSettingDto);
  }

  @ApiOperation({
    summary: "Seed default settings",
    description: "Initialize the system with default settings. This should be run once during system setup.",
  })
  @ApiResponse({
    status: 200,
    description: "Default settings seeded successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  })
  @Permissions(Permission.ALL)
  @Post("seed")
  async seedDefaultSettings() {
    await this.settingsService.seedDefaultSettings();
    return { message: "Default settings seeded successfully" };
  }

  @ApiOperation({
    summary: "Delete setting",
    description: "Delete a specific setting by its key. Use with caution as this cannot be undone.",
  })
  @ApiResponse({ status: 200, description: "Setting deleted successfully" })
  @ApiResponse({ status: 404, description: "Setting not found" })
  @Permissions(Permission.CAN_UPDATE_SETTINGS)
  @Delete(":key")
  remove(@Param("key") key: string) {
    return this.settingsService.remove(key);
  }
}
