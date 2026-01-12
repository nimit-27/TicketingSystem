package com.ticketingSystem.api.dto;

public class LoginRequest {
    private String username;
    private String password;
    private String portal;
    private String altchaToken;
//    private List<String> roles;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPortal() {
        return portal;
    }

    public void setPortal(String portal) {
        this.portal = portal;
    }

    public String getAltchaToken() {
        return altchaToken;
    }

    public void setAltchaToken(String altchaToken) {
        this.altchaToken = altchaToken;
    }

//    public List<String> getRoles() {
//        return roles;
//    }
//
//    public void setRoles(List<String> roles) {
//        this.roles = roles;
//    }
}
