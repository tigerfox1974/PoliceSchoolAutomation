import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'

export default function HomePage() {
  const modules = [
    {
      title: '🎓 Dönem Yönetimi',
      description: 'Dönem oluştur, düzenle ve yönet. Aktif dönemleri takip et.',
      href: '/terms',
      icon: 'ph:graduation-cap-bold',
      color: 'bg-blue-600 hover:bg-blue-700',
      stats: 'Dönem Odaklı Mimari',
      available: true,
    },
    {
      title: '📚 Dersler',
      description: 'Ders tanımları, hedef saatler, program kapsamı ve alt ders yönetimi.',
      href: '/courses',
      icon: 'ph:book-open-bold',
      color: 'bg-green-600 hover:bg-green-700',
      stats: '27 Ders Tanımlı',
      available: true,
    },
    {
      title: '🎯 Özel Etkinlikler',
      description: 'YOKLAMA, MÜDİRİYET, Sosyal-Sportif Faaliyetler ve törenler.',
      href: '/special-events',
      icon: 'ph:calendar-star-bold',
      color: 'bg-orange-600 hover:bg-orange-700',
      stats: 'Düzenli Etkinlikler',
      available: true,
    },
    {
      title: '🎤 Konferanslar',
      description: 'Dış konuşmacılar ile konferans planlama ve takip sistemi.',
      href: '/conferences',
      icon: 'ph:chats-circle-bold',
      color: 'bg-purple-600 hover:bg-purple-700',
      stats: 'Konferans Takvimi',
      available: true,
    },
    {
      title: '👨‍🏫 Dıştan Gelen Eğitmenler',
      description: 'Dış eğitmen profilleri, uzmanlık alanları ve iletişim bilgileri.',
      href: '/external-speakers',
      icon: 'ph:user-circle-bold',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      stats: 'Uzman Eğitmenler',
      available: true,
    },
    {
      title: '🏫 Sınıf Yönetimi',
      description: 'Sınıf tanımları, kapasite yönetimi ve Bilgisayar Lab ataması.',
      href: '/classes',
      icon: 'ph:chalkboard-bold',
      color: 'bg-teal-600 hover:bg-teal-700',
      stats: 'Yakında',
      available: false,
    },
    {
      title: '👥 Eğitmen Yönetimi',
      description: 'Eğitmen profilleri, ders atamaları ve müsaitlik yönetimi.',
      href: '/instructors',
      icon: 'ph:users-three-bold',
      color: 'bg-cyan-600 hover:bg-cyan-700',
      stats: 'Eğitmen Kayıtları',
      available: true,
    },
    {
      title: '📅 Ders Programı',
      description: 'Haftalık/Günlük ders programı, eğitmen rotasyonu ve müfredat takibi.',
      href: '/schedule',
      icon: 'ph:calendar-dots-bold',
      color: 'bg-rose-600 hover:bg-rose-700',
      stats: 'Yakında',
      available: false,
    },
    {
      title: '📊 Raporlar ve İstatistikler',
      description: 'Dönem ilerlemesi, eğitmen iş yükü ve müfredat takip raporları.',
      href: '/reports',
      icon: 'ph:chart-bar-bold',
      color: 'bg-amber-600 hover:bg-amber-700',
      stats: 'Yakında',
      available: false,
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src="/polis-okulu-logo.png"
                alt="KKTC Polis Okulu Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                KKTC Polis Okulu
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Eğitim ve Operasyon Yönetim Sistemi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Modüller</p>
                <p className="text-3xl font-bold text-blue-600">6</p>
              </div>
              <Icon icon="ph:check-circle-bold" width="40" className="text-blue-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Ders</p>
                <p className="text-3xl font-bold text-green-600">27</p>
              </div>
              <Icon icon="ph:book-open-bold" width="40" className="text-green-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Geliştirme</p>
                <p className="text-3xl font-bold text-purple-600">%30</p>
              </div>
              <Icon icon="ph:code-bold" width="40" className="text-purple-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Yakında</p>
                <p className="text-3xl font-bold text-orange-600">3</p>
              </div>
              <Icon icon="ph:rocket-launch-bold" width="40" className="text-orange-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Module Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            📋 Sistem Modülleri
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <div key={index}>
                {module.available ? (
                  <Link
                    href={module.href}
                    className={`block ${module.color} text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-6 h-full`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">
                        <Icon icon={module.icon} width="48" />
                      </div>
                      <span className="bg-white/20 text-xs px-3 py-1 rounded-full backdrop-blur">
                        {module.stats}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {module.description}
                    </p>

                    <div className="mt-4 flex items-center text-sm font-medium">
                      <span>Modüle Git</span>
                      <Icon icon="ph:arrow-right-bold" width="16" className="ml-2" />
                    </div>
                  </Link>
                ) : (
                  <div className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl shadow p-6 h-full opacity-60 cursor-not-allowed">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl opacity-50">
                        <Icon icon={module.icon} width="48" />
                      </div>
                      <span className="bg-gray-300 dark:bg-gray-600 text-xs px-3 py-1 rounded-full">
                        {module.stats}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                    <p className="text-sm leading-relaxed opacity-75">
                      {module.description}
                    </p>

                    <div className="mt-4 flex items-center text-sm font-medium">
                      <Icon icon="ph:lock-bold" width="16" className="mr-2" />
                      <span>Geliştiriliyor</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            ⚡ Hızlı Erişim
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/terms"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Icon icon="ph:graduation-cap-bold" width="24" className="text-blue-600" />
              <span className="text-sm font-medium">Dönemler</span>
            </Link>
            <Link
              href="/courses"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Icon icon="ph:book-open-bold" width="24" className="text-green-600" />
              <span className="text-sm font-medium">Dersler</span>
            </Link>
            <Link
              href="/special-events"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Icon icon="ph:calendar-star-bold" width="24" className="text-orange-600" />
              <span className="text-sm font-medium">Özel Etkinlikler</span>
            </Link>
            <Link
              href="/conferences"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Icon icon="ph:chats-circle-bold" width="24" className="text-purple-600" />
              <span className="text-sm font-medium">Konferanslar</span>
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>v1.0.0 - Geliştirme Sürümü | FAZ 1.1, 1.2, 1.3 Tamamlandı</p>
        </div>
      </div>
    </main>
  )
}
