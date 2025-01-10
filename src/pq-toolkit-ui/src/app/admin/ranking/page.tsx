'use client';

import Header from '@/lib/components/basic/header';
import Blobs from '@/lib/components/basic/blobs';
import { samplesListSchema } from './models';
import { validateApiData } from '@/core/apiHandlers/clientApiHandler';
import { useState } from 'react';

const mockData = {
  samples: [
    { name: 'Sample 1', url: 'https://example.com/sample1.mp3', rating: 4.3 },
    { name: 'Sample 2', url: 'https://example.com/sample2.mp3', rating: 5 },
    { name: 'Sample 3', url: 'https://example.com/sample3.mp3', rating: 3 },
  ],
};

const RankingPage = (): JSX.Element => {
  const apiData = mockData;
  const { data, validationError } = validateApiData(apiData, samplesListSchema);

  if (validationError != null) {
    console.error(validationError);
    return (
      <div className="flex w-full min-h-screen items-center justify-center text-center text-lg font-light">
        Invalid data from API, please check console for details
      </div>
    );
  }

  const [ratings, setRatings] = useState<{ [key: number]: number | null }>({});
  const [sortedSamples, setSortedSamples] = useState(data.samples);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [showUploadWidget, setShowUploadWidget] = useState(false);
  const [uploadedSamples, setUploadedSamples] = useState<{ name: string; url: string }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setUploadedSamples((prev) => [...prev, { name, url: fileURL }]);
    }
  };

  const handleWidgetClose = () => {
    setShowUploadWidget(false);
    setUploadedSamples([]);
  };

  const handleSendSamples = () => {
    setSortedSamples((prev) => [...prev, ...uploadedSamples]);
    handleWidgetClose();
  };

  const handleRating = (sampleIndex: number, rating: number) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [sampleIndex]: prevRatings[sampleIndex] === rating ? null : rating,
    }));
  };

  const handleSubmitFeedback = (sampleIndex: number) => {
    if (ratings[sampleIndex]) {
      alert(`You rated Sample "${sortedSamples[sampleIndex].name}" with ${ratings[sampleIndex]} stars!`);
      setRatings((prevRatings) => ({
        ...prevRatings,
        [sampleIndex]: null,
      }));
    } else {
      alert('Please select a rating before submitting.');
    }
  };

  const toggleSort = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? null : 'asc';
    setSortOrder(newSortOrder);

    if (newSortOrder === null) {
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
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              List of Sound Samples
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowUploadWidget(true)}
                className="z-10 relative flex items-center justify-center py-3 px-6 w-60 bg-white/90 dark:bg-black/70 text-black dark:text-white border border-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-black/50 shadow-sm transition-all"
              >
                Add New Sample
              </button>
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
                  {sample.name}
                </div>
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-1 w-1/4">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {sample.rating?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="text-yellow-500 text-xl">★</span>
                  </div>
                  <audio controls className="w-1/2">
                    <source src={sample.url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
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
                    <source src={sample.url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ))}
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Sample Name"
                  className="w-1/2 p-2 border border-gray-300 rounded-md dark:bg-black/50 dark:text-white"
                  id="sampleName"
                />
                <input
                  type="file"
                  accept="audio/mpeg"
                  onChange={(e) =>
                    handleFileChange(e, (document.getElementById('sampleName') as HTMLInputElement).value || '')
                  }
                  className="p-2 border border-gray-300 rounded-md dark:bg-black/50 dark:text-white"
                />
              </div>
            </div>
            <button
              onClick={handleSendSamples}
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
