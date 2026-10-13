import { useNavigate } from "react-router";
import { ChangePasswordDialog } from "../components/ChangePasswordDialog";

export function ChangePasswordPage() {
  const navigate = useNavigate();

  return <ChangePasswordDialog open onClose={() => navigate("/appointments", { replace: true })} />;
}
