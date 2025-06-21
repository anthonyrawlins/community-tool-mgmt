import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tool Catalog",
  description: "Browse our extensive collection of tools available for borrowing. Find hand tools, power tools, garden equipment and more.",
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}