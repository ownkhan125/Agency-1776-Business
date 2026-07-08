import { notFound } from "next/navigation";
import { PROJECTS, getProject } from "@/data/projects";
import ProjectDetail from "@/sections/work/ProjectDetail";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project · Agency 1776 Business" };
  return {
    title: `${project.client} · Agency 1776 Business`,
    description: project.lede,
  };
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
