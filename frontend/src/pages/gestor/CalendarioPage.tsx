import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";


const API_URL = `/api`;

const CalendarioPage: React.FC = () => {
  const navigate = useNavigate();
  const anoLetivo = new Date().getFullYear();
  
  useEffect(() => {
    const verificarCalendarios = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/calendario/${anoLetivo}`);
        if (data && data.id) {
          // Se houver calendário, redireciona para ele
          navigate(`/gestor/calendario/${data.id}`);
        } else {
          // Tenta unificar os calendários antes de redirecionar para criar
          try {
            // Correto: ano_letivo vai no body
            await axios.post(`${API_URL}/api/calendario/unificar`, {
              ano_letivo: anoLetivo
            });
            // Após unificar, tenta buscar novamente o calendário
            const resp = await axios.get(`${API_URL}/api/calendario/${anoLetivo}`);
            if (resp.data && resp.data.id) {
              navigate(`/gestor/calendario/${resp.data.id}`);
              return;
            }
          } catch {
            // Falha ao unificar, segue fluxo normal
          }
          navigate("/gestor/criarCalendario");
        }
      } catch {
        toast.error("Erro ao verificar calendários.");
        navigate("/gestor/");
      }
    };
    verificarCalendarios();
  }, [anoLetivo, navigate]);

  return null;
};

export default CalendarioPage;