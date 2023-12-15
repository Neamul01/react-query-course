import { useState } from "react";
import { IssueItem } from "./IssueItem";
import fetchWithError from "../helpers/fetchWithError";
import { useQuery } from "@tanstack/react-query";
// import { useQuery } from "react-query";

export default function IssuesList({ labels, status }) {
  const issuesQuery = useQuery({
    queryKey: ["issues", { labels, status }],
    queryFn: () => {
      const statusString = status ? `&status=${status}` : "";
      const labelsString = labels.map((label) => `labels[]=${label}`).join("&");
      return fetchWithError(`/api/issues?${labelsString}${statusString}`);
    },
  });
  const [searchValue, setSearchValue] = useState("");

  const searchQuery = useQuery({
    queryKey: ["issues", "search", searchValue],
    queryFn: () =>
      fetch(`/api/search/issues?q=${searchValue}`).then((res) => res.json()),

    enabled: searchValue.length > 0,
  });
  console.log(searchQuery.data);
  console.log("issues query", issuesQuery.data);

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
      <h2>Issues List</h2>
      {issuesQuery.isLoading ? (
        <p>Loading...</p>
      ) : issuesQuery.isError ? (
        <p>{issuesQuery.error.message}</p>
      ) : searchValue.length === 0 || !searchQuery.data ? (
        <ul className="issues-list">
          {issuesQuery.data.map((issue) => (
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
