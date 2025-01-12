'use client';
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
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
        <Loading />
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

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-6 shadow-lg w-full max-w-2xl mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{experimentName} Results</h2>
        <button
          className="bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2"
          onClick={closeResults}
        >
          Close
        </button>
      </div>

      <div className="mt-6">
        {Array.from(new Set(results.results.map((r: any) => r.testNumber))).map((testNumber) => {
          const testResults = results.results.filter((r: any) => r.testNumber === testNumber);

          if (testNumber === 3) {
            const anchorsScores = getSampleScores(testResults, 'anchorsScores');
            const samplesScores = getSampleScores(testResults, 'samplesScores');
            const referenceScore = testResults[0]?.referenceScore || 0;

            return (
              <div key={testNumber as React.Key} className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Test {String(testNumber)} Chart</h3>
                <Bar
                  data={{
                    labels: [
                      ...anchorsScores.map((score: any) => `Anchor ${score.sampleId}`),
                      ...samplesScores.map((score: any) => `Sample ${score.sampleId}`),
                    ],
                    datasets: [
                      {
                        label: 'Scores',
                        data: [
                          ...anchorsScores.map((score: any) => score.score),
                          ...samplesScores.map((score: any) => score.score),
                        ],
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: `Scores with Reference (Test ${testNumber})`,
                      },
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Samples',
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Scores',
                        },
                      },
                    },
                    animation: {
                      onComplete: ({ chart }: { chart: any }) => {
                        const ctx = chart.ctx;
                        const yAxis = chart.scales.y;
                        const xAxis = chart.scales.x;

                        const referenceY = yAxis.getPixelForValue(referenceScore);

                        // Rysowanie linii odniesienia
                        ctx.save();
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(255, 99, 132, 1)';
                        ctx.lineWidth = 2;
                        ctx.moveTo(xAxis.left, referenceY);
                        ctx.lineTo(xAxis.right, referenceY);
                        ctx.stroke();

                        // Etykieta linii odniesienia
                        ctx.fillStyle = 'rgba(255, 99, 132, 1)';
                        ctx.fillText(`Reference: ${referenceScore}`, xAxis.right - 120, referenceY - 5);
                        ctx.restore();
                      },
                    },
                  }}
                />
              </div>
            );
          }

          if (testNumber === 4) {
            const axisResults = testResults[0]?.axisResults || [];

            return axisResults.map((axisResult: any, idx: number) => (
              <div key={`${testNumber}-${axisResult.axisId}`} className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Test {String(testNumber)} - {axisResult.axisId} Chart</h3>
                <Bar
                  data={{
                    labels: axisResult.sampleRatings.map((rating: any) => rating.sampleId),
                    datasets: [
                      {
                        label: axisResult.axisId,
                        data: axisResult.sampleRatings.map((rating: any) => rating.rating),
                        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                          Math.random() * 255
                        )}, ${Math.floor(Math.random() * 255)}, 0.6)`,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: `Ratings for ${axisResult.axisId} (Test ${testNumber})`,
                      },
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Samples',
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Ratings',
                        },
                      },
                    },
                  }}
                />
              </div>
            ));
          }

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
              <h3 className="text-xl font-semibold mb-4">Test {String(testNumber)} Chart</h3>
              <Bar
                data={{
                  labels: questionIds,
                  datasets: datasets,
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: `Selections per Question (Test ${testNumber})`,
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Questions',
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Number of Selections',
                      },
                    },
                  },
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExperimentResultsChart;
