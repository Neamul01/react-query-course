import { useQuery } from "@tanstack/react-query";

export function useLabelsData() {
  const labelsQuery = useQuery({
    queryKey: ["labels"],
    queryFn: () => fetch("/api/labels").then((res) => res.json()),

    staleTime: 1000 * 60 * 60,
  });

  return labelsQuery;
}
