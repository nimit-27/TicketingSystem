import React from 'react';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
} from '@mui/material';
import { IconComponent } from './IconButton/CustomIconButton';
import { ToggleOption } from '../../types';

interface ViewToggleProps {
  value: string;
  onChange: (val: string) => void;
  options: ToggleOption[];
}

const RadioToggleGroup: React.FC<ViewToggleProps> = ({ value, onChange, options }) => {
  return (
    <FormControl>
      <Typography gutterBottom>
        Select one option
      </Typography>
      <RadioGroup
        row
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o, i) => {
          const hasIcon = !!o.icon;
          const hasLabel = !!o.label;

          return (
            <FormControlLabel
              key={i}
              value={o.value}
              control={<Radio size="small" />}
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  {hasIcon && <IconComponent icon={o.icon as string} fontSize="small" />}
                  {hasLabel && <span>{o.label}</span>}
                </Box>
              }
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
};

export default RadioToggleGroup;
