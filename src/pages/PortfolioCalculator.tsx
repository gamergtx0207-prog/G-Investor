"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PlusCircle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import TimeHorizonSelector from "@/components/TimeHorizonSelector";
import RiskToleranceSelector from "@/components/RiskToleranceSelector";

interface Asset {
  id: string;
  name: string;
  percentage: number;
  color: string;
}

const COLORS = [
  "#6366F1", // Indigo
  "#FACC15", // Yellow
  "#22C55E", // Green
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#A855F7", // Purple
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#6B7280", // Gray
];

// --- Simplified Return Assumptions ---
const ASSET_BASE_RETURNS: { [key: string]: number } = {
  stocks: 0.08, // 8% annual return
  realEstate: 0.05, // 5% annual return
  commodities: 0.04, // 4% annual return
  cash: 0.00, // 0% annual return as requested
};

const ASSET_DEFAULT_NAMES: { [key: string]: string } = {
  stocks: "Stocks",
  realEstate: "Real Estate",
  commodities: "Commodities",
  cash: "Cash",
};

const RISK_TOLERANCE_MULTIPLIERS: { [key: string]: number } = {
  conservative: 0.8,
  moderate: 1.0,
  aggressive: 1.2,
};

const RISK_ALLOCATIONS: { [key: string]: { id: string; percentage: number }[] } = {
  conservative: [
    { id: "stocks", percentage: 30 },
    { id: "realEstate", percentage: 20 },
    { id: "commodities", percentage: 5 },
    { id: "cash", percentage: 45 },
  ],
  moderate: [
    { id: "stocks", percentage: 60 },
    { id: "realEstate", percentage: 15 },
    { id: "commodities", percentage: 10 },
    { id: "cash", percentage: 15 },
  ],
  aggressive: [
    { id: "stocks", percentage: 85 },
    { id: "realEstate", percentage: 10 },
    { id: "commodities", percentage: 5 },
    { id: "cash", percentage: 0 },
  ],
};
// --- End Return Assumptions ---

const PortfolioCalculator = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [timeHorizon, setTimeHorizon] = useState<string>("10");
  const [riskTolerance, setRiskTolerance] = useState<string>("moderate");
  const [estimatedAnnualReturn, setEstimatedAnnualReturn] = useState(0);
  const [estimatedTotalReturn, setEstimatedTotalReturn] = useState(0);

  // Function to apply a risk allocation template
  const applyRiskAllocation = useCallback((newRiskTolerance: string) => {
    const template = RISK_ALLOCATIONS[newRiskTolerance];
    if (!template) return;

    const newAssets: Asset[] = template.map((item, index) => ({
      id: item.id,
      name: ASSET_DEFAULT_NAMES[item.id] || item.id.charAt(0).toUpperCase() + item.id.slice(1),
      percentage: item.percentage,
      color: COLORS[index % COLORS.length],
    }));

    setAssets(newAssets);
    setRiskTolerance(newRiskTolerance);
  }, []);

  // Initialize assets based on default risk tolerance
  useEffect(() => {
    applyRiskAllocation("moderate");
  }, [applyRiskAllocation]);

  useEffect(() => {
    const sum = assets.reduce((acc, asset) => acc + asset.percentage, 0);
    setTotalAllocation(sum);
  }, [assets]);

  const calculateEstimatedReturns = useCallback(() => {
    if (totalAllocation !== 100) {
      setEstimatedAnnualReturn(0);
      setEstimatedTotalReturn(0);
      return;
    }

    let weightedAnnualReturn = 0;
    assets.forEach((asset) => {
      const baseReturn = ASSET_BASE_RETURNS[asset.id] || 0.03; // Default to 3% for unknown assets
      weightedAnnualReturn += (asset.percentage / 100) * baseReturn;
    });

    const riskMultiplier = RISK_TOLERANCE_MULTIPLIERS[riskTolerance] || 1.0;
    const adjustedAnnualReturn = weightedAnnualReturn * riskMultiplier;

    setEstimatedAnnualReturn(adjustedAnnualReturn * 100); // Convert to percentage

    const years = parseInt(timeHorizon);
    if (years > 0) {
      const totalReturn = (Math.pow(1 + adjustedAnnualReturn, years) - 1) * 100; // Convert to percentage
      setEstimatedTotalReturn(totalReturn);
    } else {
      setEstimatedTotalReturn(0);
    }
  }, [assets, totalAllocation, timeHorizon, riskTolerance]);

  useEffect(() => {
    calculateEstimatedReturns();
  }, [calculateEstimatedReturns]);

  const handleSliderChange = (id: string, value: number[]) => {
    const newPercentage = value[0];
    setAssets((prevAssets) => {
      const updatedAssets = prevAssets.map((asset) =>
        asset.id === id ? { ...asset, percentage: newPercentage } : asset
      );

      const currentTotal = updatedAssets.reduce(
        (acc, asset) => acc + asset.percentage,
        0
      );

      if (currentTotal > 100) {
        const excess = currentTotal - 100;
        const otherAssets = updatedAssets.filter((asset) => asset.id !== id);
        const otherAssetsTotal = otherAssets.reduce(
          (acc, asset) => acc + asset.percentage,
          0
        );

        if (otherAssetsTotal > 0) {
          return updatedAssets.map((asset) => {
            if (asset.id === id) {
              return { ...asset, percentage: newPercentage };
            } else {
              const reduction = (asset.percentage / otherAssetsTotal) * excess;
              return { ...asset, percentage: Math.max(0, asset.percentage - reduction) };
            }
          });
        } else {
          return updatedAssets.map((asset) =>
            asset.id === id ? { ...asset, percentage: Math.min(100, newPercentage) } : asset
          );
        }
      } else if (currentTotal < 100 && prevAssets.length > 0) {
        // For simplicity, we'll just let it be less than 100 for now,
        // and rely on the user to adjust to 100.
      }

      return updatedAssets;
    });
  };

  const handleInputChange = (id: string, value: string) => {
    const newPercentage = parseFloat(value);
    if (!isNaN(newPercentage) && newPercentage >= 0 && newPercentage <= 100) {
      setAssets((prevAssets) => {
        const updatedAssets = prevAssets.map((asset) =>
          asset.id === id ? { ...asset, percentage: newPercentage } : asset
        );

        const currentTotal = updatedAssets.reduce(
          (acc, asset) => acc + asset.percentage,
          0
        );

        if (currentTotal > 100) {
          const excess = currentTotal - 100;
          const otherAssets = updatedAssets.filter((asset) => asset.id !== id);
          const otherAssetsTotal = otherAssets.reduce(
            (acc, asset) => acc + asset.percentage,
            0
          );

          if (otherAssetsTotal > 0) {
            return updatedAssets.map((asset) => {
              if (asset.id === id) {
                return { ...asset, percentage: newPercentage };
              } else {
                const reduction = (asset.percentage / otherAssetsTotal) * excess;
                return { ...asset, percentage: Math.max(0, asset.percentage - reduction) };
              }
            });
          } else {
            return updatedAssets.map((asset) =>
              asset.id === id ? { ...asset, percentage: Math.min(100, newPercentage) } : asset
            );
          }
        }
        return updatedAssets;
      });
    }
  };

  const handleAssetNameChange = (id: string, newName: string) => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) =>
        asset.id === id ? { ...asset, name: newName } : asset
      )
    );
  };

  const addAsset = () => {
    const newId = `asset-${Date.now()}`;
    const newColor = COLORS[assets.length % COLORS.length];
    setAssets((prevAssets) => [
      ...prevAssets,
      { id: newId, name: `New Asset ${prevAssets.length + 1}`, percentage: 0, color: newColor },
    ]);
  };

  const removeAsset = (id: string) => {
    setAssets((prevAssets) => {
      const updatedAssets = prevAssets.filter((asset) => asset.id !== id);
      const currentTotal = updatedAssets.reduce((acc, asset) => acc + asset.percentage, 0);
      if (currentTotal < 100 && updatedAssets.length > 0) {
        const remaining = 100 - currentTotal;
        const totalExistingPercentage = updatedAssets.reduce((acc, asset) => acc + asset.percentage, 0);
        if (totalExistingPercentage > 0) {
          return updatedAssets.map(asset => ({
            ...asset,
            percentage: asset.percentage + (asset.percentage / totalExistingPercentage) * remaining
          }));
        }
      }
      return updatedAssets;
    });
  };

  const pieChartData = assets.filter(asset => asset.percentage > 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl rounded-xl shadow-lg border-none">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl sm:text-4xl font-extrabold text-indigo-800">
            Investment Portfolio Calculator
          </CardTitle>
          <p className="text-md text-gray-600 mt-2">
            Adjust your asset allocation and visualize your portfolio.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 sm:p-6">
          {/* Asset Allocation Controls */}
          <div className="space-y-6">
            {assets.map((asset) => (
              <div key={asset.id} className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <Input
                    type="text"
                    value={asset.name}
                    onChange={(e) => handleAssetNameChange(asset.id, e.target.value)}
                    className="text-lg font-semibold text-gray-700 border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent"
                  />
                  <span className="text-lg font-medium text-gray-600 ml-2">
                    ({((ASSET_BASE_RETURNS[asset.id] || 0.03) * 100).toFixed(0)}% est. annual return)
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAsset(asset.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <MinusCircle className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <Slider
                    id={`asset-${asset.id}`}
                    min={0}
                    max={100}
                    step={1}
                    value={[asset.percentage]}
                    onValueChange={(value) => handleSliderChange(asset.id, value)}
                    className="flex-grow [&>span:first-child]:h-2 [&>span:first-child]:rounded-full [&>span:first-child]:bg-indigo-200 [&>span:first-child>span]:bg-indigo-600 [&>span:first-child>span]:rounded-full [&>span:first-child>span]:border-2 [&>span:first-child>span]:border-indigo-600"
                  />
                  <Input
                    type="number"
                    value={asset.percentage}
                    onChange={(e) => handleInputChange(asset.id, e.target.value)}
                    className="w-20 text-center rounded-md border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                    min={0}
                    max={100}
                  />
                  <span className="text-lg font-medium text-gray-700">%</span>
                </div>
              </div>
            ))}
            <Button
              onClick={addAsset}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-lg font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-5 w-5" /> Add Asset Class
            </Button>
            <div className="flex justify-between items-center p-4 bg-indigo-100 rounded-lg shadow-sm">
              <span className="text-xl font-bold text-indigo-800">Total Allocation:</span>
              <Badge
                className={cn(
                  "text-lg font-bold px-4 py-2 rounded-full",
                  totalAllocation === 100
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white animate-pulse"
                )}
              >
                {totalAllocation}%
              </Badge>
            </div>

            {/* Time Horizon Selector */}
            <TimeHorizonSelector onSelect={setTimeHorizon} defaultValue={timeHorizon} />

            {/* Risk Tolerance Selector */}
            <RiskToleranceSelector onSelect={applyRiskAllocation} defaultValue={riskTolerance} />
          </div>

          {/* Portfolio Visualization and Estimated Returns */}
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg shadow-sm p-4">
            <h3 className="text-2xl font-bold text-indigo-800 mb-4">Portfolio Distribution</h3>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="name"
                    animationDuration={500}
                    stroke="none"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      padding: "8px 12px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#333" }}
                    itemStyle={{ color: "#555" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 text-lg">
                Add assets to see your portfolio distribution!
              </div>
            )}
            <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-xs">
              {assets.map((asset) => (
                <div key={asset.id} className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: asset.color }}
                  ></span>
                  <span className="text-sm text-gray-700">{asset.name} ({asset.percentage.toFixed(0)}%)</span>
                </div>
              ))}
            </div>

            {/* Estimated Returns */}
            <Card className="w-full mt-8 p-4 bg-white rounded-lg shadow-md border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-indigo-800">Estimated Returns</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                {totalAllocation === 100 ? (
                  <>
                    <p className="mb-2 text-lg">
                      **Annual Return:** <span className="font-bold text-indigo-700">{estimatedAnnualReturn.toFixed(2)}%</span>
                    </p>
                    <p className="mb-2 text-lg">
                      **Total Return ({timeHorizon} years):** <span className="font-bold text-indigo-700">{estimatedTotalReturn.toFixed(2)}%</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Based on your {riskTolerance} risk tolerance over {timeHorizon} years.
                    </p>
                  </>
                ) : (
                  <p className="text-red-500 font-semibold">
                    Please adjust your asset allocation to 100% to see estimated returns.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioCalculator;