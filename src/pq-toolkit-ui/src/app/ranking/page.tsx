'use client';

import Header from '@/lib/components/basic/header';
import Blobs from '@/lib/components/basic/blobs';
import useSWR, {type KeyedMutator} from 'swr';
import {FaTrash} from 'react-icons/fa';
import AudioPlayer from '@/lib/components/player/audioplayer';
import Loading from '../loading';
import {
    userFetch,
    uploadSampleRateFetch,
    fetchSamples,
} from '@/lib/utils/fetchers';
import {validateApiData} from '@/core/apiHandlers/clientApiHandler';
import {useState, useEffect} from 'react';
import {SampleData, SamplesListSchema, UserData} from "@/lib/schemas/apiResults";

const RankingPage = (): JSX.Element => {
    const {data: userData} = useSWR<UserData>('/api/v1/auth/user', userFetch);
    const isLoggedIn = !!userData?.is_active;

    const {data: apiData, error, isLoading} = useSWR('/api/v1/samples', fetchSamples);

    const [ratings, setRatings] = useState<{ [key: number]: number | null }>({});
    const [sortedSamples, setSortedSamples] = useState<SampleData[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
    const [showUploadWidget, setShowUploadWidget] = useState(false);
    const [uploadedSamples, setUploadedSamples] = useState<{ name: string; assetPath: File }[]>([]);

    useEffect(() => {
        if (apiData?.samples) {
            setSortedSamples(apiData.samples);
        }
    }, [apiData]);

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex w-full min-h-screen items-center justify-center text-center text-lg font-light">
                Error fetching samples. Please try again later.
            </div>
        );
    }

    if (!apiData || !apiData.samples) {
        return (
            <div className="flex w-full min-h-screen items-center justify-center text-center text-lg font-light">
                No samples available.
            </div>
        );
    }

    const {data, validationError} = validateApiData(apiData, SamplesListSchema);

    if (validationError) {
        console.error(validationError);
        return (
            <div className="flex w-full min-h-screen items-center justify-center text-center text-lg font-light">
                Invalid data from API, please check console for details.
            </div>
        );
    }

    const handleSubmitFiles = async () => {
        try {
            const formData = new FormData();
            uploadedSamples.forEach((sample) => {
                formData.append('files', sample.assetPath);
                formData.append('titles', sample.name);
            });

            const response = await fetch('/api/v1/samples', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload samples.');
            }

            setUploadedSamples([]);
            await handleSendSamples();
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Failed to upload files. Please try again later.');
        }
    };

    const handleDeleteSample = async (sampleId: string) => {
        try {
            const response = await fetch(`/api/v1/samples/${sampleId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to delete sample: ${response.statusText}`);
            }

            setSortedSamples((prevSamples) => prevSamples.filter((sample) => sample.sampleId !== sampleId));
        } catch (error) {
            console.error('Error deleting sample:', error);
            alert('Failed to delete sample. Please try again.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newSamples = Array.from(files).map((file) => ({
                name: file.name,
                assetPath: file,
            }));
            setUploadedSamples((prev) => [...prev, ...newSamples]);
        }
    };

    const handleWidgetClose = () => {
        setShowUploadWidget(false);
        setUploadedSamples([]);
    };

    const handleSendSamples = async () => {
        try {
            const updatedSamples = await fetchSamples();
            setSortedSamples(updatedSamples.samples);
            handleWidgetClose();
        } catch (error) {
            console.error('Error refreshing samples:', error);
            alert('Failed to refresh the sample list. Please try again.');
        }
    };

    const handleRating = (sampleIndex: number, rating: number) => {
        setRatings((prevRatings) => ({
            ...prevRatings,
            [sampleIndex]: prevRatings[sampleIndex] === rating ? null : rating,
        }));
    };

    const handleSubmitFeedback = async (sampleIndex: number) => {
        try {
            const ratedSample = {
                sampleId: sortedSamples[sampleIndex].sampleId,
                name: sortedSamples[sampleIndex].name,
                assetPath: sortedSamples[sampleIndex].assetPath,
                rating: ratings[sampleIndex],
            };

            if (ratedSample.rating === null) {
                alert('Please select a rating before submitting.');
                return;
            }

            await uploadSampleRateFetch(ratedSample);

            setRatings((prevRatings) => ({
                ...prevRatings,
                [sampleIndex]: null,
            }));

            const updatedSamples = await fetchSamples();
            setSortedSamples(updatedSamples.samples);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    const toggleSort = () => {
        const newSortOrder = sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? null : 'asc';
        setSortOrder(newSortOrder);

        if (newSortOrder === null && data?.samples) {
            setSortedSamples([...data.samples]);
        } else {
            const sorted = [...sortedSamples].sort((a, b) =>
                newSortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating
            );
            setSortedSamples(sorted);
        }
    };

    const renderSortIcon = () => {
        if (sortOrder === 'asc') return '▲';
        if (sortOrder === 'desc') return '▼';
        return '▲▼';
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-stone-900 overflow-x-hidden relative">
            <Blobs />
            <Header />
            <div className="absolute -top-10 lg:-top-32 -right-6 max-w-full w-72 md:w-80 lg:w-96 h-72 md:h-80 lg:h-96 bg-none md:bg-gradient-to-r from-purple-500 to-violet-600 dark:from-purple-600 dark:to-violet-600 rounded-full mix-blend-multiply dark:mix-blend-color-dodge filter blur-xl opacity-60 dark:opacity-40 animate-blob animation-delay-8000 pointer-events-none"></div>
            <header className="py-12 text-center">
                <h1 className="text-5xl font-bold text-gray-900 dark:text-white">Sound Samples Ranking</h1>
            </header>
            <main className="flex flex-col items-center">
                <div className="w-full max-w-5xl px-6">
                    <div className="flex items-center justify-between mb-10 relative">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">List of Sound Samples</h2>
                        <div className="flex space-x-4">
                            {isLoggedIn && (
                                <button
                                    onClick={() => setShowUploadWidget(true)}
                                    className="z-10 relative flex items-center justify-center py-3 px-6 w-60 bg-white/90 dark:bg-black/70 text-black dark:text-white border border-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-black/50 shadow-sm transition-all"
                                >
                                    Add New Sample
                                </button>
                            )}
                            <button
                                onClick={toggleSort}
                                className="z-10 relative flex items-center justify-center py-3 px-6 w-60 bg-white/90 dark:bg-black/70 text-black dark:text-white border border-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-black/50 shadow-sm transition-all"
                            >
                                <span className="mr-2">Sort by Rating</span>
                                <span>{renderSortIcon()}</span>
                            </button>
                        </div>
                    </div>
                    <ul className="space-y-8 mb-20">
                        {sortedSamples.map((sample, idx) => (
                            <li
                                key={idx}
                                className="p-6 bg-white/80 dark:bg-black/50 backdrop-blur-lg rounded-lg shadow-lg flex flex-col space-y-4"
                            >
                                <div className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                                    {sample.assetPath.split('/').pop()}
                                </div>
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="flex items-center space-x-1 w-1/4">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {sample.rating?.toFixed(1) || 'N/A'}
                                        </span>
                                        <span className="text-yellow-500 text-xl">★</span>
                                    </div>
                                    <AudioPlayer assetPath={sample.assetPath} />
                                    <div className="flex space-x-4">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                onClick={() => handleRating(idx, rating)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-full border text-white ${
                                                    ratings[idx] === rating
                                                        ? 'bg-blue-500 border-blue-500'
                                                        : 'bg-transparent border-white hover:bg-blue-500 hover:border-blue-500'
                                                } transition-all`}
                                            >
                                                {rating}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handleSubmitFeedback(idx)}
                                        className="py-2 px-6 w-60 bg-blue-500 text-white rounded-md shadow-md hover:shadow-lg hover:bg-blue-400 transition-colors duration-300"
                                    >
                                        Rate
                                    </button>
                                    {isLoggedIn && (
                                        <button
                                            onClick={() => handleDeleteSample(sample.sampleId)}
                                            className="text-red-500 hover:text-red-700 hover:scale-110 transition-all"
                                            aria-label="Delete sample"
                                        >
                                            <FaTrash className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
            {showUploadWidget && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                    onClick={handleWidgetClose}
                >
                    <div
                        className="bg-white dark:bg-black/70 p-6 rounded-lg shadow-lg w-[40rem] border-4 border-gray-300 dark:border-gray-700 relative flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                            Upload Samples
                        </h3>
                        <div className="space-y-4 w-full">
                            {uploadedSamples.map((sample, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between bg-white/90 dark:bg-black/50 p-3 rounded-md shadow-sm"
                                >
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {sample.name || `Sample ${idx + 1}`}
                                    </span>
                                    <audio controls className="w-1/2">
                                        <source
                                            src={URL.createObjectURL(sample.assetPath)}
                                            type="audio/mpeg"
                                        />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            ))}
                            <div className="flex items-center space-x-4">
                                <input
                                    type="file"
                                    accept="audio/mpeg"
                                    multiple
                                    onChange={handleFileChange}
                                    className="py-3 px-6 w-full bg-gray-100 dark:bg-black/50 text-black dark:text-white border border-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-black/50 shadow-sm transition-all cursor-pointer"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleSubmitFiles}
                            className="py-3 px-6 w-full bg-blue-500 text-white rounded-md mt-4 hover:bg-blue-400 transition-colors shadow-sm"
                        >
                            Send Samples
                        </button>
                        <button
                            onClick={handleWidgetClose}
                            className="py-3 px-6 w-full bg-gray-500 text-white rounded-md mt-4 hover:bg-gray-400 transition-colors shadow-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RankingPage;
