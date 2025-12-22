import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      )
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: username },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { status: 401 }
      )
    }

    // Şifre kontrolü
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { status: 401 }
      )
    }

    // Başarılı giriş
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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
