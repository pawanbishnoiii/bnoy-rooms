import { Property, UserPreferences, PropertyWithScore } from '@/types';

// Function to calculate a score for a property based on user preferences
const calculatePropertyScore = (property: Property, preferences: UserPreferences): number => {
  let score = 0;

  // Location preference
  if (preferences.preferred_location && property.location?.name?.toLowerCase().includes(preferences.preferred_location.toLowerCase())) {
    score += 30;
  }

  // Property type preference
  if (preferences.preferred_property_type && property.type.toLowerCase() === preferences.preferred_property_type.toLowerCase()) {
    score += 25;
  }

  // Gender accommodation preference
  if (preferences.preferred_gender_accommodation) {
    if (property.gender === 'any' || property.gender === preferences.preferred_gender_accommodation) {
      score += 20;
    } else {
      score -= 15; // Penalize if it doesn't match
    }
  }

  // Budget preference
  if (preferences.max_budget && property.monthly_price <= preferences.max_budget) {
    // Give higher score if the price is significantly lower than the budget
    const budgetDifference = preferences.max_budget - property.monthly_price;
    const budgetRatio = budgetDifference / preferences.max_budget;
    score += 15 * budgetRatio;
  } else if (preferences.max_budget) {
    score -= 20; // Significant penalty if over budget
  }

  // Add a small base score
  score += 10;

  return Math.max(0, score); // Ensure score is not negative
};

// Function to match preferences with properties
export const matchPropertiesWithPreferences = (
  properties: Property[],
  preferences: UserPreferences
): PropertyWithScore[] => {
  if (!properties || properties.length === 0) {
    return [];
  }

  return properties.map((property) => {
    const matchScore = calculatePropertyScore(property, preferences);
    return {
      ...property,
      matchScore
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

// For location-based matches
export const getPropertiesNearLocation = (
  properties: Property[],
  targetLocation: string,
  maxDistance = 10 // km
): PropertyWithScore[] => {
  if (!properties || properties.length === 0) {
    return [];
  }

  // Mock implementation for location-based scoring
  return properties.map((property) => {
    // Assign higher score for properties that mention the location in address
    const matchScore = property.address.toLowerCase().includes(targetLocation.toLowerCase()) ? 90 : 50;
    return {
      ...property,
      matchScore
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

// For budget-based matches
export const getPropertiesInBudget = (
  properties: Property[],
  maxBudget: number
): PropertyWithScore[] => {
  if (!properties || properties.length === 0 || !maxBudget) {
    return [];
  }

  return properties
    .filter((property) => property.monthly_price <= maxBudget)
    .map((property) => {
      // Score based on how much below budget the property is
      const budgetDifference = maxBudget - property.monthly_price;
      const matchScore = Math.min(100, Math.floor((budgetDifference / maxBudget) * 100) + 50);
      return {
        ...property,
        matchScore
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
};
