"use client";

import { useMemo, useState } from "react";
import { ShieldAlert, Eye } from "lucide-react";

type FlagRecord = {
    id: string;
    matricNumber: string;
    studentName: string;
    examTitle: string;
    anomalyType: string;
    description: string;
    snapshotUrl: string | null;
    createdAtISO: string;
};

type Props = {
    flags: FlagRecord[];
};

export function FlagsClient({ flags }: Props) {
    const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);

    const selectedFlag = useMemo(
        () => flags.find((flag) => flag.id === selectedFlagId) ?? null,
        [flags, selectedFlagId]
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-16">
            <div>
                <h1 className="text-4xl font-black text-primary tracking-tight">Proctoring Flags</h1>
                <p className="text-secondary text-lg mt-2 font-medium">
                    Real-time and historical malpractice evidence captured across your assigned courses.
                </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-accent overflow-hidden">
                <div className="p-6 border-b border-accent bg-[#F4EFEA]/30 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-primary">Incident Evidence Registry</h3>
                    <span className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                        <ShieldAlert className="w-4 h-4" />
                        Review Queue
                    </span>
                </div>

                {flags.length === 0 ? (
                    <p className="p-6 text-sm font-semibold text-[#6A4D43]">No proctoring flags yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-secondary">
                            <thead className="bg-[#F4EFEA] text-xs uppercase font-bold text-primary">
                                <tr>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Exam</th>
                                    <th className="px-6 py-4">Anomaly</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4 text-right">Evidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-accent">
                                {flags.map((record) => (
                                    <tr key={record.id} className="hover:bg-red-50/50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-primary">{record.studentName}</p>
                                            <p className="font-mono text-xs">{record.matricNumber}</p>
                                        </td>
                                        <td className="px-6 py-4 font-semibold">{record.examTitle}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-red-700">{record.anomalyType}</p>
                                            <p className="text-xs mt-1 line-clamp-2">{record.description}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold">
                                            {new Date(record.createdAtISO).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedFlagId(record.id)}
                                                className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border border-accent text-primary hover:bg-[#F4EFEA]"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Evidence
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedFlag ? (
                <div className="fixed inset-0 z-40 bg-black/45 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white rounded-2xl border border-accent shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-accent flex items-center justify-between">
                            <h2 className="text-xl font-black text-primary">Malpractice Evidence</h2>
                            <button
                                type="button"
                                onClick={() => setSelectedFlagId(null)}
                                className="text-sm font-bold px-3 py-1.5 rounded-lg border border-[#D9C9BC] hover:bg-[#F4EFEA]"
                            >
                                Close
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] font-bold text-[#7A6156]">Description</p>
                                <p className="mt-1 text-sm font-semibold text-primary">{selectedFlag.description}</p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] font-bold text-[#7A6156]">Snapshot</p>
                                {selectedFlag.snapshotUrl ? (
                                    <img
                                        src={selectedFlag.snapshotUrl}
                                        alt="Malpractice evidence snapshot"
                                        className="mt-2 w-full max-h-105 object-contain rounded-xl border border-accent"
                                    />
                                ) : (
                                    <p className="mt-2 text-sm font-semibold text-[#6A4D43]">No snapshot captured for this event.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
