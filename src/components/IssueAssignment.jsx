import React, { useState } from "react";
import { useUserData } from "../helpers/useUserData";
import { GoGear } from "react-icons/go";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function IssueAssignment({ assignee, issueNumber }) {
  const user = useUserData(assignee);
  const [menuOpen, setMenuOpen] = useState(false);
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then((res) => res.json()),
  });

  const queryClient = useQueryClient();
  const setAssignment = useMutation({
    mutationFn: (newAssignee) => {
      return fetch(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignee: newAssignee }),
      }).then((res) => res.json());
    },
    onMutate: async (assignee) => {
      await queryClient.cancelQueries(["issues", issueNumber]);

      const previousAssignment = queryClient.getQueryData([
        "issues",
        issueNumber,
      ]);
      if (previousAssignment) {
        queryClient.setQueryData(["issues", issueNumber], {
          ...previousAssignment,
          assignee,
        });
      }

      return { previousAssignment };
    },
    onError: (error, newStatus, context) => {
      if (context?.previousAssignment) {
        queryClient.setQueryData(
          ["issues", issueNumber],
          context.previousAssignment
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["issues", issueNumber]);
    },
  });

  return (
    <div className="issue-options">
      <div>
        <span>Assignment</span>
        {user.isSuccess && (
          <div>
            <img src={user.data.profilePictureUrl} alt="profile" />
            {user.data.name}
          </div>
        )}
      </div>
      <GoGear onClick={() => !usersQuery.isLoading && setMenuOpen(!menuOpen)} />
      {menuOpen && (
        <div className="picker-menu">
          {usersQuery.data?.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                setAssignment.mutate(user.id);
                setMenuOpen(false);
              }}
            >
              <img src={user.profilePictureUrl} alt="" />
              {user.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
