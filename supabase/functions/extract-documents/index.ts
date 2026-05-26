import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const ALLOWED_ORIGINS = [
  "https://vitoralcantarac.github.io",
  "http://localhost:8080",
];

const CORS_ALLOW_HEADERS = "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";

const MAX_TOTAL_CHARS = 8000;

serve(async (req) => {
  const origin = req.headers.get("Origin") ?? "";
  const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": CORS_ALLOW_HEADERS,
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { analysisId } = await req.json();
    if (!analysisId) {
      return new Response(JSON.stringify({ error: "analysisId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: docs, error: docsError } = await supabase
      .from("documents")
      .select("id, file_name, file_path, file_type, file_size")
      .eq("analysis_id", analysisId);

    if (docsError) throw new Error(docsError.message);
    if (!docs || docs.length === 0) {
      await supabase.from("analyses").update({
        documents_extracted_text: "Nenhum documento enviado.",
        documents_summary: [],
      }).eq("id", analysisId);
      return new Response(JSON.stringify({ success: true, documentsProcessed: 0, totalChars: 0, documentsSummary: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const documentsSummary: { name: string; type: string; charsExtracted: number; status: string }[] = [];
    const textBlocks: string[] = [];
    let totalChars = 0;

    for (const doc of docs) {
      if (totalChars >= MAX_TOTAL_CHARS) {
        documentsSummary.push({ name: doc.file_name, type: doc.file_type || "unknown", charsExtracted: 0, status: "skipped" });
        continue;
      }

      try {
        const ext = (doc.file_name || "").split(".").pop()?.toLowerCase() || "";
        const mimeType = (doc.file_type || "").toLowerCase();

        // Images
        if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext) || mimeType.startsWith("image/")) {
          const note = `[Imagem enviada — conteúdo visual não extraível por texto: ${doc.file_name}]`;
          textBlocks.push(`=== DOCUMENTO: ${doc.file_name} ===\n${note}`);
          totalChars += note.length;
          documentsSummary.push({ name: doc.file_name, type: ext, charsExtracted: note.length, status: "image" });
          await supabase.from("documents").update({ parsed_content: note }).eq("id", doc.id);
          continue;
        }

        // Download file
        const { data: fileData, error: dlError } = await supabase.storage.from("documents").download(doc.file_path);
        if (dlError || !fileData) {
          documentsSummary.push({ name: doc.file_name, type: ext, charsExtracted: 0, status: "error" });
          continue;
        }

        let extractedText = "";

        if (ext === "txt" || ext === "md" || mimeType === "text/plain" || mimeType === "text/markdown") {
          extractedText = await fileData.text();
        } else if (ext === "csv" || mimeType === "text/csv") {
          const csvText = await fileData.text();
          const lines = csvText.split("\n").slice(0, 50);
          extractedText = lines.join("\n");
        } else if (ext === "pdf" || mimeType === "application/pdf") {
          // Basic text extraction from PDF
          const arrayBuffer = await fileData.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          const textDecoder = new TextDecoder("latin1");
          const rawStr = textDecoder.decode(bytes);

          // Extract text between stream/endstream or BT/ET blocks
          const textMatches: string[] = [];
          const btEtRegex = /BT\s([\s\S]*?)ET/g;
          let match;
          while ((match = btEtRegex.exec(rawStr)) !== null) {
            const block = match[1];
            const tjRegex = /\(([^)]*)\)\s*Tj/g;
            let tj;
            while ((tj = tjRegex.exec(block)) !== null) {
              textMatches.push(tj[1]);
            }
            const tdRegex = /\[(.*?)\]\s*TJ/g;
            let td;
            while ((td = tdRegex.exec(block)) !== null) {
              const parts = td[1].match(/\(([^)]*)\)/g);
              if (parts) textMatches.push(parts.map(p => p.slice(1, -1)).join(""));
            }
          }

          extractedText = textMatches.join(" ").replace(/\\n/g, "\n").replace(/\s+/g, " ").trim();
          if (!extractedText || extractedText.length < 20) {
            extractedText = `[PDF sem texto extraível — documento pode ser escaneado: ${doc.file_name}]`;
          }
        } else if (ext === "docx" || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          // DOCX is a ZIP containing XML
          try {
            const arrayBuffer = await fileData.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            // Simple extraction: find word/document.xml content by looking for <w:t> tags
            const textDecoder = new TextDecoder("utf-8");
            const rawStr = textDecoder.decode(bytes);
            const wtRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
            const parts: string[] = [];
            let m;
            while ((m = wtRegex.exec(rawStr)) !== null) {
              parts.push(m[1]);
            }
            extractedText = parts.join(" ").trim();
            if (!extractedText) extractedText = `[DOCX sem texto extraível: ${doc.file_name}]`;
          } catch {
            extractedText = `[Erro ao processar DOCX: ${doc.file_name}]`;
          }
        } else if (ext === "xlsx" || ext === "xls" || mimeType.includes("spreadsheet")) {
          try {
            const textDecoder = new TextDecoder("utf-8");
            const rawStr = textDecoder.decode(new Uint8Array(await fileData.arrayBuffer()));
            // Extract shared strings from XLSX
            const siRegex = /<t[^>]*>([^<]*)<\/t>/g;
            const parts: string[] = [];
            let m;
            while ((m = siRegex.exec(rawStr)) !== null) {
              parts.push(m[1]);
            }
            extractedText = parts.slice(0, 200).join(" | ").trim();
            if (!extractedText) extractedText = `[Planilha sem texto extraível: ${doc.file_name}]`;
          } catch {
            extractedText = `[Erro ao processar planilha: ${doc.file_name}]`;
          }
        } else if (ext === "pptx" || mimeType.includes("presentation")) {
          try {
            const textDecoder = new TextDecoder("utf-8");
            const rawStr = textDecoder.decode(new Uint8Array(await fileData.arrayBuffer()));
            const tRegex = /<a:t>([^<]*)<\/a:t>/g;
            const parts: string[] = [];
            let m;
            while ((m = tRegex.exec(rawStr)) !== null) {
              parts.push(m[1]);
            }
            extractedText = parts.join(" ").trim();
            if (!extractedText) extractedText = `[Apresentação sem texto extraível: ${doc.file_name}]`;
          } catch {
            extractedText = `[Erro ao processar apresentação: ${doc.file_name}]`;
          }
        } else {
          extractedText = `[Tipo de arquivo não suportado para extração: ${doc.file_name} (${ext})]`;
        }

        // Truncate individual doc if needed
        const remaining = MAX_TOTAL_CHARS - totalChars;
        if (extractedText.length > remaining) {
          extractedText = extractedText.slice(0, remaining) + "\n[...truncado]";
        }

        textBlocks.push(`=== DOCUMENTO: ${doc.file_name} ===\n${extractedText}`);
        totalChars += extractedText.length;

        // Update parsed_content in documents table
        await supabase.from("documents").update({ parsed_content: extractedText.slice(0, 5000) }).eq("id", doc.id);

        documentsSummary.push({
          name: doc.file_name,
          type: ext,
          charsExtracted: extractedText.length,
          status: extractedText.startsWith("[") ? "partial" : "success",
        });
      } catch (err: any) {
        documentsSummary.push({ name: doc.file_name, type: doc.file_type || "unknown", charsExtracted: 0, status: "error" });
        console.error(`Error processing ${doc.file_name}:`, err.message);
      }
    }

    const consolidatedText = textBlocks.join("\n\n");

    await supabase.from("analyses").update({
      documents_extracted_text: consolidatedText || "Nenhum texto extraído dos documentos.",
      documents_summary: documentsSummary,
    }).eq("id", analysisId);

    return new Response(JSON.stringify({
      success: true,
      documentsProcessed: documentsSummary.filter(d => d.status !== "skipped").length,
      totalChars,
      documentsSummary,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
