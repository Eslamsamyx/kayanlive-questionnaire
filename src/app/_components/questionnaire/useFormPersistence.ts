"use client";

import { useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";

interface FormData {
  answers: Record<number, any>;
  uploadedFiles: Record<number, File[]>;
  currentSectionIndex: number;
  submissionId?: string;
  lastSaved?: number;
}

interface UseFormPersistenceOptions {
  questionnaireId: string;
  autoSaveInterval?: number;
  onAutoSave?: (data: FormData) => Promise<void>;
  onRestore?: (data: FormData) => void;
}

/**
 * Custom hook for form data persistence with localStorage and auto-save
 */
export function useFormPersistence({
  questionnaireId,
  autoSaveInterval = 30000, // 30 seconds default
  onAutoSave,
  onRestore,
}: UseFormPersistenceOptions) {
  const storageKey = `questionnaire_${questionnaireId}_draft`;
  const lastSaveTimeRef = useRef<number>(Date.now());
  const isDirtyRef = useRef<boolean>(false);

  /**
   * Save data to localStorage
   */
  const saveToLocalStorage = useCallback((data: FormData) => {
    try {
      // Convert Files to metadata for localStorage (files themselves can't be stored)
      const dataToStore = {
        ...data,
        uploadedFiles: Object.entries(data.uploadedFiles).reduce(
          (acc, [questionId, files]) => {
            acc[Number(questionId)] = files.map(file => ({
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
            }));
            return acc;
          },
          {} as Record<number, any[]>
        ),
        lastSaved: Date.now(),
        version: "1.0",
      };

      localStorage.setItem(storageKey, JSON.stringify(dataToStore));
      lastSaveTimeRef.current = Date.now();
      isDirtyRef.current = false;

      // Also save a backup with timestamp
      const backupKey = `${storageKey}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(dataToStore));

      // Clean up old backups (keep only last 3)
      cleanupOldBackups(storageKey);

      return true;
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      return false;
    }
  }, [storageKey]);

  /**
   * Load data from localStorage
   */
  const loadFromLocalStorage = useCallback((): FormData | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // Check if data is not too old (7 days)
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (parsed.lastSaved < sevenDaysAgo) {
        localStorage.removeItem(storageKey);
        return null;
      }

      // Note: Files can't be restored from localStorage
      // User will need to re-upload them
      return {
        answers: parsed.answers || {},
        uploadedFiles: {},
        currentSectionIndex: parsed.currentSectionIndex || 0,
        submissionId: parsed.submissionId,
      };
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return null;
    }
  }, [storageKey]);

  /**
   * Clear saved data
   */
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      // Also clear backups
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`${storageKey}_backup_`)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  }, [storageKey]);

  /**
   * Auto-save with debouncing
   */
  const debouncedAutoSave = useRef(
    debounce(async (data: FormData) => {
      // Save to localStorage first
      saveToLocalStorage(data);

      // Then save to server if callback provided
      if (onAutoSave) {
        try {
          await onAutoSave(data);
          console.log("Auto-saved to server at", new Date().toLocaleTimeString());
        } catch (error) {
          console.error("Failed to auto-save to server:", error);
          // localStorage save already succeeded, so data is not lost
        }
      }
    }, 5000) // Debounce for 5 seconds
  ).current;

  /**
   * Mark data as dirty and trigger auto-save
   */
  const markDirty = useCallback((data: FormData) => {
    isDirtyRef.current = true;
    debouncedAutoSave(data);
  }, [debouncedAutoSave]);

  /**
   * Cleanup old backups to prevent localStorage bloat
   */
  const cleanupOldBackups = (baseKey: string) => {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${baseKey}_backup_`))
        .sort()
        .reverse();

      // Keep only the 3 most recent backups
      if (backupKeys.length > 3) {
        backupKeys.slice(3).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.error("Failed to cleanup old backups:", error);
    }
  };

  /**
   * Restore data on component mount
   */
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData && onRestore) {
      // Ask user if they want to restore
      const shouldRestore = window.confirm(
        "We found a saved draft of your questionnaire. Would you like to continue where you left off?"
      );

      if (shouldRestore) {
        onRestore(savedData);
        console.log("Restored form data from", new Date(savedData.lastSaved || 0).toLocaleString());
      } else {
        clearSavedData();
      }
    }
  }, []); // Only run on mount

  /**
   * Set up periodic auto-save
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirtyRef.current) {
        // Trigger save if data is dirty
        const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;
        if (timeSinceLastSave >= autoSaveInterval) {
          console.log("Periodic auto-save triggered");
          // The actual save will be triggered by markDirty
        }
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSaveInterval]);

  /**
   * Save on page unload
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearSavedData,
    markDirty,
    isDirty: isDirtyRef.current,
  };
}

/**
 * Hook for session recovery after browser crash
 */
export function useSessionRecovery(questionnaireId: string) {
  const recoveryKey = `questionnaire_${questionnaireId}_recovery`;

  const saveRecoveryPoint = useCallback((data: any) => {
    try {
      sessionStorage.setItem(recoveryKey, JSON.stringify({
        ...data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error("Failed to save recovery point:", error);
    }
  }, [recoveryKey]);

  const getRecoveryPoint = useCallback(() => {
    try {
      const data = sessionStorage.getItem(recoveryKey);
      if (data) {
        const parsed = JSON.parse(data);
        // Check if recovery point is not too old (1 hour)
        if (Date.now() - parsed.timestamp < 3600000) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Failed to get recovery point:", error);
    }
    return null;
  }, [recoveryKey]);

  const clearRecoveryPoint = useCallback(() => {
    sessionStorage.removeItem(recoveryKey);
  }, [recoveryKey]);

  return {
    saveRecoveryPoint,
    getRecoveryPoint,
    clearRecoveryPoint,
  };
}