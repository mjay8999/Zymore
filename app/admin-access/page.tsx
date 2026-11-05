import AdminLoginForm from "@/components/admin-login-form";

export const metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default function AdminAccessPage() {
  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <p className="eyebrow">Zymore</p>
        <h1>Admin sign in</h1>
        <p>Enter your private admin key to open the article manager.</p>
        <AdminLoginForm />
      </div>
    </main>
  );
}
