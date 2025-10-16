// src/components/ModalVincularResponsavel.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'sonner';

const formatCPF = (value: string): string => {
    // 1. Remove tudo que não for dígito
    const numericValue = value.replace(/\D/g, '');

    // 2. Limita a 11 dígitos
    const truncatedValue = numericValue.slice(0, 11);

    // 3. Aplica a máscara
    if (truncatedValue.length > 9) {
        return truncatedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (truncatedValue.length > 6) {
        return truncatedValue.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (truncatedValue.length > 3) {
        return truncatedValue.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }

    return truncatedValue;
};

const formatTelefone = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    const truncatedValue = numericValue.slice(0, 11);

    if (truncatedValue.length > 10) {
        // Celular com 9 dígitos: (XX) XXXXX-XXXX
        return truncatedValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (truncatedValue.length > 6) {
        // Telefone fixo ou celular com 8 dígitos: (XX) XXXX-XXXX
        return truncatedValue.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (truncatedValue.length > 2) {
        return truncatedValue.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }

    return truncatedValue.replace(/(\d*)/, '($1');
};

interface ModalProps {
    alunoId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const ModalVincularResponsavel: React.FC<ModalProps> = ({ alunoId, onClose, onSuccess }) => {
    const [cpfBusca, setCpfBusca] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [responsavelEncontrado, setResponsavelEncontrado] = useState<any>(null);
    const [isNewResponsavel, setIsNewResponsavel] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        const buscar = async () => {
            if (cpfBusca.replace(/\D/g, '').length !== 11) return;
            setIsSearching(true);
            setResponsavelEncontrado(null);
            setIsNewResponsavel(false);
            try {
                const res = await axios.get(`/api/responsaveis/cpf/${cpfBusca.replace(/\D/g, '')}`);
                setResponsavelEncontrado(res.data);
                setValue('nome', res.data.nome);
                setValue('email', res.data.email);
                setValue('telefone', formatTelefone(res.data.telefone));
            } catch (error) {
                setIsNewResponsavel(true); // CPF não encontrado, habilita modo de novo cadastro
            } finally {
                setIsSearching(false);
            }
        };
        const debounce = setTimeout(buscar, 500); // Espera 500ms após o usuário parar de digitar
        return () => clearTimeout(debounce);
    }, [cpfBusca, setValue]);

    const onSubmit = async (data: any) => {
        const payload = {
            ...data,
            cpf: cpfBusca, // Usa o CPF da busca
            alunoId: alunoId,
            responsavelId: responsavelEncontrado?.id // Envia o ID se o responsável já existia
        };

        try {
            // Este endpoint inteligente saberá o que fazer (vincular ou criar e vincular)
            await axios.post(`/api/alunos/vincular-responsavel`, payload);
            onSuccess(); // Chama a função de sucesso para recarregar a lista
        } catch (error) {
            console.error("Erro ao vincular responsável:", error);
            toast.error("Falha ao vincular responsável.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">Vincular Responsável</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label>CPF do Responsável</label>
                        <input
                            type="text"
                            className="w-full input-style"
                            value={cpfBusca}
                            onChange={(e) => setCpfBusca(formatCPF(e.target.value))}
                            placeholder="Digite o CPF para buscar ou cadastrar"
                        />
                        {isSearching && <p className="text-xs text-blue-500">Buscando...</p>}
                    </div>

                    {(responsavelEncontrado || isNewResponsavel) && (
                        <>
                            <input type="text" {...register("nome")} placeholder="Nome Completo" className="w-full input-style" disabled={!!responsavelEncontrado} />
                            <input type="email" {...register("email")} placeholder="Email" className="w-full input-style" disabled={!!responsavelEncontrado} />
                            <input
                                type="text"
                                placeholder="(00) 00000-0000"
                                className="w-full input-style disabled:bg-gray-200"
                                disabled={!!responsavelEncontrado}
                                // A MÁGICA ACONTECE AQUI
                                {...register("telefone", {
                                    onChange: (e) => {
                                        e.target.value = formatTelefone(e.target.value);
                                    },
                                })}
                            />
                            <input type="text" {...register("parentesco", { required: true })} placeholder="Parentesco (Ex: Pai, Mãe)" className="w-full input-style" />
                            {errors.parentesco && <p className="error-message">Parentesco é obrigatório.</p>}
                        </>
                    )}

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar Vínculo</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalVincularResponsavel;
