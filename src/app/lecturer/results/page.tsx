import { redirect } from "next/navigation";

export default function LegacyLecturerResultsRedirect() {
    redirect("/lecturer/flags");
}
