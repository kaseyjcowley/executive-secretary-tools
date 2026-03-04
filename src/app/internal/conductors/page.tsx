"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Conductor {
  slackUserId: string;
  name: string;
}

interface ConductorOverride extends Conductor {
  reason: string;
  expiresAfterDate: string;
}

interface ConductorState {
  rotation: Conductor[];
  currentIndex: number;
  override: ConductorOverride | null;
}

function AuthPrompt({ onAuth }: { onAuth: (token: string) => void }) {
  const [token, setToken] = useState("");

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <h1 className="text-xl font-bold text-white mb-4">
          Conductor Rotation
        </h1>
        <p className="text-gray-400 mb-4">
          Enter access token to view rotation state.
        </p>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Access token"
          className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none mb-4"
        />
        <button
          onClick={() => onAuth(token)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          View
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <h1 className="text-xl font-bold text-red-400 mb-4">Error</h1>
        <p className="text-gray-400 mb-4">{message}</p>
        <button
          onClick={onRetry}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function DataDisplay({ state }: { state: ConductorState }) {
  const currentConductor = state.rotation[state.currentIndex];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          Conductor Rotation
        </h1>

        <div className="space-y-6">
          <section className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-400 mb-3">
              Current Conductor
            </h2>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(currentConductor, null, 2)}
            </pre>
          </section>

          <section className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-400 mb-3">
              Rotation ({state.rotation.length} members)
            </h2>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(state.rotation, null, 2)}
            </pre>
          </section>

          <section className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-400 mb-3">
              Current Index
            </h2>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
              {state.currentIndex}
            </pre>
          </section>

          <section className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-400 mb-3">
              Override
            </h2>
            {state.override ? (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(state.override, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-400">No override set</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ConductorsPage() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [state, setState] = useState<ConductorState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");

  const fetchData = async (authToken: string) => {
    try {
      setError(null);
      const response = await fetch(
        `/api/conductors?internal_token=${authToken}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          setError("Invalid token");
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setState(data);
      setIsAuthenticated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    }
  };

  useEffect(() => {
    if (token) {
      fetchData(token);
    }
  }, [token]);

  if (!token) {
    return (
      <AuthPrompt
        onAuth={(t) => {
          window.location.href = `/internal/conductors?token=${t}`;
        }}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          window.location.href = "/internal/conductors";
        }}
      />
    );
  }

  if (!state) {
    return <LoadingState />;
  }

  return <DataDisplay state={state} />;
}
