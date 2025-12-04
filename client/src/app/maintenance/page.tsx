"use client";

const MaintainancePage = () => {
  return (
    <section className="min-h-screen grid place-items-center bg-gray-900">
      <div className="container mx-auto">
        <div className="text-center">
          <svg
            width="1.5em"
            height="1.5em"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-orange-500"
          >
            <path
              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M19.6224 10.3954L18.5247 7.7448L20 6L18 4L16.2647 5.48295L13.5578 4.36974L12.9353 2H10.981L10.3491 4.40113L7.70441 5.51596L6 4L4 6L5.45337 7.78885L4.3725 10.4463L2 11V13L4.40111 13.6555L5.51575 16.2997L4 18L6 20L7.79116 18.5403L10.397 19.6123L11 22H13L13.6045 19.6132L16.2551 18.5155C16.6969 18.8313 18 20 18 20L20 18L18.5159 16.2494L19.6139 13.598L21.9999 12.9772L22 11L19.6224 10.3954Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          <h2 className="font-sans antialiased font-bold text-lg md:text-xl lg:text-2xl text-current my-6 max-w-xl mx-auto [text-wrap:_balance]">
            We&#x27;re currently undergoing maintenance to improve your
            experience.
          </h2>
          <p className="font-sans antialiased text-base md:text-lg text-slate-600 max-w-xl mx-auto [text-wrap:_balance]">
            Please bear with us while we make these enhancements. We&#x27;ll be
            back shortly. Thank you for your patience!
          </p>
        </div>
      </div>
    </section>
  );
};
export default MaintainancePage;
