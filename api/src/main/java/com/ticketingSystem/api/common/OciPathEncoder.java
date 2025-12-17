package com.ticketingSystem.api.common;

import java.nio.charset.StandardCharsets;

public final class OciPathEncoder {
    private static final String UNRESERVED = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~";

    public static String encodeObjectKey(String objectKey) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < objectKey.length(); i++) {
            char c = objectKey.charAt(i);
            if (UNRESERVED.indexOf(c) >= 0) {
                sb.append(c);
            } else {
                byte[] bytes = String.valueOf(c).getBytes(StandardCharsets.UTF_8);
                for (byte b : bytes) {
                    sb.append('%').append(String.format("%02X", b));
                }
            }
        }
        return sb.toString();
    }
}
