import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

export class AuthService {
  private static SALT_ROUNDS = 12;

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Authenticate user with email and password
   */
  static async authenticateUser(email: string, password: string) {
    if (!email || !password) {
      return null;
    }

    try {
      // Find user by email
      const user = await db.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          passwordHash: true,
        }
      });

      if (!user || !user.passwordHash) {
        return null;
      }

      // Verify password
      const isValid = await this.verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return null;
      }

      // Return user data without password hash
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    }
  }

  /**
   * Create or update admin user (for initial setup)
   */
  static async setupAdminUser(email: string, password: string, name?: string) {
    const hashedPassword = await this.hashPassword(password);

    return db.user.upsert({
      where: { email: email.toLowerCase() },
      update: {
        passwordHash: hashedPassword,
        role: UserRole.ADMIN,
        name: name || "Admin",
      },
      create: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        role: UserRole.ADMIN,
        name: name || "Admin",
      },
    });
  }
}