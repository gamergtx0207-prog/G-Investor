"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TimeHorizonSelectorProps {
  onSelect: (value: string) => void;
  defaultValue?: string;
}

const TimeHorizonSelector: React.FC<TimeHorizonSelectorProps> = ({ onSelect, defaultValue = "10" }) => {
  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg shadow-sm">
      <Label htmlFor="time-horizon" className="text-lg font-semibold text-gray-700">
        Investment Time Horizon
      </Label>
      <Select onValueChange={onSelect} defaultValue={defaultValue}>
        <SelectTrigger id="time-horizon" className="w-full rounded-md border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500">
          <SelectValue placeholder="Select time horizon" />
        </SelectTrigger>
        <SelectContent className="rounded-md shadow-lg">
          <SelectItem value="1">1 Year</SelectItem>
          <SelectItem value="5">5 Years</SelectItem>
          <SelectItem value="10">10 Years</SelectItem>
          <SelectItem value="20">20 Years</SelectItem>
          <SelectItem value="30">30 Years</SelectItem>
          <SelectItem value="40">40+ Years</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeHorizonSelector;