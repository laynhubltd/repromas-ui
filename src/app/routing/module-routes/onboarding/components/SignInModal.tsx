import { Form, Input, Modal } from "antd";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { marketingStyles } from "@/shared/ui/marketing";
import { useSignInModal } from "../hooks/useSignInModal";
import styles from "./OnboardingShell.module.css";

type SignInModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function SignInModal({ open, onClose }: SignInModalProps) {
  const { form, state, rules, actions } = useSignInModal();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={actions.signIn}
      okText="Go to Sign In"
      title="Sign in to your institution"
      okButtonProps={{ size: "large" }}
      cancelButtonProps={{ size: "large" }}
      rootClassName={marketingStyles.tokens}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" className={styles.signInForm}>
        <Form.Item
          name="slug"
          label="Institution short name"
          rules={rules.slug}
          extra="The part before .repromas.app in your institution's address, e.g. fedpolybali"
        >
          <Input size="large" placeholder="your-institution" suffix=".repromas.app" autoComplete="off" />
        </Form.Item>
        <ConditionalRenderer when={Boolean(state.preview)}>
          <p className={styles.signInPreview}>
            You'll go to <strong>{state.preview}</strong>
          </p>
        </ConditionalRenderer>
      </Form>
    </Modal>
  );
}
