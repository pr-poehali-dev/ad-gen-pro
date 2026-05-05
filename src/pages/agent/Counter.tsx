import { useCounter } from "./data";

export default function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const v = useCounter(to);
  return <>{prefix}{v.toLocaleString("ru-RU")}{suffix}</>;
}
