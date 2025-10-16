// src/pages/gestor/PostPageMenu.tsx

import React, { useState } from 'react';
//import '../../styles/PostPageMenu.css';

import SidebarGestor from './components/Sidebar';
import { useNavigate } from 'react-router-dom';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

const PostPageMenu = () => {
  const [textoPost, setTextoPost] = useState('');
  const [legendaImagem, setLegendaImagem] = useState('');
  const [legendaVideo, setLegendaVideo] = useState('');
  const [imagem, setImagem] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [mencao, setMencao] = useState('');

  const [sidebarAberta, setSidebarAberta] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUser = user;
  const role = currentUser?.role ?? '';
  const showSidebar = !['responsavel', 'aluno'].includes(role);

  const handleCancelar = () => {
    setTextoPost('');
    setLegendaImagem('');
    setLegendaVideo('');
    setImagem(null);
    setVideo(null);
    setMencao('');
  };

  const handlePostar = () => {
    console.log({
      textoPost,
      legendaImagem,
      imagem,
      legendaVideo,
      video,
      mencao
    });
    toast.success('Post criado com sucesso!');
    handleCancelar();
  };

  return (
    <div className={`dashboard-container flex min-h-screen w-full overflow-x-hidden ${ showSidebar ? 'md:pl-15 pl-0' : 'pl-0' }`} >
    
          {showSidebar && (
            <SidebarGestor
              isMenuOpen={sidebarAberta}
              setActivePage={(page: string) =>
                navigate('/gestor', { state: { activePage: page } })
              }
              handleMouseEnter={() => setSidebarAberta(true)}
              handleMouseLeave={() => setSidebarAberta(false)}
            />
          )}
    
          {/* <div className="flex-1 flex flex-col pt-20 px-6 ml-[50px] rounded-2xl shadow-md p-6"> */}
          <div className={`flex-1 pt-6 pb-0 px-4 md:px-0 ${!showSidebar ? '' : 'md:container md:mx-auto md:px-4'} md:pt-20`} >
    
            <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

            <div className="flex items-start justify-center bg-gray pt-8 px-4 md:px-0">
  
              <div className="bg-white p-6 w-full max-w-full sm:max-w-[700px] rounded-xl shadow-lg flex flex-col gap-5">
                <h2 className="text-2xl font-semibold text-[#2c3e50] text-center">Criar Novo Post</h2>

                <textarea
                  className="w-full h-[150px] p-3 text-base rounded-lg border border-gray-300 resize-vertical"
                  placeholder="Escreva algo para compartilhar com a escola..."
                  value={textoPost}
                  onChange={(e) => setTextoPost(e.target.value)}
                />

                <input
                  type="text"
                  className="w-full p-2.5 text-sm rounded-lg border border-gray-300"
                  placeholder="Mencionar amigos (ex: @joao, @ana)"
                  value={mencao}
                  onChange={(e) => setMencao(e.target.value)}
                />

                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImagem(e.target.files?.[0] || null)}
                    className="text-sm"
                  />

                  <input
                    type="text"
                    placeholder="Legenda da imagem"
                    className="p-2.5 text-sm rounded-lg border border-gray-300"
                    onChange={(e) => setLegendaImagem(e.target.value)}
                    value={legendaImagem}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideo(e.target.files?.[0] || null)}
                    className="text-sm"
                  />

                  <input
                    type="text"
                    placeholder="Legenda do vídeo"
                    className="p-2.5 text-sm rounded-lg border border-gray-300"
                    value={legendaVideo}
                    onChange={(e) => setLegendaVideo(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-4 mt-2">
                  <button
                    className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-red-700"
                    onClick={handleCancelar}
                  >
                    Cancelar
                  </button>
                  <button
                    className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700"
                    onClick={handlePostar}
                  >
                    Postar
                  </button>
                </div>
              </div>
            </div>

          </div>
    </div> 
  );
};

export default PostPageMenu;
