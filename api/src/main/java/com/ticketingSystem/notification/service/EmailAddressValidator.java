package com.ticketingSystem.notification.service;

import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import org.springframework.stereotype.Component;

@Component
public class EmailAddressValidator {

    public boolean isValid(String email) {
        if (email == null) {
            return false;
        }
        String trimmed = email.trim();
        if (trimmed.isEmpty() || !trimmed.equals(email) || trimmed.contains(" ")) {
            return false;
        }
        int atIndex = trimmed.indexOf('@');
        if (atIndex <= 0 || atIndex != trimmed.lastIndexOf('@') || atIndex == trimmed.length() - 1) {
            return false;
        }
        String localPart = trimmed.substring(0, atIndex);
        String domainPart = trimmed.substring(atIndex + 1);
        if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.contains("..")) {
            return false;
        }
        if (!isValidDomain(domainPart)) {
            return false;
        }
        try {
            InternetAddress address = new InternetAddress(trimmed, true);
            address.validate();
            return trimmed.equals(address.getAddress());
        } catch (AddressException ex) {
            return false;
        }
    }

    private boolean isValidDomain(String domainPart) {
        if (domainPart.startsWith(".") || domainPart.endsWith(".") || domainPart.contains("..") || !domainPart.contains(".")) {
            return false;
        }
        String[] labels = domainPart.split("\\.");
        String topLevelDomain = labels[labels.length - 1];
        if (topLevelDomain.length() < 2) {
            return false;
        }
        for (String label : labels) {
            if (label.isBlank() || label.startsWith("-") || label.endsWith("-")) {
                return false;
            }
        }
        return true;
    }
}
