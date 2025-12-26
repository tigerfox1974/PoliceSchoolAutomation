export interface Instructor {
  id: string
  tcKimlikNo: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  instructorType: 'CADRE' | 'EXTERNAL'
  rank: string | null
  badgeNumber: string | null
  institution: string | null
  branch: string | null
  isActive: boolean
  courseInstructors: {
    id: string
    course: {
      id: string
      code: string
      name: string
      programScope: string
    }
  }[]
  _count: {
    courseInstructors: number
    dailyLessons: number
  }
}

