import Input from "../../../../components/ui/Input";

function AdminInputField({ error, ...props }) {
  return <Input error={error} {...props} />;
}

export default AdminInputField;
