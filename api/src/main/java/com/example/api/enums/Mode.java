package com.example.api.enums;

public enum Mode {
    Self("1", "SELF"),
    Call("2", "CALL"),
    Email("3", "EMAIL");

    private final String id;
    private final String code;

    Mode(String id, String code) {
        this.id = id;
        this.code = code;
    }

    public String getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public static Mode fromId(String id) {
        if (id == null) {
            return null;
        }
        for (Mode mode : values()) {
            if (mode.id.equals(id)) {
                return mode;
            }
        }
        return null;
    }

    public static Mode fromCode(String code) {
        if (code == null) {
            return null;
        }
        for (Mode mode : values()) {
            if (mode.code.equalsIgnoreCase(code)) {
                return mode;
            }
        }
        return null;
    }
}
