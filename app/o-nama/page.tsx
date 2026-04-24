import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "O nama - Mareta",
  description: "Saznajte više o Mareta – elegantne sunčane naočale za modernu ženu.",
};

export default function ONamaPage() {
  return (
    <main className="bg-gradient-soft">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-accent-500/10 to-dark-900/20" />
        <div className="relative container mx-auto px-4 py-12 sm:py-16 lg:py-24">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-elegant font-bold mb-6 text-center bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
            O nama
          </h1>
          <p className="text-lg sm:text-xl text-dark-700 text-center max-w-3xl mx-auto mb-12 font-light">
            Elegantne sunčane naočale za modernu ženu.
          </p>

          <div className="max-w-3xl mx-auto space-y-6 text-dark-700">
            <p className="text-base leading-relaxed">
              Dobrodošli u Mareta. Posvećeni smo kvaliteti i stilu – svaki par naočala odabran je s pažnjom kako biste se osjećale posebno.
            </p>
            <p className="text-base leading-relaxed">
              Ovdje možete dodati više teksta o povijesti brenda, vrijednostima, timu ili bilo čemu drugome što želite podijeliti s posjetiteljima.
            </p>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-full hover:from-primary-500 hover:to-primary-600 transition-all duration-300 font-semibold shadow-elegant"
            >
              Natrag na početnu
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
