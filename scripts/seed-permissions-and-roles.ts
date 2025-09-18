import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { PermissionsService } from "../src/components/roles/permissions.service";
import { RolesService } from "../src/components/roles/roles.service";

async function seedPermissionsAndRoles() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const permissionsService = app.get(PermissionsService);
  const rolesService = app.get(RolesService);

  try {
    console.log("Seeding permissions...");
    await permissionsService.seedDefaultPermissions();
    console.log("Permissions seeded successfully!");

    console.log("Seeding roles...");
    await rolesService.seedDefaultRoles();
    console.log("Roles seeded successfully!");

    console.log("All permissions and roles have been seeded!");
  } catch (error) {
    console.error("Error seeding permissions and roles:", error);
  } finally {
    await app.close();
  }
}

seedPermissionsAndRoles();
