import { memo, SVGProps } from 'react';

const Frame31Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <g filter='url(#filter0_dd_280_37351)'>
      <rect
        x={0.529297}
        y={0.588257}
        width={14.8235}
        height={14.8235}
        rx={3.24265}
        fill='url(#paint0_linear_280_37351)'
      />
      <path
        d='M8.86427 12.0518C8.28083 12.0518 7.72953 11.9478 7.21037 11.7398C6.69615 11.5318 6.24127 11.2421 5.84572 10.8707C5.45017 10.4993 5.13867 10.071 4.91123 9.58572C4.68379 9.09547 4.57007 8.57304 4.57007 8.01843C4.57007 7.48857 4.67637 6.98347 4.88898 6.50313C5.10653 6.01784 5.40814 5.58455 5.7938 5.20325C6.17947 4.82195 6.63188 4.52236 7.15104 4.30447C7.6702 4.08163 8.23633 3.97021 8.84943 3.97021C9.33893 3.97021 9.80865 4.03954 10.2586 4.1782C10.7135 4.3119 11.0719 4.48026 11.334 4.68329L10.4366 6.51056C10.13 6.29268 9.74437 6.18373 9.2796 6.18373C8.86921 6.18373 8.52558 6.27534 8.24869 6.45856C7.97181 6.64179 7.76414 6.87453 7.6257 7.15679C7.4922 7.43905 7.42545 7.72379 7.42545 8.011C7.42545 8.34278 7.50209 8.64732 7.65537 8.92463C7.80864 9.20194 8.02619 9.42478 8.30802 9.59314C8.58985 9.75656 8.91866 9.83827 9.29443 9.83827C9.53176 9.83827 9.74931 9.80855 9.94709 9.74913C10.1449 9.68476 10.308 9.60552 10.4366 9.51144L11.334 11.3387C11.067 11.5368 10.711 11.7051 10.266 11.8438C9.82101 11.9825 9.35376 12.0518 8.86427 12.0518Z'
        fill='url(#paint1_linear_280_37351)'
      />
    </g>
    <defs>
      <filter
        id='filter0_dd_280_37351'
        x={-0.860409}
        y={-0.338214}
        width={17.6029}
        height={17.6029}
        filterUnits='userSpaceOnUse'
        colorInterpolationFilters='sRGB'
      >
        <feFlood floodOpacity={0} result='BackgroundImageFix' />
        <feColorMatrix
          in='SourceAlpha'
          type='matrix'
          values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
          result='hardAlpha'
        />
        <feOffset dy={0.463235} />
        <feGaussianBlur stdDeviation={0.463235} />
        <feColorMatrix type='matrix' values='0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.06 0' />
        <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_280_37351' />
        <feColorMatrix
          in='SourceAlpha'
          type='matrix'
          values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
          result='hardAlpha'
        />
        <feOffset dy={0.463235} />
        <feGaussianBlur stdDeviation={0.694853} />
        <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0' />
        <feBlend mode='normal' in2='effect1_dropShadow_280_37351' result='effect2_dropShadow_280_37351' />
        <feBlend mode='normal' in='SourceGraphic' in2='effect2_dropShadow_280_37351' result='shape' />
      </filter>
      <linearGradient
        id='paint0_linear_280_37351'
        x1={7.94106}
        y1={0.588257}
        x2={7.94106}
        y2={15.4118}
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#FCFCFD' />
        <stop offset={1} stopColor='#D1E0FF' />
      </linearGradient>
      <linearGradient
        id='paint1_linear_280_37351'
        x1={7.95203}
        y1={3.97021}
        x2={7.95203}
        y2={12.0518}
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#1E50B0' />
        <stop offset={1} stopColor='#0D347D' />
      </linearGradient>
    </defs>
  </svg>
);

const Memo = memo(Frame31Icon);
export { Memo as Frame31Icon };