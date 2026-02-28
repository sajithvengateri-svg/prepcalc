// Food cost calculation utilities

export const calculateReverseCost = (
  sellPrice: number,
  targetPercent: number,
  servings: number = 1
) => {
  const maxAllowedCost = (sellPrice * targetPercent) / 100;
  const maxIngredientBudget = maxAllowedCost * servings;
  const targetMargin = sellPrice - maxAllowedCost;
  const targetMarginPercent = 100 - targetPercent;

  return {
    maxAllowedCost,
    maxIngredientBudget,
    targetMargin,
    targetMarginPercent,
  };
};

export const calculateSellPriceFromCost = (
  actualCost: number,
  targetPercent: number
) => {
  if (targetPercent === 0) return 0;
  return actualCost / (targetPercent / 100);
};

export const calculateFoodCostPercent = (
  actualCost: number,
  sellPrice: number
) => {
  if (sellPrice === 0) return 0;
  return (actualCost / sellPrice) * 100;
};
