import { PrismaClient } from "@prisma/client";
import { AuthService } from "../src/server/auth/auth.service";

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || "admin@kayanlive.com";
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "Kayan Admin";

    if (!adminPassword) {
      console.error("❌ ADMIN_PASSWORD environment variable is required to seed admin user");
      console.log("💡 Set ADMIN_PASSWORD in your .env file and run: npm run db:seed-admin");
      process.exit(1);
    }

    console.log("🔐 Creating/updating admin user:", adminEmail);

    const admin = await AuthService.setupAdminUser(
      adminEmail,
      adminPassword,
      adminName
    );

    console.log("✅ Admin user setup complete:", {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    console.log("\n📝 You can now login with:");
    console.log("   Email:", adminEmail);
    console.log("   Password: [the password you set in ADMIN_PASSWORD]");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});