import type { ReactNode } from "react";
import { ArchiveView } from "./archive-view";

export default function ArchiveLayout({ children }: { children: ReactNode }) {
  return <ArchiveView>{children}</ArchiveView>;
}
