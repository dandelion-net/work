"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOptions {
  status?: string;
  sortBy?: string;
  timeFrame?: string;
}

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const handleStatusChange = (value: string) => {
    onFilterChange({ status: value });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ sortBy: value });
  };

  const handleTimeFrameChange = (value: string) => {
    onFilterChange({ timeFrame: value });
  };

  return (
    <div className="flex gap-4">
      <Select onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="solved">Solved</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="most_votes">Most Votes</SelectItem>
          <SelectItem value="most_solutions">Most Solutions</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={handleTimeFrameChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Time frame" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="this_week">This Week</SelectItem>
          <SelectItem value="this_month">This Month</SelectItem>
          <SelectItem value="all_time">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}