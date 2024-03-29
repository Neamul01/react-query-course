import { useState } from "react";
import { IssueItem } from "./IssueItem";
import fetchWithError from "../helpers/fetchWithError";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "./Loader";

export default function IssuesList({ labels, status, pageNum, setPageNum }) {
  const queryClient = useQueryClient();

  const fetchIssues = async ({ queryKey }) => {
    const [_key, { labels, status, pageNum }] = queryKey;
    const statusString = status ? `&status=${status}` : "";
    const labelsString = labels.map((label) => `labels[]=${label}`).join("&");
    const paginationStr = `&page=${pageNum}`;

    return fetchWithError(
      `/api/issues?${labelsString}${statusString}${paginationStr}`
    );
  };

  // FIXME: previous data are not kept
  const issuesQuery = useQuery({
    queryKey: ["issues", { labels, status, pageNum }],
    queryFn: fetchIssues,
    keepPreviousData: true,
  });
  const [searchValue, setSearchValue] = useState("");

  const searchQuery = useQuery({
    queryKey: ["issues", "search", searchValue],
    queryFn: ({ signal }) =>
      fetch(`/api/search/issues?q=${searchValue}`, { signal }).then((res) =>
        res.json()
      ),

    enabled: searchValue.length > 0,
  });
  // console.log(searchQuery.data);
  // console.log("issues query", issuesQuery.data);

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSearchValue(event.target.elements.search.value);
        }}
      >
        <label htmlFor="search">Search Issues</label>
        <input
          type="search"
          placeholder="Search"
          name="search"
          id="search"
          onChange={(event) => {
            if (event.target.value.length === 0) {
              setSearchValue("");
            }
          }}
        />
      </form>
      <h2>
        Issues List{" "}
        {issuesQuery.isFetching && !issuesQuery.isLoading ? <Loader /> : null}
      </h2>
      {issuesQuery.isLoading ? (
        <p>Loading...</p>
      ) : issuesQuery.isError ? (
        <p>{issuesQuery.error.message}</p>
      ) : searchValue.length === 0 || !searchQuery.data ? (
        <>
          <ul className="issues-list">
            {issuesQuery.data?.map((issue) => (
              <IssueItem
                key={issue.id}
                title={issue.title}
                number={issue.number}
                assignee={issue.assignee}
                commentCount={issue.comments.length}
                createdBy={issue.createdBy}
                createdDate={issue.createdDate}
                labels={issue.labels}
                status={issue.status}
              />
            ))}
          </ul>
          <div className="pagination">
            <button
              onClick={() => setPageNum((old) => Math.max(old - 1, 1))}
              disabled={pageNum === 1}
            >
              Previous
            </button>
            <p>Page {pageNum}</p>
            <button
              onClick={() => setPageNum((old) => old + 1)}
              disabled={issuesQuery.isFetching || issuesQuery.isLoading}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>Search Results</h2>
          {searchQuery.isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>{searchQuery.data?.count} Results</p>
              <ul className="issues-list">
                {searchQuery.data?.items?.map((issue) => (
                  <IssueItem
                    key={issue.id}
                    title={issue.title}
                    number={issue.number}
                    assignee={issue.assignee}
                    commentCount={issue.comments.length}
                    createdBy={issue.createdBy}
                    createdDate={issue.createdDate}
                    labels={issue.labels}
                    status={issue.status}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
