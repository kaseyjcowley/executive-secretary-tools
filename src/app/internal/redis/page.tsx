"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface RedisData {
  [key: string]: unknown;
}

interface ApiResponse {
  keys: string[];
  data: RedisData;
}

function AuthPrompt({ onAuth }: { onAuth: (token: string) => void }) {
  const [token, setToken] = useState("");

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <h1 className="text-xl font-bold text-white mb-4">Redis Viewer</h1>
        <p className="text-gray-400 mb-4">
          Enter access token to view database.
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

function DataDisplay({ response }: { response: ApiResponse }) {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Redis Database</h1>
        <p className="text-gray-400 mb-6">{response.keys.length} keys</p>

        <div className="space-y-6">
          {response.keys.map((key) => (
            <section key={key} className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-400 mb-3 break-all">
                {key}
              </h2>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(response.data[key], null, 2)}
              </pre>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RedisPage() {
  const searchParams = useSearchParams();
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");

  const fetchData = async (authToken: string) => {
    try {
      setError(null);
      const res = await fetch(
        `/api/internal/redis?internal_token=${authToken}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!res.ok) {
        if (res.status === 401) {
          setError("Invalid token");
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
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
          window.location.href = `/internal/redis?token=${t}`;
        }}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          window.location.href = "/internal/redis";
        }}
      />
    );
  }

  if (!response) {
    return <LoadingState />;
  }

  return <DataDisplay response={response} />;
}
