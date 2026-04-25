import { useState } from 'react'
import {
  TextField,
  Autocomplete,
  Box,
  Chip,
  Typography,
  Paper,
  Stack,
} from '@mui/material'
import { styled } from '@mui/material/styles'

const SuggestionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.subtle} 0%, #f5f9ff 100%)`,
  border: `1px solid ${theme.palette.primary.light}`,
  borderRadius: theme.spacing(1.5),
}))

/**
 * SuggestionInput Component
 * Reusable input field with suggestions/autocomplete and quick-select chips
 */
export const SuggestionInput = ({
  label,
  placeholder,
  suggestions = [],
  quickSelect = [],
  helperText,
  value,
  onChange,
  onQuickSelect,
  multiple = false,
  type = 'text',
  icon = null,
  showCount = true,
  sx = {},
}) => {
  const [inputValue, setInputValue] = useState('')

  return (
    <Box sx={{ ...sx }}>
      {/* Label */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {icon}
        {label}
      </Typography>

      {/* Main Input */}
      <Autocomplete
        freeSolo
        multiple={multiple}
        options={suggestions}
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
        inputValue={inputValue}
        onInputChange={(e, newInputValue) => setInputValue(newInputValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant="outlined"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.95rem',
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              label={option}
              color="primary"
              variant="outlined"
              key={index}
              sx={{ m: 0.5 }}
            />
          ))
        }
        noOptionsText="Không có gợi ý"
      />

      {/* Helper Text */}
      {helperText && (
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            display: 'block',
            mt: 0.75,
            fontStyle: 'italic',
          }}
        >
          💡 {helperText}
        </Typography>
      )}

      {/* Quick Select Suggestions */}
      {quickSelect.length > 0 && (
        <SuggestionPaper sx={{ mt: 2 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              display: 'block',
              mb: 1,
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              letterSpacing: '0.5px',
            }}
          >
            ⚡ Gợi ý nhanh
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            {quickSelect.map((item) => (
              <Chip
                key={item}
                label={item}
                onClick={() => {
                  if (onQuickSelect) onQuickSelect(item)
                }}
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                    borderColor: 'primary.main',
                  },
                  transition: 'all 200ms ease',
                }}
              />
            ))}
          </Stack>
        </SuggestionPaper>
      )}

      {/* Count Display */}
      {showCount && multiple && Array.isArray(value) && (
        <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mt: 1 }}>
          ✓ Đã chọn {value.length} {label.toLowerCase()}
        </Typography>
      )}
    </Box>
  )
}

export default SuggestionInput
