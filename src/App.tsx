import React, { useState } from "react";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faStar,
  faCodeBranch,
  faPlus,
  faSyncAlt,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { format, isValid } from "date-fns";
import LoadingSpinner from "./Components/LoadingSpinner";
import { GET_REPOSITORIES, GET_REPOSITORY_DETAILS } from "./Graphql/queries";
import { ADD_REPOSITORY, MARK_RELEASE_AS_SEEN } from "./Graphql/mutations";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper function to format dates
const formattedDate = (dateString: string | null) => {
  if (!dateString) return "No date available";

  const date = new Date(dateString);
  if (!isValid(date)) return "Invalid Date";

  return format(date, "dd/MM/yyyy");
};

const App: React.FC = () => {
  const [selectedRepoName, setSelectedRepoName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // API calls
  const {
    data: repoData,
    loading: repoLoading,
    error: repoError,
    refetch,
  } = useQuery(GET_REPOSITORIES);

  const [
    fetchRepositoryDetails,
    { data: detailsData, loading: detailsLoading },
  ] = useLazyQuery(GET_REPOSITORY_DETAILS);

  const [addRepository] = useMutation(ADD_REPOSITORY);

  const handleAddRepo = async () => {
    if (!searchTerm.trim()) return;

    setIsAdding(true);
    try {
      await addRepository({ variables: { name: searchTerm } });
      setSearchTerm("");
      refetch();
      toast.success("Repository added successfully!", {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (err) {
      setSearchTerm("");
      toast.error("Failed to add repository. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleSelectRepo = (repoName: string) => {
    setSelectedRepoName(repoName);
    fetchRepositoryDetails({ variables: { name: repoName } });
  };

  const repos = repoData?.repositories || [];
  const selectedRepoDetails = detailsData?.repositoryDetails;

  const [markReleaseAsSeen] = useMutation(MARK_RELEASE_AS_SEEN);

  const handleMarkReleaseAsSeen = async (releaseId: String) => {
    try {
      const parsedReleaseId = Number(releaseId);
      if (isNaN(parsedReleaseId)) {
        throw new Error("Invalid release ID");
      }

      await markReleaseAsSeen({
        variables: {
          releaseId: parsedReleaseId,
        },
      });

      toast.success("Release marked as seen successfully!", {
        position: "top-center",
        autoClose: 3000,
      });

      refetch(); // Optional: Refetch data
    } catch (err) {
      console.error("Error marking release as seen:", err);
      toast.error("Failed to mark release as seen. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 p-8">
      <ToastContainer /> {/* Add the ToastContainer component */}
      <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg w-full shadow-sm">
          <FontAwesomeIcon icon={faSearch} className="text-gray-500 mr-2" />
          <input
            type="text"
            className="flex-1 bg-transparent focus:outline-none"
            placeholder="Search for a GitHub repo (e.g., facebook/react)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className={`flex items-center gap-2 px-6 py-2 font-semibold rounded-lg shadow transition duration-200 ${
            isAdding
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          onClick={handleAddRepo}
          disabled={isAdding}
        >
          {isAdding ? <LoadingSpinner /> : <FontAwesomeIcon icon={faPlus} />}
          {isAdding ? "Adding..." : "Add"}
        </button>
      </div>
      {/* Main Content */}
      <div className="flex space-x-6">
        {/* Left Column */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex-1 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Repositories</h2>
            <button
              className="text-gray-500 hover:text-blue-600 transition duration-200 p-2"
              onClick={() => refetch()}
              title="Refresh Repositories"
            >
              <FontAwesomeIcon icon={faSyncAlt} className="text-xl" />
            </button>
          </div>

          {repoLoading ? (
            <div className="flex justify-center items-center py-4">
              <LoadingSpinner />
            </div>
          ) : repoError ? (
            <p className="text-red-500">Error fetching repositories</p>
          ) : (
            <ul className="space-y-4">
              {repos
                ?.slice()
                .reverse()
                .map(
                  (repo: {
                    id: string;
                    name: string;
                    latestRelease: {
                      version: string;
                      publishedAt: string;
                    } | null;
                  }) => (
                    <li
                      key={repo.id}
                      className={`cursor-pointer p-4 rounded-lg shadow-md bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-blue-100 transition duration-200 border-l-4 ${
                        selectedRepoName === repo.name
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                      onClick={() => handleSelectRepo(repo.name)}
                    >
                      <div className="font-semibold text-lg text-gray-700 flex justify-between">
                        {repo.name}
                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-xs px-3 py-1 rounded-full shadow-sm ${
                              repo.latestRelease
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-200 text-gray-500"
                            }`}
                            title={
                              repo.latestRelease
                                ? `Version: v${repo.latestRelease.version}`
                                : "No releases available"
                            }
                          >
                            {repo.latestRelease
                              ? `v${repo.latestRelease.version}`
                              : "No releases"}
                          </span>
                          <button
                            disabled={
                              repo.latestRelease && repo.latestRelease.seen
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkReleaseAsSeen(repo.id);
                            }}
                            className={`p-2 text-blue-600 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                              repo.latestRelease && repo.latestRelease.seen
                                ? "bg-green-100"
                                : "bg-blue-100"
                            }`}
                            title="Mark release as seen"
                          >
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="text-xl"
                            />
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                )}
            </ul>
          )}
        </div>

        {/* Right Column */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex-1 h-full overflow-y-auto">
          {detailsLoading ? (
            <div className="flex justify-center items-center py-4">
              <LoadingSpinner />
            </div>
          ) : selectedRepoDetails ? (
            <>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                {selectedRepoDetails.name}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <FontAwesomeIcon
                    icon={faStar}
                    className="inline mr-2 text-yellow-500"
                  />
                  <strong className="mr-2">Stars:</strong>{" "}
                  {selectedRepoDetails.stars}
                </div>
                <div className="flex items-center text-gray-700">
                  <FontAwesomeIcon
                    icon={faCodeBranch}
                    className="inline mr-2 text-green-500"
                  />
                  <strong className="mr-2">Forks:</strong>{" "}
                  {selectedRepoDetails.forks}
                </div>
                {selectedRepoDetails.latestRelease && (
                  <>
                    <div className="text-gray-700">
                      <strong>Latest Release:</strong>{" "}
                      {selectedRepoDetails.latestRelease.version} ({" "}
                      {formattedDate(
                        selectedRepoDetails.latestRelease.publishedAt
                      )}
                      )
                    </div>
                    <div className="text-gray-700">
                      <strong>Release Notes:</strong>
                      <pre className="bg-gray-100 p-4 rounded-lg shadow-inner mt-2 text-sm overflow-auto">
                        {selectedRepoDetails.latestRelease.releaseNotes}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Select a repository to view details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
