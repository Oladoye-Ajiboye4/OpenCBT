"use server";

import { publishResults } from "@/actions/results";

export async function publishResult(resultId: string) {
    return publishResults(resultId);
}
