import { useCallback, useEffect, useMemo, useState } from "react";
import { getPlayerProfile } from "../services/playerProfileService";
import { getErrorMessage } from "../utils/getErrorMessage";
import {
  getCompletionItems,
  getHeroSummary,
  getInitials,
  getProfileCompletion,
  formatPreferredFoot,
} from "../utils/playerProfileHelpers";

export function usePlayerProfile() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getPlayerProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(getErrorMessage(err, "Failed to load your profile."));
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const completion = useMemo(() => getProfileCompletion(profile), [profile]);
  const completionItems = useMemo(() => getCompletionItems(profile), [profile]);
  const heroSummary = useMemo(() => getHeroSummary(profile), [profile]);
  const initials = useMemo(
    () => getInitials(profile?.first_name, profile?.last_name),
    [profile?.first_name, profile?.last_name]
  );

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    completion,
    completionItems,
    heroSummary,
    initials,
    formatPreferredFoot,
  };
}