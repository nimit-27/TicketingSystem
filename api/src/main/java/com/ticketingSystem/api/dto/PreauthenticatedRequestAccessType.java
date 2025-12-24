package com.ticketingSystem.api.dto;

public class PreauthenticatedRequestAccessType {
    
    public static final String OBJECT_READ = "ObjectRead";
    public static final String OBJECT_WRITE = "ObjectWrite";
    public static final String OBJECT_READ_WRITE = "ObjectReadWrite";
    public static final String ANY_OBJECT_READ = "AnyObjectRead";
    public static final String ANY_OBJECT_WRITE = "AnyObjectWrite";
    public static final String ANY_OBJECT_READ_WRITE = "AnyObjectReadWrite";
    
    public static boolean isValid(String value) {
        return OBJECT_READ.equals(value) || 
               OBJECT_WRITE.equals(value) || 
               OBJECT_READ_WRITE.equals(value) || 
               ANY_OBJECT_READ.equals(value) || 
               ANY_OBJECT_WRITE.equals(value) || 
               ANY_OBJECT_READ_WRITE.equals(value);
    }
}
