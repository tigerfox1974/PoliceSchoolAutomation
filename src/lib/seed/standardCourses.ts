export type StandardCourseSeed = {
  name: string
  code: string
  fourMonthHours: number | null
  sixMonthHours: number | null
  requiresLab: boolean
  programScope: 'COMMON' | 'POLIS_ONLY' | 'ITFAIYE_ONLY'
  courseType?: 'STANDARD' | 'CONFERENCE' | 'PANEL'
}

export const POLICE_STANDARD_COURSES: StandardCourseSeed[] = [
  { name: 'Ceza Hukuku ve Uygulamalari', code: 'CZH101', fourMonthHours: 40, sixMonthHours: 55, requiresLab: false, programScope: 'POLIS_ONLY' },
  { name: 'Ceza Muhakemeleri Usul Yasasi ve Uygulamalari', code: 'CMK101', fourMonthHours: 40, sixMonthHours: 55, requiresLab: false, programScope: 'POLIS_ONLY' },
  { name: 'Polislige Giris', code: 'POL101', fourMonthHours: 24, sixMonthHours: 32, requiresLab: false, programScope: 'POLIS_ONLY' },
  { name: 'Polise Yetki, Gorev Veren Yasa ve Uygulamalar', code: 'POL201', fourMonthHours: 46, sixMonthHours: 60, requiresLab: false, programScope: 'POLIS_ONLY' },
  { name: 'Hukuka Giris ve Insan Haklari', code: 'HUK101', fourMonthHours: 12, sixMonthHours: 18, requiresLab: false, programScope: 'POLIS_ONLY' },

  { name: 'Meslek Trafik Egitimi ve Guvenligi', code: 'TRF101', fourMonthHours: 28, sixMonthHours: 40, requiresLab: false, programScope: 'POLIS_ONLY' },
  { name: 'Devlet Guvenligi ve Istihbarat', code: 'IST101', fourMonthHours: 8, sixMonthHours: 12, requiresLab: false, programScope: 'POLIS_ONLY' },
  { name: 'Meslek Teknik Yazisma Usul ve Esaslari', code: 'YZS101', fourMonthHours: 12, sixMonthHours: 18, requiresLab: false, programScope: 'POLIS_ONLY' },
  { name: 'Olay Yeri Guvenligi', code: 'OYG101', fourMonthHours: 8, sixMonthHours: 12, requiresLab: false, programScope: 'POLIS_ONLY' },
  { name: 'Toplumsal Olaylar ve Onleyici Hizmetler Uygulamalari', code: 'TOP101', fourMonthHours: 20, sixMonthHours: 28, requiresLab: false, programScope: 'POLIS_ONLY' },

  { name: 'Beden Egitimi', code: 'BDN101', fourMonthHours: 16, sixMonthHours: 24, requiresLab: false, programScope: 'COMMON' },
  { name: 'Bilgisayar Destekli Polis Uygulamalari', code: 'BDP101', fourMonthHours: 12, sixMonthHours: 18, requiresLab: true, programScope: 'POLIS_ONLY' },
  { name: 'Temel Seviye Bilgisayar Kullanimi (Word-Excel)', code: 'BLG101', fourMonthHours: 14, sixMonthHours: 20, requiresLab: true, programScope: 'COMMON' },
  { name: 'Elektronik Belge Yonetim Sistemi (EBYS)', code: 'EBYS101', fourMonthHours: 8, sixMonthHours: 12, requiresLab: true, programScope: 'POLIS_ONLY' },
  { name: 'Polis Mudahale Yontemi ve Teknikleri', code: 'MUD101', fourMonthHours: 20, sixMonthHours: 28, requiresLab: false, programScope: 'POLIS_ONLY' },
  { name: 'Polis Uygulamalari', code: 'UYG101', fourMonthHours: 42, sixMonthHours: 56, requiresLab: false, programScope: 'POLIS_ONLY' },
  { name: 'Silah Bilgisi ve Atis', code: 'SLH101', fourMonthHours: 30, sixMonthHours: 40, requiresLab: false, programScope: 'POLIS_ONLY' },
  { name: 'Yanasik Duzen', code: 'YND101', fourMonthHours: 15, sixMonthHours: 20, requiresLab: false, programScope: 'POLIS_ONLY' },

  { name: 'Ingilizce', code: 'ING101', fourMonthHours: 30, sixMonthHours: 42, requiresLab: false, programScope: 'COMMON' },
  { name: 'Sosyal Psikoloji', code: 'PSI101', fourMonthHours: 10, sixMonthHours: 14, requiresLab: false, programScope: 'COMMON' },
  { name: 'Saglik Bilgisi ve Ilk Yardim', code: 'ILK101', fourMonthHours: 35, sixMonthHours: 48, requiresLab: false, programScope: 'COMMON' },

  // KONFERANSLAR (18 saat)
  { name: 'Yangin ve Tabi Afetler', code: 'KNF101', fourMonthHours: 2, sixMonthHours: 3, requiresLab: false, programScope: 'POLIS_ONLY', courseType: 'CONFERENCE' },
  { name: 'Uyusturucu Maddeler ve Zararlari', code: 'KNF102', fourMonthHours: 2, sixMonthHours: 3, requiresLab: false, programScope: 'COMMON', courseType: 'CONFERENCE' },
  { name: 'Polis - Halkla Iliskiler', code: 'KNF103', fourMonthHours: 2, sixMonthHours: 3, requiresLab: false, programScope: 'POLIS_ONLY', courseType: 'CONFERENCE' },
  { name: 'Kriminalistik Konulari', code: 'KNF104', fourMonthHours: 6, sixMonthHours: 8, requiresLab: false, programScope: 'POLIS_ONLY', courseType: 'CONFERENCE' },
  { name: 'Guvenlik Kuvvetleri Komutanligi Tanitimi ve Bilgilendirme Konferansi', code: 'KNF105', fourMonthHours: 2, sixMonthHours: 3, requiresLab: false, programScope: 'POLIS_ONLY', courseType: 'CONFERENCE' },
  { name: 'Tarih', code: 'KNF106', fourMonthHours: 2, sixMonthHours: 3, requiresLab: false, programScope: 'COMMON', courseType: 'CONFERENCE' },
  { name: 'Beden Dili ve Kriz Anlarinda Iletisim ve Duygu Kontrolu', code: 'KNF107', fourMonthHours: 2, sixMonthHours: 3, requiresLab: false, programScope: 'COMMON', courseType: 'CONFERENCE' },
]

export const FIRE_STANDARD_COURSES: StandardCourseSeed[] = [
  { name: 'Ceza Hukuku', code: 'ITF-CZH101', fourMonthHours: 3, sixMonthHours: null, requiresLab: false, programScope: 'ITFAIYE_ONLY' },
  { name: 'Ceza Muhakemeleri Usul Yasasi', code: 'ITF-CMK101', fourMonthHours: 4, sixMonthHours: null, requiresLab: false, programScope: 'ITFAIYE_ONLY' },
  { name: 'Polis Yasasi ve Tuzukleri (Polislige Giris)', code: 'ITF-POL101', fourMonthHours: 24, sixMonthHours: null, requiresLab: false, programScope: 'ITFAIYE_ONLY' },
  { name: 'Trafik Bilgisi', code: 'ITF-TRF101', fourMonthHours: 5, sixMonthHours: null, requiresLab: false, programScope: 'ITFAIYE_ONLY' },
  { name: 'Anayasa ve Insan Haklari', code: 'ITF-HUK101', fourMonthHours: 5, sixMonthHours: null, requiresLab: false, programScope: 'ITFAIYE_ONLY' },

  { name: 'Mesleki Teknik Yazisma Usul ve Esaslari', code: 'ITF-YZS101', fourMonthHours: 12, sixMonthHours: null, requiresLab: false, programScope: 'ITFAIYE_ONLY' },
  { name: 'Elektronik Belge Yonetim Sistemi (EBYS)', code: 'ITF-EBYS101', fourMonthHours: 8, sixMonthHours: null, requiresLab: true, programScope: 'ITFAIYE_ONLY' },
  { name: 'Talimatlar', code: 'TAL101', fourMonthHours: 9, sixMonthHours: 14, requiresLab: false, programScope: 'ITFAIYE_ONLY' },
  { name: 'Yanginlar', code: 'YNG101', fourMonthHours: 114, sixMonthHours: 152, requiresLab: false, programScope: 'ITFAIYE_ONLY' },
  { name: 'Toplumsal Olaylar (Polis Taktikleri)', code: 'TOP201', fourMonthHours: 7, sixMonthHours: 10, requiresLab: false, programScope: 'ITFAIYE_ONLY' },

  { name: 'Beden Egitimi', code: 'BDN101', fourMonthHours: 16, sixMonthHours: 24, requiresLab: false, programScope: 'COMMON' },
  { name: 'Temel Seviye Bilgisayar Kullanimi (Word-Excel)', code: 'BLG101', fourMonthHours: 14, sixMonthHours: 20, requiresLab: true, programScope: 'COMMON' },
  { name: 'Saglik Bilgisi ve Ilk Yardim', code: 'ILK101', fourMonthHours: 35, sixMonthHours: 48, requiresLab: false, programScope: 'COMMON' },
  { name: 'Ingilizce', code: 'ING101', fourMonthHours: 30, sixMonthHours: 42, requiresLab: false, programScope: 'COMMON' },
]

export function getStandardCoursesForTermType(termType: 'POLICE' | 'FIRE') {
  return termType === 'POLICE' ? POLICE_STANDARD_COURSES : FIRE_STANDARD_COURSES
}
