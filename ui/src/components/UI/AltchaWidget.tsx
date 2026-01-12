import { ForwardedRef, forwardRef, useEffect, useRef } from "react";
import "altcha";
import "altcha/altcha.css";

interface AltchaWidgetProps {
    challengeUrl: string;
    name?: string;
    auto?: "off" | "onfocus" | "onload" | "onsubmit";
    floating?: "auto" | "top" | "bottom";
    hideFooter?: boolean;
    hideLogo?: boolean;
    onVerified?: () => void;
}

const AltchaWidget = (
    {
        challengeUrl,
        name = "altchaToken",
        auto = "onsubmit",
        floating = "auto",
        hideFooter = true,
        hideLogo = true,
        onVerified,
    }: AltchaWidgetProps,
    forwardedRef: ForwardedRef<HTMLElement>
) => {
    const widgetRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const widget = widgetRef.current;
        if (!widget) {
            return;
        }
        const handleVerified = () => {
            onVerified?.();
        };
        widget.addEventListener("verified", handleVerified);
        return () => {
            widget.removeEventListener("verified", handleVerified);
        };
    }, [onVerified]);

    const setRefs = (element: HTMLElement | null) => {
        widgetRef.current = element;
        if (typeof forwardedRef === "function") {
            forwardedRef(element);
        } else if (forwardedRef) {
            forwardedRef.current = element;
        }
    };

    return (
        <altcha-widget
            ref={setRefs}
            challengeurl={challengeUrl}
            name={name}
            auto={auto}
            floating={floating}
            hidefooter={hideFooter}
            hidelogo={hideLogo}
        />
    );
};

export default forwardRef(AltchaWidget);
