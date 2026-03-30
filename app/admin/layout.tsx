import "../globals.css";
import React from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-w-0">{children}</main>
    </div>
  );
}


