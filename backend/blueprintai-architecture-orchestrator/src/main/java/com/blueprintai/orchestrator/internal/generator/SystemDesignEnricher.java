package com.blueprintai.orchestrator.internal.generator;

import java.util.Locale;

/** Injects domain-specific design guidance based on system type and description. */
public final class SystemDesignEnricher {

    private SystemDesignEnricher() {}

    public static String domainGuidance(String systemDescription, String systemType) {
        String combined = ((systemDescription != null ? systemDescription : "")
                        + " "
                        + (systemType != null ? systemType : ""))
                .toLowerCase(Locale.ROOT);

        if (containsAny(combined, "netflix", "hotstar", "streaming", "video", "ott")) {
            return """
                    Streaming/OTT domain: CDN edge caching, adaptive bitrate (HLS/DASH), encoding pipeline,
                    recommendation engine, watch history, DRM, multi-region origin, spike traffic during live events,
                    per-title encoding, content metadata service, playback QoS metrics.""";
        }
        if (containsAny(combined, "uber", "ride", "dispatch", "matching", "mobility")) {
            return """
                    Ride-hailing domain: real-time geospatial indexing, driver-rider matching, surge pricing,
                    trip state machine, ETA prediction, payment settlement, fraud detection, websocket location updates.""";
        }
        if (containsAny(combined, "whatsapp", "messaging", "chat", "slack")) {
            return """
                    Messaging domain: fan-out on write vs read, message ordering, delivery receipts, presence,
                    end-to-end encryption considerations, media storage, push notifications, multi-device sync.""";
        }
        if (containsAny(combined, "instagram", "social", "feed", "timeline")) {
            return """
                    Social feed domain: news feed ranking, media pipeline, graph store for follows, cache-heavy read path,
                    celebrity/hot-key handling, notification fan-out, content moderation pipeline.""";
        }
        if (containsAny(combined, "bank", "payment", "fintech", "wallet")) {
            return """
                    Fintech domain: ACID transactions, idempotency keys, ledger double-entry, PCI scope reduction,
                    fraud rules engine, strong consistency for balances, audit trails, regulatory compliance.""";
        }
        if (containsAny(combined, "ecommerce", "e-commerce", "shop", "cart", "checkout", "amazon")) {
            return """
                    E-commerce domain: catalog search, inventory reservation, cart abandonment, order orchestration,
                    payment gateway integration, warehouse fulfillment, recommendation, flash sale traffic patterns.""";
        }
        if (containsAny(combined, "api", "saas", "platform")) {
            return """
                    SaaS/API platform: multi-tenancy isolation, rate limiting, API versioning, usage metering,
                    webhook delivery, OAuth2/OIDC, horizontal pod autoscaling.""";
        }
        return """
                General distributed system: define clear service boundaries, async boundaries for heavy work,
                cache hot reads, use message queues for decoupling, design for failure with retries and circuit breakers,
                include observability (metrics, structured logs, distributed tracing) as first-class components.""";
    }

    private static boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
}
