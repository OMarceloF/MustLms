import React from "react";

interface DocumentoItem {
    file: File | null;
    label: string;
    id: string;
}

interface DocumentosContratacaoProps {
    documentos: Record<string, File | null>;
    onAdd: (id: string, file: File | null) => void;
    onRemove: (id: string) => void;
}

const tiposDocumentos: DocumentoItem[] = [
    { id: "rg_frente", label: "RG - Frente", file: null },
    { id: "rg_verso", label: "RG - Verso", file: null },
    { id: "cpf", label: "CPF", file: null },
    { id: "comprovante_residencia", label: "Comprovante de Residência", file: null },
    { id: "contrato_trabalho", label: "Contrato de Trabalho", file: null },
    { id: "termo_admissao", label: "Termo de Admissão", file: null },
    { id: "diploma_certificacao", label: "Diploma / Certificação", file: null },
    { id: "outros", label: "Outros Documentos (Opcional)", file: null },
];

export const DocumentosContratacao: React.FC<DocumentosContratacaoProps> = ({
    documentos,
    onAdd,
    onRemove,
}) => {
    return (
        <section className="mt-10">
            <h2 className="text-lg font-semibold text-primary mb-4 border-b pb-2">
                Documentos de Contratação
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">

                {tiposDocumentos.map((doc) => (
                    <div key={doc.id} className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            {doc.label}
                        </label>

                        {/* INPUT DE ARQUIVO */}
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                onAdd(doc.id, file);
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium 
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />

                        {/* PREVIEW */}
                        {documentos[doc.id] && (
                            <div className="flex justify-between items-center px-3 py-2 border rounded-md bg-muted/50">
                                <div className="flex flex-col text-sm">
                                    <span>{documentos[doc.id]!.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {(documentos[doc.id]!.size / 1024).toFixed(1)} KB
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onRemove(doc.id)}
                                    className="text-destructive text-xs underline hover:text-destructive/80"
                                >
                                    Remover
                                </button>
                            </div>
                        )}
                    </div>
                ))}

            </div>
        </section>
    );
};

export default DocumentosContratacao;
