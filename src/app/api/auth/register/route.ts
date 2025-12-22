import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password, fullName, role } = await request.json()

    if (!username || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      )
    }

    // Kullanıcı var mı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email: username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10)

    // İsmi ayır
    const nameParts = fullName.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        email: username,
        password: hashedPassword,
        firstName,
        lastName,
        visibleName: fullName,
        role,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
