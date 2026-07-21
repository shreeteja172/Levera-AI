import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  isSaved: boolean;
  isSolved: boolean;
}

export interface ProblemsFilters {
  difficulty?: string;
  status?: string;
  saved?: string;
}

export const problemsKeys = {
  all: ["problems"] as const,
  lists: () => [...problemsKeys.all, "list"] as const,
  list: (filters: ProblemsFilters) => [...problemsKeys.lists(), filters] as const,
  details: () => [...problemsKeys.all, "detail"] as const,
  detail: (id: string) => [...problemsKeys.details(), id] as const,
};

async function fetchProblems(filters: ProblemsFilters): Promise<Problem[]> {
  const { data } = await axios.get("/api/problems", { params: filters });
  return data.problems;
}

export function useProblems(filters: ProblemsFilters) {
  return useQuery({
    queryKey: problemsKeys.list(filters),
    queryFn: () => fetchProblems(filters),
  });
}

export function useToggleSaveProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (problemId: string) => {
      const { data } = await axios.post(`/api/problems/${problemId}/save`);
      return data;
    },
    onMutate: async (problemId: string) => {
      await queryClient.cancelQueries({ queryKey: problemsKeys.lists() });

      const previousQueries = queryClient.getQueriesData<Problem[]>({
        queryKey: problemsKeys.lists(),
      });

      queryClient.setQueriesData<Problem[]>(
        { queryKey: problemsKeys.lists() },
        (oldProblems) => {
          if (!oldProblems) return oldProblems;
          return oldProblems.map((p) =>
            p.id === problemId ? { ...p, isSaved: !p.isSaved } : p
          );
        }
      );

      return { previousQueries };
    },
    onError: (err, problemId, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousValue]) => {
          queryClient.setQueryData(queryKey, previousValue);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: problemsKeys.lists() });
    },
  });
}

export function useToggleSolveProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (problemId: string) => {
      const { data } = await axios.post(`/api/problems/${problemId}/solve`);
      return data;
    },
    onMutate: async (problemId: string) => {
      await queryClient.cancelQueries({ queryKey: problemsKeys.lists() });

      const previousQueries = queryClient.getQueriesData<Problem[]>({
        queryKey: problemsKeys.lists(),
      });

      queryClient.setQueriesData<Problem[]>(
        { queryKey: problemsKeys.lists() },
        (oldProblems) => {
          if (!oldProblems) return oldProblems;
          return oldProblems.map((p) =>
            p.id === problemId ? { ...p, isSolved: !p.isSolved } : p
          );
        }
      );

      return { previousQueries };
    },
    onError: (err, problemId, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousValue]) => {
          queryClient.setQueryData(queryKey, previousValue);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: problemsKeys.lists() });
    },
  });
}

export function useSeedProblems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post("/api/problems/seed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemsKeys.all });
    },
  });
}
