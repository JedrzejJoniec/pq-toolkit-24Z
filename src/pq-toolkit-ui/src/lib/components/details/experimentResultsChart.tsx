'use client';
import React, {useState, useEffect} from 'react';
import {Bar} from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from 'chart.js';
import Loading from '../../../app/loading';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ExperimentResultsChart = ({
                                    experimentName,
                                    closeDetails: closeResults,
                                }: {
    experimentName: string;
    closeDetails: () => void;
}): JSX.Element => {
    const [results, setResults] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExperimentResults = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`/api/v1/experiments/${experimentName}/results`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch experiment results: ${experimentName}`);
                }
                const data = await response.json();
                setResults(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExperimentResults();
    }, [experimentName]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center">
                <Loading/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center text-red-500">
                <p>Failed to load experiment results:</p>
                <p>{error}</p>
            </div>
        );
    }

    const parseSelections = (testResults: any[]) => {
        return testResults.flatMap((result) => result.selections || []);
    };

    const getSampleScores = (testResults: any[], key: string) => {
        return testResults.flatMap((result) => result[key] || []);
    };

    const calculateAverageScores = (scores: any[]) => {
        const scoreMap: { [sampleId: string]: number[] } = {};
        scores.forEach((score) => {
            if (!scoreMap[score.sampleId]) {
                scoreMap[score.sampleId] = [];
            }
            scoreMap[score.sampleId].push(score.score);
        });

        return Object.keys(scoreMap).map((sampleId) => ({
            sampleId,
            average: scoreMap[sampleId].reduce((sum, score) => sum + score, 0) / scoreMap[sampleId].length,
        }));
    };

    const calculateAverageScoresAPE = (scores: any[]) => {
        const scoreMap: { [sampleId: string]: number[] } = {};
        scores.forEach((score) => {
            if (!scoreMap[score.sampleId]) {
                scoreMap[score.sampleId] = [];
            }
            scoreMap[score.sampleId].push(score.rating);
        });

        return Object.keys(scoreMap).map((sampleId) => ({
            sampleId,
            average: scoreMap[sampleId].reduce((sum, score) => sum + score, 0) / scoreMap[sampleId].length,
        }));
    };

    return (
        <div
            className="flex flex-col bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-6 shadow-lg w-full max-w-2xl mt-4">

            <div className="mt-3">
                {Array.from(new Set(results.results.map((r: any) => r.testNumber))).map((testNumber) => {
                    const testResults = results.results.filter((r: any) => r.testNumber === testNumber);
                    const testType = testResults[0]?.type;

                    if (testType === 'AB') {
                        // Logic for AB
                        const selections = parseSelections(testResults);
                        const questionIds = Array.from(new Set(selections.map((s: any) => s.questionId)));
                        const sampleIds = Array.from(new Set(selections.map((s: any) => s.sampleId)));

                        const datasets = sampleIds.map((sampleId) => {
                            const data = questionIds.map((questionId) =>
                                selections.filter(
                                    (s: any) => s.sampleId === sampleId && s.questionId === questionId
                                ).length
                            );
                            return {
                                label: sampleId,
                                data,
                                backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                                    Math.random() * 255
                                )}, ${Math.floor(Math.random() * 255)}, 0.6)`,
                            };
                        });

                        return (
                            <div key={testNumber as React.Key} className="mb-8">
                                <h3 className="text-xl font-semibold mb-4">
                                    Test {testNumber} (AB) Chart
                                </h3>
                                <Bar
                                    data={{
                                        labels: questionIds,
                                        datasets,
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {position: 'top'},
                                            title: {
                                                display: true,
                                                text: `Selections per Question (Test ${testNumber})`
                                            },
                                        },
                                        scales: {
                                            x: {title: {display: true, text: 'Questions'}},
                                            y: {
                                                title: {display: true, text: 'Number of Selections'},
                                                ticks: {
                                                    stepSize: 1,
                                                    callback: function (value: any) {
                                                        return Number.isInteger(value) ? value : '';
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        );
                    }

                    if (testType === 'ABX') {
                        // Logic for ABX
                        const selections = parseSelections(testResults);
                        const questionIds = Array.from(new Set(selections.map((s: any) => s.questionId)));
                        const sampleIds = Array.from(
                            new Set([
                                ...selections.map((s: any) => s.sampleId),
                                testResults[0]?.xSampleId,
                                testResults[0]?.xSelected,
                            ].filter(Boolean))
                        );

                        const isCorrect = testResults.every(
                            (result: any) => result.xSampleId === result.xSelected
                        );

                        if (selections.length === 0) {
                            return (
                                <div key={testNumber as React.Key} className="mb-8">
                                    <h3 className="text-xl font-semibold mb-4">
                                        Test {testNumber} (ABX) - No Selections
                                    </h3>
                                    <p className="text-gray-500">
                                        {isCorrect
                                            ? 'Sample X was correctly identified.'
                                            : 'Sample X was incorrectly identified.'}
                                    </p>
                                </div>
                            );
                        }

                        const datasets = sampleIds.map((sampleId) => {
                            const data = questionIds.map((questionId) =>
                                selections.filter(
                                    (s: any) => s.sampleId === sampleId && s.questionId === questionId
                                ).length
                            );
                            return {
                                label: sampleId,
                                data,
                                backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                                    Math.random() * 255
                                )}, ${Math.floor(Math.random() * 255)}, 0.6)`,
                            };
                        });

                        return (
                            <div key={testNumber as React.Key} className="mb-8">
                                <h3 className="text-xl font-semibold mb-4">
                                    Test {testNumber} (ABX) Chart
                                </h3>
                                <p className={`mb-2 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                    {isCorrect
                                        ? 'Sample X was correctly identified.'
                                        : 'Sample X was incorrectly identified.'}
                                </p>
                                <Bar
                                    data={{
                                        labels: questionIds,
                                        datasets,
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {position: 'top'},
                                            title: {
                                                display: true,
                                                text: `Selections per Question (Test ${testNumber})`,
                                            },
                                        },
                                        scales: {
                                            x: {title: {display: true, text: 'Questions'}},
                                            y: {title: {display: true, text: 'Number of Selections'}},
                                        },
                                    }}
                                />
                            </div>
                        );
                    }

                    if (testType === 'MUSHRA') {
                        const anchorsScores = getSampleScores(testResults, 'anchorsScores');
                        const samplesScores = getSampleScores(testResults, 'samplesScores');
                        const averageScores = calculateAverageScores([...anchorsScores, ...samplesScores]);
                        const referenceScore = testResults[0]?.referenceScore || 0;

                        return (
                            <div key={testNumber as React.Key} className="mb-8">
                                <h3 className="text-xl font-semibold mb-4">
                                    Test {testNumber} (MUSHRA) Chart
                                </h3>
                                <Bar
                                    data={{
                                        labels: [
                                            ...averageScores.map((score) => score.sampleId),
                                            'Reference',
                                        ],
                                        datasets: [
                                            {
                                                data: [
                                                    ...averageScores.map((score) => score.average),
                                                    referenceScore,
                                                ],
                                                backgroundColor: [
                                                    ...averageScores.map(
                                                        () =>
                                                            `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                                                                Math.random() * 255
                                                            )}, ${Math.floor(Math.random() * 255)}, 0.6)`
                                                    ),
                                                    'rgba(255, 99, 132, 0.6)', // Fixed color for reference score
                                                ],
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                display: false, // Usunięcie legendy
                                            },
                                            title: {
                                                display: true,
                                                text: `Scores with Reference (Test ${testNumber})`,
                                            },
                                        },
                                        scales: {
                                            x: {title: {display: true, text: 'Samples'}},
                                            y: {title: {display: true, text: 'Scores'}},
                                        },
                                    }}
                                />
                            </div>
                        );
                    }

                    if (testType === 'APE') {
                        const axisResults = testResults.flatMap(
                            (result: {
                                axisResults?: {
                                    axisId: string;
                                    sampleRatings: { sampleId: string; rating: number }[];
                                }[];
                            }) => result.axisResults || []
                        );
                        const groupedByAxisId = axisResults.reduce((acc: any, axisResult: any) => {
                            if (!acc[axisResult.axisId]) {
                                acc[axisResult.axisId] = [];
                            }
                            acc[axisResult.axisId].push(...axisResult.sampleRatings);
                            return acc;
                        }, {});

                        return Object.entries(groupedByAxisId).map(([axisId, sampleRatings]) => {
                            const averageScores = calculateAverageScoresAPE(sampleRatings as any[]);
                            return (
                                <div key={`${testNumber}-${axisId}`} className="mb-8">
                                    <h3 className="text-xl font-semibold mb-4">
                                        Test {String(testNumber)} - {axisId} Chart
                                    </h3>
                                    <Bar
                                        data={{
                                            labels: averageScores.map((score) => score.sampleId),
                                            datasets: [
                                                {
                                                    data: averageScores.map((score) => score.average),
                                                    backgroundColor: averageScores.map(
                                                        () =>
                                                            `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                                                                Math.random() * 255
                                                            )}, ${Math.floor(Math.random() * 255)}, 0.6)`
                                                    ),
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    display: false, // Usunięcie legendy
                                                },
                                                title: {
                                                    display: true,
                                                    text: `Average Ratings for ${axisId} (Test ${testNumber})`,
                                                },
                                            },
                                            scales: {
                                                x: {title: {display: true, text: 'Samples'}},
                                                y: {title: {display: true, text: 'Ratings'}},
                                            },
                                        }}
                                    />
                                </div>
                            );
                        });
                    }

                    return null;
                })}
            </div>
        </div>
    );
};

export default ExperimentResultsChart;
