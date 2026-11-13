import { notFound } from "next/navigation";

/** Any URL that matches no route falls through to the branded 404 page. */
export default function Missing() {
  notFound();
}
