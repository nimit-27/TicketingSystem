package com.ticketingSystem.notification.service;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

public class SimpleRateLimiter {
    private final long intervalNanos;
    private final AtomicLong nextAllowedTime = new AtomicLong();

    public SimpleRateLimiter(int permitsPerSecond) {
        if (permitsPerSecond <= 0) {
            this.intervalNanos = 0;
        } else {
            this.intervalNanos = TimeUnit.SECONDS.toNanos(1) / permitsPerSecond;
        }
    }

    public void acquire() {
        if (intervalNanos <= 0) {
            return;
        }
        while (true) {
            long now = System.nanoTime();
            long next = nextAllowedTime.get();
            long allowed = Math.max(now, next);
            if (nextAllowedTime.compareAndSet(next, allowed + intervalNanos)) {
                long sleepNanos = allowed - now;
                if (sleepNanos > 0) {
                    try {
                        TimeUnit.NANOSECONDS.sleep(sleepNanos);
                    } catch (InterruptedException ex) {
                        Thread.currentThread().interrupt();
                    }
                }
                return;
            }
        }
    }
}
