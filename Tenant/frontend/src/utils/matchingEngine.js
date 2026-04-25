/**
 * Rule-based matching engine for roommate/travel buddy matching
 * Calculates compatibility score and provides match reasons
 */

export const calculateMatchScore = (userPreferences, candidate) => {
  let score = 0;
  const maxScore = 100;
  let reasons = [];

  // 1. Budget Match (25 points)
  const budgetOverlap = calculateBudgetOverlap(userPreferences.budget, candidate.budget);
  score += budgetOverlap * 25;
  if (budgetOverlap > 0.8) reasons.push('Ngân sách phù hợp');
  else if (budgetOverlap > 0.5) reasons.push('Ngân sách gần');

  // 2. Location Match (20 points)
  const locationMatch = calculateLocationMatch(userPreferences.locations, candidate.locations);
  score += locationMatch * 20;
  if (locationMatch > 0.8) reasons.push('Cùng khu vực');
  else if (locationMatch > 0.5) reasons.push('Khu vực gần');

  // 3. Gender Preference (15 points)
  if (userPreferences.genderPreference === 'any' || userPreferences.genderPreference === candidate.gender) {
    score += 15;
  }

  // 4. Lifestyle Match (20 points)
  const lifestyleMatch = calculateLifestyleMatch(userPreferences.lifestyle, candidate.lifestyle);
  score += lifestyleMatch * 20;
  if (lifestyleMatch > 0.7) reasons.push('Lối sống tương đồng');

  // 5. Duration Match (10 points)
  if (userPreferences.duration === candidate.duration) {
    score += 10;
    reasons.push('Cùng thời gian ở');
  }

  // 6. Interests Match (10 points)
  const interestMatch = calculateInterestsMatch(userPreferences.interests, candidate.interests);
  score += interestMatch * 10;
  if (interestMatch > 0.5) reasons.push('Cùng sở thích');

  return {
    score: Math.min(Math.round(score), maxScore),
    reasons: reasons.slice(0, 3), // Limit to 3 reasons
  };
};

const calculateBudgetOverlap = (userBudget, candidateBudget) => {
  const userMin = userBudget[0];
  const userMax = userBudget[1];
  const candMin = candidateBudget[0];
  const candMax = candidateBudget[1];

  const overlapStart = Math.max(userMin, candMin);
  const overlapEnd = Math.min(userMax, candMax);

  if (overlapStart > overlapEnd) return 0; // No overlap

  const overlapRange = overlapEnd - overlapStart;
  const userRange = userMax - userMin;
  const candRange = candMax - candMin;
  const avgRange = (userRange + candRange) / 2;

  return overlapRange / avgRange;
};

const calculateLocationMatch = (userLocations, candidateLocations) => {
  if (!userLocations.length || !candidateLocations.length) return 0.5;
  const matches = userLocations.filter((loc) => candidateLocations.includes(loc)).length;
  return matches / Math.max(userLocations.length, candidateLocations.length);
};

const calculateLifestyleMatch = (userLifestyle, candidateLifestyle) => {
  const lifestyle1 = new Set(userLifestyle);
  const lifestyle2 = new Set(candidateLifestyle);
  const intersection = new Set([...lifestyle1].filter((x) => lifestyle2.has(x)));
  const union = new Set([...lifestyle1, ...lifestyle2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
};

const calculateInterestsMatch = (userInterests, candidateInterests) => {
  const interests1 = new Set(userInterests.map((i) => i.toLowerCase()));
  const interests2 = new Set(candidateInterests.map((i) => i.toLowerCase()));
  const intersection = new Set([...interests1].filter((x) => interests2.has(x)));
  const union = new Set([...interests1, ...interests2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
};

export const filterMatchesByPreferences = (candidates, userPreferences) => {
  return candidates.filter((candidate) => {
    // Budget filter
    const budgetMatch = calculateBudgetOverlap(userPreferences.budget, candidate.budget) > 0;
    if (!budgetMatch) return false;

    // Location filter (if specified)
    if (userPreferences.locations.length > 0) {
      const locationMatch = calculateLocationMatch(userPreferences.locations, candidate.locations) > 0;
      if (!locationMatch) return false;
    }

    // Gender preference filter
    if (userPreferences.genderPreference !== 'any' && userPreferences.genderPreference !== candidate.gender) {
      return false;
    }

    // Duration filter (if specified)
    if (userPreferences.duration && userPreferences.duration !== candidate.duration) {
      return false;
    }

    return true;
  });
};

export const rankMatches = (candidates, userPreferences) => {
  return candidates
    .map((candidate) => ({
      ...candidate,
      matchData: calculateMatchScore(userPreferences, candidate),
    }))
    .sort((a, b) => b.matchData.score - a.matchData.score);
};
