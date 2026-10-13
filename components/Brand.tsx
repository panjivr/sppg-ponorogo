import Icon from "@/components/Icon";
export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-lockup">
      <span className="brand-symbol">
        <Icon name="leaf" />
      </span>
      <span>
        <span className="brand-name">
          Bumbu Pawon<span className="brand-dot">.</span>
        </span>
        {!compact && <span className="brand-caption">MAS DHOO · PONOROGO</span>}
      </span>
    </span>
  );
}
