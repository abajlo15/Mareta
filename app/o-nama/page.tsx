import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "O nama - Mareta",
  description:
    "Mareta je nastala u Zadru – sunčane naočale za svaki dan, s fokusom na kvalitetu, UV zaštitu i jednostavnom eleganciji.",
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
            Iz Zadra, za sunce i za svaki dan.
          </p>

          <div className="max-w-3xl mx-auto space-y-6 text-dark-700">
            <p className="text-base leading-relaxed">
              Mareta je krenula iz Zadra, grada u kojem sunčane naočale nisu modni dodatak koji izvlačiš iz ladice par puta godišnje. Ovdje su one stvar opće kulture, prva stvar koju uzimaš uz ključeve i mobitel kad izlaziš iz kuće, bez obzira na godišnje doba. Iz te cjelogodišnje tradicije i želje za jednostavnim, a kvalitetnim stvarima, nastala je naša priča.
            </p>
            <p className="text-base leading-relaxed">
              Nismo htjeli stvarati još jedan brend koji komplicira s visokom modom ili trendovima koji traju jedno ljeto. Pokrenuli smo Maretu s jasnim ciljem: ponuditi sunčane cvike koje i sami želimo nositi svaki dan. One koje dobro sjedaju na lice, idu uz svaku kombinaciju i u kojima se osjećaš opušteno, bilo da si u điru kroz Varoš, na kavi na Rivi ili na brodu usred kanala.
            </p>
            <p className="text-base leading-relaxed">
              Svaki model u našoj ponudi biramo osobno i testiramo ga na našem, zadarskom suncu koje zna biti prilično nemilosrdno. Zato nam je estetika važna, ali kvaliteta stakala i dobra UV zaštita su nam na prvom mjestu. Želimo da tvoje oči budu odmorene i zaštićene, a da pritom ne moraš razmišljati jesi li naočale preplatio.
            </p>
            <p className="text-base leading-relaxed">
              Radimo polako, iskreno i bez pritiska. Vjerujemo u dobre materijale, pristupačnu cijenu i fer odnos prema ljudima koji biraju naš brend. Hvala ti što nas pratiš u ovom našem điru.
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
