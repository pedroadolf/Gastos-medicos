import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getSupabaseService } from "@/services/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Al iniciar sesión, el objeto user está presente.
      // Aquí es donde guardamos el rol en el token.
      if (user) {
        const supabase = getSupabaseService();
        const { data } = await supabase
          .from('user_roles_by_email')
          .select('role')
          .eq('email', user.email)
          .single();
          
        token.role = data?.role || (user.email === 'pash.mx@gmail.com' ? 'admin' : 'asegurado');
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as any;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
