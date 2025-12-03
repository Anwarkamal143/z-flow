import Link from "next/link";

const NotFoundPage = () => {
  return (
    <main className="grid min-h-full place-items-center bg-gray-900 px-6  sm:py-32 lg:px-8">
      <div className="text-center">
        <h1 className=" text-7xl tracking-tight font-extrabold lg:text-9xl text-violet-600">
          404
        </h1>
        <h1 className="tracking-tight  font-bold text-violet-600 text-2xl">
          Not Found
        </h1>
        <p className=" text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">
          The page you’re looking for isn’t found, we suggest you back to home.
        </p>
        <div className="mt-4 flex items-center justify-center">
          <Link
            href="/"
            className="rounded-md bg-indigo-500 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Go back home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
