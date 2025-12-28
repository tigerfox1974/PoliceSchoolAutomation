const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Dönemler kontrol ediliyor...\n')
  
  // Tüm dönemler (silinenler dahil)
  const allTerms = await prisma.term.findMany({
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`📊 Toplam dönem sayısı: ${allTerms.length}\n`)
  
  if (allTerms.length === 0) {
    console.log('⚠️  Veritabanında hiç dönem yok!')
    console.log('💡 Yeni dönem oluşturmanız gerekiyor.')
  } else {
    console.log('📋 Tüm dönemler:')
    allTerms.forEach((term, index) => {
      console.log(`\n${index + 1}. ${term.name} (${term.termCode})`)
      console.log(`   ID: ${term.id}`)
      console.log(`   Tip: ${term.termType}`)
      console.log(`   Süre: ${term.duration}`)
      console.log(`   Durum: ${term.status}`)
      console.log(`   isDeleted: ${term.isDeleted}`)
      console.log(`   deletedAt: ${term.deletedAt || 'null'}`)
      console.log(`   Oluşturulma: ${term.createdAt}`)
    })
    
    // Aktif dönemler
    const activeTerms = allTerms.filter(t => !t.isDeleted)
    console.log(`\n✅ Aktif dönemler: ${activeTerms.length}`)
    
    if (activeTerms.length === 0 && allTerms.length > 0) {
      console.log('⚠️  Tüm dönemler silinmiş görünüyor!')
      console.log('💡 isDeleted değerlerini kontrol edin.')
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

