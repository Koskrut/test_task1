import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NovaPoshtaResponse } from './nova-poshta.types';

interface NovaPoshtaRequest {
  apiKey: string;
  modelName: string;
  calledMethod: string;
  methodProperties: Record<string, unknown>;
}

@Injectable()
export class NovaPoshtaClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly retryCount: number;
  private readonly retryDelayMs: number;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('novaPoshta.apiKey') ?? '';
    this.baseUrl = this.configService.get<string>('novaPoshta.baseUrl') ?? '';
    this.timeoutMs =
      this.configService.get<number>('novaPoshta.requestTimeoutMs') ?? 8000;
    this.retryCount =
      this.configService.get<number>('novaPoshta.retryCount') ?? 3;
    this.retryDelayMs =
      this.configService.get<number>('novaPoshta.retryDelayMs') ?? 500;
  }

  async call<T>(
    modelName: string,
    calledMethod: string,
    methodProperties: Record<string, unknown>,
  ): Promise<NovaPoshtaResponse<T>> {
    if (!this.apiKey) {
      throw new Error('Nova Poshta API key is not configured');
    }

    const payload: NovaPoshtaRequest = {
      apiKey: this.apiKey,
      modelName,
      calledMethod,
      methodProperties,
    };

    return this.withRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Nova Poshta API error: ${response.status}`);
        }

        const data = (await response.json()) as NovaPoshtaResponse<T>;
        if (!data.success) {
          const errorText = data.errors?.join(', ') || 'Unknown error';
          throw new Error(`Nova Poshta API error: ${errorText}`);
        }

        return data;
      } finally {
        clearTimeout(timeoutId);
      }
    });
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;
    let lastError: Error | undefined;

    while (attempt < this.retryCount) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        attempt += 1;
        if (attempt >= this.retryCount) {
          break;
        }
        await this.delay(this.retryDelayMs * attempt);
      }
    }

    throw lastError ?? new Error('Nova Poshta request failed');
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
