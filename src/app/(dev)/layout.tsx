import { notFound } from "next/navigation";
import "../globals.css";

// Pages /dev/* : n'existent pas en production (section 19).
export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <html lang="fr">
      <body className="mx-auto max-w-md p-4">{children}</body>
    </html>
  );
}
