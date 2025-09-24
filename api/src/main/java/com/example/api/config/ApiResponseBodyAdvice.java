package com.example.api.config;

import com.example.api.dto.ApiResponse;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestControllerAdvice
public class ApiResponseBodyAdvice implements ResponseBodyAdvice {
    @Override
    public boolean supports(MethodParameter returnType, Class converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType, Class selectedConverterType, ServerHttpRequest request, ServerHttpResponse response) {
        if (body instanceof ApiResponse) {
            return body;
        }
        if (body instanceof SseEmitter) {
            return body;
        }
        if (selectedContentType != null && MediaType.TEXT_EVENT_STREAM.isCompatibleWith(selectedContentType)) {
            return body;
        }
        if (body == null && response instanceof ServletServerHttpResponse) {
            ServletServerHttpResponse servletResponse = (ServletServerHttpResponse) response;
            if (servletResponse.getServletResponse().getStatus() == HttpStatus.CREATED.value()) {
                return null;
            }
        }
        return ApiResponse.success(body);
    }
}
