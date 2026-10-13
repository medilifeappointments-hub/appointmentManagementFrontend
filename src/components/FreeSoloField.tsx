import { Autocomplete, TextField, type TextFieldProps } from "@mui/material";

type FreeSoloFieldProps = Omit<TextFieldProps, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  /** Suggestions only: any typed text is accepted. */
  options: string[];
};

/** Text input with suggestions from existing values (helps keep spellings consistent). */
export function FreeSoloField({ id, value, onChange, options, disabled, slotProps, ...textFieldProps }: FreeSoloFieldProps) {
  const extraHtmlInput = (slotProps?.htmlInput ?? {}) as object;
  return (
    <Autocomplete
      id={id}
      freeSolo
      options={options}
      inputValue={value}
      onInputChange={(_event, next) => onChange(next)}
      disabled={disabled}
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
          slotProps={{
            ...params.slotProps,
            htmlInput: { ...params.slotProps.htmlInput, ...extraHtmlInput },
          }}
        />
      )}
    />
  );
}
