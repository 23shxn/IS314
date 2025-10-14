package com.grp12.Model;

public class EmailVerification {
    private String email;
    private String code;
    private long expirationTime;

    public EmailVerification(String email, String code, long expirationTime) {
        this.email = email;
        this.code = code;
        this.expirationTime = expirationTime;
    }

    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public long getExpirationTime() { return expirationTime; }
    public void setExpirationTime(long expirationTime) { this.expirationTime = expirationTime; }
    
    public boolean isExpired() {
        return System.currentTimeMillis() > expirationTime;
    }
}