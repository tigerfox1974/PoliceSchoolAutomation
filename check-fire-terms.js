const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkFireTerms() {
  try {
    const fireTerms = await prisma.term.findMany({
      where: { termType: 'FIRE' }
    })
    
    console.log('=== İTFAİYE DÖNEMLERİ ===')
    console.log('Toplam:', fireTerms.length)
    
    if (fireTerms.length > 0) {
      console.log('\nKayıtlar:')
      fireTerms.forEach(term => {
        console.log(`- ${term.termCode}: ${term.name} (Dönem No: ${term.termNumber})`)
      })
    } else {
      console.log('\n❌ İtfaiye tipinde dönem bulunamadı.')
    }
    
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkFireTerms()
