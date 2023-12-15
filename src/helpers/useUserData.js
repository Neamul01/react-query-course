import { useQuery } from "@tanstack/react-query";

export function useUserData(userId) {
  const usersData = useQuery({
    queryKey: ["users", userId],
    queryFn: () => fetch(`/api/users/${userId}`).then((res) => res.json()),

    staleTime: 1000 * 60 * 5,
  });

  return usersData;
}
