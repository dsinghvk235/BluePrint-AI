package com.blueprintai.common.response;

import java.util.List;

/** Standard paginated response envelope for list endpoints. */
public record PaginatedResponse<T>(
        List<T> items, int page, int size, long totalElements, int totalPages) {}
