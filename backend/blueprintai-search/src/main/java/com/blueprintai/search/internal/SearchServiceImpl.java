package com.blueprintai.search.internal;

import com.blueprintai.search.api.SearchService;
import org.springframework.stereotype.Service;

@Service
public class SearchServiceImpl implements SearchService {

    private static final String MODULE_NAME = "search";

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return false;
    }
}
