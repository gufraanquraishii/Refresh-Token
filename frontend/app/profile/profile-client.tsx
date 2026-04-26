"use client";

import { useRef, useState } from "react";
import { StepsForm } from "@ant-design/pro-components";
import {
  ProFormText,
  ProFormSelect,
  ProFormDatePicker,
  ProFormTextArea,
  ProFormDependency,
} from "@ant-design/pro-components";
import type { ProFormInstance } from "@ant-design/pro-components";
import {
  Alert,
  Button,
  Descriptions,
  Modal,
  Space,
  Typography,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";

const { Title, Paragraph } = Typography;

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const COUNTRY_OPTIONS = [
  { label: "United States", value: "US" },
  { label: "Canada", value: "CA" },
  { label: "United Kingdom", value: "GB" },
  { label: "India", value: "IN" },
  { label: "Australia", value: "AU" },
];

const STATE_BY_COUNTRY: Record<string, { label: string; value: string }[]> = {
  US: [
    { label: "California", value: "CA" },
    { label: "New York", value: "NY" },
    { label: "Texas", value: "TX" },
    { label: "Florida", value: "FL" },
  ],
  CA: [
    { label: "Ontario", value: "ON" },
    { label: "British Columbia", value: "BC" },
    { label: "Quebec", value: "QC" },
  ],
  GB: [
    { label: "England", value: "ENG" },
    { label: "Scotland", value: "SCT" },
    { label: "Wales", value: "WLS" },
  ],
  IN: [
    { label: "Maharashtra", value: "MH" },
    { label: "Karnataka", value: "KA" },
    { label: "Delhi", value: "DL" },
  ],
  AU: [
    { label: "New South Wales", value: "NSW" },
    { label: "Victoria", value: "VIC" },
    { label: "Queensland", value: "QLD" },
  ],
};

const phoneOptionalRule = {
  async validator(_: unknown, value: string) {
    if (!value?.trim()) return;
    if (!/^[\d\s\-+()]{7,}$/.test(value)) {
      throw new Error("Enter a valid phone number");
    }
  },
};

function isValidHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const websiteOptionalRule = {
  async validator(_: unknown, value: string) {
    if (!value?.trim()) return;
    if (!isValidHttpUrl(value)) {
      throw new Error("Enter a valid URL");
    }
  },
};

export type ProfileFormValues = {
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: Dayjs;
  email: string;
  phone: string;
  alternatePhone?: string;
  website?: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  fullAddress: string;
};

function formatDob(v: Dayjs | undefined) {
  return v && dayjs.isDayjs(v) ? v.format("MMMM D, YYYY") : "—";
}

function ReviewSummary({ values }: { values: Partial<ProfileFormValues> }) {
  const genderLabel =
    GENDER_OPTIONS.find((g) => g.value === values.gender)?.label ?? "—";

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Alert
        type="info"
        showIcon
        message="Almost done"
        description="Please review your information below. Click Submit to save your profile."
      />
      <Descriptions
        bordered
        size="small"
        column={1}
        title="Personal"
        items={[
          { label: "First name", children: values.firstName ?? "—" },
          { label: "Last name", children: values.lastName ?? "—" },
          { label: "Gender", children: genderLabel },
          { label: "Date of birth", children: formatDob(values.dateOfBirth) },
        ]}
      />
      <Descriptions
        bordered
        size="small"
        column={1}
        title="Contact"
        items={[
          { label: "Email", children: values.email ?? "—" },
          { label: "Phone", children: values.phone ?? "—" },
          {
            label: "Alternate phone",
            children: values.alternatePhone || "—",
          },
          { label: "Website", children: values.website || "—" },
        ]}
      />
      <Descriptions
        bordered
        size="small"
        column={1}
        title="Address"
        items={[
          {
            label: "Country",
            children:
              COUNTRY_OPTIONS.find((c) => c.value === values.country)?.label ??
              values.country,
          },
          { label: "State", children: values.state ?? "—" },
          { label: "City", children: values.city ?? "—" },
          { label: "Postal code", children: values.postalCode ?? "—" },
          { label: "Full address", children: values.fullAddress ?? "—" },
        ]}
      />
    </Space>
  );
}

type ProfileClientProps = {
  signedInAs?: string | null;
};

export function ProfileClient({ signedInAs }: ProfileClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState<ProfileFormValues | null>(null);
  const formRef = useRef<ProFormInstance>(null);

  return (
    <>
      {signedInAs ? (
        <Paragraph className="mt-2 text-zinc-600 dark:text-zinc-400" style={{ marginBottom: 0 }}>
          Signed in as <strong>{signedInAs}</strong>
        </Paragraph>
      ) : null}
      <Space wrap className="mt-6">
        <Button type="primary" size="large" onClick={() => setModalOpen(true)}>
          Add profile…
        </Button>
      </Space>

      {submitted && (
        <div className="mt-10 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <Title level={4} style={{ marginTop: 0 }}>
            Submitted profile
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Values from your last submission (also logged to the console).
          </Paragraph>
          <ReviewSummary values={submitted} />
        </div>
      )}

      <Modal
        title="Create profile"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
        styles={{ body: { paddingTop: 16 } }}
      >
        <StepsForm<ProfileFormValues>
          formRef={formRef}
          formProps={{
            layout: "vertical",
            requiredMark: true,
            validateMessages: { required: "This field is required" },
          }}
          stepsProps={{
            size: "small",
          }}
          onFinish={async (values) => {
            console.log("Profile form submitted:", values);
            setSubmitted(values);
            setModalOpen(false);
            return true;
          }}
          submitter={{
            render: (props) => {
              const { step, onPre, onSubmit } = props;
              const isLast = step === 3;
              return (
                <div style={{ marginTop: 24, textAlign: "right" }}>
                  <Space>
                    {step > 0 && <Button onClick={() => onPre?.()}>Previous</Button>}
                    <Button type="primary" onClick={() => onSubmit?.()}>
                      {isLast ? "Submit" : "Next"}
                    </Button>
                  </Space>
                </div>
              );
            },
          }}
        >
          <StepsForm.StepForm
            name="personal"
            title="Personal"
            stepProps={{ description: "Your name and demographics" }}
            grid
            rowProps={{ gutter: [16, 0] }}
            colProps={{ span: 12 }}
          >
            <ProFormText
              name="firstName"
              label="First name"
              placeholder="Jane"
              rules={[{ required: true }]}
            />
            <ProFormText
              name="lastName"
              label="Last name"
              placeholder="Doe"
              rules={[{ required: true }]}
            />
            <ProFormSelect
              name="gender"
              label="Gender"
              options={GENDER_OPTIONS}
              placeholder="Select gender"
              colProps={{ span: 24 }}
            />
            <ProFormDatePicker
              name="dateOfBirth"
              label="Date of birth"
              fieldProps={{ style: { width: "100%" } }}
              colProps={{ span: 24 }}
            />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name="contact"
            title="Contact"
            stepProps={{ description: "How we can reach you" }}
            grid
            rowProps={{ gutter: [16, 0] }}
            colProps={{ span: 12 }}
          >
            <ProFormText
              name="email"
              label="Email"
              placeholder="you@example.com"
              rules={[
                { required: true },
                { type: "email", message: "Enter a valid email" },
              ]}
              colProps={{ span: 24 }}
            />
            <ProFormText
              name="phone"
              label="Phone number"
              placeholder="+1 555 0100"
              rules={[
                { required: true },
                {
                  pattern: /^[\d\s\-+()]{7,}$/,
                  message: "Enter a valid phone number",
                },
              ]}
            />
            <ProFormText
              name="alternatePhone"
              label="Alternate phone"
              placeholder="Optional"
              rules={[phoneOptionalRule]}
            />
            <ProFormText
              name="website"
              label="Website"
              placeholder="https://"
              rules={[websiteOptionalRule]}
              colProps={{ span: 24 }}
            />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name="address"
            title="Address"
            stepProps={{ description: "Where you are located" }}
            grid
            rowProps={{ gutter: [16, 0] }}
            colProps={{ span: 12 }}
          >
            <ProFormSelect
              name="country"
              label="Country"
              options={COUNTRY_OPTIONS}
              rules={[{ required: true }]}
              colProps={{ span: 24 }}
            />
            <ProFormDependency name={["country"]}>
              {({ country }) => (
                <ProFormSelect
                  name="state"
                  label="State"
                  options={country ? STATE_BY_COUNTRY[country] ?? [] : []}
                  rules={[{ required: true }]}
                  placeholder={country ? "Select state" : "Select country first"}
                  colProps={{ span: 24 }}
                />
              )}
            </ProFormDependency>
            <ProFormText
              name="city"
              label="City"
              rules={[{ required: true }]}
            />
            <ProFormText
              name="postalCode"
              label="Postal code"
              rules={[{ required: true }]}
            />
            <ProFormTextArea
              name="fullAddress"
              label="Full address"
              placeholder="Street, building, unit…"
              rules={[{ required: true }]}
              fieldProps={{ rows: 3, showCount: true, maxLength: 500 }}
              colProps={{ span: 24 }}
            />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name="review"
            title="Review"
            stepProps={{ description: "Confirm and submit" }}
          >
            <ProFormDependency
              name={[
                "firstName",
                "lastName",
                "gender",
                "dateOfBirth",
                "email",
                "phone",
                "alternatePhone",
                "website",
                "country",
                "state",
                "city",
                "postalCode",
                "fullAddress",
              ]}
            >
              {(deps) => (
                <ReviewSummary values={deps as Partial<ProfileFormValues>} />
              )}
            </ProFormDependency>
          </StepsForm.StepForm>
        </StepsForm>
      </Modal>
    </>
  );
}
