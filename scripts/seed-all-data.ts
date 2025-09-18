import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PermissionsService } from '../src/components/roles/permissions.service';
import { RolesService } from '../src/components/roles/roles.service';
import { SettingsService } from '../src/components/settings/settings.service';

async function seedAllData() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const permissionsService = app.get(PermissionsService);
  const rolesService = app.get(RolesService);
  const settingsService = app.get(SettingsService);

  try {
    console.log('🌱 Starting data seeding...');

    console.log('📋 Seeding permissions...');
    await permissionsService.seedDefaultPermissions();
    console.log('✅ Permissions seeded successfully!');

    console.log('👥 Seeding roles...');
    await rolesService.seedDefaultRoles();
    console.log('✅ Roles seeded successfully!');

    console.log('⚙️ Seeding settings...');
    await settingsService.seedDefaultSettings();
    console.log('✅ Settings seeded successfully!');

    console.log('🎉 All data seeded successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the application: npm run start:dev');
    console.log(
      '2. Visit the API documentation: http://localhost:3000/api/docs',
    );
    console.log('3. Create your first user via POST /auth/register');
    console.log('4. Assign roles to users as needed');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await app.close();
  }
}

seedAllData();
