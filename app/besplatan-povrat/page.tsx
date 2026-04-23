import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Besplatan povrat - Mareta",
  description: "Informacije o besplatnom povratu proizvoda na Mareta web shopu.",
};

export default function BesplatanPovratPage() {
  return (
    <main className="min-h-screen bg-gradient-soft py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-elegant font-bold mb-6 text-center bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
          Besplatan povrat
        </h1>

        <div className="bg-white rounded-lg shadow-elegant p-6 sm:p-8 space-y-5 text-dark-800">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Imam li pravo na povrat?</h2>
              <p>
                Svaki kupac ima pravo na povrat narudžbe za sve proizvode kupljene u Mareta web
                shopu.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">U kojem roku moram zatražiti povrat?</h2>
              <p>
                Povrat za sve proizvode morate zatražiti u roku od <strong>14 dana</strong> od
                trenutka primitka paketa.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">
                Mogu li proizvod kupljen u web shopu vratiti u fizičku trgovinu?
              </h2>
              <p>
                Povrat se trenutno obavlja isključivo putem dostavne službe, nakon odobrenja
                zahtjeva za povrat.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">
                Što se događa nakon što zatražim povrat? Koliko vremena imam za povrat proizvoda?
              </h2>
              <p>
                Nakon što zatražite povrat, naš tim će vas kontaktirati i poslati upute za izvršenje
                povrata. Ako je zahtjev odobren, proizvod je potrebno poslati unutar{" "}
                <strong>2 radna dana</strong> od odobrenja zahtjeva.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">Kako pokrećem zahtjev za povrat?</h2>
              <p>
                Zahtjev za povrat pokrećete slanjem e-maila s naslovom{" "}
                <strong>&quot;Zahtjev za povrat&quot;</strong> na adresu{" "}
                <strong>maretasunglasseshr@gmail.com</strong>, unutar 14 dana od primitka paketa.
                U zahtjevu navedite broj narudžbe i razlog povrata.
              </p>
              <p className="mt-2">
                Nakon što zaprimimo e-mail, naša podrška će vas kontaktirati u najkraćem mogućem
                roku s daljnjim koracima. Molimo da uz vraćeni proizvod priložite potvrdu kupnje
                (račun ili narudžbu), te da proizvod bude pravilno zapakiran (zaštitna vanjska
                ambalaža iznad originalne ambalaže).
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">
                Ako vratim proizvod, hoću li dobiti puni iznos koji sam platio/la?
              </h2>
              <p>
                Ako utvrdimo da je vraćeni proizvod neoštećen i u originalnom pakiranju, povrat
                sredstava izvršava se prema načinu plaćanja i pravilima povrata.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">
                Što ako sam primio/la pogrešan proizvod ili proizvod s greškom?
              </h2>
              <p>
                Ako ste primili proizvod koji niste naručili ili proizvod s greškom, kontaktirajte
                nas najkasnije u roku od 14 dana od primitka pošiljke na{" "}
                <strong>maretasunglasseshr@gmail.com</strong> kako bismo dogovorili zamjenu ili
                povrat novca.
              </p>
            </div>
          </div>

          <div className="border-t pt-4 text-sm text-gray-600 space-y-2">
            <p>
              Mareta jamči da su svi proizvodi kupljeni na web shopu ispravni. Fotografije
              proizvoda su ilustrativne prirode i moguća su manja odstupanja u prikazu boja,
              ovisno o postavkama zaslona.
            </p>
            <p>
              U slučaju da odgovor na e-mail čekate dulje od 3 radna dana, možete nam se javiti i
              putem Instagram profila{" "}
              <Link
                href="https://www.instagram.com/mareta_hr/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary-600 hover:text-primary-500"
              >
                @mareta_hr
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
