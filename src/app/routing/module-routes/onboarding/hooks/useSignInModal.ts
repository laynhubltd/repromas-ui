import { Form } from "antd";
import { buildTenantLoginUrl, TENANT_SLUG_PATTERN } from "../utils/build-tenant-login-url";

type SignInForm = { slug: string };

function currentLocation() {
  const { protocol, hostname, port } = window.location;
  return { protocol, hostname, port };
}

export function useSignInModal() {
  const [form] = Form.useForm<SignInForm>();
  const slug = Form.useWatch("slug", form) ?? "";
  const normalised = slug.trim().toLowerCase();
  const preview = normalised ? buildTenantLoginUrl(normalised, currentLocation()) : "";

  function signIn() {
    form.validateFields().then(({ slug: value }) => {
      window.location.href = buildTenantLoginUrl(value.trim().toLowerCase(), currentLocation());
    });
  }

  return {
    form,
    state: { preview },
    rules: {
      slug: [
        { required: true, message: "Please enter your institution's short name" },
        { pattern: TENANT_SLUG_PATTERN, message: "Only lowercase letters, numbers and hyphens" },
      ],
    },
    actions: { signIn },
  };
}
