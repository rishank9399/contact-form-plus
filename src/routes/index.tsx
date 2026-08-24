import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Application Form | Fresh Professional Forms" },
      { name: "description", content: "Submit your application with confidence. Clean, secure, and professional form experience." },
      { property: "og:title", content: "Application Form | Fresh Professional Forms" },
      { property: "og:description", content: "Submit your application with confidence. Clean, secure, and professional form experience." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function generateCaptcha(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function Index() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email1: "",
    email2: "",
    address: "",
    captchaInput: "",
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [captcha, setCaptcha] = useState(generateCaptcha);
  type FieldName = keyof typeof formData | "attachment";
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateField = useCallback(
    (name: keyof typeof formData, value: string) => {
      switch (name) {
        case "name": {
          if (!value.trim()) return "Name is required";
          if (!/^[A-Za-z\s]+$/.test(value)) return "Name must contain only alphabets";
          return "";
        }
        case "phone": {
          if (!value.trim()) return "Phone number is required";
          if (!/^\d{10}$/.test(value)) return "Phone number must be exactly 10 digits";
          return "";
        }
        case "email1": {
          if (!value.trim()) return "Email ID 1 is required";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email address";
          if (value === formData.email2) return "Email ID 1 must be different from Email ID 2";
          return "";
        }
        case "email2": {
          if (!value.trim()) return "Email ID 2 is required";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email address";
          if (value === formData.email1) return "Email ID 2 must be different from Email ID 1";
          return "";
        }
        case "address": {
          if (!value.trim()) return "Address is required";
          const wordCount = value.trim().split(/\s+/).length;
          if (wordCount > 50) return "Address must not exceed 50 words";
          return "";
        }
        case "captchaInput": {
          if (!value.trim()) return "Captcha is required";
          if (value !== captcha) return "Captcha does not match";
          return "";
        }
        default:
          return "";
      }
    },
    [formData.email2, formData.email1, captcha]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: FieldName; value: string };
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name as keyof typeof formData, value),
      }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: value }));
    if (touched["phone"]) {
      setErrors((prev) => ({ ...prev, phone: validateField("phone", value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: FieldName; value: string };
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name as keyof typeof formData, value),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "doc" && ext !== "docx") {
        setErrors((prev) => ({ ...prev, attachment: "Only .doc and .docx files are allowed" }));
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setAttachment(file);
      setErrors((prev) => ({ ...prev, attachment: "" }));
    } else {
      setAttachment(null);
      setErrors((prev) => ({ ...prev, attachment: "Attachment is required" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (!attachment) {
      newErrors.attachment = "Attachment is required";
    }

    setErrors(newErrors);
    setTouched({
      name: true,
      phone: true,
      email1: true,
      email2: true,
      address: true,
      captchaInput: true,
    });

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitted(true);
    }
  };

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setFormData((prev) => ({ ...prev, captchaInput: "" }));
    setErrors((prev) => ({ ...prev, captchaInput: "" }));
    setTouched((prev) => ({ ...prev, captchaInput: false }));
  };

  const addressWordCount = formData.address.trim().split(/\s+/).filter(Boolean).length;

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl bg-card p-10 text-center form-card-shadow border border-border">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-card-foreground">Application Submitted</h2>
          <p className="mt-3 text-muted-foreground">
            Thank you for your submission. We have received your details and attachment.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                name: "",
                phone: "",
                email1: "",
                email2: "",
                address: "",
                captchaInput: "",
              });
              setAttachment(null);
              setErrors({});
              setTouched({});
              refreshCaptcha();
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Submit another application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Application Form
          </h1>
          <p className="mt-3 text-muted-foreground">
            Please fill in your details accurately. All fields are required.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-card p-6 sm:p-10 form-card-shadow border border-border"
          noValidate
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-card-foreground">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="John Doe"
                className="block w-full rounded-lg border border-input bg-surface px-4 py-3 text-sm transition focus:border-primary focus:input-focus-ring"
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-card-foreground">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                value={formData.phone}
                onChange={handlePhoneChange}
                onBlur={handleBlur}
                placeholder="1234567890"
                className="block w-full rounded-lg border border-input bg-surface px-4 py-3 text-sm transition focus:border-primary focus:input-focus-ring"
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email1" className="block text-sm font-medium text-card-foreground">
                Email ID 1
              </label>
              <input
                id="email1"
                name="email1"
                type="email"
                value={formData.email1}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="primary@example.com"
                className="block w-full rounded-lg border border-input bg-surface px-4 py-3 text-sm transition focus:border-primary focus:input-focus-ring"
                aria-invalid={!!errors.email1}
              />
              {errors.email1 && <p className="text-sm text-destructive">{errors.email1}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email2" className="block text-sm font-medium text-card-foreground">
                Email ID 2
              </label>
              <input
                id="email2"
                name="email2"
                type="email"
                value={formData.email2}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="secondary@example.com"
                className="block w-full rounded-lg border border-input bg-surface px-4 py-3 text-sm transition focus:border-primary focus:input-focus-ring"
                aria-invalid={!!errors.email2}
              />
              {errors.email2 && <p className="text-sm text-destructive">{errors.email2}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-card-foreground">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={4}
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your address (max 50 words)"
                className="block w-full rounded-lg border border-input bg-surface px-4 py-3 text-sm transition focus:border-primary focus:input-focus-ring resize-none"
                aria-invalid={!!errors.address}
              />
              <div className="flex items-center justify-between">
                {errors.address ? (
                  <p className="text-sm text-destructive">{errors.address}</p>
                ) : (
                  <span className="text-sm text-muted-foreground">Max 50 words</span>
                )}
                <span className={`text-sm ${addressWordCount > 50 ? "text-destructive" : "text-muted-foreground"}`}>
                  {addressWordCount} / 50 words
                </span>
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="attachment" className="block text-sm font-medium text-card-foreground">
                Attachment
              </label>
              <div className="relative">
                <input
                  id="attachment"
                  name="attachment"
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="block w-full rounded-lg border border-input bg-surface px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground transition focus:border-primary focus:input-focus-ring"
                  aria-invalid={!!errors.attachment}
                />
              </div>
              {attachment && (
                <p className="text-sm text-success">Selected: {attachment.name}</p>
              )}
              {errors.attachment && <p className="text-sm text-destructive">{errors.attachment}</p>}
              {!attachment && !errors.attachment && (
                <p className="text-sm text-muted-foreground">Accepted formats: .doc, .docx</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-medium text-card-foreground">
                Security Verification
              </label>
              <div className="flex items-center gap-4 rounded-lg border border-dashed border-border bg-muted p-4">
                <div className="flex-1">
                  <div className="select-none rounded-md bg-surface px-4 py-3 text-center font-mono text-lg tracking-[0.25em] text-foreground border border-border">
                    {captcha}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
                  aria-label="Refresh captcha"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </button>
              </div>
              <input
                id="captchaInput"
                name="captchaInput"
                type="text"
                value={formData.captchaInput}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter the code above"
                autoComplete="off"
                className="mt-3 block w-full rounded-lg border border-input bg-surface px-4 py-3 text-sm transition focus:border-primary focus:input-focus-ring"
                aria-invalid={!!errors.captchaInput}
              />
              {errors.captchaInput && <p className="text-sm text-destructive">{errors.captchaInput}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 w-full inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}
