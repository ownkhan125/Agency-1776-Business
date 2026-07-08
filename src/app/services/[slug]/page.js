import { notFound } from "next/navigation";
import { SERVICES, getService } from "@/data/services";
import ServiceDetail from "@/sections/services/ServiceDetail";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service · Agency 1776 Business" };
  return {
    title: `${service.title} · Agency 1776 Business`,
    description: service.lede,
  };
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  return <ServiceDetail service={service} />;
}
