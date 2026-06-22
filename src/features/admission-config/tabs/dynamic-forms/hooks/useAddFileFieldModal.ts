import { useGetDocumentTypesQuery } from "@/features/admission-config/tabs/document-type/api/documentTypeApi";
import type { AdmissionDocumentType } from "@/features/admission-config/tabs/document-type/types/document-type";
import { Form } from "antd";
import { useCallback, useMemo } from "react";

type UseAddFileFieldModalArgs = {
  open: boolean;
  onAdd: (fieldKey: string, label: string, isRequired: boolean) => Promise<void>;
  onClose: () => void;
};

export function useAddFileFieldModal({
  open,
  onAdd,
  onClose,
}: UseAddFileFieldModalArgs) {
  const [form] = Form.useForm<{
    documentTypeId: number | null;
    label: string;
    isRequired: boolean;
  }>();

  // Fetch active document types — only when the modal is open
  const { data, isLoading: isLoadingTypes } = useGetDocumentTypesQuery(
    { "exact[isActive]": true, sort: "name:asc", itemsPerPage: 200 },
    { skip: !open },
  );

  const documentTypes = data?.member ?? [];

  // Options for the Select — value is the document type ID so we can look up
  // the code and name on selection
  const typeOptions = useMemo(
    () =>
      documentTypes.map((dt) => ({
        value: dt.id,
        label: dt.name,
        // Store the full object so onSelect can read code + name without a lookup
        docType: dt,
      })),
    [documentTypes],
  );

  // When the admin picks a document type, auto-fill label from name
  const handleTypeSelect = useCallback(
    (_value: number, option: { docType: AdmissionDocumentType }) => {
      form.setFieldsValue({ label: option.docType.name });
    },
    [form],
  );

  const handleOk = async () => {
    const values = await form.validateFields();
    if (values.documentTypeId == null) return;

    // Resolve fieldKey from the selected document type code
    const selected = documentTypes.find((dt) => dt.id === values.documentTypeId);
    if (!selected) return;

    await onAdd(selected.code, values.label, values.isRequired ?? false);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return {
    form,
    state: { typeOptions, isLoadingTypes },
    actions: { handleOk, handleCancel, handleTypeSelect },
  };
}
