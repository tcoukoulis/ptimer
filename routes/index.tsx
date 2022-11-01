import { Head } from "$fresh/runtime.ts";
import Timer from "../islands/Timer.tsx";
import Octocat from "../components/Octocat.tsx";

export default function Home() {
  return (
    <div className="dark:bg-gray-600 dark:text-white">
      <Head>
        <meta charSet="utf-8" />
        <title>ptimer - A Pomodoro Timer using Fresh</title>
        <style>
          {`input[type=number] {
              -moz-appearance: textfield;
            }
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
              -webkit-appearance: none;
            }
            .github-corner:hover .octo-arm {
              animation:octocat-wave 560ms ease-in-out
            }
            @keyframes octocat-wave {
             0% , 100% {
               transform:rotate(0)
             }
             20%, 60% {
               transform:rotate(-25deg)
             }
             40%, 80% {
               transform:rotate(10deg)
             }
           }
           @media (max-width:500px) {
             .github-corner:hover .octo-arm {
               animation: none;
             }
             .github-corner .octo-arm {
               animation:octocat-wave 560ms ease-in-out
             }
           }
            `}
        </style>
      </Head>
      <a
        href="https://github.com/tcoukoulis/ptimer"
        class="github-corner"
        aria-label="View source on GitHub"
      >
        <Octocat />
      </a>
      <div className="container mx-auto w-1/2">
        <div className="h-screen">
          <div className="h-1/2 translate-y-1/4">
            <Timer />
          </div>
        </div>
      </div>
    </div>
  );
}
