import React from "react";

const SearchIcon = ({
  className,
  size,
}: {
  className: string;
  size: number;
}) => {
  return (
    // <svg
    //   className={className}
    //   width={size}
    //   height={size}
    //   viewBox="0 0 24 24"
    //   fill="currentColor"
    //   xmlns="http://www.w3.org/2000/svg"
    // >
    //   <path
    //     d="M18 6L6 18M6 6L18 18"
    //     stroke="currentColor"
    //     strokeWidth="1.5"
    //     strokeLinecap="round"
    //     strokeLinejoin="round"
    //   />
    // </svg>
    <svg
      className={className}
      width={size}
      height={size}
      fill="currentColor"
      viewBox="0 -0.5 25 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5.5 11.1455C5.49956 8.21437 7.56975 5.69108 10.4445 5.11883C13.3193 4.54659 16.198 6.08477 17.32 8.79267C18.4421 11.5006 17.495 14.624 15.058 16.2528C12.621 17.8815 9.37287 17.562 7.3 15.4895C6.14763 14.3376 5.50014 12.775 5.5 11.1455Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15.989 15.4905L19.5 19.0015"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default SearchIcon;
