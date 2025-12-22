import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          🚔 KKTC Polis Okulu
        </h1>
        <h2 className="text-2xl mb-8">
          Eğitim ve Operasyon Yönetim Sistemi
        </h2>
        
        <div className="mt-8 space-y-4">
          <Link
            href="/terms"
            className="block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 text-xl font-semibold"
          >
            🎓 Dönem Yönetimi
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Dönem Odaklı Mimari - Her şey dönem içinde tanımlanır
          </p>
        </div>
      </div>
    </main>
  )
}
