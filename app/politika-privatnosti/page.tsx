import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politika privatnosti - Mareta",
  description: "Informacije o obradi i zaštiti osobnih podataka na Mareta web shopu.",
};

export default function PolitikaPrivatnostiPage() {
  return (
    <main className="min-h-screen bg-gradient-soft py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-elegant font-bold mb-6 text-center bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
          Politika privatnosti
        </h1>

        <div className="bg-white rounded-lg shadow-elegant p-6 sm:p-8 space-y-6 text-dark-800">
          <p>
            Ova Politika privatnosti objašnjava kako Mareta prikuplja, koristi i štiti osobne
            podatke korisnika web trgovine.
          </p>

          <section>
            <h2 className="text-lg font-semibold mb-2">1. Koje podatke prikupljamo</h2>
            <p>
              Prilikom registracije, narudžbe ili slanja upita možemo prikupljati: ime i
              prezime, adresu, e-mail adresu, broj telefona, podatke o narudžbi i komunikaciji
              s korisničkom podrškom.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Svrha obrade podataka</h2>
            <p>Podatke obrađujemo radi:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>obrade i dostave narudžbi,</li>
              <li>komunikacije s kupcima,</li>
              <li>rješavanja povrata, zamjena i reklamacija,</li>
              <li>ispunjavanja zakonskih obveza.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Dijeljenje podataka</h2>
            <p>
              Podatke dijelimo samo s pouzdanim partnerima nužnima za rad web shopa, poput
              dostavnih službi i pružatelja platnih usluga, isključivo u mjeri potrebnoj za
              izvršenje usluge.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Sigurnost podataka</h2>
            <p>
              Poduzimamo odgovarajuće tehničke i organizacijske mjere kako bismo zaštitili
              osobne podatke od neovlaštenog pristupa, gubitka ili zlouporabe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Vaša prava</h2>
            <p>
              Korisnici imaju pravo zatražiti pristup svojim podacima, ispravak, brisanje,
              ograničenje obrade i prigovor na obradu, u skladu s važećim propisima.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Kontakt</h2>
            <p>
              Za sva pitanja vezana uz privatnost i obradu podataka možete nam se javiti na:
              <br />
              <strong>maretasunglasseshr@gmail.com</strong>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
