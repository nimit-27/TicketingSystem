import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { Theme, useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

export interface MetricCardTextConfig {
  attributes?: Record<string, unknown> | null;
  text?: string | number | null;
  textSize?: number | string | null;
  textColor?: string | null;
}

export interface MetricCardData {
  title?: MetricCardTextConfig | null;
  subtitle?: MetricCardTextConfig | null;
  metricValue?: MetricCardTextConfig | null;
  backgroundColor?: string | null;
  children?: MetricCardData[] | null;
  show?: boolean | null;
}

interface CustomMetricCardProps extends MetricCardData {
  level?: number;
}

const defaultTextConfig = {
  title: {
    text: "",
    textSize: 12,
    textColor: "text.secondary",
  },
  subtitle: {
    text: "",
    textSize: 12,
    textColor: "text.secondary",
  },
  metricValue: {
    text: "0",
    textSize: 24,
    textColor: "text.primary",
  },
};

const resolveThemeColor = (theme: Theme, color?: string | null, fallback = "text.primary") => {
  const key = color || fallback;

  if (key.includes(".")) {
    const [group, shade] = key.split(".");
    const paletteGroup = (theme.palette as any)[group];
    if (paletteGroup && paletteGroup[shade]) return paletteGroup[shade];
  }

  const textPalette = (theme.palette as any).text;
  if (textPalette && textPalette[key]) return textPalette[key];

  return key;
};

const getLeafCount = (node?: MetricCardData | null): number => {
  if (!node?.children?.length) return 1;
  return node.children.reduce((sum, child) => sum + getLeafCount(child), 0);
};

const MetricText: React.FC<{
  config: MetricCardTextConfig | null | undefined;
  fallback: MetricCardTextConfig;
  variant: "subtitle2" | "body2" | "h5";
  className?: string;
}> = ({ config, fallback, variant, className }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const merged = { ...fallback, ...(config ?? {}) };

  return (
    <Typography
      variant={variant}
      className={className}
      sx={{
        fontSize: merged.textSize || fallback.textSize,
        color: resolveThemeColor(theme, merged.textColor, fallback.textColor),
      }}
      {...((merged.attributes ?? {}) as object)}
    >
      {merged.text == null || merged.text === "" ? "" : t(String(merged.text), { defaultValue: String(merged.text) })}
    </Typography>
  );
};

const CustomMetricCard = ({
  title,
  subtitle,
  metricValue,
  backgroundColor,
  children,
  show,
  level = 0,
}: CustomMetricCardProps) => {
  const theme = useTheme();

  if (show === false) {
    return null;
  }

  const visibleChildren = (children ?? []).filter((child) => child?.show !== false);

  return (
    <Card
      className="h-100"
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: resolveThemeColor(theme, backgroundColor, "background.paper"),
        boxShadow: level === 0 ? theme.shadows[1] : "none",
      }}
    >
      <CardContent className="py-3" sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box>
          <MetricText config={title} fallback={defaultTextConfig.title} variant="subtitle2" className="fw-semibold text-uppercase mb-1" />
          <MetricText config={metricValue} fallback={defaultTextConfig.metricValue} variant="h5" className="fw-bold" />
          <MetricText config={subtitle} fallback={defaultTextConfig.subtitle} variant="body2" className="mt-1" />
        </Box>

        {visibleChildren.length ? (
          <Box className="d-flex flex-wrap" sx={{ gap: 1, alignItems: "stretch" }}>
            {visibleChildren.map((child, index) => {
              const leafCount = getLeafCount(child);
              return (
                <Box key={`${index}-${child?.title?.text ?? "metric-child"}`} sx={{ flex: `${leafCount} 1 0`, minWidth: 75 }}>
                  <CustomMetricCard {...child} level={level + 1} />
                </Box>
              );
            })}
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default CustomMetricCard;
