export interface Course {
  id: string
  name: string
  code: string
  fourMonthHours: number | null
  sixMonthHours: number | null
  requiresLab: boolean
  programScope: 'COMMON' | 'POLIS_ONLY' | 'ITFAIYE_ONLY'
  credit: number | null
  description: string | null
  parentCourse: {
    id: string
    name: string
    code: string
  } | null
  subCourses: {
    id: string
    name: string
    code: string
    weightPercentage: number | null
  }[]
  _count: {
    subCourses: number
    courseInstructors: number
    dailyLessons: number
  }
}

