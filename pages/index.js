import { ExternalLinkIcon, MoonIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import Head from "next/head";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url) =>
  fetch(url).then(async (res) => {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return json;
    } catch (e) {
      return text;
    }
  });

function msToMinutesSeconds(ms) {
  const minutes = Math.floor(ms / 60000);
  let seconds = Math.floor(ms / 1000) % 60;
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

export default function Home() {
  const { data, error } = useSWR("/api/hello", fetcher, {
    refreshInterval: 1000,
  });
  const [progress, setProgress] = useState(data?.progress_ms);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    console.log({ data, error });
    if (data) {
      setProgress(data.progress_ms - (data.progress_ms % 1000));

      const interval = setInterval(() => {
        setProgress((p) => p + 1000);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [data]);

  useEffect(() => {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setDark(true);
    } else {
      setDark(false);
    }
  }, []);

  useEffect(() => {
    console.log(dark);

    // Whenever the user explicitly chooses light mode
    localStorage.theme = dark ? "dark" : "light";

    // // Whenever the user explicitly chooses to respect the OS preference
    // localStorage.removeItem('theme')
  }, [dark]);

  if (typeof data == 'undefined') {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{JSON.stringify(error)}</p>;
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div
        className={classNames(
          "flex flex-col items-center justify-center min-h-screen py-2 dark:bg-gray-900"
        )}
      >
        <Head>
          <title>Listen with Wilson</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="flex flex-col items-center justify-center flex-1 w-full px-20 text-center">
          <div className="fixed top-4 right-4">
            <button
              onClick={() => setDark((d) => !d)}
              className="p-2 bg-gray-200 rounded dark:bg-gray-700"
            >
              <span className="sr-only">Enable dark mode</span>
              <MoonIcon className="w-6 h-6 text-gray-400 dark:text-gray-400" />
            </button>
          </div>
          {!!data && !data?.offline ? (
            <>
              <div className="flex flex-col items-center mb-8 space-y-8 md:space-y-0 md:space-x-4 md:flex-row">
                <div>
                  <img
                    src={data.item.album.images[0].url}
                    className="h-48 rounded-lg dw-48 xl:w-72 xl:h-72"
                    alt="Album"
                  />
                </div>
                <div className="flex flex-col items-center mt-4 md:items-start">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-start mb-2 md:justify-center dark:text-gray-50 hover:underline"
                    href={data.item.external_urls.spotify}
                  >
                    <h1 className="text-xl font-bold text-center md:text-3xl md:text-left">
                      {data.item.name}
                    </h1>{" "}
                    <ExternalLinkIcon className="hidden w-6 h-6 md:block" />
                  </a>
                  <h3 className="text-lg font-medium text-gray-600 md:text-xl dark:text-gray-400">
                    {data.item.album.name}
                  </h3>
                  <h3 className="max-w-lg text-gray-500 truncate">
                    {data.item.artists.map(({ name }) => name).join(", ")}
                  </h3>
                </div>
              </div>

              <div className="w-full max-w-2xl ">
                <div className="flex justify-between text-sm font-semibold text-gray-500 dark:text-gray-400">
                  <p>{msToMinutesSeconds(progress)}</p>
                  <p>{msToMinutesSeconds(data.item.duration_ms)}</p>
                </div>
                <div className="relative ">
                  <div className="h-4 bg-gray-300 rounded-full dark:bg-gray-700"></div>
                  <div
                    className="absolute top-0 h-4 transition-all duration-1000 bg-green-400 rounded-full"
                    style={{
                      width: `${(100 * progress) / data.item.duration_ms}%`,
                    }}
                  ></div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center mb-8 space-y-8 md:space-y-0 md:space-x-4 md:flex-row">
                <div>
                  <div
                    className="w-48 h-48 bg-gray-200 rounded-lg dark:bg-gray-700 xl:w-72 xl:h-72"
                    alt="Album"
                  />
                </div>
                <div className="flex flex-col items-center mt-4 md:items-start">
                  <h1 className="mb-2 text-xl font-bold dark:text-gray-50 hover:underline md:text-3xl">
                    Offline
                  </h1>

                  <h3 className="text-lg font-medium text-gray-600 md:text-xl dark:text-gray-400">
                    Offline
                  </h3>
                  <h3 className="max-w-lg text-gray-500 truncate">Offline</h3>
                </div>
              </div>

              <div className="w-full max-w-2xl ">
                <div className="flex justify-between text-sm font-semibold text-gray-500 dark:text-gray-400">
                  <p>0:00</p>
                  <p>0:00</p>
                </div>
                <div className="relative ">
                  <div className="h-4 bg-gray-300 rounded-full dark:bg-gray-700"></div>
                </div>
              </div>
            </>
          )}
        </main>

        <footer className="flex items-center justify-center w-full h-24 border-t dark:border-gray-700">
          <div className="flex divide-x dark:divide-gray-500">
            <a
              className="flex items-center justify-center px-4 dark:text-gray-400"
              href="//twitter.com/wilsonsaccount"
              target="_blank"
              rel="noopener noreferrer"
            >
              Created by Wilson
            </a>
            <a
              className="flex items-center justify-center px-4 dark:text-gray-400"
              href="//github.com/wbhob/listening"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fork on GitHub
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
