import { useState } from "react";
import { Info, FileText } from "lucide-react";
import { AIKnowledgeSource } from "@/data/hazardReports";
import CitationPanel from "./CitationPanel";

interface AIKnowledgeCardProps {
  source: AIKnowledgeSource;
}

const labelConfig = {
  TBC: { 
    bg: "bg-emerald-500", 
    text: "text-white",
    fullName: "TBC - To be Concern Hazard",
    documentName: "SOP-TBC-Guidelines-2024.pdf"
  },
  PSPP: { 
    bg: "bg-amber-500", 
    text: "text-white",
    fullName: "PSPP - Peraturan Sanksi Pelanggaran Prosedur",
    documentName: "PSPP-Regulasi-Keselamatan-2024.pdf"
  },
  GR: { 
    bg: "bg-slate-600", 
    text: "text-white",
    fullName: "Safety Golden Rules",
    documentName: "Safety-Golden-Rules-2024.pdf"
  }
};

const AIKnowledgeCard = ({ source }: AIKnowledgeCardProps) => {
  const [showCitation, setShowCitation] = useState(false);
  const config = labelConfig[source.type];

  return (
    <>
      <div className="bg-card rounded-lg p-5 card-shadow flex-1 min-w-0">
        {/* Label Badge */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
            {config.fullName}
          </span>
        </div>

        {/* Category & Confidence */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Category</span>
            <span className="text-sm font-semibold text-foreground text-right">
              {source.categoryNumber}. {source.category}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Confidence</span>
            <span className="text-sm font-medium text-foreground">{source.confidence}%</span>
          </div>
        </div>

        {/* Reasoning */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Reasoning</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
            {source.reasoning}
          </p>
        </div>

        {/* Citation Link - Updated with document filename */}
        <button
          onClick={() => setShowCitation(true)}
          className="mt-4 flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium group transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span className="group-hover:underline">
            Rujukan: {config.documentName}
          </span>
        </button>
      </div>

      {/* Citation Panel */}
      <CitationPanel
        isOpen={showCitation}
        onClose={() => setShowCitation(false)}
        documentName={config.documentName}
        citationTitle={source.citation.title}
        citationContent={source.citation.content}
        type={source.type}
      />
    </>
  );
};

export default AIKnowledgeCard;