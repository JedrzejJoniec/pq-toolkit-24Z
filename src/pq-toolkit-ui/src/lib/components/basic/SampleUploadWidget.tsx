import React, {useState, useEffect} from 'react';
import useSWR from 'swr';
import {fetchSamples} from '@/lib/utils/fetchers';
import AudioPlayer from '@/lib/components/player/audioplayer';

interface SampleData {
    sampleId: number;
    name: string;
    assetPath: string;
    rating: number | null;
}

interface SampleUploadWidgetProps {
    experimentName: string;
    onClose: () => void;
    onSamplesSubmitted: (newSamples: { name: string; assetPath: string }[]) => void;
}

const SampleUploadWidget = ({experimentName, onClose, onSamplesSubmitted}: SampleUploadWidgetProps): JSX.Element => {
    const {data: apiData, error, isLoading} = useSWR('/api/v1/samples', fetchSamples);
    const [sortedSamples, setSortedSamples] = useState<SampleData[]>([]);
    const [selectedSamples, setSelectedSamples] = useState<number[]>([]);
    const [uploadedSamples, setUploadedSamples] = useState<{ name: string; assetPath: string | File }[]>([]);

    useEffect(() => {
        if (apiData?.samples) {
            setSortedSamples(
                apiData.samples.map((sample: any) => ({
                    ...sample,
                    sampleId: parseInt(sample.sampleId, 10),
                }))
            );
        }
    }, [apiData]);

    const handleSampleToggle = (sampleId: number) => {
        setSelectedSamples((prev) =>
            prev.includes(sampleId)
                ? prev.filter((id) => id !== sampleId)
                : [...prev, sampleId]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, sampleName: string) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedSamples((prev) => [
                ...prev,
                {name: sampleName || file.name, assetPath: file},
            ]);
        }
    };

    const handleSubmitSamples = async () => {
        try {
            const formData = new FormData();

            uploadedSamples.forEach((sample) => {
                const file = sample.assetPath instanceof File ? sample.assetPath : new File([], sample.name);
                formData.append('files', file);
                formData.append('titles', sample.name);
            });

            selectedSamples.forEach((id) => {
                formData.append('sample_ids', id.toString());
            });

            const response = await fetch(`/api/v1/experiments/${experimentName}/samples/v2`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Failed to submit samples: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Samples submitted successfully:', result);

            const newSamples = result.asset_path.map((path: string) => ({
                name: path.split('/').pop() || path,
                assetPath: path,
            }));

            onSamplesSubmitted(newSamples);
            onClose();
        } catch (error) {
            console.error('Error submitting samples:', error);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-black/70 p-6 rounded-lg shadow-lg w-[60rem] border-4 border-gray-300 dark:border-gray-700 relative flex flex-row space-x-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Upload Files Section */}
                <div className="flex-1">
                    <h3 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                        Upload Samples
                    </h3>
                    <div className="space-y-4">
                        {uploadedSamples.map((sample, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between bg-white/90 dark:bg-black/50 p-3 rounded-md shadow-sm"
                            >
                                <span className="text-sm font-medium text-gray-900 dark:text-white w-2/3">
                                    {sample.name} {/* Wyświetlamy nazwę pliku */}
                                </span>
                                <audio controls className="w-1/3">
                                    <source
                                        src={typeof sample.assetPath === 'string' ? sample.assetPath : URL.createObjectURL(sample.assetPath)}
                                        type="audio/mpeg"
                                    />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        ))}
                        <div className="flex flex-col space-y-2">
                            <input
                                type="file"
                                accept="audio/mpeg"
                                multiple
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files) {
                                        const newSamples = Array.from(files).map((file) => ({
                                            name: file.name,
                                            assetPath: file,
                                        }));
                                        setUploadedSamples((prev) => [...prev, ...newSamples]);
                                    }
                                }}
                                className="py-3 px-6 w-full border border-gray-300 rounded-md dark:bg-black/50 dark:text-white"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSubmitSamples}
                        className="py-3 px-6 w-full bg-blue-500 text-white rounded-md mt-4 hover:bg-blue-400 transition-colors shadow-sm"
                    >
                        Submit Samples
                    </button>
                </div>

                {/* Available Samples List */}
                <div className="flex-1">
                    <h3 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                        Available Samples
                    </h3>
                    <div
                        className="space-y-4 overflow-y-auto max-h-80 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
                        {
                            sortedSamples.map((sample) => (
                                <li
                                    key={sample.sampleId}
                                    className={`flex items-center justify-between p-4 rounded-lg shadow ${
                                        selectedSamples.includes(sample.sampleId)
                                            ? 'bg-blue-100 dark:bg-blue-900'
                                            : 'bg-gray-100 dark:bg-gray-700'
                                    }`}
                                >
                                    <div className="flex flex-col">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {sample.name.split('/').pop()}
                                    </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {sample.rating?.toFixed(1) || 'N/A'} ★
                                    </span>
                                    </div>
                                    <AudioPlayer assetPath={sample.assetPath}/>
                                    <button
                                        onClick={() => handleSampleToggle(sample.sampleId)}
                                        className={`ml-4 px-4 py-2 rounded ${
                                            selectedSamples.includes(sample.sampleId)
                                                ? 'bg-red-500 text-white'
                                                : 'bg-blue-500 text-white'
                                        }`}
                                    >
                                        {selectedSamples.includes(sample.sampleId) ? 'Deselect' : 'Select'}
                                    </button>
                                </li>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SampleUploadWidget;
