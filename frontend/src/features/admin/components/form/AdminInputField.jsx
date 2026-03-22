import Input from "../../../../components/ui/Input";
import AdminFieldError from "./AdminFieldError";

function AdminInputField({ error, ...props }) {
  return (
    <div>
      <Input {...props} />
      <AdminFieldError message={error} />
    </div>
  );
}

export default AdminInputField;
