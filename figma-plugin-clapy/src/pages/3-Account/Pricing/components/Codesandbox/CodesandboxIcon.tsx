import type { SVGProps } from 'react';
import { memo } from 'react';

const CodesandboxIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg preserveAspectRatio='none' viewBox='0 0 20 23' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M5.5 3.21L10 5.81L14.5 3.21M5.5 18.79V13.6L1 11M19 11L14.5 13.6V18.79M1.27 5.96L10 11.01L18.73 5.96M10 21.08V11M19 15V7C18.9996 6.64927 18.9071 6.30481 18.7315 6.00116C18.556 5.69752 18.3037 5.44536 18 5.27L11 1.27C10.696 1.09446 10.3511 1.00205 10 1.00205C9.64893 1.00205 9.30404 1.09446 9 1.27L2 5.27C1.69626 5.44536 1.44398 5.69752 1.26846 6.00116C1.09294 6.30481 1.00036 6.64927 1 7V15C1.00036 15.3507 1.09294 15.6952 1.26846 15.9988C1.44398 16.3025 1.69626 16.5546 2 16.73L9 20.73C9.30404 20.9055 9.64893 20.998 10 20.998C10.3511 20.998 10.696 20.9055 11 20.73L18 16.73C18.3037 16.5546 18.556 16.3025 18.7315 15.9988C18.9071 15.6952 18.9996 15.3507 19 15Z'
      stroke='#101828'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const Memo = memo(CodesandboxIcon);
export { Memo as CodesandboxIcon };
