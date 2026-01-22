declare module '@iconify/react' {
  import * as React from 'react'

  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    icon: string | object
    width?: string | number
    height?: string | number
    className?: string
  }

  export const Icon: React.FC<IconProps>
}
