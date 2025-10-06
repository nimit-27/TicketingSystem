package com.ticketingSystem.api.aspect;

import java.util.Arrays;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

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
        logger.info("Entering {}.{} with arguments {}", className, methodName, Arrays.toString(joinPoint.getArgs()));
        try {
            Object result = joinPoint.proceed();
            logger.info("Exiting {}.{} with result {}", className, methodName, result);
            return result;
        } catch (Throwable ex) {
            logger.error("Exception in {}.{}", className, methodName, ex);
            throw ex;
        }
    }
}
