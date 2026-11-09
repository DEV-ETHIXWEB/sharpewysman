import { notFound } from "next/navigation";

/** Sends unknown URLs to this design's branded 404 page. */
export default function Missing() {
  notFound();
}
