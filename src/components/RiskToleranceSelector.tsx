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

interface RiskToleranceSelectorProps {
  onSelect: (value: string) => void;
  defaultValue?: string;
}

const RiskToleranceSelector: React.FC<RiskToleranceSelectorProps> = ({ onSelect, defaultValue = "moderate" }) => {
  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg shadow-sm">
      <Label htmlFor="risk-tolerance" className="text-lg font-semibold text-gray-700">
        Risk Tolerance
      </Label>
      <Select onValueChange={onSelect} defaultValue={defaultValue}>
        <SelectTrigger id="risk-tolerance" className="w-full rounded-md border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500">
          <SelectValue placeholder="Select risk tolerance" />
        </SelectTrigger>
        <SelectContent className="rounded-md shadow-lg">
          <SelectItem value="conservative">Conservative</SelectItem>
          <SelectItem value="moderate">Moderate</SelectItem>
          <SelectItem value="aggressive">Aggressive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RiskToleranceSelector;