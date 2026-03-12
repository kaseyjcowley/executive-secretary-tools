export interface LlmJob<TInput, TOutput> {
  name: string;
  run(input: TInput): Promise<TOutput>;
}

export interface LlmJobRequest {
  job: string;
  payload: unknown;
}

export interface LlmJobResponse {
  result: unknown;
  error?: string;
}
