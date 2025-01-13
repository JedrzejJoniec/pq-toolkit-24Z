'use client'
import Header from '@/lib/components/basic/header'
import ScrollToTopButton from '@/lib/components/basic/scrollToTopButton'
import type {UserData} from "@/lib/schemas/apiResults";
import {userFetch} from "@/lib/utils/fetchers";
import Loading from "@/app/loading";
import useSWR, { type KeyedMutator } from 'swr';
import LoginPage from "@/lib/components/login/login-page";

const Guide = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-stone-900 text-black dark:text-neutral-200">
      <Header />
      <div className="relative flex flex-col h-full w-full items-center justify-center my-auto fadeInUp mt-14">
        <div className="relative text-center mb-sm">
          <h1
            className="relative text-4xl md:text-6xl font-bold mt-1 md:mt-6 pb-1.5 pt-1.5 before:absolute before:inset-0 before:animate-typewriter before:bg-gray-100
            dark:before:bg-stone-900 after:absolute after:inset-0 after:w-[0.125em] after:animate-caret after:bg-black dark:after:bg-neutral-200"
          >
            Administrator guide
          </h1>
        </div>
        <div className="relative text-center mb-md">
          <h2 className="relative text-base md:text-xl font-semibold">
            Guide for administration use
          </h2>
        </div>

      </div>
      <ScrollToTopButton />
    </div>
  )
}

const LoginSwitch = (): JSX.Element => {
    const {
        data: apiData,
        error,
        isLoading,
        mutate,
    } = useSWR<UserData>(`/api/v1/auth/user`, userFetch);
    if (isLoading) return <Loading />;
    if (error != null)
        if (error.message.includes('"status":401') as boolean) {
            return <LoginPage refreshAdminPage={mutate} />;
        } else
            return (
                <div>
                    <div>Authorization Error</div>
                    <div>{error.toString()}</div>
                </div>
            );
    if (apiData?.is_active ?? false) {
        return <Guide refreshAdminPage={mutate} />;
    } else {
        return <LoginPage refreshAdminPage={mutate} />;
    }
};

export default LoginSwitch;
