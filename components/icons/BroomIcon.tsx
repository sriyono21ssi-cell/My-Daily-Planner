import React from 'react';

export const BroomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.336 21.064l1.414-1.414a1.5 1.5 0 0 1 2.121 0l1.414 1.414a1.5 1.5 0 0 0 2.121 0l1.414-1.414a1.5 1.5 0 0 1 2.121 0l1.414 1.414M3 18.064h18M19.593 3.65l-9.33 9.33a1.5 1.5 0 0 1-2.121 0l-2.828-2.828a1.5 1.5 0 0 1 0-2.121l9.33-9.33a1.5 1.5 0 0 1 2.121 0l2.828 2.828a1.5 1.5 0 0 1 0 2.121z"
    />
  </svg>
);
