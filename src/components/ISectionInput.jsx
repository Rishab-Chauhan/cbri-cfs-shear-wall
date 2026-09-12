import CSectionInput from "./CSectionInput";

export default function ISectionInput({ section, onChange }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] text-slate-500">
        Built-up I: two C-sections back-to-back. Enter one C.
      </p>
      <CSectionInput section={section} onChange={onChange} />
    </div>
  );
}
