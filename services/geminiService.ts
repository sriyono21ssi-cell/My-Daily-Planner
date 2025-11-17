import { GoogleGenAI } from "@google/genai";
import { SummaryData } from '../types';

let ai: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI | null => {
    if (!process.env.API_KEY) {
        return null;
    }
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

export const generateAiAnalysis = async (summary: SummaryData, range: string): Promise<string> => {
    const gemini = getAi();
    if (!gemini) {
        throw new Error("API Key for Gemini is not configured.");
    }
    
    const prompt = `Anda adalah seorang asisten produktivitas yang ahli dengan gaya bahasa yang ringan, lugas, dan mudah dimengerti.
Berdasarkan data berikut untuk rentang waktu "${range}":
- Total tugas: ${summary.total}
- Tugas selesai: ${summary.done}
- Tugas tertunda: ${summary.pending}
- Total waktu perencanaan: ${summary.totalPlanning.toFixed(1)} jam
- Total waktu aktual yang dihabiskan: ${summary.totalActual.toFixed(1)} jam

Berikan analisis singkat dan saran yang bisa ditindaklanjuti.
Gunakan format di bawah ini secara persis, langsung ke intinya, dan jangan gunakan bullet points. Setiap poin harus di baris baru.

Hasil Analisa :
[Analisa perbandingan rencana vs realita]
[Analisa beban kerja]

Saran :
[Saran untuk meningkatkan akurasi perencanaan]
[Saran untuk meningkatkan produktivitas]`;
    
    try {
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("AI Analysis Error in service:", error);
        // Re-throw a more user-friendly error
        throw new Error("Gagal berkomunikasi dengan layanan AI. Silakan coba lagi.");
    }
};