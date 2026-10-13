import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AddRounded, EventRounded, PaymentsRounded, PersonRounded } from "@mui/icons-material";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { DetailField } from "../../components/DetailField";
import { DialogHeader } from "../../components/DialogHeader";
import { FormSection } from "../../components/FormSection";
import { useNotify } from "../../components/NotificationProvider";
import { ApiError, errorMessage } from "../../lib/api";
import { clinicNowLocal, formatClinicDateTime, timeZoneLabel } from "../../lib/clinicTime";
import {
  changedFields,
  emptyFormValues,
  formValuesFromAppointment,
  isFormDirty,
  isAllowedMoneyInput,
  isAllowedPhoneInput,
  normalizePhone,
  validateAppointmentForm,
  validateAppointmentField,
  type AppointmentFormValues,
  type FormErrors,
  type FormField,
} from "./appointmentForm";
import { useAddClinicNumber, useClinicNumbers, useCreateAppointment, useUpdateAppointment } from "./appointmentsApi";
import { APPOINTMENT_STATUS_OPTIONS, FIELD_LABELS, FIELD_LIMITS, PATIENT_TYPE_LABELS, PAYMENT_METHOD_LABELS, RESULT_ISSUED_OPTIONS, fieldLabel } from "./fields";
import type { Appointment } from "./types";

interface AppointmentFormDialogProps {
  /** Record to edit; omit to create. Captured once when the dialog opens. */
  appointment?: Appointment;
  timeZone: string;
  onClose: () => void;
}

const FIRST_FIELD_ID = "appointment-patientName";

const titleCase = (value: string) =>
  value.replace(/\S+/g, (word) =>
    word === word.toLocaleLowerCase() ? word.charAt(0).toLocaleUpperCase() + word.slice(1) : word,
  );

/**
 * Create/edit form. Mount it fresh for each open (the parent renders it conditionally),
 * so background list refreshes never overwrite what the user is typing.
 */
export function AppointmentFormDialog({ appointment, timeZone, onClose }: AppointmentFormDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const notify = useNotify();
  const clinicNumbers = useClinicNumbers();
  const addClinicNumber = useAddClinicNumber();
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();

  /** The stored record being edited (switches from create to edit if a retry was already saved). */
  const [target, setTarget] = useState<Appointment | undefined>(appointment);
  const [initial, setInitial] = useState<AppointmentFormValues>(() =>
    appointment ? formValuesFromAppointment(appointment) : emptyFormValues(),
  );
  const [values, setValues] = useState<AppointmentFormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionKey, setSubmissionKey] = useState(() => crypto.randomUUID());
  const [conflict, setConflict] = useState<Appointment | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [addAnotherAfterSave, setAddAnotherAfterSave] = useState(false);
  const [showAddNumber, setShowAddNumber] = useState(false);
  const [newClinicNumber, setNewClinicNumber] = useState("");
  const [newClinicNumberError, setNewClinicNumberError] = useState<string>();
  const [earliestAppointmentLocal] = useState(() => (appointment ? undefined : clinicNowLocal(timeZone)));

  const isEdit = Boolean(target);
  const saving = createMutation.isPending || updateMutation.isPending;
  const dirty = useMemo(() => isFormDirty(values, initial), [values, initial]);
  const formValid = useMemo(() => Object.keys(validateAppointmentForm(values, earliestAppointmentLocal)).length === 0, [values, earliestAppointmentLocal]);
  const generalError = createMutation.error ?? updateMutation.error;

  // Protect unsaved input from accidental tab close or reload.
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const setField = (field: FormField) => (value: string) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: validateAppointmentField(nextValues, field, earliestAppointmentLocal),
      }));
    }
  };

  const validateField = (field: FormField) => {
    const formatted = field === "patientName" || field === "location" ? titleCase(values[field].trim()) : values[field];
    const next = formatted === values[field] ? values : { ...values, [field]: formatted };
    if (next !== values) setValues(next);
    const error = validateAppointmentField(next, field, earliestAppointmentLocal);
    setErrors((current) => ({ ...current, [field]: error }));
  };

  const setPaymentMethod = (method: AppointmentFormValues["paymentMethod"]) => {
    setValues((current) => ({
      ...current,
      paymentMethod: method,
      cashAmount: method === "CASH" ? current.amount : method === "MIXED" ? current.cashAmount : "",
      cardAmount: method === "CARD" ? current.amount : method === "MIXED" ? current.cardAmount : "",
    }));
    setErrors((current) => ({ ...current, paymentMethod: undefined, cashAmount: undefined, cardAmount: undefined }));
  };

  const fieldProps = (field: FormField, options: { required?: boolean; maxLength?: number } = {}) => ({
    id: `appointment-${field}`,
    name: field,
    label: FIELD_LABELS[field],
    value: values[field],
    required: options.required,
    error: Boolean(errors[field]),
    helperText: errors[field],
    disabled: saving,
    onBlur: () => validateField(field),
    slotProps: options.maxLength ? { htmlInput: { maxLength: options.maxLength } } : undefined,
  });

  const textField = (field: FormField, options: { required?: boolean; maxLength?: number } = {}) => (
    <TextField {...fieldProps(field, options)} onChange={(event) => setField(field)(event.target.value)} />
  );

  const selectField = (field: FormField, choices: readonly string[], required = false) => {
    const available = values[field] && !choices.includes(values[field]) ? [values[field], ...choices] : choices;
    return (
      <TextField {...fieldProps(field, { required })} select onChange={(event) => setField(field)(event.target.value)}>
        {!required && <MenuItem value="" />}
        {available.map((choice) => <MenuItem key={choice} value={choice}>{choice}</MenuItem>)}
      </TextField>
    );
  };

  const focusFirstError = (fieldErrors: FormErrors) => {
    const first = Object.keys(fieldErrors)[0];
    if (first) window.setTimeout(() => document.getElementById(`appointment-${first}`)?.focus(), 0);
  };

  const applyServerError = (error: unknown) => {
    if (!(error instanceof ApiError)) return;
    if (error.code === "VERSION_CONFLICT") {
      setConflict((error.details as { current: Appointment }).current);
      return;
    }
    if (error.fieldIssues.length > 0) {
      const fieldErrors: FormErrors = {};
      for (const issue of error.fieldIssues) {
        if (issue.field in values) fieldErrors[issue.field as FormField] = issue.message;
      }
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
    }
  };

  const resetForAnother = () => {
    const blank = emptyFormValues();
    setInitial(blank);
    setValues(blank);
    setErrors({});
    setNotice(null);
    setSubmissionKey(crypto.randomUUID());
    createMutation.reset();
    window.setTimeout(() => document.getElementById(FIRST_FIELD_ID)?.focus(), 0);
  };

  const createClinicNumber = () => {
    const normalized = normalizePhone(newClinicNumber);
    if (!/^\+?\d{6,15}$/.test(normalized)) {
      setNewClinicNumberError("Enter 6–15 digits, optionally starting with + and the country code.");
      return;
    }
    addClinicNumber.mutate(normalized, {
      onSuccess: ({ number }) => {
        setField("clinicNumber")(number);
        setNewClinicNumber("");
        setNewClinicNumberError(undefined);
        setShowAddNumber(false);
      },
      onError: (error) => setNewClinicNumberError(errorMessage(error)),
    });
  };

  const persist = (addAnother: boolean) => {
    if (saving) return;
    setNotice(null);

    if (target) {
      updateMutation.mutate(
        { id: target.id, version: target.version, ...values },
        {
          onSuccess: (saved) => {
            notify(`Record #${saved.recordNumber} updated.`);
            onClose();
          },
          onError: applyServerError,
        },
      );
      return;
    }

    // Retrying after a failure reuses the same submissionKey, so the server can never create a duplicate.
    createMutation.mutate(
      { ...values, submissionKey },
      {
        onSuccess: ({ data: saved, meta }) => {
          if (meta?.replayed && changedFields(values, saved).length > 0) {
            // An earlier attempt was saved but the user has edited since: continue as an edit.
            setTarget(saved);
            setInitial(formValuesFromAppointment(saved));
            setNotice(
              `This appointment was already saved as record #${saved.recordNumber} by an earlier attempt. ` +
                "Your newer changes are not saved yet — review them and select Save to update the record.",
            );
            return;
          }
          notify(`Record #${saved.recordNumber} saved.`);
          if (addAnother) resetForAnother();
          else onClose();
        },
        onError: applyServerError,
      },
    );
  };

  const save = (addAnother: boolean) => {
    const fieldErrors = validateAppointmentForm(values, earliestAppointmentLocal);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      focusFirstError(fieldErrors);
      return;
    }
    setAddAnotherAfterSave(addAnother);
    setConfirmSave(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    save(false);
  };

  const requestClose = () => {
    if (saving) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  const keepMyChanges = () => {
    if (!conflict) return;
    setTarget(conflict);
    setConflict(null);
    updateMutation.reset();
    setNotice("Your changes are kept. Select Save to apply them on top of the latest version.");
  };

  const loadLatest = () => {
    if (!conflict) return;
    const latest = formValuesFromAppointment(conflict);
    setTarget(conflict);
    setInitial(latest);
    setValues(latest);
    setErrors({});
    setConflict(null);
    updateMutation.reset();
    setNotice("Loaded the latest version of this record.");
  };

  const conflictFields = conflict ? changedFields(values, conflict) : [];
  const showGeneralError =
    generalError && !conflict && !(generalError instanceof ApiError && generalError.fieldIssues.length > 0);

  const title = target ? `Edit appointment #${target.recordNumber}` : "Add appointment";

  return (
    <>
      <Dialog
        open
        onClose={requestClose}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="md"
        scroll="paper"
        aria-labelledby="appointment-form-title"
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: "contents" }}>
          <DialogHeader
            id="appointment-form-title"
            title={title}
            subtitle={
              target
                ? `Last updated by ${target.updatedBy.name} · ${formatClinicDateTime(target.updatedAt, timeZone)}`
                : "Fields marked * are required."
            }
            onClose={requestClose}
            closeDisabled={saving}
          />
          <DialogContent>
            <Stack spacing={3}>
              {conflict && (
                <Alert severity="warning" role="alert">
                  <AlertTitle>Someone else changed this record</AlertTitle>
                  {conflict.updatedBy.name} saved record #{conflict.recordNumber} at{" "}
                  {formatClinicDateTime(conflict.updatedAt, timeZone)} after you opened it. Your edits are still in the
                  form and have not been saved.
                  {conflictFields.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      Fields where your values differ from the latest version:{" "}
                      <strong>{conflictFields.map(fieldLabel).join(", ")}</strong>.
                    </Box>
                  )}
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }}>
                    <Button variant="contained" color="warning" size="small" onClick={keepMyChanges}>
                      Keep my changes
                    </Button>
                    <Button variant="outlined" color="warning" size="small" onClick={loadLatest}>
                      Discard mine and load latest
                    </Button>
                  </Stack>
                </Alert>
              )}
              {notice && (
                <Alert severity="info" onClose={() => setNotice(null)}>
                  {notice}
                </Alert>
              )}
              {showGeneralError && (
                <Alert severity="error" role="alert">
                  <AlertTitle>Not saved</AlertTitle>
                  {errorMessage(generalError)} Your entries are still here.
                </Alert>
              )}

              <FormSection title="Patient details" icon={<PersonRounded sx={{ fontSize: 18 }} />}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                    <TextField
                      {...fieldProps("clinicNumber", { required: true })}
                      select
                      onChange={(event) => setField("clinicNumber")(event.target.value)}
                    >
                      {values.clinicNumber && !(clinicNumbers.data ?? []).includes(values.clinicNumber) && (
                        <MenuItem value={values.clinicNumber}>{values.clinicNumber}</MenuItem>
                      )}
                      {(clinicNumbers.data ?? []).map((number) => <MenuItem key={number} value={number}>{number}</MenuItem>)}
                    </TextField>
                    <Tooltip title="Add clinic number">
                      <IconButton
                        aria-label="Add clinic number"
                        onClick={() => setShowAddNumber(true)}
                        disabled={saving}
                        sx={{ border: 1, borderColor: "divider", width: 40, height: 40, flexShrink: 0 }}
                      >
                        <AddRounded />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {textField("patientName", { required: true, maxLength: FIELD_LIMITS.patientName })}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    {...fieldProps("mobileNo", { required: true })}
                    type="tel"
                    autoComplete="off"
                    placeholder="+971 50 123 4567"
                    helperText={errors.mobileNo ?? "Include the country code when known, e.g. +971…"}
                    onChange={(event) => {
                      if (isAllowedPhoneInput(event.target.value)) setField("mobileNo")(event.target.value);
                    }}
                    slotProps={{ htmlInput: { maxLength: 30, inputMode: "tel" } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    {...fieldProps("patientType", { required: true })}
                    select
                    onChange={(event) => setField("patientType")(event.target.value)}
                  >
                    {(Object.keys(PATIENT_TYPE_LABELS) as Array<keyof typeof PATIENT_TYPE_LABELS>).map((key) => (
                      <MenuItem key={key} value={key}>
                        {PATIENT_TYPE_LABELS[key]}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {textField("location", { maxLength: FIELD_LIMITS.location })}
                </Grid>
              </FormSection>

              <FormSection title="Appointment details" icon={<EventRounded sx={{ fontSize: 18 }} />}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    {...fieldProps("appointmentLocal", { required: true })}
                    type="datetime-local"
                    helperText={errors.appointmentLocal ?? `Clinic time: ${timeZoneLabel(timeZone)}`}
                    onChange={(event) => setField("appointmentLocal")(event.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: { step: 60, min: earliestAppointmentLocal },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {textField("team", { required: true, maxLength: FIELD_LIMITS.team })}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {textField("procedure", { required: true, maxLength: FIELD_LIMITS.procedure })}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>{textField("cs", { maxLength: FIELD_LIMITS.cs })}</Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {selectField("status", APPOINTMENT_STATUS_OPTIONS)}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>{selectField("resultIssued", RESULT_ISSUED_OPTIONS)}</Grid>
              </FormSection>

              <FormSection title="Financial / other details" icon={<PaymentsRounded sx={{ fontSize: 18 }} />}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    {...fieldProps("amount")}
                    onChange={(event) => {
                      if (isAllowedMoneyInput(event.target.value)) {
                        const amount = event.target.value;
                        setValues((current) => ({
                          ...current,
                          amount,
                          cashAmount: current.paymentMethod === "CASH" ? amount : current.cashAmount,
                          cardAmount: current.paymentMethod === "CARD" ? amount : current.cardAmount,
                        }));
                      }
                    }}
                    placeholder="0.00"
                    helperText={errors.amount ?? "Leave blank if unknown"}
                    slotProps={{ htmlInput: { inputMode: "decimal", maxLength: 14 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    {...fieldProps("cost")}
                    onChange={(event) => {
                      if (isAllowedMoneyInput(event.target.value)) setField("cost")(event.target.value);
                    }}
                    placeholder="0.00"
                    helperText={errors.cost ?? "Leave blank if unknown"}
                    slotProps={{ htmlInput: { inputMode: "decimal", maxLength: 14 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    {...fieldProps("paymentMethod")}
                    select
                    onChange={(event) => setPaymentMethod(event.target.value as AppointmentFormValues["paymentMethod"])}
                    helperText={errors.paymentMethod}
                  >
                    <MenuItem value="">
                      <em>Not recorded</em>
                    </MenuItem>
                    {(Object.keys(PAYMENT_METHOD_LABELS) as Array<keyof typeof PAYMENT_METHOD_LABELS>).map((key) => (
                      <MenuItem key={key} value={key}>
                        {PAYMENT_METHOD_LABELS[key]}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                {values.paymentMethod === "MIXED" && (
                  <>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <TextField
                        {...fieldProps("cashAmount", { required: true })}
                        onChange={(event) => {
                          if (isAllowedMoneyInput(event.target.value)) setField("cashAmount")(event.target.value);
                        }}
                        placeholder="0.00"
                        slotProps={{ htmlInput: { inputMode: "decimal", maxLength: 14 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <TextField
                        {...fieldProps("cardAmount", { required: true })}
                        onChange={(event) => {
                          if (isAllowedMoneyInput(event.target.value)) setField("cardAmount")(event.target.value);
                        }}
                        placeholder="0.00"
                        slotProps={{ htmlInput: { inputMode: "decimal", maxLength: 14 } }}
                      />
                    </Grid>
                  </>
                )}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  {textField("approvalCode", { maxLength: FIELD_LIMITS.approvalCode })}
                </Grid>
              </FormSection>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ flexWrap: "wrap", borderTop: 1, borderColor: "divider" }}>
            <Button onClick={requestClose} disabled={saving}>
              Cancel
            </Button>
            {!isEdit && (
              <Button variant="outlined" onClick={() => save(true)} disabled={saving || Boolean(conflict) || !formValid}>
                Save &amp; Add Another
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={saving || Boolean(conflict) || !formValid}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={confirmSave}
        title="Booking summary"
        message={
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><DetailField label={FIELD_LABELS.clinicNumber} value={values.clinicNumber} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><DetailField label={FIELD_LABELS.patientName} value={values.patientName} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><DetailField label={FIELD_LABELS.mobileNo} value={values.mobileNo} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><DetailField label={FIELD_LABELS.appointmentLocal} value={`${values.appointmentLocal.replace("T", ", ")} (${timeZoneLabel(timeZone)})`} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><DetailField label={FIELD_LABELS.team} value={values.team} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><DetailField label={FIELD_LABELS.procedure} value={values.procedure} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><DetailField label={FIELD_LABELS.paymentMethod} value={values.paymentMethod ? PAYMENT_METHOD_LABELS[values.paymentMethod] : null} /></Grid>
            {values.paymentMethod === "MIXED" && <Grid size={{ xs: 12, sm: 6 }}><DetailField label={FIELD_LABELS.cashAmount} value={values.cashAmount} /></Grid>}
            {values.paymentMethod === "MIXED" && <Grid size={{ xs: 12, sm: 6 }}><DetailField label={FIELD_LABELS.cardAmount} value={values.cardAmount} /></Grid>}
          </Grid>
        }
        cancelLabel="Back"
        confirmLabel="Confirm"
        onCancel={() => setConfirmSave(false)}
        onConfirm={() => {
          setConfirmSave(false);
          persist(addAnotherAfterSave);
        }}
      />

      <Dialog open={showAddNumber} onClose={() => setShowAddNumber(false)} fullWidth maxWidth="xs" scroll="paper">
        <DialogHeader id="add-clinic-number-title" title="Add clinic number" onClose={() => setShowAddNumber(false)} />
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            label="Clinic Number"
            type="tel"
            value={newClinicNumber}
            error={Boolean(newClinicNumberError)}
            helperText={newClinicNumberError}
            onChange={(event) => {
              if (isAllowedPhoneInput(event.target.value)) {
                setNewClinicNumber(event.target.value);
                setNewClinicNumberError(undefined);
              }
            }}
            slotProps={{ htmlInput: { inputMode: "tel", maxLength: 30 } }}
            sx={{ mt: 0.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: "divider" }}>
          <Button onClick={() => setShowAddNumber(false)} disabled={addClinicNumber.isPending}>Cancel</Button>
          <Button variant="contained" onClick={createClinicNumber} disabled={addClinicNumber.isPending || !newClinicNumber}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmClose}
        title="Discard unsaved changes?"
        message="You have entered information that has not been saved. If you close this form it will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        destructive
        onCancel={() => setConfirmClose(false)}
        onConfirm={() => {
          setConfirmClose(false);
          onClose();
        }}
      />
    </>
  );
}
