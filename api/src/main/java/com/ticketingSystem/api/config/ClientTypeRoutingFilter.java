package com.ticketingSystem.api.config;

import com.ticketingSystem.api.enums.ClientType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Locale;

@Component
public class ClientTypeRoutingFilter extends OncePerRequestFilter {
    public static final String CLIENT_TYPE_ATTRIBUTE = "clientType";
    private static final String MOBILE_PREFIX = "/mobile";
    private static final String INTERNAL_PREFIX = "/internal";
    private static final String PREFIX_REQUIRED_MESSAGE = "API paths must start with /internal or /mobile";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, PREFIX_REQUIRED_MESSAGE);
            return;
        }

        ClientType clientType;
        String normalizedPath;

        String lowerPath = path.toLowerCase(Locale.ROOT);
        if (lowerPath.startsWith(MOBILE_PREFIX)) {
            clientType = ClientType.MOBILE;
            normalizedPath = stripPrefix(path, MOBILE_PREFIX);
        } else if (lowerPath.startsWith(INTERNAL_PREFIX)) {
            clientType = ClientType.INTERNAL;
            normalizedPath = stripPrefix(path, INTERNAL_PREFIX);
        } else {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, PREFIX_REQUIRED_MESSAGE);
            return;
        }

        HttpServletRequest wrappedRequest = request;
        if (!normalizedPath.equals(path)) {
            wrappedRequest = new PrefixedPathRequestWrapper(request, normalizedPath);
        }
        wrappedRequest.setAttribute(CLIENT_TYPE_ATTRIBUTE, clientType);
        filterChain.doFilter(wrappedRequest, response);
    }

    private String stripPrefix(String path, String prefix) {
        String withoutPrefix = path.substring(prefix.length());
        return withoutPrefix.isEmpty() ? "/" : withoutPrefix;
    }

    private static class PrefixedPathRequestWrapper extends HttpServletRequestWrapper {
        private final String normalizedPath;

        PrefixedPathRequestWrapper(HttpServletRequest request, String normalizedPath) {
            super(request);
            this.normalizedPath = normalizedPath;
        }

        @Override
        public String getRequestURI() {
            return normalizedPath;
        }

        @Override
        public String getServletPath() {
            return normalizedPath;
        }

        @Override
        public StringBuffer getRequestURL() {
            HttpServletRequest request = (HttpServletRequest) getRequest();
            StringBuffer original = new StringBuffer(request.getRequestURL());
            int index = original.indexOf(request.getRequestURI());
            if (index >= 0) {
                original.replace(index, original.length(), normalizedPath);
            }
            return original;
        }
    }
}
