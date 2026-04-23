import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reklamacije - Mareta",
  description: "Informacije o postupku reklamacije za kupnju na Mareta web shopu.",
};

export default function ReklamacijePage() {
  return (
    <main className="min-h-screen bg-gradient-soft py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-elegant font-bold mb-6 text-center bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
          Reklamacije
        </h1>

        <div className="bg-white rounded-lg shadow-elegant p-6 sm:p-8 space-y-4 text-dark-800">
          <p>
            Ako niste zadovoljni proizvodom koji ste kupili putem Mareta web trgovine, imate pravo
            na reklamaciju u skladu s važećim zakonskim rokovima.
          </p>
          <p>
            Za pokretanje reklamacije pošaljite e-mail s naslovom{" "}
            <strong>&quot;Reklamacija po narudžbi&quot;</strong> na adresu{" "}
            <strong>maretasunglasseshr@gmail.com</strong>. U poruci obavezno navedite broj
            narudžbe.
          </p>
          <p>
            Mareta jamči da su svi proizvodi kupljeni putem naše web trgovine ispravni.
            Fotografije proizvoda služe kao ilustracija i ne moraju uvijek u potpunosti
            odgovarati stvarnim proizvodima dostupnim za isporuku.
          </p>
          <p>
            Zbog individualnih postavki monitora, subjektivnog doživljaja boja i drugih tehničkih
            čimbenika, ne možemo jamčiti potpunu usklađenost boja proizvoda s prikazom na vašem
            zaslonu. U takvim situacijama reklamacija nije opravdana.
          </p>
          <p>
            Pravo na ostvarivanje jamstva kupac gubi u slučaju neovlaštene dorade proizvoda ili
            intervencije treće neovlaštene osobe.
          </p>

          <div className="border-t pt-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">
                Koliko dugo mogu podnijeti reklamaciju za naručeni proizvod?
              </h2>
              <p>Reklamaciju trebate podnijeti u skladu s važećim zakonskim rokovima.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">
                Ako primijetim da je proizvod oštećen, mogu li ga vratiti?
              </h2>
              <p>
                Naravno. Ako niste zadovoljni proizvodom, pošaljite e-mail s naslovom{" "}
                <strong>&quot;Reklamacija po narudžbi&quot;</strong> na{" "}
                <strong>maretasunglasseshr@gmail.com</strong> i navedite broj narudžbe.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">Kako teče postupak reklamacije?</h2>
              <p>
                Kada podnosite reklamaciju, kupac je obvezan vratiti proizvod u dogovorenom roku.
                Reklamacija će biti prihvaćena ako pregledom utvrdimo da su ispunjeni uvjeti za
                reklamaciju sukladno Zakonu o obveznim odnosima i Zakonu o zaštiti potrošača.
              </p>
              <p className="mt-2">
                U tom slučaju, u roku od 15 dana od primitka valjane reklamacije, zamijenit ćemo
                proizvod ili vratiti cjelokupan plaćeni iznos.
              </p>
              <p className="mt-2">
                Reklamacije koje se šalju kurirskom službom moraju biti pravilno zapakirane u
                kartonsku ambalažu. Reklamacije koje nisu odgovarajuće zapakirane ili su vidljivo
                oštećene tijekom transporta neće biti prihvaćene i bit će vraćene pošiljatelju o
                njegovu trošku.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
