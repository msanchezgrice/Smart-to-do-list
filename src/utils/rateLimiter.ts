interface RateLimiterOptions {
  maxRequests: number;
  interval: number; // in milliseconds
}

class RateLimiter {
  private timestamps: number[] = [];
  private maxRequests: number;
  private interval: number;

  constructor({ maxRequests, interval }: RateLimiterOptions) {
    this.maxRequests = maxRequests;
    this.interval = interval;
  }

  async waitForToken(): Promise<void> {
    const now = Date.now();
    
    // Remove timestamps outside the current interval
    this.timestamps = this.timestamps.filter(
      timestamp => now - timestamp < this.interval
    );

    if (this.timestamps.length >= this.maxRequests) {
      // Calculate how long to wait
      const oldestTimestamp = this.timestamps[0];
      const waitTime = this.interval - (now - oldestTimestamp);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      // Recursive call to ensure we're still within limits after waiting
      return this.waitForToken();
    }

    this.timestamps.push(now);
  }
}

// Create a singleton instance for OpenAI API calls
export const openAIRateLimiter = new RateLimiter({
  maxRequests: 50, // Adjust based on your OpenAI plan
  interval: 60 * 1000 // 1 minute
}); 