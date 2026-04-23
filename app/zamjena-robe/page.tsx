import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zamjena robe - Mareta",
  description: "Pravila i postupak zamjene robe za kupnju na Mareta web shopu.",
};

export default function ZamjenaRobePage() {
  return (
    <main className="min-h-screen bg-gradient-soft py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-elegant font-bold mb-6 text-center bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
          Zamjena robe
        </h1>

        <div className="bg-white rounded-lg shadow-elegant p-6 sm:p-8 space-y-6 text-dark-800">
          <p>
            Svi kupci imaju pravo na zamjenu robe. Zamjena je moguća unutar 14 dana od
            primitka pošiljke. Zahtjev za zamjenu morate podnijeti putem e-maila na adresu{" "}
            <strong>maretasunglasseshr@gmail.com</strong> s naslovom <strong>&quot;Zamjena robe&quot;</strong>{" "}
            unutar 14 dana od primitka pošiljke.
          </p>

          <p>
            U e-mailu trebate navesti broj narudžbe i jasno napisati želite li zamijeniti
            proizvod za isti proizvod druge veličine, boje ili za neki drugi proizvod iz naše
            ponude. Nakon odobrenja zahtjeva, proizvod trebate vratiti na našu adresu unutar
            2 radna dana.
          </p>

          <p>
            Nakon što utvrdimo da je vraćeni proizvod neoštećen i u originalnoj ambalaži,
            izvršit ćemo zamjenu. Ako mijenjate proizvod za proizvod veće vrijednosti, bit ćete
            dužni uplatiti razliku na naš račun. U slučaju da je zamjena za proizvod manje
            vrijednosti, novac će biti vraćen na vaš račun.
          </p>

          <div className="border-t pt-6 space-y-5">
            <h2 className="text-xl font-semibold">Često postavljena pitanja</h2>

            <div>
              <h3 className="font-semibold mb-1">
                Je li moguće zamijeniti proizvod kupljen u web shopu u fizičkoj trgovini?
              </h3>
              <p>
                Ne, sve proizvode kupljene u Mareta web shopu možete zamijeniti putem
                kontaktiranja na adresu <strong>maretasunglasseshr@gmail.com</strong> unutar 14 dana od
                primitka paketa.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">
                Što ako želim zamijeniti proizvod za jeftiniji proizvod i dobiti natrag razliku
                novca?
              </h3>
              <p>
                To je moguće. Molimo kontaktirajte naše osoblje na{" "}
                <strong>maretasunglasseshr@gmail.com</strong>, pokrenite zahtjev za zamjenu proizvoda i
                bit će vam pružene daljnje informacije o procesu povrata razlike novca.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">
                Je li moguće zamijeniti proizvod kupljen u web shopu za skuplji proizvod?
              </h3>
              <p>
                Da, to je moguće. Kontaktirajte naše osoblje na{" "}
                <strong>maretasunglasseshr@gmail.com</strong>, a oni će vam dati upute o izvršenju uplate
                razlike između cijena proizvoda.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">
                U kojem roku moram podnijeti zahtjev za zamjenu proizvoda?
              </h3>
              <p>
                Zahtjev za zamjenu proizvoda mora biti podnesen unutar 14 dana od primitka
                paketa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
