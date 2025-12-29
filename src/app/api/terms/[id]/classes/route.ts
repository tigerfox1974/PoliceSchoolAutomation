import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Döneme ait sınıfları listele
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classes = await prisma.class.findMany({
      where: { 
        termId: params.id,
        isDeleted: false, // Soft delete filtresi
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ classes })
  } catch (error) {
    console.error('Classes fetch error:', error)
    return NextResponse.json(
      { error: 'Sınıflar yüklenemedi' },
      { status: 500 }
    )
  }
}

// Döneme yeni sınıf ekle (DÖNEM ODAKLI MİMARİ)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // params.id array olabilir, string'e çevir
    const termId = Array.isArray(params.id) ? params.id[0] : params.id
    
    if (!termId) {
      return NextResponse.json(
        { error: 'Dönem ID gereklidir' },
        { status: 400 }
      )
    }
    
    const data = await request.json()
    let { name, capacity } = data

    if (!name || !capacity) {
      return NextResponse.json(
        { error: 'Sınıf adı ve kapasite gereklidir' },
        { status: 400 }
      )
    }

    // İSİM NORMALİZASYONU: Kullanıcı dostu dönüşümler
    // "F" → "F Sınıfı", "A" → "A Sınıfı", vb.
    const trimmedName = name.trim()
    let normalizedName = trimmedName
    
    // Özel isimler: Laboratuvar, Lab içerenler değişmemeli
    const isSpecialName = /laboratuvar|lab/i.test(trimmedName)
    
    // "Sınıf" veya "Sınıfı" kelimesi var mı kontrol et
    const hasClassWord = /sınıf|sınıfı/i.test(trimmedName)
    
    // Tek harf ise (A, B, C, D, E, F, G, vb.) → "X Sınıfı" formatına çevir
    if (/^[A-Z]$/i.test(trimmedName)) {
      normalizedName = `${trimmedName.toUpperCase()} Sınıfı`
    }
    // "X Sınıfı" formatında değilse ve tek harf + "Sınıfı" içermiyorsa, kontrol et
    else if (!/Sınıfı/i.test(trimmedName) && /^[A-Z]\s*$/i.test(trimmedName)) {
      normalizedName = `${trimmedName.toUpperCase()} Sınıfı`
    }
    // Eğer "Sınıf" veya "Sınıfı" kelimesi yoksa ve özel isim değilse → "Sınıfı" ekle
    else if (!hasClassWord && !isSpecialName) {
      normalizedName = `${trimmedName} Sınıfı`
    }

    // Aynı dönemde aynı isimli aktif sınıf var mı kontrol et (silinen sınıflar hariç)
    const existingClass = await prisma.class.findFirst({
      where: {
        termId: termId,
        name: normalizedName,
        isDeleted: false, // Sadece aktif sınıfları kontrol et
      },
    })

    if (existingClass) {
      return NextResponse.json(
        { error: 'Bu dönemde bu isimle bir sınıf zaten mevcut' },
        { status: 400 }
      )
    }

    // Code mantığı: Daha akıllı code üretimi
    // ÖNEMLİ: Code üretiminde sadece orijinal ismi (trimmedName) kullan, "Sınıfı" ekleme
    let classCode = ''
    
    // Lab için özel
    if (trimmedName.toLowerCase().includes('laboratuvar') || trimmedName.toLowerCase().includes('lab')) {
      classCode = 'LAB'
    } 
    // Tek harf ise (A, B, C, D, E, F, G, vb.) → sadece harfi kullan
    else if (/^[A-Z]$/i.test(trimmedName)) {
      classCode = trimmedName.toUpperCase()
    }
    // İsim "HABABAM", "A1", "AAA", "F1", "haba" gibi özel isimse
    else {
      // İlk harfi al
      const firstChar = trimmedName.charAt(0).toUpperCase()
      if (!firstChar || !/^[A-Z]$/.test(firstChar)) {
        // İlk karakter geçerli bir harf değilse, ismin tamamını temizle
        classCode = trimmedName
          .toUpperCase()
          .replace(/\s/g, '')
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 5) || 'CLS' // Fallback
      } else {
        classCode = firstChar
        
        // Eğer çakışma varsa, ismin ilk 3 harfini kullan
        // NOT: Prisma unique constraint tüm sınıfları (silinenler dahil) kontrol eder
        // Bu yüzden burada da tüm sınıfları kontrol etmeliyiz
        const existingCodeCheck = await prisma.class.findFirst({
          where: {
            termId: termId,
            code: classCode,
            // isDeleted filtresi YOK - çünkü unique constraint tüm sınıfları kontrol eder
          },
        })
        
        if (existingCodeCheck) {
          // Çakışma var, alternatif code üret
          if (trimmedName.length >= 3) {
            // İlk 3 harfi al ve büyük harfe çevir, boşlukları ve özel karakterleri kaldır
            classCode = trimmedName
              .substring(0, 3)
              .toUpperCase()
              .replace(/\s/g, '')
              .replace(/[^A-Z0-9]/g, '')
            
            // 3 harfli code da çakışıyorsa, ismin tamamını kullan
            // NOT: Tüm sınıfları kontrol et (silinenler dahil)
            const existingCodeCheck3 = await prisma.class.findFirst({
              where: {
                termId: termId,
                code: classCode,
                // isDeleted filtresi YOK
              },
            })
            
            if (existingCodeCheck3) {
              // İsmin tamamını kullan (boşluk ve özel karakterler olmadan)
              classCode = trimmedName
                .toUpperCase()
                .replace(/\s/g, '')
                .replace(/[^A-Z0-9]/g, '')
                .substring(0, 5) || 'CLS' // Fallback
            }
          } else {
            // 3 harften azsa, ismin tamamını kullan (boşluk ve özel karakterler olmadan)
            classCode = trimmedName
              .toUpperCase()
              .replace(/\s/g, '')
              .replace(/[^A-Z0-9]/g, '')
              .substring(0, 5) || 'CLS' // Fallback
          }
        }
      }
    }
    
    // Güvenlik kontrolü: classCode boş olamaz
    if (!classCode || classCode.length === 0) {
      // Son çare: ismin ilk 3 karakterini veya tamamını kullan (orijinal isimden)
      classCode = trimmedName
        .toUpperCase()
        .replace(/\s/g, '')
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 5) || 'CLS'
    }

    // Aynı dönemde aynı code'a sahip sınıf var mı kontrol et
    // NOT: Prisma unique constraint tüm sınıfları (silinenler dahil) kontrol eder
    // Bu yüzden burada da tüm sınıfları kontrol etmeliyiz
    const existingCode = await prisma.class.findFirst({
      where: {
        termId: termId,
        code: classCode,
        // isDeleted filtresi YOK - çünkü unique constraint tüm sınıfları kontrol eder
      },
    })

    if (existingCode) {
      // Eğer çakışan sınıf silinmişse, silinen sınıfın code'unu değiştir
      if (existingCode.isDeleted) {
        // Silinen sınıfın code'unu değiştir (örn: F -> F_DELETED_123456)
        const deletedCode = `${classCode}_DELETED_${Date.now().toString().slice(-6)}`
        
        try {
          await prisma.class.update({
            where: { id: existingCode.id },
            data: { code: deletedCode },
          })
          // Artık classCode kullanılabilir
        } catch (updateError) {
          console.error('Failed to update deleted class code:', updateError)
          // Güncelleme başarısız olursa, alternatif code üret
          let alternativeCode = classCode
          let counter = 1
          let foundUnique = false
          
          while (!foundUnique && counter < 100) {
            alternativeCode = `${classCode}${counter}`
            
            const checkAlternative = await prisma.class.findFirst({
              where: {
                termId: termId,
                code: alternativeCode,
              },
            })
            
            if (!checkAlternative) {
              foundUnique = true
              classCode = alternativeCode
            } else {
              counter++
            }
          }
          
          if (!foundUnique) {
            return NextResponse.json(
              { error: 'Sınıf oluşturulamadı. Lütfen farklı bir sınıf adı deneyin.' },
              { status: 500 }
            )
          }
        }
      } else {
        // Aktif sınıf var, hata döndür
        return NextResponse.json(
          { error: `Bu dönemde "${classCode}" kodlu bir sınıf zaten mevcut. Lütfen farklı bir sınıf adı kullanın.` },
          { status: 400 }
        )
      }
    }

    const newClass = await prisma.class.create({
      data: {
        name: normalizedName, // Normalize edilmiş ismi kullan
        code: classCode,
        capacity: parseInt(capacity),
        termId: termId,
      },
    })

    return NextResponse.json({ success: true, class: newClass })
  } catch (error) {
    console.error('Class create error:', error)
    const errorDetails: any = {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
    }
    
    // Sadece tanımlı değişkenleri logla
    try {
      if (typeof name !== 'undefined') errorDetails.name = name
      if (typeof capacity !== 'undefined') errorDetails.capacity = capacity
      if (typeof termId !== 'undefined') errorDetails.termId = termId
    } catch (e) {
      // Değişkenler tanımlı değilse sessizce geç
    }
    
    console.error('Error details:', errorDetails)
    
    return NextResponse.json(
      { 
        error: 'Sınıf oluşturulamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}
