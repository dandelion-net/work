import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import VoteButtons from "@/components/voting/VoteButtons";
import SearchBar from "@/components/search/SearchBar";
import FilterBar, { FilterOptions } from "@/components/filters/FilterBar";

interface Problem {
  id: string;
  title: string;
  description: string;
  status: string;
  author: {
    name: string;
    email: string;
  };
  _count: {
    solutions: number;
    votes: number;
  };
  createdAt: string;
}

export default function ProblemList() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});
  const { ref, inView } = useInView();

  const fetchProblems = async (reset = false) => {
    if (isLoading || (!hasMore && !reset)) return;
    setIsLoading(true);

    const currentPage = reset ? 1 : page;
    const queryParams = new URLSearchParams({
      page: currentPage.toString(),
      limit: "10",
      ...(searchQuery && { q: searchQuery }),
      ...(filters.status && { status: filters.status }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.timeFrame && { timeFrame: filters.timeFrame }),
    });

    try {
      const response = await fetch(
        `/api/problems/search?${queryParams.toString()}`
      );
      const data = await response.json();
      
      if (data.problems.length === 0) {
        setHasMore(false);
        return;
      }

      setProblems(prev => reset ? data.problems : [...prev, ...data.problems]);
      setPage(prev => reset ? 2 : prev + 1);
      setHasMore(data.problems.length === 10);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems(true);
  }, [searchQuery, filters]);

  useEffect(() => {
    if (inView) {
      fetchProblems();
    }
  }, [inView]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    setHasMore(true);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPage(1);
    setHasMore(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SearchBar onSearch={handleSearch} placeholder="Search problems..." />
        <FilterBar onFilterChange={handleFilterChange} />
      </div>

      <div className="space-y-4">
        {problems.map((problem) => (
          <Card key={problem.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{problem.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Posted by {problem.author.name} on{" "}
                  {new Date(problem.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-2">{problem.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-sm text-muted-foreground">
                    {problem._count.solutions} solutions
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {problem._count.votes} votes
                  </span>
                </div>
              </div>
              <VoteButtons problemId={problem.id} />
            </div>
          </Card>
        ))}

        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3 mt-2" />
                <Skeleton className="h-20 w-full mt-4" />
              </Card>
            ))}
          </div>
        )}

        <div ref={ref} className="h-10" />
      </div>
    </div>
  );
}