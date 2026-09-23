package com.blueprintai.search.api.dto;

import java.time.Instant;
import java.util.UUID;

public record SearchHistoryItem(UUID id, String query, int resultCount, Instant searchedAt) {}
