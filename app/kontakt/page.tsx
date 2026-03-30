import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Kontaktiraj nas - Mareta",
  description: "Pošaljite nam poruku – Mareta sunčane naočale.",
};

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-gradient-soft py-12 px-4">
      <div className="container max-w-lg mx-auto">
        <h1 className="text-2xl sm:text-3xl font-elegant font-bold mb-2 text-center bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
          Kontaktiraj nas
        </h1>
        <p className="text-center text-dark-700 mb-8">
          Imate pitanja? Javite nam se, rado ćemo odgovoriti.
        </p>
        <div className="bg-white rounded-lg shadow-elegant p-6">
          <ContactForm />
        </div>
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            ← Natrag na početnu
          </Link>
        </div>
      </div>
    </main>
  );
}
