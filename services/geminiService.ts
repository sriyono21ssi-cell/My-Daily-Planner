import { GoogleGenAI } from "@google/genai";
import { SummaryData } from '../types';

export const generateAiAnalysis = async (summary: SummaryData, range: string, apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("Kunci API Gemini belum diatur. Silakan atur di Dashboard.");
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
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
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("AI Analysis Error in service:", error);
        if (error instanceof Error && (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid'))) {
            throw new Error("Kunci API Gemini tidak valid. Silakan periksa kembali dan atur ulang.");
        }
        throw new Error("Gagal berkomunikasi dengan layanan AI. Pastikan Kunci API Anda benar dan coba lagi.");
    }
};