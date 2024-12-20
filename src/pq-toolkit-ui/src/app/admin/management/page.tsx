'use client'
import React, { useState } from 'react';
import useSWR, { type KeyedMutator } from 'swr'
import Loading from '../../loading'
import LoginPage from '../../../lib/components/login/login-page'
import { userFetch } from '@/lib/utils/fetchers'
import {
  type getExperimentsData,
  type UserData
} from '@/lib/schemas/apiResults'
import { validateApiData } from '@/core/apiHandlers/clientApiHandler'
import { adminExperimentsListSchema } from '../models'
import Header from '@/lib/components/basic/header'
import Blobs from '@/lib/components/basic/blobs'
import { TbLogout2 } from 'react-icons/tb'
import ExperimentDetails from '@/lib/components/details/experimentDetails' // Importujemy komponent szczegółów

const AdminPage = ({
  refreshAdminPage
}: {
  refreshAdminPage: KeyedMutator<UserData>
}): JSX.Element => {
  const {
    data: apiData,
    error,
    isLoading,
    mutate
  } = useSWR<getExperimentsData>(`/api/v1/experiments`)

  const [expandedExperiment, setExpandedExperiment] = useState<string | null>(null) // Dodajemy stan

  if (isLoading) return <Loading />
  if (error != null)
    return (
      <div className="flex w-full min-h-screen items-center justify-center text-center h2">
        API Error
        <br />
        {error.toString()}
      </div>
    )
  const { data, validationError } = validateApiData(
    apiData,
    adminExperimentsListSchema
  )
  if (validationError != null) {
    console.error(validationError)
    return (
      <div className="flex w-full min-h-screen items-center justify-center text-center h2">
        Invalid data from API, please check console for details
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-stone-900">
      <Header />
      <div className="flex justify-end fadeInUp mr-4 md:mr-10 z-50 space-x-4">
        {/* Logout Button */}
        <button
          className="flex items-center font-semibold max-md:text-sm max-md:px-2 max-md:py-1 bg-blue-400 dark:bg-blue-500 hover:bg-pink-500 dark:hover:bg-pink-600 text-white px-4 py-2 rounded-full shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105"
          onClick={() => {
            localStorage.removeItem('token')
            refreshAdminPage().catch((error) => {
              console.error(error)
            })
          }}
        >
          <TbLogout2 className="mr-2" />
          Logout
        </button>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center font-semibold max-md:text-sm max-md:px-2 max-md:py-1 bg-blue-400 dark:bg-blue-500 hover:bg-pink-500 dark:hover:bg-pink-600 text-white px-4 py-2 rounded-full shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105"
        >
          Back
        </button>
      </div>
      <div className="flex flex-col h-full w-full items-center justify-center my-auto mt-32">
        <div className="relative text-center mb-sm md:mb-md lg:mb-lg">
          <Blobs />
          <div className="fadeInUp">
            <h1 className="relative text-5xl md:text-6xl font-bold">
              Perceptual Qualities Toolkit
            </h1>
            <h2 className="relative text-2xl md:text-3xl font-semibold mt-sm">
              Experiments Management
            </h2>
          </div>
        </div>
        <div className="flex flex-col w-11/12 justify-center items-center fadeInUp">
          <AdminExperimentsListWidget
            experiments={data.experiments}
            setExpandedExperiment={setExpandedExperiment}
          />
          {expandedExperiment && (
            <ExperimentDetails
              experimentName={expandedExperiment}
              closeDetails={() => setExpandedExperiment(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const AdminExperimentsListWidget = ({
  experiments,
  setExpandedExperiment
}: {
  experiments: string[]
  setExpandedExperiment: React.Dispatch<React.SetStateAction<string | null>>
}): JSX.Element => {
  return (
    <div className="flex flex-col self-start fadeInUpFast items-center z-10 w-full max-w-full 2xl:max-w-md text-black dark:text-white bg-gray-50 dark:bg-stone-800 rounded-3xl p-8 shadow-2xl relative">
      <div className="flex text-lg md:text-xl font-semibold mb-4">
        Experiments:
      </div>
      <ul className="space-y-2 w-full">
        {experiments.map((name, idx) => (
          <li
            key={idx}
            className="flex items-center gap-sm justify-between whitespace-normal break-words"
          >
            <div
              className="font-semibold text-white w-full bg-blue-400 dark:bg-blue-500 hover:bg-pink-500 dark:hover:bg-pink-600 transform hover:scale-105 duration-300 ease-in-out p-2 rounded-md cursor-pointer"
              onClick={() => setExpandedExperiment(name)}
            >
              {name}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const LoginSwitch = (): JSX.Element => {
  const {
    data: apiData,
    error,
    isLoading,
    mutate
  } = useSWR<UserData>(`/api/v1/auth/user`, userFetch)
  if (isLoading) return <Loading />
  if (error != null)
    if (error.message.includes('"status":401') as boolean) {
      return <LoginPage refreshAdminPage={mutate} />
    } else
      return (
        <div>
          <div>Authorization Error</div>
          <div>{error.toString()}</div>
        </div>
      )
  if (apiData?.is_active ?? false) {
    return <AdminPage refreshAdminPage={mutate} />
  } else {
    return <LoginPage refreshAdminPage={mutate} />
  }
}

export default LoginSwitch
