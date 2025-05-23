import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl font-bold text-blue-400">
          fridaysdining
        </h1>

        <p className="text-lg text-gray-300 leading-relaxed">
          Was als spontanes Freitagsritual begann, wurde zu einer kleinen kulinarischen Mission:  
          Wir – Ünal, Hüseyin und Burak – gehen (fast) jeden Freitag gemeinsam essen.  
          Unser Ziel? Neue Restaurants ausprobieren, bewerten und den Geschmack der Woche finden. 🍽️✨
        </p>

        <p className="text-gray-400 leading-relaxed text-sm">
          Ünal und Hüseyin arbeiten als Qualitätstechniker – ganz im Zeichen präziser Analyse.  
          Burak hingegen promoviert in der Virologie – also auch er kennt sich bestens mit Proben aus. 😉  
          Gemeinsam bewerten wir nicht nur Geschmack, sondern das komplette Erlebnis – strukturiert, ehrlich und mit einem Augenzwinkern.
        </p>

        <p className="text-gray-400 text-sm">
          Mit <span className="text-blue-300 font-semibold">fridaysdining</span> wollen wir unsere Bewertungen festhalten – und teilen.  
          Diese Seite ist unser digitales Notizbuch für kulinarische Abenteuer.
        </p>

        <div className="flex justify-center gap-4 flex-wrap mt-4">
          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded text-lg font-semibold"
          >
            Einloggen
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded text-lg font-semibold"
          >
            Registrieren
          </button>
          <button
            onClick={() => navigate('/top')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded text-lg font-semibold"
          >
            Bestenliste ansehen
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Nur eingeladene Mitglieder können bewerten. Gäste dürfen zuschauen – wenn der Admin das erlaubt.
        </p>
      </div>
    </div>
  );
}
