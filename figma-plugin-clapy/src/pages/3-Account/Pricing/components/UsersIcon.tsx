import { memo, SVGProps } from 'react';

const UsersIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg preserveAspectRatio='none' viewBox='0 0 22 18' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M15.1667 16.5V14.8333C15.1667 13.9493 14.8155 13.1014 14.1904 12.4763C13.5652 11.8512 12.7174 11.5 11.8333 11.5H5.16667C4.28261 11.5 3.43477 11.8512 2.80964 12.4763C2.18452 13.1014 1.83333 13.9493 1.83333 14.8333V16.5M20.1667 16.5V14.8333C20.1661 14.0948 19.9203 13.3773 19.4678 12.7936C19.0153 12.2099 18.3818 11.793 17.6667 11.6083M14.3333 1.60833C15.0503 1.79192 15.6859 2.20892 16.1397 2.79359C16.5935 3.37827 16.8399 4.09736 16.8399 4.8375C16.8399 5.57764 16.5935 6.29673 16.1397 6.88141C15.6859 7.46608 15.0503 7.88308 14.3333 8.06667M11.8333 4.83333C11.8333 6.67428 10.3409 8.16667 8.5 8.16667C6.65905 8.16667 5.16667 6.67428 5.16667 4.83333C5.16667 2.99238 6.65905 1.5 8.5 1.5C10.3409 1.5 11.8333 2.99238 11.8333 4.83333Z'
      stroke='#667085'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const Memo = memo(UsersIcon);
export { Memo as UsersIcon };