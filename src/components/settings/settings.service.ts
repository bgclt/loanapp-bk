import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { CompanySetting } from "./entities/company-setting.entity";
import { UpdateSettingDto } from "./dto/update-setting.dto";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(CompanySetting)
    private settingsRepository: Repository<CompanySetting>,
  ) {}

  async findAll(): Promise<CompanySetting[]> {
    return this.settingsRepository.find({
      order: { key: "ASC" },
    });
  }

  async findByKey(key: string): Promise<CompanySetting | null> {
    return this.settingsRepository.findOne({ where: { key } });
  }

  async updateSetting(key: string, updateSettingDto: UpdateSettingDto): Promise<CompanySetting> {
    let setting = await this.findByKey(key);

    if (!setting) {
      // Create new setting if it doesn't exist
      setting = this.settingsRepository.create({
        key,
        ...updateSettingDto,
      });
    } else {
      // Update existing setting
      Object.assign(setting, updateSettingDto);
    }

    return this.settingsRepository.save(setting);
  }

  async getCompanyInfo(): Promise<any> {
    const settings = await this.findAll();
    const companyInfo = {};

    settings.forEach(setting => {
      let value: any = setting.value;

      // Parse value based on type
      switch (setting.type) {
        case "number":
          value = Number.parseFloat(setting.value);
          break;
        case "boolean":
          value = setting.value === "true";
          break;
        case "json":
          try {
            value = JSON.parse(setting.value);
          } catch {
            value = setting.value;
          }
          break;
        default:
          value = setting.value;
      }

      companyInfo[setting.key] = value;
    });

    return companyInfo;
  }

  async seedDefaultSettings(): Promise<void> {
    const defaultSettings = [
      {
        key: "company_name",
        value: "Loan Management Company",
        description: "Company name displayed in the system",
        type: "string",
      },
      {
        key: "company_address",
        value: "123 Business Street, City, Country",
        description: "Company physical address",
        type: "string",
      },
      {
        key: "company_email",
        value: "info@loancompany.com",
        description: "Company contact email",
        type: "string",
      },
      {
        key: "company_phone",
        value: "+1234567890",
        description: "Company contact phone number",
        type: "string",
      },
      {
        key: "company_logo",
        value: "",
        description: "Company logo URL or base64 data",
        type: "string",
      },
      {
        key: "default_loan_duration",
        value: "12",
        description: "Default loan duration in months",
        type: "number",
      },
      {
        key: "max_loan_amount",
        value: "100000",
        description: "Maximum loan amount allowed",
        type: "number",
      },
      {
        key: "min_loan_amount",
        value: "1000",
        description: "Minimum loan amount allowed",
        type: "number",
      },
      {
        key: "late_payment_fee",
        value: "50",
        description: "Late payment fee amount",
        type: "number",
      },
      {
        key: "interest_rate",
        value: "15",
        description: "Default interest rate percentage",
        type: "number",
      },
      {
        key: "payment_reminder_days",
        value: "3",
        description: "Days before due date to send payment reminders",
        type: "number",
      },
      {
        key: "system_timezone",
        value: "UTC",
        description: "System timezone",
        type: "string",
      },
      {
        key: "currency",
        value: "USD",
        description: "System currency",
        type: "string",
      },
      {
        key: "enable_email_notifications",
        value: "true",
        description: "Enable automatic email notifications",
        type: "boolean",
      },
      {
        key: "enable_sms_notifications",
        value: "false",
        description: "Enable SMS notifications",
        type: "boolean",
      },
    ];

    for (const settingData of defaultSettings) {
      const existingSetting = await this.findByKey(settingData.key);
      if (!existingSetting) {
        const setting = this.settingsRepository.create(settingData);
        await this.settingsRepository.save(setting);
      }
    }
  }

  async remove(key: string): Promise<void> {
    const result = await this.settingsRepository.delete({ key });
    if (result.affected === 0) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }
  }
}
