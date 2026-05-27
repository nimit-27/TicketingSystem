package com.ticketingSystem.api.dto;

import com.ticketingSystem.api.dto.LoginPayload;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.util.StringUtils;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DownloadReportRequestDto {
    private int page = 0;
    private int size = 10;
    private String requestedBy;
    private String reportCode;
    private String format;
    private String requestedAt;

    public void applyPolicyRuleParams(Set<String> policyRulesParams, LoginPayload authenticatedUser) {
        if (policyRulesParams == null || policyRulesParams.isEmpty()) {
            return;
        }

        if (policyRulesParams.contains("requestedBy")
                && authenticatedUser != null
                && StringUtils.hasText(authenticatedUser.getUserId())) {
            this.requestedBy = authenticatedUser.getUserId();
        }
    }
}
