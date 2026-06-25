package com.blueprintai.auth.internal;

import com.blueprintai.auth.api.AuthService;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private static final String MODULE_NAME = "authentication";

    @Override
    public String getModuleName() {
        return MODULE_NAME;
    }

    @Override
    public boolean isReady() {
        return false;
    }
}
