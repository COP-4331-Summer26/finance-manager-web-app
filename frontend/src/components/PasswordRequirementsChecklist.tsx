import { PASSWORD_REQUIREMENTS } from "../utils/passwordRequirements";

interface PasswordRequirementsChecklistProps {
  password: string;
}

export default function PasswordRequirementsChecklist({ password }: PasswordRequirementsChecklistProps) {
  return (
    <div className="flex flex-col gap-1 mt-2">
      {PASSWORD_REQUIREMENTS.map((req) => {
        const met = req.test(password);
        return (
          <div
            key={req.label}
            className="flex items-center gap-1.5 text-[11px] transition-colors"
            style={{ color: met ? "#10B981" : "#8790AC" }}
          >
            <span>{met ? "✓" : "○"}</span>
            <span>{req.label}</span>
          </div>
        );
      })}
    </div>
  );
}
