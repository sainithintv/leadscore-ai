'use client';
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface Profile {
  id: string;
  linkedinUrl: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  company: string;
  companyId: string;
  companyLocation: string;
  companyDescription: string;
  companySize: string;
  companyWebsite: string;
  industry: string;
  location: string;
  summary: string;
  isPremium: string;
  openProfile: string;
  type: string;
}

export interface ScoredProfile extends Profile {
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  reasoning: string;
}

export interface EnrichedProfile extends ScoredProfile {
  email?: string;
  phone?: string;
  enrichmentStatus?: 'pending' | 'success' | 'failed';
}

interface AppState {
  apiKeys: { openai: string; mistral: string; lusha: string; aiModel: 'openai' | 'mistral' };
  persona: { name: string; description: string; targetTitles: string; targetIndustries: string; minSeniority: string };
  profiles: Profile[];
  scoredProfiles: ScoredProfile[];
  enrichedProfiles: EnrichedProfile[];
}

type Action =
  | { type: 'SET_API_KEYS'; payload: AppState['apiKeys'] }
  | { type: 'SET_PERSONA'; payload: AppState['persona'] }
  | { type: 'SET_PROFILES'; payload: Profile[] }
  | { type: 'SET_SCORED_PROFILES'; payload: ScoredProfile[] }
  | { type: 'SET_ENRICHED_PROFILES'; payload: EnrichedProfile[] }
  | { type: 'UPDATE_ENRICHED_PROFILE'; payload: { id: string; email?: string; phone?: string; enrichmentStatus: 'pending' | 'success' | 'failed' } }
  | { type: 'LOAD'; payload: AppState };

const defaultState: AppState = {
  apiKeys: { openai: '', mistral: '', lusha: '', aiModel: 'mistral' },
  persona: { name: '', description: '', targetTitles: '', targetIndustries: '', minSeniority: 'mid' },
  profiles: [],
  scoredProfiles: [],
  enrichedProfiles: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_API_KEYS': return { ...state, apiKeys: action.payload };
    case 'SET_PERSONA': return { ...state, persona: action.payload };
    case 'SET_PROFILES': return { ...state, profiles: action.payload };
    case 'SET_SCORED_PROFILES': return { ...state, scoredProfiles: action.payload };
    case 'SET_ENRICHED_PROFILES': return { ...state, enrichedProfiles: action.payload };
    case 'UPDATE_ENRICHED_PROFILE': return {
      ...state,
      enrichedProfiles: state.enrichedProfiles.map(p =>
        p.id === action.payload.id ? { ...p, ...action.payload } : p
      ),
    };
    case 'LOAD': return action.payload;
    default: return state;
  }
}

const Ctx = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('leadscore-state');
      if (saved) dispatch({ type: 'LOAD', payload: JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('leadscore-state', JSON.stringify(state));
    } catch {}
  }, [state]);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppStore must be inside AppProvider');
  return ctx;
}
