import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legacy | Gaines Boxing Club",
  description:
    "A 50-year legacy forged in the underground. Discover the story of Sam Gaines and how Gaines Boxing Club became a modern institution.",
};

export default function LegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
