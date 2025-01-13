'use client'
import Header from '@/lib/components/basic/header';
import ScrollToTopButton from '@/lib/components/basic/scrollToTopButton';
import type { UserData } from '@/lib/schemas/apiResults';
import { userFetch } from '@/lib/utils/fetchers';
import Loading from '@/app/loading';
import useSWR from 'swr';
import LoginPage from '@/lib/components/login/login-page';


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
            Administrator Guide
          </h1>
        </div>
          <div className="relative mb-md ml-7 md:ml-20 mr-7 md:mr-20 p-1 md:p-8 mt-1 md:mt-2">
              <div className="text-center">
                  <h2 className="text-xl md:text-2xl font-semibold mb-4">Administrator's User Manual</h2>
              </div>

              <h3 className="text-lg font-semibold mt-6">Adding an Experiment</h3>
              <p>To add a new experiment, enter a name in the field next to the + button, then confirm by clicking the
                  button.</p>

              <p>At this point, a tile with the name of the newly created experiment will appear in the Experiments
                  list. Clicking this tile opens the test editor, where tests comprising the experiment can be
                  configured.</p>

              <div className="flex justify-center my-4">
                  <img src="/guide_photos/Add_experiment.png" alt="Adding an experiment" className="my-4"/>
              </div>

              <h3 className="text-lg font-semibold mt-6">Uploading Samples</h3>
              <p>The first step in creating an experiment is uploading samples to the system. Click the Add samples
                  button to proceed. In the displayed window, the user has two options: Upload samples or Available
                  samples.</p>
              <p>If the audio material required for the experiment is not already in the database, upload it by
                  selecting a file from your computer and confirming the upload with the Submit Samples button.
                  Successfully uploaded files will appear in the right-hand column of the window under Available
                  Samples. Added samples can be previewed using the built-in player. To include samples in the
                  experiment, click the Select button next to each desired track and confirm with Submit Samples. The
                  tracks are now associated with the experiment being created.</p>

              <div className="flex justify-center my-4">
                  <img src="/guide_photos/Add_sample.png" alt="Adding an experiment" className="my-4"/>
              </div>

              <h3 className="text-lg font-semibold mt-6">Constructing the Tests</h3>
              <p>To add a test, click the + button next to the Tests label. A tile will appear below, and clicking it
                  opens a configuration window for the test, where four test types are available: MUSHRA, AB, ABX, and
                  APE.</p>

              <h4 className="text-md font-semibold mt-4">MUSHRA Test</h4>
              <p>The MUSHRA test (Multiple Stimuli with Hidden Reference and Anchor) is a subjective method for
                  evaluating audio quality, where participants compare various versions of the same audio signal,
                  including a reference version and distorted samples. The goal is to rate the perceptual quality of
                  samples on a scale from 0 to 100, with participants able to listen to the samples repeatedly and
                  switch between them.</p>

              <div className="flex justify-center my-4">
                  <img src="/guide_photos/Create_MUSHRA.png" alt="Adding an experiment" className="my-4"/>
              </div>

              <h4 className="text-md font-semibold mt-4">AB Test</h4>
              <p>This is the simplest test type, where users answer questions by selecting one of two audio tracks.
                  Example questions might be: "Which track has better quality?" or "Which track has better spatial
                  characteristics?"</p>

              <div className="flex justify-center my-4">
                  <img src="/guide_photos/Create_AB.png" alt="Adding an experiment" className="my-4"/>
              </div>

              <h4 className="text-md font-semibold mt-4">ABX Test</h4>
              <p>This is a modified version of the AB test, where the additional default task is identifying which of
                  the two tracks corresponds to the one labeled X.</p>

              <div className="flex justify-center my-4">
                  <img src="/guide_photos/Create_ABX.png" alt="Adding an experiment" className="my-4"/>
              </div>

              <h4 className="text-md font-semibold mt-4">APE Test</h4>
              <p>The APE test assesses perceptual audio quality across various conditions or processing techniques.
                  Participants rate audio samples on specified scales, such as intelligibility, naturalness, or overall
                  quality, using sliders.</p>

              <div className="flex justify-center my-4">
                  <img src="/guide_photos/Create_APE.png" alt="Adding an experiment" className="my-4"/>
              </div>

              <h3 className="text-lg font-semibold mt-6">Saving the Experiment</h3>
              <p>To save an experiment and make it available to participants, click the Floppy Disk icon in the
                  top-right corner of the configuration window.</p>

              <h3 className="text-lg font-semibold mt-6">Viewing Experiment Results</h3>
              <p>Results from conducted experiments can be reviewed in the Experiment review tab, accessible via the
                  dropdown menu in the top-right corner.</p>

              <div className="flex justify-center my-4">
                  <img src="/guide_photos/Experiment_review.png" alt="Adding an experiment" className="my-4"/>
              </div>

              <div className="flex justify-center my-4">
                  <img src="/guide_photos/Experiment_review_chart.png" alt="Adding an experiment" className="my-4"/>
              </div>

              <h3 className="text-lg font-semibold mt-6">Quick Experiment Management</h3>
              <p>The application includes a tab for quickly reviewing experiment specifications and deleting them from
                  the database if needed.</p>

              <div className="flex justify-center my-4">
                  <img src="/guide_photos/Experiment_management.png" alt="Adding an experiment" className="my-4"/>
              </div>

              <div className="flex justify-center my-4">
                  <img src="/guide_photos/Experiment_management_details.png" alt="Adding an experiment"
                       className="my-4"/>
              </div>

              <h3 className="text-lg font-semibold mt-6">Rating Audio Samples</h3>
              <p>A dedicated tab allows administrators to rate samples uploaded to the system on a scale from 1 to 5.
                  Samples can also be previewed.</p>

              <div className="flex justify-center my-4">
                  <img src="/guide_photos/Sample_ranking.png" alt="Adding an experiment" className="my-4"/>
              </div>

          </div>
      </div>
        <ScrollToTopButton/>
    </div>
  );
};

export default Guide;
