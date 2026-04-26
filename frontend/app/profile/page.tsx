"use client";
import { useState } from "react";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";
import { Modal, Button } from "antd";
import { useSession } from "next-auth/react";
import { ProForm, ProFormText } from "@ant-design/pro-components";

type ModalActionType = "profile" | "residential" | "personal" | null;

interface ModalState {
  actionActive: boolean;
  type: ModalActionType;
}

export default function ProfilePage() {
  const session = useSession();

  if (session.status === "unauthenticated") {
    redirect("/login");
  }

  const signedInAs =
    session.data?.user.email ?? session.data?.user.name ?? session.data?.user.id ?? null;

  // Single state for handling modal actions
  const [modalState, setModalState] = useState<ModalState>({
    actionActive: false,
    type: null,
  });

  const handleOpen = (type: ModalActionType) => {
    setModalState({ actionActive: true, type });
  };

  const handleClose = () => {
    setModalState({ actionActive: false, type: null });
  };

  // Render content based on modal type
  const renderModalContent = () => {
    switch (modalState.type) {
      case "profile":
        return (
          <ProForm
            submitter={{
              searchConfig: { submitText: "Save Profile" },
              resetButtonProps: false,
            }}
            onFinish={async () => {
              handleClose();
            }}
          >
            <ProFormText
              name="profileField1"
              label="Profile Field 1"
              placeholder="Enter Profile Field 1"
            />
            <ProFormText
              name="profileField2"
              label="Profile Field 2"
              placeholder="Enter Profile Field 2"
            />
          </ProForm>
        );
      case "personal":
        return (
          <ProForm
            submitter={{
              searchConfig: { submitText: "Save Personal Info" },
              resetButtonProps: false,
            }}
            onFinish={async () => {
              handleClose();
            }}
          >
            <ProFormText
              name="personalField1"
              label="Personal Field 1"
              placeholder="Enter Personal Field 1"
            />
            <ProFormText
              name="personalField2"
              label="Personal Field 2"
              placeholder="Enter Personal Field 2"
            />
          </ProForm>
        );
      case "residential":
        return (
          <ProForm
            submitter={{
              searchConfig: { submitText: "Save Residential Address" },
              resetButtonProps: false,
            }}
            onFinish={async () => {
              handleClose();
            }}
          >
            <ProFormText
              name="residentialField1"
              label="Residential Field 1"
              placeholder="Enter Residential Field 1"
            />
            <ProFormText
              name="residentialField2"
              label="Residential Field 2"
              placeholder="Enter Residential Field 2"
            />
          </ProForm>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Profile
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Complete your profile with the guided form. Your answers stay in this
        browser session until you submit.
      </p>
      <div className="flex gap-4 mt-6 mb-6">
        <Button
          type="primary"
          onClick={() => handleOpen("profile")}
          data-testid="add-profile-btn"
        >
          Add Profile
        </Button>
        <Button
          type="default"
          onClick={() => handleOpen("personal")}
          data-testid="add-personal-btn"
        >
          Add Personal Info
        </Button>
        <Button
          type="default"
          onClick={() => handleOpen("residential")}
          data-testid="add-residential-btn"
        >
          Add Residential Address
        </Button>
      </div>

      <Modal
        open={modalState.actionActive}
        onCancel={handleClose}
        title={
          modalState.type === "profile"
            ? "Add Profile"
            : modalState.type === "personal"
            ? "Add Personal Info"
            : modalState.type === "residential"
            ? "Add Residential Address"
            : ""
        }
        footer={null}
        destroyOnClose
      >
        {renderModalContent()}
      </Modal>

      <ProfileClient signedInAs={signedInAs} />

      
    </div>
  );
}
