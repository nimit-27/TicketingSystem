import type React from "react";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "altcha-widget": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                challengeurl?: string;
                name?: string;
                auto?: "off" | "onfocus" | "onload" | "onsubmit";
                floating?: "auto" | "top" | "bottom";
                hidefooter?: boolean;
                hidelogo?: boolean;
            };
        }
    }
}

export {};
