import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Extender el usuario de la sesión para incluir el rol.
   */
  interface User {
    id: string;
    role: "admin" | "operator" | "asegurado";
  }

  interface Session {
    user: User & { id: string };
  }
}
