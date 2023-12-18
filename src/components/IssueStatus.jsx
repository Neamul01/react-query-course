import React from "react";
import { StatusSelect } from "./StatusSelect";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function IssueStatus({ status, issueNumber }) {
  const queryClient = useQueryClient();
  const setStatus = useMutation({
    mutationFn: (newStatus) => {
      return fetch(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      }).then((res) => res.json());
    },
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries(["issues", issueNumber]);

      const previousIssue = queryClient.getQueryData(["issues", issueNumber]);
      if (previousIssue) {
        queryClient.setQueryData(["issues", issueNumber], {
          ...previousIssue,
          status: newStatus,
        });
      }

      return { previousIssue };
    },
    onError: (error, newStatus, context) => {
      if (context?.previousIssue) {
        queryClient.setQueryData(
          ["issues", issueNumber],
          context.previousIssue
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["issues", issueNumber]);
    },
  });

  return (
    <div className="issue-options">
      <div className="">
        <span>Status</span>
        <StatusSelect
          noEmptyOption
          value={status}
          onChange={(e) => setStatus.mutate(e.target.value)}
        />
      </div>
    </div>
  );
}
