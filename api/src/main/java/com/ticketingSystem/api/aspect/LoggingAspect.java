package com.ticketingSystem.api.aspect;

import java.util.Arrays;
import java.util.Collection;
import java.util.Map;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.http.ResponseEntity;

/**
 * Aspect for logging execution of controller and service beans.
 */
@Aspect
@Component
public class LoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    /**
     * Logs entry, exit and exceptions for methods in controller and service packages.
     *
     * @param joinPoint join point for advised method
     * @return result of method execution
     * @throws Throwable if the advised method throws any exception
     */
    @Around("execution(* com.ticketingSystem..controller..*(..)) || execution(* com.ticketingSystem..service..*(..))")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();
        logger.info("Entering {}.{} with arguments {}", className, methodName, summarizeArgs(joinPoint.getArgs()));
        try {
            Object result = joinPoint.proceed();
            logger.info("Exiting {}.{} with result {}", className, methodName, summarizeResult(result));
            return result;
        } catch (Throwable ex) {
            logger.error("Exception in {}.{}", className, methodName, ex);
            throw ex;
        }
    }

    private String summarizeArgs(Object[] args) {
        if (args == null) {
            return "[]";
        }
        return Arrays.toString(Arrays.stream(args).map(this::summarizeValue).toArray());
    }

    private String summarizeResult(Object result) {
        return summarizeValue(result);
    }

    private String summarizeValue(Object value) {
        if (value == null) {
            return "null";
        }
        if (value instanceof byte[] bytes) {
            return "byte[" + bytes.length + "]";
        }
        if (value instanceof ResponseEntity<?> responseEntity) {
            Object body = responseEntity.getBody();
            String bodySummary = summarizeValue(body);
            return "ResponseEntity(status=" + responseEntity.getStatusCode() + ", body=" + bodySummary + ")";
        }
        if (value instanceof Collection<?> collection) {
            return value.getClass().getSimpleName() + "(size=" + collection.size() + ")";
        }
        if (value instanceof Map<?, ?> map) {
            return value.getClass().getSimpleName() + "(size=" + map.size() + ")";
        }
        return String.valueOf(value);
    }
}
